import { useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

/**
 * Synthesized underwater ambience — filtered brown noise with a slow swell,
 * plus an occasional distant whale-like sine sweep. No audio assets needed.
 */
export function SoundToggle() {
  const [on, setOn] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const whaleTimer = useRef<number | null>(null);

  const start = () => {
    if (!ctxRef.current) {
      const ctx = new AudioContext();
      ctxRef.current = ctx;

      // Brown noise buffer
      const seconds = 4;
      const buffer = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let last = 0;
      for (let i = 0; i < data.length; i++) {
        const white = Math.random() * 2 - 1;
        last = (last + 0.02 * white) / 1.02;
        data[i] = last * 3.5;
      }
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      src.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 220;

      const gain = ctx.createGain();
      gain.gain.value = 0;
      gainRef.current = gain;

      // Slow swell LFO on the filter for a breathing sea
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.07;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 90;
      lfo.connect(lfoGain).connect(filter.frequency);
      lfo.start();

      src.connect(filter).connect(gain).connect(ctx.destination);
      src.start();

      const whaleCall = () => {
        if (!ctxRef.current || !gainRef.current) return;
        const t = ctx.currentTime;
        const osc = ctx.createOscillator();
        const og = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(70, t);
        osc.frequency.exponentialRampToValueAtTime(160, t + 2.4);
        osc.frequency.exponentialRampToValueAtTime(55, t + 5);
        og.gain.setValueAtTime(0, t);
        og.gain.linearRampToValueAtTime(0.012, t + 1.2);
        og.gain.linearRampToValueAtTime(0, t + 5.2);
        osc.connect(og).connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 5.4);
      };
      whaleTimer.current = window.setInterval(() => {
        if (Math.random() < 0.5) whaleCall();
      }, 16000);
    }
    ctxRef.current.resume();
    gainRef.current?.gain.linearRampToValueAtTime(
      0.16,
      ctxRef.current.currentTime + 1.8
    );
  };

  const stop = () => {
    if (ctxRef.current && gainRef.current) {
      gainRef.current.gain.linearRampToValueAtTime(
        0,
        ctxRef.current.currentTime + 0.8
      );
    }
  };

  const toggle = () => {
    const next = !on;
    setOn(next);
    next ? start() : stop();
  };

  return (
    <button
      data-cursor="hover"
      onClick={toggle}
      aria-pressed={on}
      aria-label={on ? "Mute ambient sound" : "Play ambient underwater sound"}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-400/20 text-slate-300 transition-all duration-500 hover:border-glow-cyan/50 hover:text-glow-ice"
    >
      {on ? <Volume2 size={16} strokeWidth={1.5} /> : <VolumeX size={16} strokeWidth={1.5} />}
    </button>
  );
}
