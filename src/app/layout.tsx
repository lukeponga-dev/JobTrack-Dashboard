import type { Metadata } from 'next';
import { Inter as FontSans } from 'next/font/google';
import Script from 'next/script';

import './globals.css';

import { cn } from '@/lib/utils';
import { Providers } from '@/components/providers';
import { FirebaseClientProvider } from '@/firebase';

const fontSans = FontSans({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'JobTrack - Job Application Tracker',
  description: 'A secure, responsive dashboard to track job applications.',
  icons: {
    icon: '/favicon.ico',
  },
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#000000" />
      </head>
      <body className={cn('font-sans antialiased', fontSans.variable)}>
        <FirebaseClientProvider>
          <Providers
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </Providers>
        </FirebaseClientProvider>
        <Script id="service-worker-registration">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js').then(registration => {
                  console.log('SW registered: ', registration);
                }).catch(registrationError => {
                  console.log('SW registration failed: ', registrationError);
                });
              });
            }
          `}
        </Script>
      </body>
    </html>
  );
}
