import type { Metadata } from 'next';
import { Inter as FontSans } from 'next/font/google';

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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
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
      </body>
    </html>
  );
}
