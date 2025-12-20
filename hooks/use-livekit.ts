import { LIVEKIT_CONFIG } from '@/constants/livekit';
import { fetchLiveKitToken } from '@/utils/livekit/token';
import { AudioSession, registerGlobals } from '@livekit/react-native';
import {
  ConnectionState,
  RemoteParticipant,
  Room,
  RoomEvent,
  Track,
} from 'livekit-client';
import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';

// LiveKit 전역 설정 등록
registerGlobals();

export interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: Date;
  isLocal: boolean;
}

export interface UseLiveKitReturn {
  // 연결 상태
  room: Room | null;
  connectionState: ConnectionState;
  isConnecting: boolean;
  isConnected: boolean;

  // 입력 상태
  serverUrl: string;
  setServerUrl: (url: string) => void;
  token: string;
  setToken: (token: string) => void;
  roomName: string;
  setRoomName: (roomName: string) => void;
  hasTokenEndpoint: boolean;

  // 음성 상태
  isMicEnabled: boolean;
  participants: string[];

  // 채팅 상태
  messages: ChatMessage[];

  // 액션
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  toggleMic: () => Promise<void>;
  sendMessage: (text: string) => Promise<void>;
}

export function useLiveKit(): UseLiveKitReturn {
  const [serverUrl, setServerUrl] = useState(LIVEKIT_CONFIG.serverUrl);
  const [token, setToken] = useState('');
  const [roomName, setRoomName] = useState(LIVEKIT_CONFIG.defaultRoom);
  const [connectionState, setConnectionState] = useState<ConnectionState>(
    ConnectionState.Disconnected
  );
  const [room, setRoom] = useState<Room | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // 음성 통화 상태
  const [isMicEnabled, setIsMicEnabled] = useState(true);
  const [participants, setParticipants] = useState<string[]>([]);

  // 채팅 상태
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // 오디오 세션 설정
  useEffect(() => {
    const setupAudio = async () => {
      await AudioSession.startAudioSession();
    };
    setupAudio();

    return () => {
      AudioSession.stopAudioSession();
    };
  }, []);

  // 시스템 메시지 추가
  const addSystemMessage = useCallback((text: string) => {
    const message: ChatMessage = {
      id: Date.now().toString(),
      sender: 'System',
      text,
      timestamp: new Date(),
      isLocal: false,
    };
    setMessages((prev) => [...prev, message]);
  }, []);

  // 방 이벤트 핸들러 설정
  const setupRoomEvents = useCallback(
    (newRoom: Room) => {
      newRoom.on(RoomEvent.ConnectionStateChanged, (state: ConnectionState) => {
        setConnectionState(state);
      });

      newRoom.on(
        RoomEvent.ParticipantConnected,
        (participant: RemoteParticipant) => {
          setParticipants((prev) => [...prev, participant.identity]);
          addSystemMessage(`${participant.identity}님이 입장했습니다.`);
        }
      );

      newRoom.on(
        RoomEvent.ParticipantDisconnected,
        (participant: RemoteParticipant) => {
          setParticipants((prev) =>
            prev.filter((p) => p !== participant.identity)
          );
          addSystemMessage(`${participant.identity}님이 퇴장했습니다.`);
        }
      );

      newRoom.on(
        RoomEvent.DataReceived,
        (payload: Uint8Array, participant?: RemoteParticipant) => {
          try {
            const decoder = new TextDecoder();
            const message = JSON.parse(decoder.decode(payload));
            if (message.type === 'chat') {
              const newMessage: ChatMessage = {
                id: Date.now().toString(),
                sender: participant?.identity || 'Unknown',
                text: message.text,
                timestamp: new Date(),
                isLocal: false,
              };
              setMessages((prev) => [...prev, newMessage]);
            }
          } catch (e) {
            console.error('메시지 파싱 오류:', e);
          }
        }
      );

      newRoom.on(
        RoomEvent.TrackSubscribed,
        (track, publication, participant) => {
          if (track.kind === Track.Kind.Audio) {
            console.log(`오디오 구독: ${participant.identity}`);
          }
        }
      );
    },
    [addSystemMessage]
  );

  // 방 연결
  const connect = useCallback(async () => {
    if (!serverUrl) {
      Alert.alert('오류', 'LiveKit 서버 URL을 입력해주세요.');
      return;
    }

    try {
      setIsConnecting(true);
      let resolvedToken = token;
      if (!resolvedToken && LIVEKIT_CONFIG.tokenEndpoint) {
        resolvedToken = await fetchLiveKitToken({
          room: roomName,
          identity: `user-${Date.now()}`,
        });
        setToken(resolvedToken);
      }
      if (!resolvedToken) {
        Alert.alert(
          '오류',
          LIVEKIT_CONFIG.tokenEndpoint
            ? '토큰 발급에 실패했습니다.'
            : '토큰을 입력해주세요.'
        );
        return;
      }

      const newRoom = new Room();
      setupRoomEvents(newRoom);

      await newRoom.connect(serverUrl, resolvedToken);
      await newRoom.localParticipant.setMicrophoneEnabled(true);

      const existingParticipants = Array.from(
        newRoom.remoteParticipants.values()
      ).map((p) => p.identity);
      setParticipants(existingParticipants);

      setRoom(newRoom);
      addSystemMessage('방에 연결되었습니다.');
    } catch (error) {
      console.error('연결 실패:', error);
      Alert.alert(
        '연결 실패',
        '방 연결에 실패했습니다. URL과 토큰을 확인해주세요.'
      );
    } finally {
      setIsConnecting(false);
    }
  }, [serverUrl, token, roomName, setupRoomEvents, addSystemMessage]);

  // 방 연결 해제
  const disconnect = useCallback(async () => {
    if (room) {
      await room.disconnect();
      setRoom(null);
      setConnectionState(ConnectionState.Disconnected);
      setParticipants([]);
      setMessages([]);
    }
  }, [room]);

  // 마이크 토글
  const toggleMic = useCallback(async () => {
    if (room) {
      const newState = !isMicEnabled;
      await room.localParticipant.setMicrophoneEnabled(newState);
      setIsMicEnabled(newState);
    }
  }, [room, isMicEnabled]);

  // 채팅 메시지 전송
  const sendMessage = useCallback(
    async (text: string) => {
      if (!room || !text.trim()) return;

      const messageData = {
        type: 'chat',
        text: text.trim(),
      };

      const encoder = new TextEncoder();
      const data = encoder.encode(JSON.stringify(messageData));

      try {
        await room.localParticipant.publishData(data, { reliable: true });

        const newMessage: ChatMessage = {
          id: Date.now().toString(),
          sender: 'Me',
          text: text.trim(),
          timestamp: new Date(),
          isLocal: true,
        };
        setMessages((prev) => [...prev, newMessage]);
      } catch (error) {
        console.error('메시지 전송 실패:', error);
      }
    },
    [room]
  );

  const isConnected = connectionState === ConnectionState.Connected;

  return {
    room,
    connectionState,
    isConnecting,
    isConnected,
    serverUrl,
    setServerUrl,
    token,
    setToken,
    roomName,
    setRoomName,
    hasTokenEndpoint: Boolean(LIVEKIT_CONFIG.tokenEndpoint),
    isMicEnabled,
    participants,
    messages,
    connect,
    disconnect,
    toggleMic,
    sendMessage,
  };
}
