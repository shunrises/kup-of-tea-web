import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import { Toaster } from 'react-hot-toast'
import './globals.css'
import { Providers } from './providers'
import { defaultMetadata } from '@/shared/getMetadata'

export const metadata: Metadata = defaultMetadata

export const viewport: Viewport = {
  themeColor: '#FFFFFF',
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  colorScheme: 'light',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko">
      <head>
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-MJMY1VFJB8"
        />
        <Script id="google-analytics">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-MJMY1VFJB8');
          `}
        </Script>
      </head>
      <body className="font-pretendard tracking-[-2%] flex items-center justify-center min-h-dvh bg-gray-100">
        <Providers>
          <div className="max-w-lg w-full">
            <div className="fixed py-1 max-w-lg flex left-0 right-0 mx-auto top-0 w-full bg-pink-300 bg-opacity-35 text-center items-center justify-center">
              <a
                href="https://www.ducktility.studio/"
                className="underline font-semibold text-blue-600"
              >
                덕틸리티
              </a>
              <span className="font-regular">에서 새롭게 만나요!</span>
            </div>
        {children}
          </div>
        </Providers>
        <Toaster />
      </body>
    </html>
  )
}
