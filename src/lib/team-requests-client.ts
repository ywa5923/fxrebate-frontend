'use client';

import { BASE_URL } from '@/constants';
import { getBearerToken } from './auth-actions';
import logger from './logger';

/**
 * Add a new user to the broker team (Client-side function)
 */
export async function addUserToBroker(brokerId: number, email: string, name: string, permissionAction: string): Promise<{ success: boolean; message: string }> {
  const teamLogger = logger.child('team-requests-client/addUserToBroker');
  
  try {
    // Get bearer token for authentication
    const bearerToken = await getBearerToken();
    if (!bearerToken) {
      throw new Error('Authentication token not found');
    }

    teamLogger.debug('Adding user to broker team', { 
      brokerId,
      email,
      name,
      permissionAction
    });

    const response = await fetch(`${BASE_URL}/add-user-to-broker`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${bearerToken}`,
      },
      body: JSON.stringify({ 
        broker_id: brokerId,
        email,
        name,
        permission_action: permissionAction
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      teamLogger.error('API request failed', {
        status: response.status,
        statusText: response.statusText,
        errorBody: errorText,
        brokerId,
        email
      });
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || 'Failed to add user to team');
    }

    teamLogger.info('User added to broker team successfully', {
      brokerId,
      email
    });

    return data;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    teamLogger.error('Error adding user to broker team', {
      error: errorMessage,
      brokerId,
      email
    });
    throw error;
  }
}

