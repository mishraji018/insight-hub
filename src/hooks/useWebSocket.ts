import { useCallback, useEffect, useRef, useState } from "react";

type ConnectionStatus = "connecting" | "connected" | "disconnected" | "reconnecting" | "error";

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
    const token = sessionStorage.getItem("accessToken");
    
    // Guard: Don't attempt connection if no token exists yet
    if (!token) {
      setConnectionStatus("disconnected");
      return;
    }

    try {
      const wsUrl = `${url}?token=${token}`;
      setConnectionStatus("connecting");
      
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnectionStatus("connected");
        retriesRef.current = 0;

        if (import.meta.env.VITE_MOCK === 'true') {
          const interval = setInterval(() => {
            const mockMsg = {
              type: Math.random() > 0.8 ? 'anomaly_alert' : 'kpi_update',
              message: 'Simulated live update',
              data: {
                timestamp: new Date().toISOString(),
                value: 100 + Math.random() * 50
              }
            };
            setLastMessage({ data: JSON.stringify(mockMsg) } as MessageEvent);
          }, 5000);
          // Attach interval cleanup to WebSocket object so it can be cleared on close
          (ws as any)._mockInterval = interval;
        }
      };

      ws.onmessage = (event) => {
        setLastMessage(event);
      };

      ws.onclose = () => {
        if ((ws as any)._mockInterval) {
          clearInterval((ws as any)._mockInterval);
        }
        
        setConnectionStatus("disconnected");
        
        if (retriesRef.current < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, retriesRef.current), 30000);
          retriesRef.current += 1;
          setConnectionStatus("reconnecting");
          timeoutRef.current = setTimeout(connect, delay);
        } else {
          setConnectionStatus("error");
        }
      };

      ws.onerror = () => {
        // ws.close() triggers onclose which handles reconnection
        ws.close();
      };
    } catch (err) {
      console.error("WebSocket connection error:", err);
      setConnectionStatus("error");
    }
  }, [url]);

  useEffect(() => {
    connect();
    
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (wsRef.current) {
        if ((wsRef.current as any)._mockInterval) {
          clearInterval((wsRef.current as any)._mockInterval);
        }
        // Remove onclose handler so it doesn't trigger a reconnect when intentionally unmounting
        wsRef.current.onclose = null;
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connect]);

  const sendMessage = useCallback((data: string | object) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(typeof data === "string" ? data : JSON.stringify(data));
    }
  }, []);

  return { lastMessage, connectionStatus, sendMessage };
}
