import { useEffect } from "react";

type Props = {
  text: string;
  rate?: number;
  pitch?: number;
  lang?: string;
  when?: boolean;
};

export default function Speech({
  text,
  rate = 1,
  pitch = 1,
  lang = "es-ES",
  when = true,
}: Props) {
  useEffect(() => {
    if (!when || !text) return;
    const synth = window.speechSynthesis;
    if (!synth) return;

    const speak = () => {
      const voices = synth.getVoices();
      const voice =
        voices.find((v) => v.lang?.startsWith(lang)) ||
        voices.find((v) => v.name?.toLowerCase().includes("spanish")) ||
        voices[0];

      const u = new SpeechSynthesisUtterance(text);
      u.lang = voice?.lang || lang;
      u.voice = voice || null;
      u.rate = rate;
      u.pitch = pitch;

      try {
        synth.cancel();
        synth.speak(u);
      } catch {}
    };

    if (synth.getVoices().length === 0) synth.onvoiceschanged = speak;
    else speak();

    return () => {
      try { window.speechSynthesis.cancel(); } catch {}
    };
  }, [text, rate, pitch, lang, when]);

  return null;
}
