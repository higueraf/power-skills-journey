import { useEffect, useMemo, useRef } from "react";

type Props = {
  text: string;
  rate?: number;
  pitch?: number;
  lang?: string;
  when?: boolean;
};

const isMobile = () =>
  /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

export default function Speech({
  text,
  rate = 1,
  pitch = 1,
  lang = "es-ES",
  when = true,
}: Props) {
  const cachedVoiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const voicesReadyRef = useRef(false);
  const speakTimeoutRef = useRef<number | null>(null);

  // Ajuste por plataforma (móviles suelen sonar más lento a igual rate)
  const adjusted = useMemo(() => {
    const rateAdj = isMobile() ? rate * 1.15 : rate * 0.95; // antes lo bajabas a 0.9
    const pitchAdj = Math.min(1.1, Math.max(0.9, pitch * (isMobile() ? 1.0 : 0.95)));
    return { rate: rateAdj, pitch: pitchAdj };
  }, [rate, pitch]);

  // Resolver y cachear voz una sola vez
  useEffect(() => {
    const synth = window.speechSynthesis;
    if (!synth) return;

    const pick = () => {
      const voices = synth.getVoices();
      if (!voices || voices.length === 0) return;

      const v =
        voices.find(v => v.name?.toLowerCase().includes("neural")) ||
        voices.find(v => v.lang?.toLowerCase().startsWith(lang.toLowerCase())) ||
        voices.find(v => v.name?.toLowerCase().includes("spanish")) ||
        voices[0];

      cachedVoiceRef.current = v || null;
      voicesReadyRef.current = true;

      // Pre-warm tras cargar voces (silencioso) para inicializar el motor móvil
      const u = new SpeechSynthesisUtterance(" ");
      u.volume = 0;
      u.lang = v?.lang || lang;
      u.voice = v || null;
      synth.speak(u);
    };

    if (synth.getVoices().length > 0) {
      pick();
    } else {
      // Registrar una única vez
      const handler = () => {
        pick();
        synth.onvoiceschanged = null;
      };
      synth.onvoiceschanged = handler;
    }
  }, [lang]);

  // Hablar cuando cambie el texto/flags
  useEffect(() => {
    if (!when || !text) return;
    const synth = window.speechSynthesis;
    if (!synth || !voicesReadyRef.current) return;

    // Debounce para evitar cancelar/hablar en el mismo tick
    if (speakTimeoutRef.current) {
      clearTimeout(speakTimeoutRef.current);
    }

    speakTimeoutRef.current = window.setTimeout(() => {
      try {
        if (synth.speaking || synth.pending) {
          // Cancel y espera un micro-turno para que el motor libere recursos (móvil)
          synth.cancel();
        }

        const u = new SpeechSynthesisUtterance(text);
        const v = cachedVoiceRef.current;
        u.lang = v?.lang || lang;
        u.voice = v || null;
        u.rate = adjusted.rate;
        u.pitch = adjusted.pitch;
        u.volume = 1;

        // En algunos móviles es mejor dar un pequeño respiro tras cancel()
        setTimeout(() => synth.speak(u), 0);
      } catch (e) {
        console.warn("Speech synthesis error:", e);
      }
    }, 120); // pequeño debounce

    return () => {
      if (speakTimeoutRef.current) clearTimeout(speakTimeoutRef.current);
      // No canceles siempre al desmontar si hay otras utterances en cola compartida
      try { if (window.speechSynthesis.speaking) window.speechSynthesis.cancel(); } catch {}
    };
  }, [text, when, lang, adjusted.rate, adjusted.pitch]);

  return null;
}
