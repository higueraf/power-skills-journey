import SceneShell from "../components/SceneShell";
import { useNavigate } from "react-router-dom";
import CompassPickupGame from "../miniGames/CompassPickupGame";
import Ground from "../components/Ground";

const intro1 = `¡Hola! Bienvenido(a) a este viaje interactivo sobre Power Skills.`;
const intro2 = `En unos segundos verás un breve video de bienvenida. Mientras tanto, recuerda: las Power Skills son
habilidades humanas que potencian la comunicación, el pensamiento crítico, la empatía, el liderazgo adaptativo y la
colaboración. Presta atención; luego podrás ponerlas en práctica en un mini-juego.`;

export default function SceneWelcome() {
  const nav = useNavigate();

  return (
    <SceneShell
      videoSrc="/videos/01-bienvenida.mp4"
      introTitle="Bienvenida"
      introText={intro1}
      introTitle2="Antes de comenzar…"
      introText2={intro2}
      // ❌ NO pasamos audio del primer modal
      // ✅ Solo el segundo modal con MP3 numerado
      introAudio2Src="/audio/02-intro.mp3"
    >
      <group position={[0, -0.5, 0]}>
        <Ground />
        <CompassPickupGame onWin={() => nav("/context")} />
      </group>
    </SceneShell>
  );
}
