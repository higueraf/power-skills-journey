import { useEffect, useRef, useState } from "react";
import { theme } from "../theme";

type Props = {
  src: string;
  poster?: string;
  onEnd: () => void;
  skippable?: boolean;
  overlayBg?: string;
  startNow?: boolean;
};

export default function VideoIntro({
  src,
  poster,
  onEnd,
  skippable = true,
  overlayBg = "#E0F4FF",
  startNow = false,
}: Props) {
  const ref = useRef<HTMLVideoElement | null>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const ended = () => onEnd();
    v.addEventListener("ended", ended);
    return () => v.removeEventListener("ended", ended);
  }, [onEnd]);

  useEffect(() => {
    if (!startNow) return;
    const v = ref.current;
    if (!v) return;
    (async () => {
      try {
        v.muted = false;
        await v.play();
        setStarted(true);
      } catch {
        setStarted(false);
      }
    })();
  }, [startNow]);

  return (
    <div className="video-overlay" style={{ background: overlayBg }}>
      <video
        ref={ref}
        className="video"
        src={src}
        poster={poster}
        controls={!started}
        playsInline
        preload="auto"
      />
      {skippable && (
        <button
        onClick={onEnd}
        style={{
          position: "absolute",
          bottom: "40px",
          right: "60px",
          background: theme.primary,
          color: theme.text,
          border: "none",
          padding: "1rem 2rem",
          borderRadius: "16px",
          fontSize: "1.2rem",
          fontWeight: 700,
          cursor: "pointer",
          boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
          transition: "all 0.3s ease",
        }}
        onMouseEnter={(e) => {
          (e.target as HTMLButtonElement).style.transform = "scale(1.05)";
        }}
        onMouseLeave={(e) => {
          (e.target as HTMLButtonElement).style.transform = "scale(1)";
        }}
      >
        👉 Continuar al juego
      </button>
        
      )}
    </div>
  );
}
