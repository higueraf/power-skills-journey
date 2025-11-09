import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ThreeCanvas from "../components/ThreeCanvas";
import Ground from "../components/Ground";
import ResultsDragMatchGame from "../miniGames/ResultsDragMatchGame";
import { theme } from "../theme";

/**
 * Escena 6: Resultados
 * - Reproduce un video introductorio automáticamente (con botón para saltar).
 * - Controla volumen por JS (0.85) y desbloquea audio con la 1ª interacción.
 * - Luego muestra el minijuego con modal + speech.
 * - Fondo vivo (degradado azul–verde).
 */
export default function SceneResults() {
  const nav = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showGame, setShowGame] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Volumen deseado (0..1)
    const TARGET_VOL = 1;

    // Listener fin de video
    const onEnd = () => setShowGame(true);
    video.addEventListener("ended", onEnd);

    // Asegura volumen al cargar metadatos
    const onLoadedMeta = () => {
      video.volume = TARGET_VOL;
    };
    video.addEventListener("loadedmetadata", onLoadedMeta);

    // Desbloquear audio en la primera interacción del usuario
    const unlockAudio = async () => {
      try {
        video.muted = false;
        video.volume = TARGET_VOL;
        await video.play();
      } catch {
        // Si falla, dejamos muted y que siga reproduciendo sin sonido
      } finally {
        window.removeEventListener("pointerdown", unlockAudio);
        window.removeEventListener("keydown", unlockAudio);
      }
    };
    window.addEventListener("pointerdown", unlockAudio, { once: true });
    window.addEventListener("keydown", unlockAudio, { once: true });

    // Intento de autoplay: primero sin mute, si falla, con mute
    (async () => {
      try {
        video.muted = false;
        video.volume = TARGET_VOL;
        await video.play();
      } catch {
        try {
          video.muted = true; // autoplay más permisivo
          video.volume = TARGET_VOL;
          await video.play();
        } catch (err) {
          console.warn("No se pudo iniciar el video automáticamente:", err);
        }
      }
    })();

    return () => {
      video.removeEventListener("ended", onEnd);
      video.removeEventListener("loadedmetadata", onLoadedMeta);
      window.removeEventListener("pointerdown", unlockAudio);
      window.removeEventListener("keydown", unlockAudio);
    };
  }, []);

  const handleSkip = () => {
    const video = videoRef.current;
    if (video) {
      video.pause();
    }
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
            {/* Al ganar → reflexión final */}
            <ResultsDragMatchGame onWin={() => nav("/reflection")} />
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
      <div
        style={{
          width: "min(420px, 90vw)",
          aspectRatio: "9 / 16",
          borderRadius: "20px",
          overflow: "hidden",
          boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
          background: theme.bg,
          position: "relative",
        }}
      >
        <video
          ref={videoRef}
          src="/videos/06-resultados.mp4"
          // Autoplay más confiable en móviles: playsInline + muted
          playsInline
          muted
          preload="auto"
          autoPlay
          // controls={true} // <- descomenta si quieres mostrar controles
          style={{
            width: "120%",                 // 🔍 zoom horizontal
            height: "100%",
            objectFit: "cover",
            transform: "translateX(-10%)", // 👈 ajuste fino de recorte
          }}
          // (Opcional) permite activar sonido al tocar el video
          onClick={() => {
            const v = videoRef.current;
            if (!v) return;
            if (v.muted) {
              v.muted = false;
              v.volume = 1;
              v.play().catch(() => {});
            }
          }}
        />
      </div>

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
        👉 Ver resultados en acción
      </button>
    </div>
  );
}
