import type { MetadataRoute } from 'next';
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'NEVIE-GLOBAL UK',
    short_name: 'NEVIE UK',
    description: 'Technology, products and learning for your next chapter.',
    start_url: '/',
    display: 'standalone',
    background_color: '#08090b',
    theme_color: '#08090b',
    icons: [{ src: '/icon.png', sizes: '192x192', type: 'image/png' }],
  };
}

export const dynamic = 'force-static';
