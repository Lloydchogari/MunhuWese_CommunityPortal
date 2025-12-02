import type { Metadata } from 'next';
import { AuthProvider } from '@/context/AuthContext';
import { DataProvider } from '@/context/DataContext';
import SplashScreen from './SplashScreen';
import './globals.css'; 

export const metadata: Metadata = {
  title: 'Munhu Wese',
  description: 'Let\'s dive into exciting new events',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <DataProvider>
            <SplashScreen>{children}</SplashScreen>
          </DataProvider>
        </AuthProvider>
      </body>
    </html>
  );
}