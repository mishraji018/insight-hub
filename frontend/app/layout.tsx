import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import { Toaster } from 'react-hot-toast';
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

import { Providers } from "./providers";
import { ThemeSelector } from "@/components/ui/ThemeSelector";

export const metadata: Metadata = {
  title: "Insight Hub",
  description: "Next Generation Analytics and Dashboards",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Dynamic Google Fonts Loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&family=Dancing+Script&family=Playfair+Display&family=Oswald&family=JetBrains+Mono&family=Nunito&family=Merriweather&family=Raleway&family=Cinzel&family=Caveat&display=swap" rel="stylesheet" />
        
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('app-theme') || 'cherry';
                  const font = localStorage.getItem('selectedFont') || 'Inter';
                  const lang = localStorage.getItem('app-lang') || 'en';
                  
                  document.documentElement.setAttribute('data-theme', theme);
                  document.documentElement.style.setProperty('--app-font', font);
                  document.documentElement.setAttribute('lang', lang);
                  
                  if (lang === 'ar') {
                    document.documentElement.setAttribute('dir', 'rtl');
                  } else {
                    document.documentElement.setAttribute('dir', 'ltr');
                  }
                  
                  if (theme === 'dark') document.documentElement.classList.add('dark');
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={cn(inter.className, "transition-colors duration-500")}>
        <Providers>
          <div className="min-h-screen bg-background text-text selection:bg-accent selection:text-white relative">
            {children}
            <ThemeSelector />
          </div>
          <Toaster 
            position="top-right" 
            toastOptions={{
              duration: 3000,
              style: {
                background: '#0a0a0a',
                color: '#F9FAFB',
                border: '1px solid rgba(255,255,255,0.05)',
                fontSize: '11px',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                letterSpacing: '0.1em'
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
