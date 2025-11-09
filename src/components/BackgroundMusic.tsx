import { useEffect, useRef } from "react";

type Props = {
  src: string;
  volume?: number; // 0.0 a 1.0
};

export default function BackgroundMusic({ src, volume = 0.25 }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(src);
    audio.loop = true;
    audio.volume = volume;

    const playAudio = async () => {
      try {
        await audio.play();
      } catch (e) {
        // ⚠️ Algunos navegadores bloquean autoplay hasta que el usuario interactúe
        console.warn("Esperando interacción del usuario para reproducir música.");
        const resume = () => {
          audio.play();
          document.removeEventListener("click", resume);
        };
        document.addEventListener("click", resume);
      }
    };

    playAudio();
    audioRef.current = audio;

    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, [src, volume]);

  return null; // No renderiza nada visible
}
