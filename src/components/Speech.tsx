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
      // intento encontrar voz de mejor calidad
      const voice =
        voices.find((v) =>
          v.name?.toLowerCase().includes("neural")
        ) ||
        voices.find((v) => v.lang?.startsWith(lang)) ||
        voices.find((v) => v.name?.toLowerCase().includes("spanish")) ||
        voices[0];

      const u = new SpeechSynthesisUtterance(text);
      u.lang = voice?.lang || lang;
      u.voice = voice || null;
      // ajusto rate/pitch para sonido más natural
      u.rate = rate * 0.9;
      u.pitch = pitch * 0.95;

      try {
        if (synth.speaking) {
          synth.cancel();
        }
        synth.speak(u);
      } catch (err) {
        console.warn("Speech synthesis error:", err);
      }
    };

    if (synth.getVoices().length === 0) {
      synth.onvoiceschanged = speak;
    } else {
      speak();
    }

    return () => {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    };
  }, [text, rate, pitch, lang, when]);

  return null;
}
