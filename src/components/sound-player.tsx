
'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef, useState, useCallback } from 'react';

type Sound = 'spin' | 'win' | 'lose' | 'chip';

export interface SoundPlayerHandle {
  playSound: (sound: Sound) => void;
  initializeAudio: () => void;
}

const SoundPlayer = forwardRef<SoundPlayerHandle, { isMuted: boolean }>(({ isMuted }, ref) => {
  const [audioInitialized, setAudioInitialized] = useState(false);
  const ToneRef = useRef<typeof import('tone') | null>(null);
  const sounds = useRef<{
    spin?: any;
    win?: any;
    lose?: any;
    chip?: any;
    initialized: boolean;
  }>({ initialized: false });

  useEffect(() => {
    const initialize = async () => {
        if (sounds.current.initialized) return;
        const ToneModule = await import('tone');
        ToneRef.current = ToneModule;
        
        sounds.current.spin = new ToneModule.NoiseSynth({ noise: { type: 'white' }, envelope: { attack: 0.005, decay: 0.1, sustain: 0.2, release: 0.2 }, volume: -20 }).toDestination();
        sounds.current.win = new ToneModule.Synth({ oscillator: { type: 'triangle' }, envelope: { attack: 0.005, decay: 0.1, sustain: 0.3, release: 1 }, volume: -10 }).toDestination();
        sounds.current.lose = new ToneModule.Synth({ oscillator: { type: 'sine' }, envelope: { attack: 0.01, decay: 0.5, sustain: 0, release: 0.5 }, volume: -10 }).toDestination();
        sounds.current.chip = new ToneModule.MembraneSynth({ octaves: 4, pitchDecay: 0.1, volume: -15 }).toDestination();
        sounds.current.initialized = true;
    };
    initialize();

    return () => {
      sounds.current.spin?.dispose();
      sounds.current.win?.dispose();
      sounds.current.lose?.dispose();
      sounds.current.chip?.dispose();
      sounds.current.initialized = false;
    };
  }, []);
  
  useEffect(() => {
      if (ToneRef.current) {
          ToneRef.current.Destination.mute = isMuted;
      }
  }, [isMuted]);

  const initializeAudio = useCallback(async () => {
    if (audioInitialized || !ToneRef.current) return;
    try {
      await ToneRef.current.start();
      setAudioInitialized(true);
    } catch (e) {
      console.error("Could not start audio context", e);
    }
  }, [audioInitialized]);

  const playSound = useCallback((sound: Sound) => {
    if (isMuted || !ToneRef.current || !sounds.current.initialized) return;

    const now = ToneRef.current.now();
    if (sound === 'spin' && sounds.current.spin) {
      sounds.current.spin.triggerAttackRelease("2n", now);
    } else if (sound === 'win' && sounds.current.win) {
      sounds.current.win.triggerAttackRelease('C5', '8n', now);
      sounds.current.win.triggerAttackRelease('G5', '8n', now + 0.2);
    } else if (sound === 'lose' && sounds.current.lose) {
      sounds.current.lose.triggerAttackRelease('C3', '4n', now);
    } else if (sound === 'chip' && sounds.current.chip) {
      sounds.current.chip.triggerAttackRelease('C2', '8n', now);
    }
  }, [isMuted]);

  useImperativeHandle(ref, () => ({
    playSound,
    initializeAudio,
  }));

  return null; // This component does not render anything
});

SoundPlayer.displayName = 'SoundPlayer';

export default SoundPlayer;
