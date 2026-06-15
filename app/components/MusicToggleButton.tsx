'use client';

interface MusicToggleButtonProps {
  isPlaying: boolean;
  onToggle: () => void;
  className?: string;
}

export default function MusicToggleButton({
  isPlaying,
  onToggle,
  className = '',
}: MusicToggleButtonProps) {
  const buttonClasses = [
    'header-control sound-toggle',
    'transition-transform duration-120 ease-out active:scale-[0.92]',
    isPlaying ? 'is-playing' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type="button"
      onClick={onToggle}
      className={buttonClasses}
      aria-label={isPlaying ? 'Tắt nhạc' : 'Bật nhạc'}
      aria-pressed={isPlaying}
    >
      <span />
      <span />
      <span />
      <span />
      <span />
    </button>
  );
}

