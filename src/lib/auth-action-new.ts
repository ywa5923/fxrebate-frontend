import { BASE_URL } from '@/constants';
import { AuthUserSchema, type AuthUser, type BrokerInfo } from '@/app/schemas/auth-schema';
import type {
  AuthUserResponse,
  BrokerInfoResponse,
  MagicLinkAuthResponse,
} from '@/types';

import logger from './logger';

const AUTH_COOKIE_NAME = 'bearer_token';
const USER_DATA_COOKIE_NAME = 'user_data';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

class UnauthenticatedError extends Error {
  constructor(message = 'User is not authenticated') {
    super(message);
    this.name = 'UnauthenticatedError';
  }
}

/**
 * Reads the bearer token once per React server render/request.
 *
 * This is request memoization, not persistent caching between users.
 */
const readBearerToken = cache(async (): Promise<string | null> => {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_COOKIE_NAME)?.value ?? null;
});

/**
 * Authenticate a user through a magic-link token.
 */
export async function authenticateWithMagicLink(
  token: string,
): Promise<{
  success: boolean;
  message: string;
  redirectTo: string;
}> {
  const log = logger.child('AuthActions/authenticateWithMagicLink');

  try {
    const response = await fetch(`${BASE_URL}/magic-link/verify`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
      cache: 'no-store',
    });

    const responseData = (await response.json()) as MagicLinkAuthResponse;

    if (!response.ok) {
      throw new Error(
        responseData.message || `HTTP error: ${response.status}`,
      );
    }

    if (!responseData.success || !responseData.data) {
      throw new Error(
        responseData.message || 'Authentication failed',
      );
    }

    await setAuthCookie(
      responseData.data.access_token,
      responseData.data.user,
    );

    const user = responseData.data.user;
    let redirectTo = '/en';

    if (
      user.user_type === 'platform_user' &&
      user.permissions?.some(
        (permission) =>
          permission.type === 'super-admin' &&
          permission.action === 'manage',
      )
    ) {
      redirectTo = '/en/control-panel/super-manager';
    } else if (user.user_type === 'platform_user') {
      redirectTo = '/en/control-panel/platform-manager';
    } else if (user.user_type === 'team_user') {
      const brokerId =
        responseData.data.broker_context?.broker_id;

      if (!brokerId) {
        throw new Error('Broker context not found');
      }

      redirectTo =
        `/en/control-panel/${brokerId}` +
        '/broker-profile/1/general-information';
    }

    log.info('Magic link authentication successful', {
      context: {
        userId: user.id,
        userEmail: user.email,
        userType: user.user_type,
      },
    });

    return {
      success: true,
      message: 'Authentication successful!',
      redirectTo,
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Authentication failed';

    log.error('Magic link authentication failed', {
      error: message,
      context: {
        tokenPresent: Boolean(token),
        errorStack:
          error instanceof Error ? error.stack : undefined,
      },
    });

    return {
      success: false,
      message,
      redirectTo: '#',
    };
  }
}

/**
 * Logout and clear authentication cookies.
 */
export async function logoutUser(): Promise<void> {
  const log = logger.child('AuthActions/logoutUser');

  try {
    await clearAuthCookies();
    log.info('User logged out successfully');
  } catch (error) {
    log.error('Error during logout', {
      error:
        error instanceof Error
          ? error.message
          : 'Unknown error',
    });

    throw error;
  }
}

/**
 * Sets authentication cookies.
 *
 * Keep this function restricted to Server Actions or Route Handlers.
 */
export async function setAuthCookie(
  token: string,
  user: Omit<AuthUser, 'permissions' | 'broker_context'>,
): Promise<void> {
  const log = logger.child('AuthActions/setAuthCookie');
  const cookieStore = await cookies();
  const secure = process.env.NODE_ENV === 'production';

  cookieStore.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  });

  /*
   * This cookie remains readable from client-side JavaScript because the
   * existing application may depend on it. Do not put permissions, tokens,
   * or other sensitive authorization data inside it.
   */
  cookieStore.set(USER_DATA_COOKIE_NAME, JSON.stringify(user), {
    httpOnly: false,
    secure,
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  });

  log.info('Authentication cookies set successfully', {
    context: {
      userId: user.id,
      userEmail: user.email,
    },
  });
}

/**
 * Clears authentication cookies.
 */
export async function clearAuthCookies(): Promise<void> {
  const log = logger.child('AuthActions/clearAuthCookies');
  const cookieStore = await cookies();

  cookieStore.delete(AUTH_COOKIE_NAME);
  cookieStore.delete(USER_DATA_COOKIE_NAME);

  log.info('Authentication cookies cleared successfully');
}

/**
 * Returns the current request's bearer token.
 *
 * Errors produced by Next.js request APIs are deliberately not converted
 * to null. They must propagate so that Suspense/prerendering can work.
 */
export async function getBearerToken(): Promise<string | null> {
  return readBearerToken();
}

/**
 * Loads and validates the authenticated user.
 *
 * Missing/expired credentials raise UnauthenticatedError. Infrastructure,
 * parsing, and Next.js rendering errors are allowed to propagate.
 */
export async function getLoggedInUserData(): Promise<AuthUser> {
  const log = logger.child(
    'lib/auth-actions/getLoggedInUserData',
  );

  const bearerToken = await getBearerToken();

  if (!bearerToken) {
    throw new UnauthenticatedError(
      'Bearer token not found',
    );
  }

  const response = await fetch(`${BASE_URL}/user`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${bearerToken}`,
    },
    cache: 'no-store',
  });

  if (response.status === 401 || response.status === 403) {
    throw new UnauthenticatedError(
      `Authentication rejected with status ${response.status}`,
    );
  }

  if (!response.ok) {
    throw new Error(
      `Unable to load authenticated user: HTTP ${response.status}`,
    );
  }

  const responseData =
    (await response.json()) as AuthUserResponse;

  if (!responseData.success || !responseData.user) {
    throw new Error(
      responseData.message ||
        'User data not found in API response',
    );
  }

  const parsed = AuthUserSchema.safeParse(
    responseData.user,
  );

  if (!parsed.success) {
    log.error('Invalid AuthUser response shape', {
      context: {
        issues: parsed.error.issues,
      },
    });

    throw new Error(
      `Invalid AuthUser shape: ${parsed.error.issues
        .map(
          (issue) =>
            `${issue.path.join('.')} - ${issue.message}`,
        )
        .join('; ')}`,
    );
  }

  return parsed.data;
}

/**
 * Returns the authenticated user, or null only when credentials are absent
 * or rejected.
 *
 * It intentionally does not swallow unrelated errors. In particular, a
 * Next.js cookies()/prerendering signal must propagate to React.
 */
export async function isAuthenticated(): Promise<AuthUser | null> {
  const log = logger.child(
    'lib/auth-actions/isAuthenticated',
  );

  try {
    return await getLoggedInUserData();
  } catch (error) {
    if (error instanceof UnauthenticatedError) {
      log.debug('User is not authenticated', {
        context: {
          reason: error.message,
        },
      });

      return null;
    }

    log.error('Authentication check failed', {
      error:
        error instanceof Error
          ? error.message
          : 'Unknown error',
    });

    throw error;
  }
}

/**
 * Checks whether the authenticated platform user is a super-admin.
 */
export async function isSuperAdmin(): Promise<boolean> {
  const user = await isAuthenticated();

  if (
    !user ||
    user.user_type !== 'platform_user' ||
    user.role !== 'super-admin'
  ) {
    return false;
  }

  return (
    user.permissions?.some(
      (permission) =>
        permission.type === 'super-admin' &&
        permission.action === 'manage',
    ) ?? false
  );
}

/**
 * Loads broker information using the current authenticated request.
 */
export async function getBrokerInfo(
  brokerId: number,
): Promise<BrokerInfo> {
  const log = logger.child(
    'lib/auth-actions/getBrokerInfo',
  );

  if (!Number.isInteger(brokerId) || brokerId <= 0) {
    throw new Error(`Invalid broker ID: ${brokerId}`);
  }

  const bearerToken = await getBearerToken();

  if (!bearerToken) {
    throw new UnauthenticatedError(
      'Authentication token not found',
    );
  }

  const response = await fetch(
    `${BASE_URL}/brokers/broker-info/${brokerId}`,
    {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${bearerToken}`,
      },
      cache: 'no-store',
    },
  );

  if (response.status === 401 || response.status === 403) {
    throw new UnauthenticatedError(
      `Broker request rejected with status ${response.status}`,
    );
  }

  if (!response.ok) {
    const message =
      `Unable to fetch broker ${brokerId}: ` +
      `HTTP ${response.status}`;

    log.error('Error fetching broker info', {
      error: message,
    });

    throw new Error(message);
  }

  const data =
    (await response.json()) as BrokerInfoResponse;

  if (!data.success || !data.data) {
    const message =
      data.message || 'Broker data not found in API response';

    log.error('Error fetching broker info', {
      error: message,
    });

    throw new Error(message);
  }

  return data.data;
}

/**
 * Requests a magic-link email.
 */
export async function requestMagicLink(
  email: string,
): Promise<{
  success: boolean;
  message?: string;
}> {
  const log = logger.child(
    'AuthActions/requestMagicLink',
  );

  try {
    const response = await fetch(
      `${BASE_URL}/login-with-email`,
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
        cache: 'no-store',
      },
    );

    const responseText = await response.text();
    let data: {
      message?: string;
      errors?: Record<string, string[] | string>;
    } = {};

    if (responseText) {
      try {
        data = JSON.parse(responseText) as typeof data;
      } catch (error) {
        log.error('Failed to parse magic-link response', {
          error:
            error instanceof Error
              ? error.message
              : 'Unknown parse error',
          context: {
            responseText,
          },
        });
      }
    }

    if (!response.ok) {
      let message =
        data.message || `HTTP error: ${response.status}`;

      if (data.errors) {
        const validationErrors = Object.entries(
          data.errors,
        )
          .map(([field, errors]) => {
            const messages = Array.isArray(errors)
              ? errors.join(', ')
              : errors;

            return `${field}: ${messages}`;
          })
          .join('; ');

        message += ` - ${validationErrors}`;
      }

      log.error('Magic-link request failed', {
        error: message,
        context: {
          status: response.status,
          statusText: response.statusText,
        },
      });

      return {
        success: false,
        message,
      };
    }

    return {
      success: true,
      message:
        data.message ||
        'Magic link sent if the email exists',
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Unexpected error';

    log.error('Exception requesting magic link', {
      error: message,
    });

    return {
      success: false,
      message,
    };
  }
}