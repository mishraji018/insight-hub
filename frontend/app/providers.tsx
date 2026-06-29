"use client"

import { SessionProvider } from "next-auth/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { useState } from "react";
import { SyncAuthStore } from "@/components/SyncAuthStore";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <SessionProvider>
      <SyncAuthStore />
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          {children}
          <Sonner />
        </TooltipProvider>
      </QueryClientProvider>
    </SessionProvider>
  )
}
