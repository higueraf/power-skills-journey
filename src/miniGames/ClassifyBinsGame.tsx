import { Html } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const BLUE = "#3BA8FF";   // Liderazgo
const GREEN = "#24D2A2";  // Operativo
const BLUE_EM = "#53B8FF";
const GREEN_EM = "#47E1BC";
const GROUND = "#E6F7F3";

type Q = { t: string; isLeadership: boolean };

function Bin({
  position,
  color,
  emissive,
  label,
  active,
}: {
  position: [number, number, number];
  color: string;
  emissive: string;
  label: string;
  active: boolean;
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    // pequeño pulso si está activo
    const target = active ? 1.06 : 1;
    if (!ref.current) return;
    const s = THREE.MathUtils.lerp(ref.current.scale.x, target, Math.min(1, dt * 8));
    ref.current.scale.setScalar(s);
  });

  return (
    <group ref={ref} position={position}>
      {/* base */}
      <mesh receiveShadow>
        <cylinderGeometry args={[1.1, 1.2, 0.35, 48]} />
        <meshStandardMaterial color={GROUND} />
      </mesh>
      {/* cuerpo */}
      <mesh castShadow position={[0, 0.9, 0]}>
        <cylinderGeometry args={[0.95, 1.0, 1.8, 48]} />
        <meshStandardMaterial
          color={color}
          emissive={active ? emissive : "#000"}
          emissiveIntensity={active ? 0.35 : 0}
          roughness={0.35}
          metalness={0.05}
        />
      </mesh>
      {/* etiqueta */}
      <Html center position={[0, 2.1, 0]} style={{ pointerEvents: "none" }}>
        <div
          style={{
            background: "rgba(255,255,255,.9)",
            border: "1px solid rgba(0,0,0,.08)",
            borderRadius: 12,
            padding: "6px 12px",
            fontWeight: 800,
            color: "#0F2740",
          }}
        >
          {label}
        </div>
      </Html>
    </group>
  );
}

export default function ClassifyBinsGame({ onWin }: { onWin: () => void }) {
  const qs = useMemo<Q[]>(
    () => [
      { t: "Alinear visión con el equipo docente", isLeadership: true },
      { t: "Publicar cronograma de aulas", isLeadership: false },
      { t: "Facilitar feedback constructivo", isLeadership: true },
      { t: "Consolidar actas y listas", isLeadership: false },
      { t: "Motivar e inspirar hacia la mejora", isLeadership: true },
    ],
    []
  );

  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [highlight, setHighlight] = useState<"L" | "O" | null>(null);
  const [locked, setLocked] = useState(false);

  function pick(side: "L" | "O") {
    if (locked) return;
    setLocked(true);
    setHighlight(side);

    const correct = (side === "L") === qs[idx].isLeadership;
    if (correct) setScore((s) => s + 1);

    setTimeout(() => {
      setHighlight(null);
      const next = idx + 1;
      setLocked(false);
      if (next >= qs.length) {
        // gana con 4/5
        if (score + (correct ? 1 : 0) >= 4) onWin();
        else {
          alert(`Aciertos: ${score + (correct ? 1 : 0)}/5. Necesitas 4. Intentemos de nuevo.`);
          setIdx(0);
          setScore(0);
        }
      } else {
        setIdx(next);
      }
    }, 500);
  }

  // Atajos de teclado: L/O
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === "l") pick("L");
      if (k === "o") pick("O");
      if (k === "arrowleft") pick("L");
      if (k === "arrowright") pick("O");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [idx, locked, score]);

  return (
    <group>
      {/* Suelo suave */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[36, 16]} />
        <meshStandardMaterial color={GROUND} />
      </mesh>

      {/* Contenedores grandes y separados */}
      <Bin position={[-3, 0, 0]} color={BLUE} emissive={BLUE_EM} label="Liderazgo (L)" active={highlight === "L"} />
      <Bin position={[3, 0, 0]} color={GREEN} emissive={GREEN_EM} label="Operativo (O)" active={highlight === "O"} />

      {/* Frase actual + botones grandes */}
      <Html center>
        <div
          className="credits"
          style={{
            minWidth: 520,
            maxWidth: 680,
            textAlign: "center",
            background: "rgba(255,255,255,.92)",
            border: "1px solid #B7D7E8",
            color: "#0F2740",
          }}
        >
          <h3 style={{ marginTop: 0, marginBottom: 10 }}>Clasifica la frase</h3>
          <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 12 }}>{qs[idx].t}</div>

          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <button
              className="btn"
              style={{ background: BLUE, color: "#05233A", padding: "12px 16px", borderRadius: 12, minWidth: 160 }}
              onClick={() => pick("L")}
              disabled={locked}
            >
              ⬅️ Liderazgo (L)
            </button>
            <button
              className="btn"
              style={{ background: GREEN, color: "#05233A", padding: "12px 16px", borderRadius: 12, minWidth: 160 }}
              onClick={() => pick("O")}
              disabled={locked}
            >
              Operativo (O) ➡️
            </button>
          </div>

          <div style={{ marginTop: 10, opacity: 0.85 }}>
            Progreso: {idx + 1}/{qs.length} · Aciertos: {score}
          </div>
          <div style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>
            Tip: usa teclado L / O o ← / →
          </div>
        </div>
      </Html>
    </group>
  );
}
