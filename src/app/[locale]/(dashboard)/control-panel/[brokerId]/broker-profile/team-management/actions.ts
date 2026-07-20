'use server'

import { BASE_URL } from '@/constants'
import { getBearerToken } from '@/lib/auth-actions'
import logger from '@/lib/logger'
import { revalidatePath } from 'next/cache'

export async function addMemberToBroker(
  brokerId: number,
  email: string,
  name: string,
  permissionAction: string
) {
  const actionLogger = logger.child('AddMemberAction')
  
  try {
    const bearerToken = await getBearerToken()
    if (!bearerToken) {
      throw new Error('Authentication token not found')
    }

    actionLogger.debug('Adding user to broker team', { 
      brokerId,
      email,
      name,
      permissionAction
    })

    const response = await fetch(`${BASE_URL}/brokers/${brokerId}/broker-team-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${bearerToken}`,
      },
      body: JSON.stringify({ 
        broker_id: brokerId.toString(),
        email,
        name,
        permission_action: permissionAction
      }),
    })

    const data = await response.json()

    if (!data.success) {
      const errorMessage = Object.values(data.errors ?? {})
        .flat()
        .join('; ')

      throw new Error(errorMessage || data.message || 'Request failed')
    }

    actionLogger.info('User added to broker team successfully', {
      brokerId,
      email
    })

    // Revalidate the team management page to show the new member
    revalidatePath(`/en/control-panel/${brokerId}/broker-profile/team-management`)

    return {
      success: true,
      message: data.message || 'User added successfully'
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    actionLogger.error('Error adding user to broker team', {
      error: errorMessage,
      brokerId,
      email
    })
    return {
      success: false,
      message: errorMessage
    }
  }
}

/**
 * Update a broker team user
 */
export async function updateBrokerTeamUser(
  brokerId: number,
  userId: number,
  data: {
    name: string
    permission_action: string
    is_active: boolean
  }
) {
  const actionLogger = logger.child('UpdateTeamUserAction')
  
  try {
    const bearerToken = await getBearerToken()
    if (!bearerToken) {
      throw new Error('Authentication token not found')
    }

    actionLogger.debug('Updating broker team user', { brokerId, userId, data })

    const response = await fetch(`${BASE_URL}/brokers/${brokerId}/broker-team-user/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${bearerToken}`,
      },
      body: JSON.stringify(data),
    })

    const result = await response.json()

    if (!result.success) {
      const errorMessage = Object.values(result.errors ?? {})
        .flat()
        .join('; ')

      throw new Error(errorMessage || result.message || 'Request failed')
    }

    actionLogger.info('Broker team user updated successfully', { brokerId, userId })

    revalidatePath(`/en/control-panel/${brokerId}/broker-profile/team-management`)

    return {
      success: true,
      message: result.message || 'User updated successfully'
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    actionLogger.error('Error updating broker team user', {
      error: errorMessage,
      brokerId,
      userId
    })
    return {
      success: false,
      message: errorMessage
    }
  }
}

/**
 * Delete a broker team user
 */
export async function deleteBrokerTeamUser(brokerId: number, userId: number) {
  const actionLogger = logger.child('DeleteTeamUserAction')
  
  try {
    const bearerToken = await getBearerToken()
    if (!bearerToken) {
      throw new Error('Authentication token not found')
    }

    actionLogger.debug('Deleting broker team user', { brokerId, userId })

    const response = await fetch(`${BASE_URL}/brokers/${brokerId}/broker-team-user/${userId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${bearerToken}`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      actionLogger.error('API request failed', {
        status: response.status,
        statusText: response.statusText,
        errorBody: errorText,
        brokerId,
        userId
      })
      throw new Error(`Failed to delete user: ${errorText}`)
    }

    actionLogger.info('Broker team user deleted successfully', { brokerId, userId })

    revalidatePath(`/en/control-panel/${brokerId}/broker-profile/team-management`)

    return {
      success: true,
      message: 'User deleted successfully'
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    actionLogger.error('Error deleting broker team user', {
      error: errorMessage,
      brokerId,
      userId
    })
    return {
      success: false,
      message: errorMessage
    }
  }
}

