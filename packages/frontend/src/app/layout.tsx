// src/app/layout.tsx
import type { Metadata, Viewport } from "next";
import dynamic from "next/dynamic";
import "./globals.css";

const Providers = dynamic(() => import("./providers").then((mod) => mod.Providers), { ssr: false });

export const metadata: Metadata = {
  title: "ExamPrep",
};

// Locks the viewport for a native-app feel inside Telegram's WebView —
// no pinch-zoom, no accidental double-tap zoom on quiz buttons.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      {/* Telegram injects the WebApp script; load it before hydration */}
      <head>
        <script src="https://telegram.org/js/telegram-web-app.js" async />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              document.addEventListener('contextmenu', e => e.preventDefault());
              document.addEventListener('keydown', e => {
                // Prevent F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U, and PrintScreen/Ctrl+P
                if (
                  e.key === 'F12' ||
                  (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
                  (e.ctrlKey && e.key === 'u') ||
                  (e.ctrlKey && e.key === 'p')
                ) {
                  e.preventDefault();
                }
              });
            `
          }}
        />
      </head>
      <body className="bg-white text-slate-900 antialiased overscroll-none">
        <Providers>
          <main className="mx-auto max-w-md h-screen">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
