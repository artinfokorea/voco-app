export const LIVEKIT_CONFIG = {
  // LiveKit Cloud URL (client)
  serverUrl:
    process.env.EXPO_PUBLIC_LIVEKIT_URL ||
    'wss://voco-agent-project-8w4372xl.livekit.cloud',

  // 기본 룸 이름 (서버에서 반환된 roomName 사용 전 초기값)
  defaultRoom: process.env.EXPO_PUBLIC_LIVEKIT_ROOM || 'voco-agent',
};
