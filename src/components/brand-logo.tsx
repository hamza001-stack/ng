import Image from 'next/image';

export function BrandLogo({
  className = 'nevie-logo-clean',
  width = 360,
  height = 80,
  priority = false,
  alt = 'NEVIE-GLOBAL',
}: {
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  alt?: string;
}) {
  return (
    <Image
      src="/brand/logo.webp"
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority={priority}
    />
  );
}
