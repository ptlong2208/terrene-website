'use client';

import MusicToggleButton from '@/app/components/MusicToggleButton';
import MenuToggleButton from '@/app/components/MenuToggleButton';

interface HeaderLeftProps {
  isAudioPlaying: boolean;
  onAudioToggle: () => void;
  isMenuOpen: boolean;
  onMenuToggle: () => void;
}

export default function HeaderLeft({
  isAudioPlaying,
  onAudioToggle,
  isMenuOpen,
  onMenuToggle,
}: HeaderLeftProps) {
  return (
    <div className="flex items-center gap-5 md:gap-6">
      <MusicToggleButton isPlaying={isAudioPlaying} onToggle={onAudioToggle} />
      <MenuToggleButton isOpen={isMenuOpen} onToggle={onMenuToggle} />
    </div>
  );
}
