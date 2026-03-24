"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./auth-context";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Bell } from "lucide-react";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    const socketUrl = apiUrl.replace("/api/v1", "");

    const socketInstance = io(socketUrl, {
      transports: ["websocket"],
    });

    socketInstance.on("connect", () => {
      setIsConnected(true);
      // console.log("Socket connected:", socketInstance.id);
      socketInstance.emit("join", user.id);
    });

    socketInstance.on("disconnect", () => {
      setIsConnected(false);
      // console.log("Socket disconnected");
    });

    socketInstance.on("notification", (notification) => {
      // console.log("New real-time notification received:", notification);
      // Directly invalidate the notifications query
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      
      // Show a visual toast notification
      toast(notification.title, {
        description: notification.message,
        icon: <Bell className="h-4 w-4 text-primary" />,
        action: notification.link ? {
          label: 'View',
          onClick: () => {
            // Use window.location.href or a router push if we had access to router
            window.location.href = notification.link;
          }
        } : undefined,
      });
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [user, queryClient]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);
