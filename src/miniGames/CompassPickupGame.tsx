import { Html } from "@react-three/drei";
import { useState } from "react";
import Modal from "../components/Modal";
import AudioNarration from "../components/AudioNarration";
import { theme } from "../theme";
import { SIZES } from "../constants3d";

export default function CompassPickupGame({ onWin }: { onWin: () => void }) {
  const [picked, setPicked] = useState(false);
  const [showHelp, setShowHelp] = useState(true);
  const [showWin, setShowWin] = useState(false);

  const handlePick = () => {
    if (showHelp || picked || showWin) return; // evita clics prematuros
    setPicked(true);
    setTimeout(() => setShowWin(true), 400);
  };

  return (
    <group>
      {/* 🧭 Modal de instrucciones */}
      <Html center>
        <Modal
          open={showHelp}
          title="Juego: Brújula Power Skills"
          onPrimary={() => setShowHelp(false)}
        >
          <p>
            Haz clic en la <b>brújula 3D</b> para activarla. 
            Cuando se ilumine, avanzarás automáticamente a la siguiente escena.
          </p>
          <p style={{ marginTop: 6, opacity: 0.9 }}>
            Pista: es la figura con forma de nudo luminoso.
          </p>

          {/* 🎧 Narración MP3 (solo cuando está abierto el modal de ayuda) */}
          <AudioNarration
            src="/audio/03-compass-help.mp3"
            when={showHelp}
            rate={1}
            volume={1}
          />
        </Modal>
      </Html>

      {/* 🌀 Brújula 3D */}
      <mesh
        position={[0, 1.3, 0]}
        rotation={[0, 0.6, 0]}
        onClick={handlePick}
      >
        <torusKnotGeometry args={[SIZES.medium - 0.1, 0.2, 110, 16]} />
        <meshStandardMaterial
          color={picked ? theme.padGreen : theme.padBlue}
          emissive={picked ? theme.glowGreen : theme.glowBlue}
          emissiveIntensity={picked ? 0.5 : 0.8}
          metalness={0.05}
          roughness={0.35}
        />
      </mesh>

      {/* 🏆 Modal de éxito */}
      <Html center>
        <Modal
          open={showWin}
          title="¡Excelente!"
          type="success"
          onPrimary={onWin}
        >
          <p>
            Activaste la Brújula Power Skills. ¡Continuemos con el recorrido para
            poner en práctica estas habilidades!
          </p>

          {/* 🎧 Narración MP3 de victoria */}
          <AudioNarration
            src="/audio/04-compass-win.mp3"
            when={showWin}
            rate={1}
            volume={1}
          />
        </Modal>
      </Html>
    </group>
  );
}
