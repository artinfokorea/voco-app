const { AccessToken } = require('livekit-server-sdk');

// 사용법: node scripts/generate-token.js <API_KEY> <API_SECRET> <PARTICIPANT_NAME>
// 예시: node scripts/generate-token.js APIkey1234 Secret1234 User1

const apiKey = process.argv[2];
const apiSecret = process.argv[3];
const participantName = process.argv[4] || 'TestUser';
const roomName = 'test-room';

if (!apiKey || !apiSecret) {
  console.error(
    'Usage: node scripts/generate-token.js <API_KEY> <API_SECRET> [PARTICIPANT_NAME]'
  );
  process.exit(1);
}

const createToken = async () => {
  const at = new AccessToken(apiKey, apiSecret, {
    identity: participantName,
    ttl: '1h',
  });

  at.addGrant({
    roomJoin: true,
    room: roomName,
    canPublish: true,
    canSubscribe: true,
  });

  const token = await at.toJwt();
  console.log('Access Token Generated:');
  console.log(token);
};

createToken();
