import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Noto_Sans_JP, Zen_Kaku_Gothic_New } from 'next/font/google'
import { SessionProvider } from 'next-auth/react'
import './globals.css'
import { QueryProvider } from '@/components/query-provider'

const notoSansJp = Noto_Sans_JP({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-noto-sans-jp',
})

const zenKaku = Zen_Kaku_Gothic_New({
  subsets: ['latin'],
  weight: ['500', '700', '900'],
  variable: '--font-zen-kaku',
})

export const metadata: Metadata = {
  icons: { icon: { url: '/icon.svg', type: 'image/svg+xml' } },
  title: 'Auto Machare | 車両の売買・リース・運搬マッチング',
  description:
    '軽自動車・乗用車・SUV・トラック・バンを、売る・買う・リースする・運ぶ。残価設定リースで、乗ってから買うかを決められます。',
}

export const viewport: Viewport = {
  themeColor: '#182022',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="ja"
      data-scroll-behavior="smooth"
      className={`light ${notoSansJp.variable} ${zenKaku.variable} bg-background`}
    >
      <body className="font-sans antialiased">
        <SessionProvider>
          <QueryProvider>{children}</QueryProvider>
        </SessionProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
