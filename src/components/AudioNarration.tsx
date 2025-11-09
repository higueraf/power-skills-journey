import { useEffect, useId, useRef, useState } from "react";
import { audioBus } from "../utils/audioBus";

type Props = {
  src: string;           // ruta del MP3
  when?: boolean;        // si true, intenta reproducir
  volume?: number;       // 0..1
  rate?: number;         // 0.5..2 (playbackRate)
  loop?: boolean;
  captionsSrc?: string;  // opcional: .vtt para subtítulos
  onEnded?: () => void;
  // UI
  autoHideButton?: boolean; // si true, oculta botón al reproducir
  label?: string;           // texto del botón fallback
};

export default function AudioNarration({
  src,
  when = true,
  volume = 1,
  rate = 1,
  loop = false,
  captionsSrc,
  onEnded,
  autoHideButton = true,
  label = "🔊 Reproducir narración",
}: Props) {
  const id = useId();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [needsUserGesture, setNeedsUserGesture] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
  const off = audioBus.onStopAll((exceptId) => {
    if (exceptId === id) return;
    audioRef.current?.pause();
    setIsPlaying(false);
  });
  return off; // ahora off es () => void, sin boolean
}, [id]);

  // intentar reproducir cuando cambie when/src
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;

    a.volume = Math.max(0, Math.min(1, volume));
    a.playbackRate = Math.max(0.5, Math.min(2, rate));
    a.loop = !!loop;

    if (when) {
      // pausa todo lo demás y luego intenta reproducir este
      audioBus.stopAll(id);
      a.currentTime = 0;

      a.play()
        .then(() => {
          setIsPlaying(true);
          setNeedsUserGesture(false);
        })
        .catch(() => {
          // Autoplay bloqueado (común en móvil); mostramos botón
          setNeedsUserGesture(true);
          setIsPlaying(false);
        });
    } else {
      a.pause();
      setIsPlaying(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [when, src, volume, rate, loop]);

  // ended
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnd = () => {
      setIsPlaying(false);
      onEnded?.();
    };
    a.addEventListener("play", onPlay);
    a.addEventListener("pause", onPause);
    a.addEventListener("ended", onEnd);
    return () => {
      a.removeEventListener("play", onPlay);
      a.removeEventListener("pause", onPause);
      a.removeEventListener("ended", onEnd);
    };
  }, [onEnded]);

  const handleUserPlay = async () => {
    const a = audioRef.current;
    if (!a) return;
    try {
      audioBus.stopAll(id);
      await a.play();
      setNeedsUserGesture(false);
      setIsPlaying(true);
    } catch {
      setNeedsUserGesture(true);
    }
  };

  // Elemento de audio “invisible” (sin controles) + botón fallback si hace falta
  return (
    <>
      <audio ref={audioRef} preload="auto">
        <source src={src} type="audio/mpeg" />
        {captionsSrc && <track kind="captions" src={captionsSrc} />}
      </audio>

      {needsUserGesture && (
        <button
          onClick={handleUserPlay}
          style={{
            background: "#21262d",
            color: "#58a6ff",
            border: "1px solid #30363d",
            padding: "8px 12px",
            borderRadius: 10,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          {label}
        </button>
      )}

      {/* Si no quieres mostrar nada cuando está reproduciendo */}
      {autoHideButton && isPlaying && null}
    </>
  );
}
