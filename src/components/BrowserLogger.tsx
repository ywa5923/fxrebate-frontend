'use client';

import { useEffect } from 'react';

import { BASE_URL } from '@/constants';

type ConsoleMethod = 'log' | 'info' | 'warn' | 'error';
type BrowserLogType = ConsoleMethod | 'window_error' | 'unhandled_rejection';

interface BrowserLogEntry {
  type: BrowserLogType;
  timestamp: string;
  data: unknown[];
  url: string;
  userAgent: string;
}

const CONSOLE_METHODS: ConsoleMethod[] = ['log', 'info', 'warn', 'error'];
const MAX_DEPTH = 3;
const MAX_ITEMS = 20;
const MAX_STRING_LENGTH = 1000;
const REDACTED_KEY_PARTS = [
  'authorization',
  'cookie',
  'password',
  'secret',
  'token',
  'api_key',
  'apikey',
  'access_token',
  'refresh_token',
];

function truncateString(value: string): string {
  return value.length > MAX_STRING_LENGTH
    ? `${value.slice(0, MAX_STRING_LENGTH)}... [truncated]`
    : value;
}

function resolveEndpoint(): string | null {
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  try {
    return process.env.NEXT_PUBLIC_BROWSER_LOGS_ENDPOINT?.trim()
      || new URL('/_boost/browser-logs', BASE_URL).toString();
  } catch {
    return null;
  }
}

function shouldRedact(key: string): boolean {
  const normalizedKey = key.toLowerCase();
  return REDACTED_KEY_PARTS.some((part) => normalizedKey.includes(part));
}

function sanitizeValue(
  value: unknown,
  depth = 0,
  seen: WeakSet<object> = new WeakSet(),
): unknown {
  if (value == null || typeof value === 'boolean' || typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string') {
    return truncateString(value);
  }

  if (typeof value === 'bigint') {
    return `${value.toString()}n`;
  }

  if (typeof value === 'undefined') {
    return '[undefined]';
  }

  if (typeof value === 'function') {
    return `[Function ${value.name || 'anonymous'}]`;
  }

  if (typeof value === 'symbol') {
    return value.toString();
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? '[Invalid Date]' : value.toISOString();
  }

  if (value instanceof URL) {
    return value.toString();
  }

  if (value instanceof Error) {
    return {
      name: value.name,
      message: truncateString(value.message),
      stack: value.stack ? truncateString(value.stack) : undefined,
    };
  }

  if (typeof Event !== 'undefined' && value instanceof Event) {
    return {
      type: value.type,
      constructor: value.constructor.name,
    };
  }

  if (typeof Element !== 'undefined' && value instanceof Element) {
    return `<${value.tagName.toLowerCase()}>`;
  }

  if (depth >= MAX_DEPTH) {
    return `[${value instanceof Array ? 'Array' : 'Object'}]`;
  }

  if (Array.isArray(value)) {
    return value.slice(0, MAX_ITEMS).map((item) => sanitizeValue(item, depth + 1, seen));
  }

  if (typeof value === 'object') {
    if (seen.has(value)) {
      return '[Circular]';
    }

    seen.add(value);

    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .slice(0, MAX_ITEMS)
        .map(([key, nestedValue]) => [
          key,
          shouldRedact(key) ? '[REDACTED]' : sanitizeValue(nestedValue, depth + 1, seen),
        ]),
    );
  }

  return String(value);
}

function createLogEntry(type: BrowserLogType, data: unknown[]): BrowserLogEntry {
  return {
    type,
    timestamp: new Date().toISOString(),
    data: data.map((item) => sanitizeValue(item)),
    url: window.location.href,
    userAgent: navigator.userAgent,
  };
}

async function sendLogs(endpoint: string, logs: BrowserLogEntry[]) {
  try {
    const body = JSON.stringify({ logs });

    if (navigator.sendBeacon) {
      const sent = navigator.sendBeacon(
        endpoint,
        new Blob([body], { type: 'application/json' }),
      );

      if (sent) {
        return;
      }
    }

    await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body,
      keepalive: true,
      cache: 'no-store',
    });
  } catch {
    // Browser logging should stay best-effort only.
  }
}

export function BrowserLogger() {
  useEffect(() => {
    const endpoint = resolveEndpoint();

    if (!endpoint) {
      return;
    }

    const originalConsole = {
      log: console.log,
      info: console.info,
      warn: console.warn,
      error: console.error,
    };

    const logToServer = (type: BrowserLogType, args: unknown[]) => {
      void sendLogs(endpoint, [createLogEntry(type, args)]);
    };

    for (const method of CONSOLE_METHODS) {
      console[method] = (...args: unknown[]) => {
        originalConsole[method](...args);
        logToServer(method, args);
      };
    }

    const onError = (event: ErrorEvent) => {
      logToServer('window_error', [
        {
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          error: event.error,
        },
      ]);
    };

    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      logToServer('unhandled_rejection', [
        {
          message: 'Unhandled Promise Rejection',
          reason: event.reason,
        },
      ]);
    };

    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onUnhandledRejection);

    return () => {
      console.log = originalConsole.log;
      console.info = originalConsole.info;
      console.warn = originalConsole.warn;
      console.error = originalConsole.error;

      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onUnhandledRejection);
    };
  }, []);

  return null;
}
