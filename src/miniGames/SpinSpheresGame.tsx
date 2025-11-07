// src/miniGames/SpinSpheresGame.tsx
import { Html } from "@react-three/drei";
import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { theme } from "../theme";
import { SIZES } from "../constants3d";
type Pad = {
  pos: [number, number, number];
  color: string;
  glow: string;
  emoji: string;
  label: string;
};

const PADS: Pad[] = [
  { pos: [-2.2, 1.1, 0], color: theme.padBlue,  glow: theme.glowBlue,  emoji: "💬", label: "Comunicación" },
  { pos: [-0.6, 1.1, 0], color: theme.padGreen, glow: theme.glowGreen, emoji: "🧠", label: "Crítico" },
  { pos: [ 0.9, 1.1, 0], color: theme.padBlue,  glow: theme.glowBlue,  emoji: "💗", label: "Empatía" },
  { pos: [ 2.4, 1.1, 0], color: theme.padGreen, glow: theme.glowGreen, emoji: "🤝", label: "Colaboración" },
];

export default function SpinSpheresGame({ onWin }: { onWin: () => void }) {
  const groups = useRef<Array<THREE.Group | null>>([]);
  const [spinning, setSpinning] = useState<boolean[]>([false, false, false, false]);
  const [done, setDone] = useState<boolean[]>([false, false, false, false]);
  const [locked, setLocked] = useState<boolean[]>([false, false, false, false]);
  const [progress, setProgress] = useState(0);
  const [won, setWon] = useState(false);

  // Rotación fluida mientras gira
  useFrame((_, dt) => {
    groups.current.forEach((g, i) => {
      if (!g) return;
      if (spinning[i]) g.rotation.y += dt * 4;
    });
  });

  const onClick = (i: number) => {
    // si ya está hecho o bloqueado, no aceptar más clics
    if (done[i] || locked[i]) return;

    // bloquear la esfera mientras se anima
    setLocked((prev) => prev.map((v, k) => (k === i ? true : v)));

    // marcar check inmediato
    setDone((prev) => {
      const nd = prev.map((v, k) => (k === i ? true : v));
      const completed = nd.filter(Boolean).length;
      setProgress(completed);
      if (completed === PADS.length && !won) {
        setWon(true);
        setTimeout(onWin, 1000);
      }
      return nd;
    });

    // iniciar giro
    setSpinning((s) => s.map((v, k) => (k === i ? true : v)));
    setTimeout(() => {
      // detener giro y desbloquear la esfera
      setSpinning((s) => s.map((v, k) => (k === i ? false : v)));
      setLocked((l) => l.map((v, k) => (k === i ? false : v)));
    }, 900);
  };

  return (
    <group>
      {PADS.map((p, i) => (
        <group
          key={i}
          position={p.pos as any}
          ref={(el) => (groups.current[i] = el)}
          onClick={() => onClick(i)}
        >
          <mesh castShadow>
            <sphereGeometry args={[SIZES.medium, 40, 40]} />
            <meshStandardMaterial
              color={p.color}
              emissive={spinning[i] ? p.glow : "#000000"}
              emissiveIntensity={spinning[i] ? 0.6 : 0}
              roughness={0.35}
              metalness={0.05}
            />
          </mesh>

          {/* Icono, texto y estado */}
          <Html center distanceFactor={10} style={{ pointerEvents: "none", transform: "translateY(20px)" }}>
            <div
              style={{
                display: "grid",
                placeItems: "center",
                gap: 4,
                background: "rgba(231,246,243,.92)",
                border: "1px solid #B7D7E8",
                color: "#0F2740",
                borderRadius: 12,
                padding: "6px 10px",
                minWidth: 120,
              }}
            >
              <div style={{ fontSize: 18 }}>{p.emoji}</div>
              <div style={{ fontWeight: 600 }}>{p.label}</div>
              <div style={{ fontSize: 14, opacity: 0.9 }}>
                {done[i] ? "✅" : spinning[i] ? "🌀" : "Toca"}
              </div>
            </div>
          </Html>
        </group>
      ))}

      {/* Panel central */}
      <Html center>
        <div
          className="bubble"
          style={{
            background: "rgba(218,241,234,.95)",
            borderColor: "#B7D7E8",
            color: "#0F2740",
            minWidth: 320,
            textAlign: "center",
            fontSize: 16,
          }}
        >
          {won
            ? "✅ ¡Completaste las 4 Power Skills! Avanzando..."
            : `Activa las 4 esferas. Progreso: ${progress}/4`}
        </div>
      </Html>
    </group>
  );
}
