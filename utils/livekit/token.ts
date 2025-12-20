import { LIVEKIT_CONFIG } from '@/constants/livekit';

export type LiveKitTokenResponse = {
  token: string;
};

export async function fetchLiveKitToken(params: {
  room: string;
  identity: string;
  name?: string;
}) {
  if (!LIVEKIT_CONFIG.tokenEndpoint) {
    throw new Error('LiveKit token endpoint is not configured');
  }

  const url = new URL(LIVEKIT_CONFIG.tokenEndpoint);
  url.searchParams.set('room', params.room);
  url.searchParams.set('identity', params.identity);
  if (params.name) url.searchParams.set('name', params.name);

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Token request failed (${response.status})`);
  }
  const data = (await response.json()) as LiveKitTokenResponse;
  if (!data?.token) {
    throw new Error('Token response missing token');
  }
  return data.token;
}

