import { Metadata } from 'next'

const ABOUT_URL = 'https://www.winningadventure.com.au/about'
const ABOUT_TITLE = "About Us: Australia's China Sourcing Partner"

export const metadata: Metadata = {
  // absolute: avoid root title.template doubling "| Winning Adventure Global"
  title: { absolute: `${ABOUT_TITLE} | Winning Adventure Global` },
  description:
    'Winning Adventure Global is based in Australia. Founder Andy Liu helps Australian businesses find and verify Chinese manufacturers across electronics, furniture, apparel, machinery, and more.',
  keywords: [
    'china sourcing adelaide',
    'andy liu china sourcing',
    'verified chinese manufacturers australia',
    'china supplier connection service',
    'south australia china sourcing',
    'australia-based china sourcing company',
  ],
  alternates: {
    canonical: ABOUT_URL,
    languages: {
      'en-AU': ABOUT_URL,
      'x-default': ABOUT_URL,
    },
  },
  openGraph: {
    title: `${ABOUT_TITLE} | Winning Adventure Global`,
    description:
      'Based in Australia. Learn how we help Australian businesses connect with verified Chinese manufacturers.',
    url: ABOUT_URL,
  },
}
