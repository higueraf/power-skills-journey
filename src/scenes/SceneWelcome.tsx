import SceneShell from "../components/SceneShell";
import { useNavigate } from "react-router-dom";
import CompassPickupGame from "../miniGames/CompassPickupGame";
import Ground from "../components/Ground";
import { useRef, useState } from "react";
import { theme } from "../theme";

const intro1 = `¡Hola! Soy la Dra. Empatía. Bienvenido(a) a este viaje interactivo sobre Power Skills.`;
const intro2 = `En unos segundos verás un breve video de bienvenida. Mientras tanto, recuerda: las Power Skills son
habilidades humanas que potencian la comunicación, el pensamiento crítico, la empatía, el liderazgo adaptativo y la
colaboración. Presta atención; luego podrás ponerlas en práctica en un mini-juego.`;


export default function SceneWelcome() {
  const nav = useNavigate();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [showGame, setShowGame] = useState(false);
  const handleSkipToGame = () => {
    const video = videoRef.current;
    if (video) {
      video.pause();
    }
    setShowGame(true);
  };
  return (
    <SceneShell
      videoSrc="/videos/01-bienvenida.mp4"
      introTitle="Bienvenida"
      introText={intro1}
      introTitle2="Antes de comenzar…"
      introText2={intro2}
    >
      <group position={[0, -0.5, 0]}>
        <Ground />
        <CompassPickupGame onWin={() => nav("/context")} />
      </group>
    </SceneShell>
  );
}
