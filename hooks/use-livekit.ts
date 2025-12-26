import { LIVEKIT_CONFIG } from '@/constants/livekit';
import { fetchLiveKitToken } from '@/utils/livekit/token';
import { tokenStorage } from '@/utils/token';
import { AudioSession, registerGlobals } from '@livekit/react-native';
import {
  ConnectionState,
  DisconnectReason,
  RemoteParticipant,
  Room,
  RoomEvent,
  TrackPublication,
} from 'livekit-client';
import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';

// LiveKit 전역 설정 등록
registerGlobals();

function logLiveKit(...args: unknown[]) {
  console.log('[LiveKit]', ...args);
}

function isAgentIdentity(identity: string) {
  return identity.toLowerCase().includes('agent');
}

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
  agentIdentity: string | null;
  isAgentConnected: boolean;

  // 입력 상태
  serverUrl: string;
  setServerUrl: (url: string) => void;
  token: string;
  setToken: (token: string) => void;
  roomName: string;
  setRoomName: (roomName: string) => void;

  // 음성 상태
  isMicEnabled: boolean;
  participants: string[];

  // 채팅 상태
  messages: ChatMessage[];

  // 액션
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  toggleMic: () => Promise<void>;
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
  const [localIdentity, setLocalIdentity] = useState<string>('');
  const [agentIdentity, setAgentIdentity] = useState<string | null>(null);

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

  // 화면(훅) 언마운트 시 방 연결 정리
  useEffect(() => {
    return () => {
      if (room) {
        room.disconnect();
      }
    };
  }, [room]);

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
    logLiveKit('system', text);
  }, []);

  const addTranscriptionMessage = useCallback(
    (
      senderIdentity: string,
      segment: {
        id: string;
        text: string;
        final: boolean;
        lastReceivedTime?: number;
      }
    ) => {
      const normalizedText = segment.text.trim();
      if (!normalizedText) return;

      const isAgent = senderIdentity.toLowerCase().includes('agent');
      const isLocal = localIdentity
        ? senderIdentity === localIdentity
        : !isAgent;

      setMessages((prev) => {
        const messageId = `transcription:${senderIdentity}:${segment.id}`;
        const existingIndex = prev.findIndex((m) => m.id === messageId);
        const timestampMs = segment.lastReceivedTime ?? Date.now();

        if (existingIndex !== -1) {
          const existing = prev[existingIndex];
          if (existing.text === normalizedText) return prev;
          const updated = prev.slice();
          updated[existingIndex] = {
            ...existing,
            text: normalizedText,
            timestamp: new Date(timestampMs),
          };
          return updated;
        }

        const message: ChatMessage = {
          id: messageId,
          sender: senderIdentity,
          text: normalizedText,
          timestamp: new Date(timestampMs),
          isLocal,
        };
        return [...prev, message];
      });
    },
    [localIdentity]
  );

  const dumpRoomSnapshot = useCallback((targetRoom: Room, label: string) => {
    const localParticipant = targetRoom.localParticipant as unknown as {
      identity?: string;
      sid?: string;
      name?: string;
      trackPublications?: Map<string, TrackPublication>;
    };

    const describeTrackPubs = (pubs?: Map<string, TrackPublication>) => {
      if (!pubs) return [];
      return Array.from(pubs.values()).map((pub) => ({
        trackSid: (pub as unknown as { trackSid?: string }).trackSid,
        kind: (pub as unknown as { kind?: string }).kind,
        source: (pub as unknown as { source?: string }).source,
        muted: (pub as unknown as { isMuted?: boolean }).isMuted,
        subscribed: (pub as unknown as { isSubscribed?: boolean }).isSubscribed,
      }));
    };

    const remoteSummaries = Array.from(
      targetRoom.remoteParticipants.values()
    ).map((p) => ({
      identity: p.identity,
      sid: p.sid,
      name: (p as unknown as { name?: string }).name,
      tracks: describeTrackPubs(
        (p as unknown as { trackPublications?: Map<string, TrackPublication> })
          .trackPublications
      ),
    }));

    logLiveKit('room snapshot', label, {
      name: targetRoom.name,
      sid: (targetRoom as unknown as { sid?: string }).sid,
      connectionState: targetRoom.state,
      local: {
        identity: localParticipant.identity,
        sid: localParticipant.sid,
        name: localParticipant.name,
        tracks: describeTrackPubs(localParticipant.trackPublications),
      },
      remoteCount: remoteSummaries.length,
      remotes: remoteSummaries,
    });
  }, []);

  const syncAgentFromRoom = useCallback((targetRoom: Room) => {
    const agent = Array.from(targetRoom.remoteParticipants.values()).find((p) =>
      isAgentIdentity(p.identity)
    );
    setAgentIdentity(agent?.identity ?? null);
  }, []);

  // 방 이벤트 핸들러 설정
  const setupRoomEvents = useCallback(
    (newRoom: Room) => {
      newRoom.on(RoomEvent.ConnectionStateChanged, (state: ConnectionState) => {
        setConnectionState(state);
        logLiveKit('connection state', state);
      });

      newRoom.on(RoomEvent.Connected, () => {
        const identity = newRoom.localParticipant.identity;
        setLocalIdentity(identity);
        logLiveKit('connected', { room: newRoom.name, identity });
        dumpRoomSnapshot(newRoom, 'connected');
        syncAgentFromRoom(newRoom);
      });

      newRoom.on(RoomEvent.Disconnected, (reason?: DisconnectReason) => {
        logLiveKit('disconnected', reason ?? 'unknown');
        dumpRoomSnapshot(newRoom, 'disconnected');
        setAgentIdentity(null);
      });

      newRoom.on(
        RoomEvent.ParticipantConnected,
        (participant: RemoteParticipant) => {
          setParticipants((prev) => [...prev, participant.identity]);
          addSystemMessage(`${participant.identity}님이 입장했습니다.`);
          logLiveKit('participant connected', {
            identity: participant.identity,
            sid: participant.sid,
          });
          dumpRoomSnapshot(newRoom, 'participantConnected');
          if (isAgentIdentity(participant.identity)) {
            setAgentIdentity(participant.identity);
          }
        }
      );

      newRoom.on(
        RoomEvent.ParticipantDisconnected,
        (participant: RemoteParticipant) => {
          setParticipants((prev) =>
            prev.filter((p) => p !== participant.identity)
          );
          addSystemMessage(`${participant.identity}님이 퇴장했습니다.`);
          logLiveKit('participant disconnected', {
            identity: participant.identity,
            sid: participant.sid,
          });
          dumpRoomSnapshot(newRoom, 'participantDisconnected');
          setAgentIdentity((current) =>
            current === participant.identity ? null : current
          );
        }
      );

      newRoom.on(
        RoomEvent.DataReceived,
        (
          payload: Uint8Array,
          participant?: RemoteParticipant,
          kind?: unknown,
          topic?: string
        ) => {
          try {
            const decoder = new TextDecoder();
            const message = JSON.parse(decoder.decode(payload));
            if (message.type === 'chat') {
              logLiveKit('data received', {
                from: participant?.identity ?? 'unknown',
                kind,
                topic,
                type: 'chat',
                text: message.text,
              });
              const newMessage: ChatMessage = {
                id: Date.now().toString(),
                sender: participant?.identity || 'Unknown',
                text: message.text,
                timestamp: new Date(),
                isLocal: false,
              };
              setMessages((prev) => [...prev, newMessage]);
            } else {
              logLiveKit('data received', {
                from: participant?.identity ?? 'unknown',
                kind,
                topic,
                message,
              });
            }
          } catch (e) {
            console.error('메시지 파싱 오류:', e);
            logLiveKit('data received (unparsed)', {
              from: participant?.identity ?? 'unknown',
              kind,
              topic,
              bytes: payload.byteLength,
            });
          }
        }
      );

      newRoom.on(RoomEvent.TranscriptionReceived, (segments, participant) => {
        const sender = participant?.identity ?? 'unknown';
        for (const segment of segments) {
          if (!segment.text?.trim()) continue;
          addTranscriptionMessage(sender, segment);
          logLiveKit('transcription', {
            from: sender,
            id: segment.id,
            final: segment.final,
            text: segment.text,
          });
        }
      });

      newRoom.on(
        RoomEvent.TrackSubscribed,
        (track, publication, participant) => {
          logLiveKit('track subscribed', {
            from: participant.identity,
            kind: track.kind,
            source: publication.source,
            trackSid: publication.trackSid,
          });
          dumpRoomSnapshot(newRoom, 'trackSubscribed');
        }
      );

      newRoom.on(RoomEvent.TrackPublished, (publication, participant) => {
        logLiveKit('track published', {
          from: participant.identity,
          source: publication.source,
          kind: publication.kind,
          trackSid: publication.trackSid,
        });
        syncAgentFromRoom(newRoom);
      });

      newRoom.on(RoomEvent.TrackUnpublished, (publication, participant) => {
        logLiveKit('track unpublished', {
          from: participant.identity,
          source: publication.source,
          kind: publication.kind,
          trackSid: publication.trackSid,
        });
        syncAgentFromRoom(newRoom);
      });

      newRoom.on(RoomEvent.TrackMuted, (publication, participant) => {
        logLiveKit('track muted', {
          participant: participant.identity,
          source: (publication as unknown as { source?: string }).source,
          kind: (publication as unknown as { kind?: string }).kind,
          trackSid: (publication as unknown as { trackSid?: string }).trackSid,
        });
      });

      newRoom.on(RoomEvent.TrackUnmuted, (publication, participant) => {
        logLiveKit('track unmuted', {
          participant: participant.identity,
          source: (publication as unknown as { source?: string }).source,
          kind: (publication as unknown as { kind?: string }).kind,
          trackSid: (publication as unknown as { trackSid?: string }).trackSid,
        });
      });
    },
    [
      addSystemMessage,
      dumpRoomSnapshot,
      addTranscriptionMessage,
      syncAgentFromRoom,
    ]
  );

  // 방 연결
  const connect = useCallback(async () => {
    if (!serverUrl) {
      Alert.alert('오류', 'LiveKit 서버 URL을 입력해주세요.');
      return;
    }

    // 로그인 상태 확인
    const accessToken = await tokenStorage.getAccessToken();
    if (!accessToken) {
      Alert.alert('오류', '로그인이 필요합니다.');
      return;
    }

    try {
      setIsConnecting(true);

      // API에서 토큰과 룸 이름 가져오기
      const { token: liveKitToken, roomName: serverRoomName } =
        await fetchLiveKitToken();
      setToken(liveKitToken);
      setRoomName(serverRoomName);

      const newRoom = new Room();
      setupRoomEvents(newRoom);

      logLiveKit('connect', { serverUrl, roomName: serverRoomName });
      await newRoom.connect(serverUrl, liveKitToken);
      await newRoom.localParticipant.setMicrophoneEnabled(true);
      setIsMicEnabled(true);

      const existingParticipants = Array.from(
        newRoom.remoteParticipants.values()
      ).map((p) => p.identity);
      setParticipants(existingParticipants);
      syncAgentFromRoom(newRoom);

      setRoom(newRoom);
      addSystemMessage('방에 연결되었습니다.');
    } catch (error) {
      console.error('연결 실패:', error);
      logLiveKit('connect error', String(error));
      Alert.alert('연결 실패', '방 연결에 실패했습니다.');
    } finally {
      setIsConnecting(false);
    }
  }, [serverUrl, setupRoomEvents, addSystemMessage, syncAgentFromRoom]);

  // 방 연결 해제
  const disconnect = useCallback(async () => {
    if (room) {
      await room.disconnect();
      setRoom(null);
      setConnectionState(ConnectionState.Disconnected);
      setParticipants([]);
      setMessages([]);
      logLiveKit('local disconnect');
      setAgentIdentity(null);
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

  const isConnected = connectionState === ConnectionState.Connected;

  return {
    room,
    connectionState,
    isConnecting,
    isConnected,
    agentIdentity,
    isAgentConnected: Boolean(agentIdentity),
    serverUrl,
    setServerUrl,
    token,
    setToken,
    roomName,
    setRoomName,
    isMicEnabled,
    participants,
    messages,
    connect,
    disconnect,
    toggleMic,
  };
}
