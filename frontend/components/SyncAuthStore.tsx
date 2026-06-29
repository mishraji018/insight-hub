"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";

export function SyncAuthStore() {
  const { data: session, status } = useSession();
  const setUser = useAuthStore(s => s.setUser);

  useEffect(() => {
    if (status === "loading") return;

    if (session?.user) {
      setUser({
        id: (session.user as any).id,
        email: session.user.email || "",
        name: session.user.name || "",
        role: (session.user as any).role || 'user',
        is_approved: true, // Assuming true since they are authenticated
        is_staff: (session.user as any).role === 'admin',
        theme_preference: 'dark', // or retrieve from somewhere
        avatar: session.user.image,
      } as any);
    } else {
      setUser(null);
    }
  }, [session, status, setUser]);

  return null;
}
