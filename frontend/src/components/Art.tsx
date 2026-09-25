import { art } from '@/lib/art';

interface Props {
  /** Path inside public/art without the extension, e.g. "status/baking". */
  src: string;
  size: number;
  /** Leave empty when the picture is decorative (the text next to it says the same thing). */
  alt?: string;
  className?: string;
}

/** One illustration from public/art. They're small and pre-sized, so a plain img is enough. */
export function Art({ src, size, alt = '', className }: Props) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img className={className ? `art ${className}` : 'art'} src={art(src)} width={size} height={size} alt={alt}
      aria-hidden={alt ? undefined : true} decoding="async" draggable={false} />
  );
}
