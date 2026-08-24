import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Inter, Poppins, Tiro_Bangla } from 'next/font/google';
import '@/styles/globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import NoticeBanner from '@/components/NoticeBanner';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import { AuthProvider } from '@/context/auth/AuthContext';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-poppins',
});

const tiroBangla = Tiro_Bangla({
  weight: '400',
  subsets: ['bengali'],
  display: 'swap',
  variable: '--font-tiro-bangla',
});

export const viewport = {
  themeColor: '#f97316',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://iskcondurgapur.com'),
  title: 'ISKCON Durgapur | Hare Krishna Temple & Community',
  description: 'Welcome to ISKCON Durgapur. Experience the divine atmosphere of Krishna Consciousness, explore Vedic wisdom, join daily aartis, and participate in spiritual festivals.',
  keywords: ['ISKCON', 'Durgapur', 'Krishna', 'Bhagavad Gita', 'Spirituality', 'Temple', 'Vedic Wisdom', 'Prasadam', 'Yoga', 'Meditation'],
  authors: [{ name: 'ISKCON Durgapur' }],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'ISKCON Durgapur',
  },
  openGraph: {
    title: 'ISKCON Durgapur | Hare Krishna Temple & Community',
    description: 'Experience the divine atmosphere of Krishna Consciousness. Join us for daily aartis, spiritual discourses, and nectarean prasadam.',
    url: 'https://iskcondurgapur.com',
    siteName: 'ISKCON Durgapur',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'ISKCON Durgapur Temple',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ISKCON Durgapur | Hare Krishna Temple & Community',
    description: 'Experience the divine atmosphere of Krishna Consciousness at ISKCON Durgapur.',
    images: ['/images/twitter-image.jpg'],
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.png', type: 'image/png', sizes: '32x32' },
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable} ${tiroBangla.variable}`}>
      <body className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex flex-col">
        <AuthProvider>
          <Navbar />
          <NoticeBanner />
          <main className="flex-grow">{children}</main>
          <Footer />
          <Suspense fallback={null}>
            <AnalyticsTracker />
          </Suspense>
        </AuthProvider>
      </body>
    </html>
  );
}