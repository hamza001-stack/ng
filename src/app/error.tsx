'use client';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="container section empty" role="alert">
      <span className="eyebrow">SOMETHING INTERRUPTED</span>
      <h1>This page could not load.</h1>
      <p>Please try again. Your cart and saved products on this device are unchanged.</p>
      <Button onClick={reset}>
        Try again <ArrowRight size={16} />
      </Button>
    </div>
  );
}
