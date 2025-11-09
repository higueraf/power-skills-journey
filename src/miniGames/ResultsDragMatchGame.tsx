import { Html } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
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
  const { size, gl, viewport } = useThree();
  const isMobile = size.width < 640;
  
  // Evita scroll/pinch del navegador durante drag táctil
  useEffect(() => {
    gl.domElement.style.touchAction = "none";
  }, [gl]);

  /** ========================
   *  Medidas responsive
   *  ======================== */
  // Escala del grupo (mobile más chico)
  const GROUP_SCALE = isMobile ? Math.min(1, Math.max(0.60, viewport.width / 6.6)) : 1;

  // Espaciado horizontal en mobile: usa viewport.width (unidades de mundo)
  // para garantizar que las 3 columnas quepan sin solaparse
  const MOBILE_SPACING = isMobile
  ? Math.max(1.5, Math.min(1.9, viewport.width / 3.4))
  : 2.4;

// Posiciones base
const X_LEFT  = isMobile ? -MOBILE_SPACING : -2.2;
const X_MID   = 0;
const X_RIGHT = isMobile ?  MOBILE_SPACING :  2.2;
  // Z (profundidad): agrando el “carril” en mobile para que haya aire entre labels
  const Z_START = isMobile ?  1.0 :  1.2;
  const Z_TGT   = isMobile ? -1.0 : -0.9;
  const Y_LEVEL = 0.2;

  // Tamaños de bloques y textos (más compactos en mobile)
  const BLOCK_SIZE  = isMobile ? 0.52 : 0.70;
  const BLOCK_H     = isMobile ? 0.26 : 0.35;
  const CAPTION_Y   = isMobile ? 0.34 : 0.50;       // texto del bloque más bajo en mobile
  const CAPTION_PX  = isMobile ? 10 : 13;
  const TARGET_R    = isMobile ? 0.36 : 0.45;
  const TARGET_TXT_PX = isMobile ? 12 : 14;
  const TARGET_TXT_W  = isMobile ? 150 : 200;

  // Radio de acierto (un pelín menor para evitar snaps “por error”)
  const HIT_RADIUS  = isMobile ? 0.28 : 0.35;

  /** ========================
   *  Ítems (bloques + pedestales)
   *  ======================== */
  const items = useMemo<Item[]>(
    () => [
      {
        id: "eficiencia",
        label: "📈 Eficiencia académica",
        color: vivid.blue,
        start: [X_LEFT, Y_LEVEL, Z_START],
        target: [X_LEFT, Y_LEVEL, Z_TGT],
        hint: "La eficiencia académica mejora con comunicación efectiva y coordinación clara.",
      },
      {
        id: "compromiso",
        label: "🤝 Compromiso del equipo",
        color: vivid.green,
        start: [X_MID, Y_LEVEL, Z_START],
        target: [X_MID, Y_LEVEL, Z_TGT],
        hint: "El compromiso crece con colaboración, feedback y un clima de empatía.",
      },
      {
        id: "innovacion",
        label: "💡 Innovación en investigación",
        color: "#23C7C0",
        start: [X_RIGHT, Y_LEVEL, Z_START],
        target: [X_RIGHT, Y_LEVEL, Z_TGT],
        hint: "La innovación surge del pensamiento crítico y el liderazgo adaptativo.",
      },
    ],
    [X_LEFT, X_MID, X_RIGHT, Z_START, Z_TGT]
  );

  /** ========================
   *  Estado
   *  ======================== */
  const [positions, setPositions] = useState<Record<string, [number, number, number]>>(
    () => items.reduce((acc, it) => ({ ...acc, [it.id]: it.start }), {})
  );
  const [dragId, setDragId] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(true);
  const [showError, setShowError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showWin, setShowWin] = useState(false);

  /** ========================
   *  Drag robusto (ray ⨯ plano)
   *  ======================== */
  const dragPlane = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)); // y=0
  const tmpVec = useRef(new THREE.Vector3()).current;

  const getXZFromEvent = (e: any) => {
    const hit = e.ray.intersectPlane(dragPlane.current, tmpVec);
    if (!hit) return { x: 0, z: 0 };
    return { x: hit.x, z: hit.z };
  };

  // Limitar área de juego (para que no se vayan “muy lejos”)
  const CLAMP_X = isMobile ? MOBILE_SPACING + 0.6 : 3.4;
  const CLAMP_Z = isMobile ? 1.8 : 2.2;
  const clampXZ = (nx: number, nz: number) => ([
    Math.max(-CLAMP_X, Math.min(CLAMP_X, nx)),
    Math.max(-CLAMP_Z, Math.min(CLAMP_Z, nz)),
  ] as const);

  const placed = (id: string) => {
    const p = positions[id];
    const t = items.find((i) => i.id === id)!.target;
    const dx = p[0] - t[0];
    const dz = p[2] - t[2];
    return Math.hypot(dx, dz) < HIT_RADIUS;
  };
  const allPlaced = items.every((it) => placed(it.id));

  /** ========================
   *  Handlers
   *  ======================== */
  function onBlockDown(id: string, e: any) {
    e.stopPropagation();
    if (showHelp || showError || showWin) return;
    setDragId(id);
    if (showHelp) setShowHelp(false);
  }

  function onMoveCatcher(e: any) {
    if (!dragId) return;
    e.stopPropagation();
    const { x, z } = getXZFromEvent(e);
    const y = items.find((i) => i.id === dragId)!.start[1];
    const [cx, cz] = clampXZ(x, z);
    setPositions((prev) => ({ ...prev, [dragId!]: [cx, y, cz] }));
  }

  function onBlockUp(id: string, e: any) {
    e.stopPropagation();
    if (dragId !== id) return;
    setDragId(null);

    if (placed(id)) {
      if (items.every((it) => placed(it.id))) {
        setTimeout(() => setShowWin(true), 300);
      }
      return;
    }

    const it = items.find((i) => i.id === id)!;
    setPositions((prev) => ({ ...prev, [id]: it.start }));
    setErrorMsg(`Ese bloque no está sobre su pedestal. Tip: ${it.hint}`);
    setShowError(true);
  }

  return (
    <group position={[0, isMobile ? 0.7 : 0.9, 0]} scale={[GROUP_SCALE, GROUP_SCALE, GROUP_SCALE]}>
      {/* Plano "catcher" invisible (captura move/up fuera del bloque) */}
      <mesh
        position={[0, 0, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        onPointerMove={onMoveCatcher}
        onPointerUp={() => setDragId(null)}
      >
        <planeGeometry args={[isMobile ? 18 : 24, isMobile ? 12 : 16, 1, 1]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* Pedestales */}
      {items.map((it) => (
        <group key={`t-${it.id}`} position={[it.target[0], 0, it.target[2]]}>
          {/* base */}
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[TARGET_R, 48]} />
            <meshStandardMaterial
              color={theme.ground}
              emissive={theme.glowBlue}
              emissiveIntensity={0.12}
            />
          </mesh>
          {/* poste decorativo */}
          <mesh position={[0, 0.1, 0]}>
            <cylinderGeometry args={[0.05, 0.05, isMobile ? 0.18 : 0.2, 16]} />
            <meshStandardMaterial
              color={theme.padBlue}
              emissive={theme.glowBlue}
              emissiveIntensity={0.1}
              roughness={0.35}
              metalness={0.05}
            />
          </mesh>
          {/* etiqueta del pedestal (más estrecha en mobile) */}
          <Html center position={[0, 0.62, 0]}>
            <div
              style={{
                background: "rgba(255,255,255,0.92)",
                border: `1px solid ${theme.border}`,
                borderRadius: 12,
                padding: isMobile ? "4px 8px" : "6px 12px",
                color: theme.text,
                fontWeight: 700,
                fontSize: TARGET_TXT_PX,
                textAlign: "center",
                width: TARGET_TXT_W,
                lineHeight: 1.25,
                whiteSpace: "normal",
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
              <boxGeometry args={[BLOCK_SIZE, BLOCK_H, BLOCK_SIZE]} />
              <meshStandardMaterial
                color={ok ? it.color : theme.padBlue}
                emissive={ok ? vivid.greenGlow : theme.glowBlue}
                emissiveIntensity={ok ? 0.45 : 0.25}
                metalness={0.12}
                roughness={0.35}
              />
            </mesh>
            {/* caption del bloque (más abajo y más pequeño en mobile) */}
            <Html center position={[0, CAPTION_Y, 0]}>
              <div
                style={{
                  background: "rgba(255,255,255,0.9)",
                  border: `1px solid ${theme.border}`,
                  borderRadius: 10,
                  padding: isMobile ? "3px 8px" : "4px 10px",
                  color: theme.text,
                  fontWeight: 700,
                  fontSize: CAPTION_PX,
                  whiteSpace: "nowrap",
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
            text={errorMsg || "Ese bloque no está en su pedestal correcto. Inténtalo de nuevo."}
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
