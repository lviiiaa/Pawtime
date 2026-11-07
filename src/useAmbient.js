import { useEffect, useRef } from 'react';

// Level suara ambien (0-1). Sengaja pelan supaya tidak mengganggu fokus.
const AMBIENT_LEVEL = 0.4;

function noiseSource(ctx, seconds = 3) {
  const length = ctx.sampleRate * seconds;
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i += 1) data[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  src.loop = true;
  return src;
}

// Hujan lembut: desis frekuensi tinggi + gemuruh rendah, dengan naik-turun pelan
function startRain(ctx, out) {
  const hiss = noiseSource(ctx);
  const hp = ctx.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.value = 500;
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 7000;
  const hissGain = ctx.createGain();
  hissGain.gain.value = 0.5;
  hiss.connect(hp).connect(lp).connect(hissGain).connect(out);

  const body = noiseSource(ctx);
  const bodyLp = ctx.createBiquadFilter();
  bodyLp.type = 'lowpass';
  bodyLp.frequency.value = 900;
  const bodyGain = ctx.createGain();
  bodyGain.gain.value = 0.35;
  body.connect(bodyLp).connect(bodyGain).connect(out);

  const lfo = ctx.createOscillator();
  lfo.frequency.value = 0.2;
  const lfoDepth = ctx.createGain();
  lfoDepth.gain.value = 0.08;
  lfo.connect(lfoDepth).connect(hissGain.gain);

  [hiss, body, lfo].forEach((n) => n.start());
  return () => [hiss, body, lfo].forEach((n) => n.stop());
}

// Derau putih: noise rata dengan frekuensi sangat tinggi diredam
function startWhite(ctx, out) {
  const src = noiseSource(ctx);
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 10000;
  const gain = ctx.createGain();
  gain.gain.value = 0.35;
  src.connect(lp).connect(gain).connect(out);
  src.start();
  return () => src.stop();
}

/**
 * Memutar suara ambien selama `playing` true.
 * sound: 'rain' | 'whitenoise' | 'mute'
 */
export function useAmbient({ sound, playing }) {
  const ctxRef = useRef(null);

  useEffect(() => {
    if (!playing || sound === 'mute') return undefined;

    let ctx;
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      ctx = new Ctx();
    } catch {
      return undefined;
    }
    ctxRef.current = ctx;
    ctx.resume?.();

    const master = ctx.createGain();
    master.gain.setValueAtTime(0, ctx.currentTime);
    master.gain.linearRampToValueAtTime(AMBIENT_LEVEL, ctx.currentTime + 1.5); // fade in
    master.connect(ctx.destination);

    const stopNodes = sound === 'rain' ? startRain(ctx, master) : startWhite(ctx, master);

    return () => {
      // fade out singkat supaya tidak "klik"
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
      master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4);
      setTimeout(() => {
        try {
          stopNodes();
        } catch {
          /* sudah berhenti */
        }
        ctx.close();
      }, 450);
    };
  }, [sound, playing]);
}