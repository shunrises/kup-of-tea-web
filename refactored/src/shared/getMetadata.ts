import type { Metadata } from 'next'

export const defaultMetadata: Metadata = {
  metadataBase: new URL('https://k-tea.love/'),
  title: 'K-POP 아이돌 취향표 생성기',
  description: 'K-POP 아이돌 취향표 생성기',
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: 'https://k-tea.love/',
    title: 'K-POP 아이돌 취향표 생성기',
    description: 'K-POP 아이돌 취향표 생성기',
    images: [
      {
        url: 'https://k-tea.love/meta.png',
        width: 800,
        height: 400,
        alt: 'K-POP 아이돌 취향표 생성기',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'K-POP 아이돌 취향표 생성기',
    description: 'K-POP 아이돌 취향표 생성기',
    site: 'https://k-tea.love/',
    images: [
      {
        url: 'https://k-tea.love/meta.png',
        width: 800,
        height: 400,
        alt: 'K-POP 아이돌 취향표 생성기',
      },
    ],
  },
}
