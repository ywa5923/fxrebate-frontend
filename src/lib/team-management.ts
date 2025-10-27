import { BASE_URL } from '@/constants';
import { BrokerDefaultTeamResponse } from '@/types';
import { getBearerToken } from './auth-actions';
import logger from './logger';

/**
 * Fetch broker's default team with users
 */
export async function getBrokerDefaultTeam(brokerId: number): Promise<BrokerDefaultTeamResponse> {
  const teamLogger = logger.child('TeamManagement/getBrokerDefaultTeam');
  
  try {
    // Get bearer token for authentication
    const bearerToken = await getBearerToken();
    if (!bearerToken) {
      throw new Error('Authentication token not found');
    }

    teamLogger.debug('Fetching broker default team', { 
      brokerId,
      url: `${BASE_URL}/broker-default-team/${brokerId}`,
      hasToken: !!bearerToken
    });

    const response = await fetch(`${BASE_URL}/broker-default-team/${brokerId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${bearerToken}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      teamLogger.error('API request failed', {
        status: response.status,
        statusText: response.statusText,
        errorBody: errorText,
        brokerId
      });
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const data: BrokerDefaultTeamResponse = await response.json();

    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch team data');
    }

    teamLogger.info('Broker default team fetched successfully', {
      teamId: data.data.id,
      teamName: data.data.name,
      userCount: data.data.users.length
    });

    return data;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    teamLogger.error('Error fetching broker default team', {
      error: errorMessage,
      brokerId
    });
    throw error;
  }
}
