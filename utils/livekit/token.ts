import { apiClient } from '@/utils/api-client';

export type LiveKitTokenResponse = {
  type: 'SUCCESS' | 'FAIL';
  exception?: {
    errorNo: string;
    message: string;
    validation?: Record<string, string>;
  };
  item?: {
    token: string;
    roomName: string;
  };
};

export async function fetchLiveKitToken(scenarioId: number): Promise<{
  token: string;
  roomName: string;
}> {
  console.log('[LiveKit] fetchLiveKitToken request', { scenarioId });

  try {
    const response = await apiClient.post<LiveKitTokenResponse>(
      '/livekit/token',
      { scenarioId }
    );
    console.log('[LiveKit] fetchLiveKitToken response', response.status);

    const data = response.data;

    if (data.type === 'FAIL' || !data.item) {
      const message = data.exception?.message || 'Token request failed';
      throw new Error(message);
    }

    return {
      token: data.item.token,
      roomName: data.item.roomName,
    };
  } catch (error) {
    console.log('[LiveKit] fetchLiveKitToken error', String(error));
    throw error;
  }
}
