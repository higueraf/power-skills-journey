import { Html } from "@react-three/drei";
import { useState } from "react";
import Modal from "../components/Modal";
import Speech from "../components/Speech";
import { theme } from "../theme";
import { SIZES } from "../constants3d";

export default function CompassPickupGame({ onWin }: { onWin: () => void }) {
  const [picked, setPicked] = useState(false);
  const [showHelp, setShowHelp] = useState(true);
  const [msg] = useState<string | null>(null);
  const [showWin, setShowWin] = useState(false);
 const handlePick = () => {
    if (showHelp || picked || showWin) return; // no permitir clicks antes de cerrar el modal o repetidos
    setPicked(true);
    // Mostrar felicitación al ganar:
    setTimeout(() => setShowWin(true), 400);
    // Si quieres avanzar automáticamente tras la felicitación, descomenta:
    // setTimeout(onWin, 1800);
  };


  return (
    <group>
      {/* 🧩 Modal de instrucciones del juego */}
      <Html center>
        <Modal
          open={showHelp}
          title="Juego: Brújula Power Skills"
          onPrimary={() => setShowHelp(false)}
        >
          <p>
            Haz clic en la <b>brújula</b> 3D para activarla. 
            Cuando se ilumine, avanzarás automáticamente a la siguiente escena.
          </p>
          <p style={{ marginTop: 6, opacity: 0.9 }}>
            Pista: es la figura con forma de nudo luminoso.
          </p>

          {/* 🔊 Narración automática */}
          <Speech
            text="Haz clic en la brújula tridimensional para activarla. 
            Cuando la actives, avanzarás automáticamente a la siguiente escena."
            when={showHelp}
            lang="es-ES"
          />
        </Modal>
      </Html>

      {/* 🧭 Brújula 3D */}
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

      {/* 💬 Mensaje de éxito */}
      {msg && (
        <Html center position={[0, 2.2, 0]}>
          <div
            className="bubble"
            style={{
              background: "rgba(218,241,234,.95)",
              border: "1px solid #B7D7E8",
              borderRadius: 12,
              padding: "8px 14px",
              color: "#0F2740",
              fontWeight: 600,
            }}
          >
            {msg}
          </div>
        </Html>
      )}
       {/* ✅ Modal de éxito */}
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
        <Speech
          text="Excelente. Activaste la Brújula Power Skills. Continuemos con el recorrido."
          when={showWin}
          lang="es-ES"
        />
      </Modal>
            </Html>
    </group>
  );
}
