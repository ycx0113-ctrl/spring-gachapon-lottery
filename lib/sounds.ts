export type SoundName = 'knob' | 'drop' | 'open' | 'win';

// Add matching MP3 files under public/audio to enable the prepared sound hooks.
export const SOUND_FILES: Record<SoundName, string> = {
  knob: 'audio/knob.mp3',
  drop: 'audio/drop.mp3',
  open: 'audio/open.mp3',
  win: 'audio/win.mp3',
};

export function playSound(name: SoundName, enabled: boolean): void {
  if (!enabled || typeof Audio === 'undefined') return;
  const audio = new Audio(SOUND_FILES[name]);
  audio.volume = name === 'win' ? 0.45 : 0.35;
  void audio.play().catch(() => {
    // Audio assets are intentionally optional. Missing files should never block a draw.
  });
}
