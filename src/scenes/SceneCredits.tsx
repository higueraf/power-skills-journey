import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ThreeCanvas from "../components/ThreeCanvas";
import Ground from "../components/Ground";
import CreditsOverlay from "../components/CreditsOverlay";
import { theme } from "../theme";

/**
 * Escena 8: Créditos finales
 * - Reproduce un video corto (autoplay si el navegador lo permite) con botón para saltar.
 * - Luego muestra la pantalla de créditos como overlay centrado (Html).
 */
export default function SceneCredits() {
  const nav = useNavigate();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [showCredits, setShowCredits] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onEnd = () => setShowCredits(true);
    video.addEventListener("ended", onEnd);

    (async () => {
      try {
        video.muted = false;
        await video.play();
      } catch {
        try {
          video.muted = true;
          await video.play();
        } catch (err) {
          console.warn("No se pudo iniciar el video automáticamente:", err);
        }
      }
    })();

    return () => video.removeEventListener("ended", onEnd);
  }, []);

  const handleSkip = () => {
    videoRef.current?.pause();
    setShowCredits(true);
  };

  // Pantalla de créditos con un fondo 3D suave
  if (showCredits) {
    return (
      <div
        className="screen"
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(135deg, #CFEFFF 0%, #BCF5E6 35%, #DFFEF2 100%)",
        }}
      >
        <ThreeCanvas>
          <group position={[0, -0.5, 0]}>
            <Ground />
            <CreditsOverlay
              onRestart={() => nav("/welcome")}
              onMore={() =>
                window.open("https://smowl.net/es/blog/power-skills/", "_blank", "noopener,noreferrer")
              }
            />
          </group>
        </ThreeCanvas>
      </div>
    );
  }

  // Video de créditos con botón para saltar
  return (
    <div
      className="screen"
      style={{
        position: "relative",
        inset: 0,
        background:
          "linear-gradient(135deg, #CFEFFF 0%, #BCF5E6 35%, #DFFEF2 100%)",
        display: "grid",
        placeItems: "center",
      }}
    >
      <video
        ref={videoRef}
        src="/videos/08-creditos.mp4"
        playsInline
        preload="auto"
        style={{
          width: "90%",
          maxWidth: "1000px",
          borderRadius: "20px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
          background: theme.bg,
        }}
      />
      <button
        onClick={handleSkip}
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
        }}
      >
        👉 Ver créditos
      </button>
    </div>
  );
}
