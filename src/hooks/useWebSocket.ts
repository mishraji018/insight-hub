import { useCallback, useEffect, useRef, useState } from "react";

type ConnectionStatus = "connecting" | "connected" | "disconnected" | "reconnecting";

interface UseWebSocketReturn {
  lastMessage: MessageEvent | null;
  connectionStatus: ConnectionStatus;
  sendMessage: (data: string | object) => void;
}

export function useWebSocket(url: string): UseWebSocketReturn {
  const [lastMessage, setLastMessage] = useState<MessageEvent | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("disconnected");
  const wsRef = useRef<WebSocket | null>(null);
  const retriesRef = useRef(0);
  const maxRetries = 10;
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const connect = useCallback(() => {
    const token = localStorage.getItem("access_token");
    const wsUrl = token ? `${url}?token=${token}` : url;

    setConnectionStatus("connecting");
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnectionStatus("connected");
      retriesRef.current = 0;
    };

    ws.onmessage = (event) => {
      setLastMessage(event);
    };

    ws.onclose = () => {
      setConnectionStatus("disconnected");
      if (retriesRef.current < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, retriesRef.current), 30000);
        retriesRef.current += 1;
        setConnectionStatus("reconnecting");
        timeoutRef.current = setTimeout(connect, delay);
      }
    };

    ws.onerror = () => {
      ws.close();
    };
  }, [url]);

  useEffect(() => {
    connect();
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      wsRef.current?.close();
    };
  }, [connect]);

  const sendMessage = useCallback((data: string | object) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(typeof data === "string" ? data : JSON.stringify(data));
    }
  }, []);

  return { lastMessage, connectionStatus, sendMessage };
}
