import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ThreeCanvas from "../components/ThreeCanvas";
import Ground from "../components/Ground";
import TeamExploreGame from "../miniGames/TeamExploreGame";
import { theme } from "../theme";

/**
 * Escena 3: Conociendo al equipo Power Skills
 * - Reproduce un video introductorio automáticamente (con botón para saltar).
 * - Luego muestra el minijuego con modal + speech.
 * - Fondo vivo (degradado azul–verde).
 */
export default function SceneTeam() {
  const nav = useNavigate();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [showGame, setShowGame] = useState(false);

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

  const handleSkip = () => {
    videoRef.current?.pause();
    setShowGame(true);
  };

  if (showGame) {
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
            <TeamExploreGame onWin={() => nav("/challenge")} />
          </group>
        </ThreeCanvas>
      </div>
    );
  }

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
        src="/videos/03-equipo.mp4"
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
        👉 Continuar al equipo
      </button>
    </div>
  );
}
