import { Html } from "@react-three/drei";
import { useMemo, useState } from "react";
import Modal from "../components/Modal";
import Speech from "../components/Speech";
import { theme, vivid } from "../theme";

type Props = { onWin: () => void };

type Item = {
  id: "eficiencia" | "compromiso" | "innovacion";
  label: string;
  color: string;
  start: [number, number, number];   // posición inicial del bloque
  target: [number, number, number];  // pedestal correcto
  hint: string;
};

export default function ResultsDragMatchGame({ onWin }: Props) {
  // Configuración de bloques + pedestales
  const items = useMemo<Item[]>(
    () => [
      {
        id: "eficiencia",
        label: "📈 Eficiencia académica",
        color: vivid.blue,
        start: [-2.8, 0.2, 1.2],
        target: [-2.8, 0.2, -0.9],
        hint:
          "La eficiencia académica mejora con comunicación efectiva y coordinación clara.",
      },
      {
        id: "compromiso",
        label: "🤝 Compromiso del equipo",
        color: vivid.green,
        start: [0, 0.2, 1.2],
        target: [0, 0.2, -0.9],
        hint:
          "El compromiso crece con colaboración, feedback y un clima de empatía.",
      },
      {
        id: "innovacion",
        label: "💡 Innovación en investigación",
        color: "#23C7C0",
        start: [2.8, 0.2, 1.2],
        target: [2.8, 0.2, -0.9],
        hint:
          "La innovación surge del pensamiento crítico y el liderazgo adaptativo.",
      },
    ],
    []
  );

  // Estado
  const [positions, setPositions] = useState<Record<string, [number, number, number]>>(
    () => items.reduce((acc, it) => ({ ...acc, [it.id]: it.start }), {})
  );
  const [dragId, setDragId] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(true);
  const [showError, setShowError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showWin, setShowWin] = useState(false);

  const placed = (id: string) => {
    const p = positions[id];
    const t = items.find((i) => i.id === id)!.target;
    const dx = p[0] - t[0];
    const dz = p[2] - t[2];
    return Math.sqrt(dx * dx + dz * dz) < 0.35; // radio de acierto
  };

  const allPlaced = items.every((it) => placed(it.id));

  function onBlockDown(id: string, e: any) {
    e.stopPropagation();
    if (showHelp || showError || showWin) return;
    setDragId(id);
  }

  function onPointerMove(e: any) {
    if (!dragId) return;
    e.stopPropagation();
    // movemos en plano XZ, fijando Y
    const y = items.find((i) => i.id === dragId)!.start[1];
    const nx = e.point.x;
    const nz = e.point.z;
    setPositions((prev) => ({ ...prev, [dragId]: [nx, y, nz] }));
  }

  function onBlockUp(id: string, e: any) {
    e.stopPropagation();
    if (dragId !== id) return;
    setDragId(null);

    // ¿Se soltó sobre el pedestal correcto?
    if (placed(id)) {
      // si ya están todos, ganar
      if (items.every((it) => placed(it.id))) {
        setTimeout(() => setShowWin(true), 300);
      }
      return;
    }

    // Error: volver a la posición inicial del bloque
    const it = items.find((i) => i.id === id)!;
    setPositions((prev) => ({ ...prev, [id]: it.start }));
    setErrorMsg(
      `Ese bloque no está sobre su pedestal. Tip: ${it.hint}`
    );
    setShowError(true);
  }

  return (
    <group position={[0, 0.9, 0]} onPointerMove={onPointerMove}>
      {/* Pedestales (targets) */}
      {items.map((it) => (
        <group key={`t-${it.id}`} position={[it.target[0], 0, it.target[2]]}>
          {/* base */}
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.45, 48]} />
            <meshStandardMaterial
              color={theme.ground}
              emissive={theme.glowBlue}
              emissiveIntensity={0.12}
            />
          </mesh>
          {/* poste decorativo */}
          <mesh position={[0, 0.1, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 0.2, 16]} />
            <meshStandardMaterial
              color={theme.padBlue}
              emissive={theme.glowBlue}
              emissiveIntensity={0.1}
              roughness={0.35}
              metalness={0.05}
            />
          </mesh>
          {/* etiqueta */}
          <Html center position={[0, 0.6, 0]}>
            <div
              style={{
                background: "rgba(255,255,255,0.92)",
                border: `1px solid ${theme.border}`,
                borderRadius: 10,
                padding: "6px 12px",
                color: theme.text,
                fontWeight: 700,
                fontSize: 14,
                textAlign: "center",
                width: 200,
              }}
            >
              {it.label}
            </div>
          </Html>
        </group>
      ))}

      {/* Bloques arrastrables */}
      {items.map((it) => {
        const p = positions[it.id];
        const ok = placed(it.id);
        return (
          <group key={it.id} position={[p[0], p[1], p[2]]}>
            <mesh
              onPointerDown={(e) => onBlockDown(it.id, e)}
              onPointerUp={(e) => onBlockUp(it.id, e)}
              castShadow
            >
              <boxGeometry args={[0.7, 0.35, 0.7]} />
              <meshStandardMaterial
                color={ok ? it.color : theme.padBlue}
                emissive={ok ? vivid.greenGlow : theme.glowBlue}
                emissiveIntensity={ok ? 0.45 : 0.25}
                metalness={0.12}
                roughness={0.35}
              />
            </mesh>
            {/* breve caption sobre el bloque */}
            <Html center position={[0, 0.5, 0]}>
              <div
                style={{
                  background: "rgba(255,255,255,0.9)",
                  border: `1px solid ${theme.border}`,
                  borderRadius: 10,
                  padding: "4px 10px",
                  color: theme.text,
                  fontWeight: 700,
                }}
              >
                Arrastra y suelta
              </div>
            </Html>
          </group>
        );
      })}

      {/* Modal: Instrucciones */}
      <Html center>
        <Modal
          open={showHelp}
          title="Juego: Vincula logros con sus pedestales"
          onPrimary={() => setShowHelp(false)}
          type="info"
          primaryLabel="Comenzar"
        >
          <p>
            Arrastra cada <b>bloque 3D</b> hasta el <b>pedestal</b> que le
            corresponde: <em>Eficiencia académica, Compromiso del equipo, Innovación</em>.
            Si te equivocas, te daremos una pista.
          </p>
          <Speech
            text="Arrastra cada bloque tridimensional hasta el pedestal que le corresponde: Eficiencia académica, Compromiso del equipo e Innovación. Si te equivocas, te daremos una pista."
            when={showHelp}
            lang="es-ES"
          />
        </Modal>
      </Html>

      {/* Modal: Error */}
      <Html center>
        <Modal
          open={showError}
          type="warning"
          title="Aún no coincide"
          onPrimary={() => setShowError(false)}
          primaryLabel="Intentar de nuevo"
        >
          <p>{errorMsg || "Ese bloque no está en su pedestal correcto."}</p>
          <Speech
            text={
              errorMsg ||
              "Ese bloque no está en su pedestal correcto. Inténtalo de nuevo."
            }
            when={showError}
            lang="es-ES"
          />
        </Modal>
      </Html>

      {/* Modal: Éxito */}
      <Html center>
        <Modal
          open={showWin || allPlaced}
          type="success"
          title="¡Resultados alineados!"
          onPrimary={onWin}
          primaryLabel="Continuar"
        >
          <p>
            ¡Excelente! Vinculaste correctamente los logros con sus pedestales.
            Avancemos a la reflexión final.
          </p>
          <Speech
            text="Excelente. Vinculaste correctamente los logros con sus pedestales. Avancemos a la reflexión final."
            when={showWin || allPlaced}
            lang="es-ES"
          />
        </Modal>
      </Html>
    </group>
  );
}
