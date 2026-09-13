/** Photo avatar for the chat assistant, "Virtual Marcela" (Marcela Aduna's headshot). */
export function VirtualMarcelaAvatar({ size = 56, className = "" }: { size?: number; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/site/marcela-avatar.jpg"
      alt="Virtual Marcela"
      width={size}
      height={size}
      className={`object-cover ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
