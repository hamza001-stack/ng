import type { ReactNode } from 'react';
import { Instagram, Linkedin } from 'lucide-react';
import { publishedContact, publishedSocials } from '@/lib/company';

function XMark({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M18.244 2H21l-6.51 7.44L22 22h-6.79l-4.32-6.47L6.2 22H3.44l6.96-7.96L2 2h6.94l3.9 5.96L18.244 2Zm-1.19 18.2h1.88L7.03 3.69H5.02l12.034 16.51Z"
      />
    </svg>
  );
}

const icons: Record<string, (size: number) => ReactNode> = {
  instagram: (size) => <Instagram size={size} />,
  linkedin: (size) => <Linkedin size={size} />,
  x: (size) => <XMark size={size} />,
};

export function SocialLinks({
  size = 18,
  className = 'social-links',
}: {
  size?: number;
  className?: string;
}) {
  return (
    <nav className={className} aria-label="Official social profiles">
      {publishedSocials.map((item) => (
        <a
          key={item.id}
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={item.label}
        >
          {icons[item.id]?.(size)}
        </a>
      ))}
      <a href={`mailto:${publishedContact.email}`} aria-label="Email">
        <span className="social-mail">@</span>
      </a>
    </nav>
  );
}
