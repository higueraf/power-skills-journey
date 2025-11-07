import { Html } from "@react-three/drei";
import { useState } from "react";
import { theme, vivid } from "../theme";
import Modal from "../components/Modal";
import Speech from "../components/Speech";

export default function BalanceTradeoffGame({ onWin }: { onWin: () => void }) {
  const railHalf = 2;        // riel de -2 a 2
  const tolerance = 1.0;     // éxito cuando |x| < tolerance (fácil)
  const [x, setX] = useState(0);
  const [drag, setDrag] = useState(false);
  const [showHelp, setShowHelp] = useState(true);
  const [won, setWon] = useState(false);
  const [showError, setShowError] = useState(false);

  const inGreen = Math.abs(x) < tolerance;

  const clamp = (v: number) => Math.max(-railHalf, Math.min(railHalf, v));

  // Arrastre desde el riel
  function onRailDown(e: any) {
    e.stopPropagation();
    setDrag(true);
    setX(clamp(e.point.x));
    if (showHelp) setShowHelp(false);
  }
  function onRailMove(e: any) {
    if (!drag) return;
    e.stopPropagation();
    setX(clamp(e.point.x));
  }
  function onRailUp(e: any) {
    e.stopPropagation();
    setDrag(false);
    if (inGreen) {
      setWon(true)
    }
    else {
      setShowError(true);
    };
  }

  // Arrastre desde el knob
  function onKnobDown(e: any) {
    e.stopPropagation();
    setDrag(true);
    if (showHelp) setShowHelp(false);
  }
  function onKnobMove(e: any) {
    if (!drag) return;
    e.stopPropagation();
    setX(clamp(e.point.x));
  }
  function onKnobUp(e: any) {
    e.stopPropagation();
    setDrag(false);
    if (inGreen) {
      setWon(true)
    }
    else {
      setShowError(true);
    };
  }

  return (
    <group position={[0, 0.9, 0]}>
      {/* Zona verde */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.2, 0.26]} />
        <meshStandardMaterial
          color={theme.padGreen}
          transparent
          opacity={0.6}
          emissive={theme.glowGreen}
          emissiveIntensity={0.22}
        />
      </mesh>

      {/* Riel */}
      <mesh
        position={[0, 0, 0]}
        onPointerDown={onRailDown}
        onPointerMove={onRailMove}
        onPointerUp={onRailUp}
        onPointerCancel={() => setDrag(false)}
      >
        <boxGeometry args={[railHalf * 2 + 0.4, 0.12, 0.12]} />
        <meshStandardMaterial
          color={theme.padBlue}
          roughness={0.35}
          metalness={0.08}
          emissive={theme.glowBlue}
          emissiveIntensity={0.15}
        />
      </mesh>

      {/* Tope decorativo (izq/der) */}
      <mesh position={[-railHalf - 0.6, 0, 0]}>
        <boxGeometry args={[0.5, 0.12, 0.12]} />
        <meshStandardMaterial color={vivid.green} emissive={vivid.greenGlow} emissiveIntensity={0.2} />
      </mesh>
      <mesh position={[railHalf + 0.6, 0, 0]}>
        <boxGeometry args={[0.5, 0.12, 0.12]} />
        <meshStandardMaterial color={vivid.blue} emissive={vivid.blueGlow} emissiveIntensity={0.2} />
      </mesh>

      {/* Knob (esfera) */}
      <mesh
        position={[x, 0, 0]}
        onPointerDown={onKnobDown}
        onPointerMove={onKnobMove}
        onPointerUp={onKnobUp}
        onPointerCancel={() => setDrag(false)}
        castShadow
      >
        <sphereGeometry args={[0.24, 32, 32]} />
        <meshStandardMaterial
          color={inGreen ? vivid.green : vivid.blue}
          emissive={inGreen ? vivid.greenGlow : theme.glowBlue}
          emissiveIntensity={inGreen ? 0.5 : 0.25}
          metalness={0.15}
          roughness={0.35}
        />
      </mesh>

      {/* Etiquetas con Html (solo DOM dentro de Html) */}
      <Html center position={[-railHalf - 0.6, 0.5, 0]}>
        <div
          style={{
            background: "rgba(255,255,255,0.9)",
            border: `1px solid ${theme.border}`,
            borderRadius: 10,
            padding: "4px 10px",
            color: theme.text,
            fontWeight: 800,
            fontSize: 14,
          }}
        >
          Enfoque humano
        </div>
      </Html>
      <Html center position={[railHalf + 0.6, 0.5, 0]}>
        <div
          style={{
            background: "rgba(255,255,255,0.9)",
            border: `1px solid ${theme.border}`,
            borderRadius: 10,
            padding: "4px 10px",
            color: theme.text,
            fontWeight: 800,
            fontSize: 14,
          }}
        >
          Productividad
        </div>
      </Html>
      {/* Instrucción simple */}
      <Html center>
        <Modal
          open={showHelp}
          title="Juego: Conociendo al equipo Power Skills"
          onPrimary={() => setShowHelp(false)}
        >
          <p>
            Arrastra la <b>esfera</b> sobre el riel y suéltala dentro de la{" "}
            <b>zona verde</b> para lograr el balance. Al lograrlo,{" "}
            <b>continuarás a la siguiente escena</b>.
          </p>
          <Speech
            text="Arrastra la esfera sobre el riel y suéltala dentro de la zona verde para lograr el balance. Al lograrlo, continuarás a la siguiente escena."
            when={showHelp}
            lang="es-ES"
          />
        </Modal>
      </Html>

      {/* Mensaje de éxito y continuar */}
      <Html center>
        <Modal
          open={won}
          title="Juego: Conociendo al equipo Power Skills"
          onPrimary={() => onWin()}
        >
          <p>
            ¡Muy bien! Encontraste un balance saludable entre productividad y
            enfoque humano. Pulsa <b>Continuar</b> para pasar a la siguiente
            escena.
          </p>
          <Speech
            text="Muy bien. Encontraste un balance saludable entre productividad y enfoque humano. Pulsa Continuar para pasar a la siguiente escena."
            when={won}
            lang="es-ES"
          />
        </Modal>
      </Html>
      {/* 🔶 Modal: Error */}
      <Html center>
        <Modal
          open={showError}
          type="warning"
          title="Suelta dentro del equilibrio"
          onPrimary={() => setShowError(false)}
          primaryLabel="Intentar de nuevo"
        >
          <p>
            Soltaste la esfera fuera de la <b>zona verde</b>. Recuerda: buscamos
            un <b>balance</b> entre enfoque humano y productividad — ni muy a la
            izquierda ni muy a la derecha.
          </p>
          <Speech
            text="Suelta la esfera dentro de la zona verde. Buscamos un balance entre enfoque humano y productividad: ni muy a la izquierda ni muy a la derecha."
            when={showError}
            lang="es-ES"
          />
        </Modal>
      </Html>
    </group>
  );
}
