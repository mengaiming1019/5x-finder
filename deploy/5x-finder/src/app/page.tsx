'use client';

import dynamic from 'next/dynamic';

const HomeContent = dynamic(() => import('./HomeContent'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-muted-foreground text-sm">Loading 5X Finder...</p>
      </div>
    </div>
  ),
});

export default function Home() {
  return <HomeContent />;
}
