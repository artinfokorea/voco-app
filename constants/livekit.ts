export const LIVEKIT_CONFIG = {
  // LiveKit Cloud URL (client)
  serverUrl:
    process.env.EXPO_PUBLIC_LIVEKIT_URL ||
    'wss://voco-agent-project-8w4372xl.livekit.cloud',

  // 토큰 발급 API 엔드포인트 (서버에서 구현 필요)
  // 예) iOS 시뮬레이터: http://localhost:4000/token
  // 실기기: http://<내-PC-IP>:4000/token
  tokenEndpoint: process.env.EXPO_PUBLIC_LIVEKIT_TOKEN_ENDPOINT || '',

  // 기본 룸 이름
  defaultRoom: process.env.EXPO_PUBLIC_LIVEKIT_ROOM || 'voco-agent',
};
