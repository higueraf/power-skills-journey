import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ThreeCanvas from "../components/ThreeCanvas";
import Ground from "../components/Ground";
import BuildSentenceGame from "../miniGames/BuildSentenceGame";
import { theme } from "../theme";

/**
 * Escena 2: Contexto Gerencial
 * - Reproduce el video automáticamente.
 * - Muestra un botón abajo a la derecha para saltar directamente al mini-juego.
 */
export default function SceneContext() {
  const nav = useNavigate();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [showGame, setShowGame] = useState(false);

  // 🔹 Reproducir el video automáticamente
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onEnd = () => setShowGame(true);
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

  // 🔹 Acción para saltar directamente al mini-juego
  const handleSkipToGame = () => {
    const video = videoRef.current;
    if (video) {
      video.pause();
    }
    setShowGame(true);
  };

  // 🔹 Mostrar el mini-juego al terminar o saltar
  if (showGame) {
    return (
      <div className="screen" style={{ background: theme.bg }}>
        <ThreeCanvas>
          <group position={[0, -0.5, 0]}>
            <Ground />
            <BuildSentenceGame onWin={() => nav("/team")} />
          </group>
        </ThreeCanvas>
      </div>
    );
  }

  // 🔹 Pantalla del video con botón “Continuar al juego”
  return (
    <div
      className="screen"
      style={{
        position: "relative",
        inset: 0,
        background: "linear-gradient(135deg, #E0F4FF 0%, #D7F3E3 100%)",
        display: "grid",
        placeItems: "center",
      }}
    >
      <video
        ref={videoRef}
        src="/videos/02-contexto.mp4"
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

      {/* Botón flotante para saltar al juego */}
      <button
        onClick={handleSkipToGame}
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
    </div>
  );
}
