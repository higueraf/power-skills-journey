import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ThreeCanvas from "../components/ThreeCanvas";
import Ground from "../components/Ground";
import ResultsDragMatchGame from "../miniGames/ResultsDragMatchGame";
import { theme } from "../theme";

/**
 * Escena 6: Resultados
 * - Reproduce un video introductorio automáticamente (con botón para saltar).
 * - Controla volumen por JS (1.0) y desbloquea audio con la 1ª interacción.
 * - Al entrar al juego: desmonta/limpia el video para que NO pueda sonar.
 */
export default function SceneResults() {
  const nav = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showGame, setShowGame] = useState(false);

  // util para garantizar que el video queda "muerto"
  const fullyStopVideo = () => {
    const v = videoRef.current;
    if (!v) return;
    try {
      v.pause();
      // silenciar y reiniciar
      v.muted = true;
      v.currentTime = 0;
      // quitar fuente para evitar reproducciones fantasma
      const src = v.getAttribute("src");
      if (src) v.removeAttribute("src");
      // forzar a recargar estado vacío
      v.load();
    } catch {}
  };

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const TARGET_VOL = 1.0;

    const onEnd = () => setShowGame(true);
    const onLoadedMeta = () => {
      v.volume = TARGET_VOL;
    };

    v.addEventListener("ended", onEnd);
    v.addEventListener("loadedmetadata", onLoadedMeta);

    // ——— Solo desbloquear y autoplay mientras NO estamos en el juego ———
    if (!showGame) {
      const unlockAudio = async () => {
        // si el video ya no está en el DOM, no hagas nada
        if (!v || !document.body.contains(v)) return;
        try {
          v.muted = false;
          v.volume = TARGET_VOL;
          await v.play();
        } catch {
          // si falla, al menos que quede en mute reproduciendo (para autoplay en móvil)
          try {
            v.muted = true;
            v.volume = TARGET_VOL;
            await v.play();
          } catch {}
        } finally {
          window.removeEventListener("pointerdown", unlockAudio);
          window.removeEventListener("keydown", unlockAudio);
        }
      };

      window.addEventListener("pointerdown", unlockAudio, { once: true });
      window.addEventListener("keydown", unlockAudio, { once: true });

      // intento de autoplay inicial
      (async () => {
        try {
          v.muted = false;
          v.volume = TARGET_VOL;
          await v.play();
        } catch {
          try {
            v.muted = true;
            v.volume = TARGET_VOL;
            await v.play();
          } catch (err) {
            console.warn("No se pudo iniciar el video automáticamente:", err);
          }
        }
      })();

      // cleanup parcial (cuando pase a showGame o unmount)
      return () => {
        v.removeEventListener("ended", onEnd);
        v.removeEventListener("loadedmetadata", onLoadedMeta);
        window.removeEventListener("pointerdown", unlockAudio);
        window.removeEventListener("keydown", unlockAudio);
      };
    } else {
      // si ya estamos en el juego: detén y “desengancha” por si quedaba algo
      fullyStopVideo();
      return () => {
        v.removeEventListener("ended", onEnd);
        v.removeEventListener("loadedmetadata", onLoadedMeta);
      };
    }
  }, [showGame]);

  const handleSkip = () => {
    fullyStopVideo();
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
          playsInline
          muted
          preload="auto"
          autoPlay
          style={{
            width: "120%",
            height: "100%",
            objectFit: "cover",
            transform: "translateX(-10%)",
          }}
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
