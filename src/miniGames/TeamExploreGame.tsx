import { Html, Text, Bounds } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useMemo, useState, useRef, useEffect } from "react";
import { MeshBasicMaterial } from "three";
import Modal from "../components/Modal";
import Speech from "../components/Speech";
import { theme, vivid } from "../theme";

type Props = { onWin: () => void };

function Label3D({ text, fontSize, color, borderColor, width, height, yOffset }: any) {
  const textRef = useRef<any>(null);

  useEffect(() => {
    if (textRef.current) {
      const mats = Array.isArray(textRef.current.material)
        ? textRef.current.material
        : [textRef.current.material];
      mats.forEach((m: any) => {
        if (m) {
          (m as MeshBasicMaterial).depthTest = false;
          (m as MeshBasicMaterial).depthWrite = false;
        }
      });
    }
  }, []);

  return (
    <group position={[0, yOffset, 0.15]} renderOrder={30}>
      <mesh renderOrder={29}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.95} depthTest={false} depthWrite={false} />
      </mesh>

      <Text
        ref={textRef}
        fontSize={fontSize}
        color={color}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.005}
        outlineColor={borderColor}
        maxWidth={width * 0.95}
        lineHeight={1}
        renderOrder={31}
      >
        {text}
      </Text>
    </group>
  );
}

export default function TeamExploreGame({ onWin }: Props) {
  const [visited, setVisited] = useState<string[]>([]);
  const [activeSkill, setActiveSkill] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(true);
  const [showWin, setShowWin] = useState(false);

  const { viewport, size } = useThree();
  const isMobile = size.width < 600;
  const isTablet = size.width < 1100;
  const isWide = !isMobile && !isTablet;

  /** 🔹 Escala base de los avatares */
  const SIZE_BOOST = 2.4;
  const baseScale = useMemo(() => {
    const w = viewport.width;
    const raw = Math.max(0.4, Math.min(0.62, w / 12));
    return raw * SIZE_BOOST;
  }, [viewport.width]);

  const R = 0.95 * baseScale;
  const labelFont = Math.max(0.16, R * 0.33);
  const labelYOffset = R * 1.35; // ⬆️ etiqueta un poco más alta

  /** 🔹 Piso bien abajo y grupo más arriba */
  const planeY = -viewport.height * 1.2;   // ⬇️ baja el piso de forma clara
  const groupY = viewport.height * 0.28;   // ⬆️ sube el grupo de esferas
  const spacingY = isMobile ? R * 4.4 : R * 3.2;

  /** 🔹 Separación horizontal más amplia */
  const spacingXBase = isWide
    ? Math.max(3.6, viewport.width / 3.8)   // ⬅️ más separación en pantallas anchas
    : Math.min(2.8, viewport.width / 2.4); // ⬅️ también más separación en mobile/tablet

  // factores por fila (para layout 2-2-1)
  const ROW_X_FACTORS = [2.6, 2.4, 2.2]; // ⬅️ separa más cada fila

  /** 🔹 Datos */
  const skills = [
    { id: "empatia", name: "Dra. Empatía", color: vivid.green, text: "Liderar con empatía es entender antes de decidir. Escuchar y motivar impulsa el bienestar del equipo." },
    { id: "adaptabilidad", name: "Ing. Adaptabilidad", color: vivid.blue, text: "En un entorno cambiante, cada desafío se convierte en una oportunidad para innovar." },
    { id: "colaboracion", name: "Lic. Colaboración", color: "#39D9A3", text: "Fomentar alianzas entre docentes, estudiantes y empresas multiplica la productividad." },
    { id: "estrategia", name: "Prof. Estrategia", color: "#4BA9E3", text: "Analizar, evaluar y cuestionar con propósito fortalece la calidad académica." },
    { id: "innovacion", name: "Mtra. Innovación", color: "#23C7C0", text: "Transformar ideas en mensajes claros inspira a toda la organización." },
  ];

  /** 🔹 Posiciones (1 fila ancha o 2-2-1) */
  const positions = useMemo(() => {
    if (isWide) {
      // 🖥️ fila horizontal amplia
      const total = skills.length;
      const startX = -((total - 1) * spacingXBase) / 2;
      return skills.map((_, i) => [startX + i * spacingXBase, 1.0, 0] as [number, number, number]);
    } else {
      // 📱🧭 layout 2-2-1
      const rows = [[0, 1], [2, 3], [4]];
      const rowYStart = 2.8;
      return rows.flatMap((row, rIdx) => {
        const spacingXRow = spacingXBase * (ROW_X_FACTORS[rIdx] ?? 1.0);
        const y = rowYStart - rIdx * spacingY;
        const startXRow = -((row.length - 1) * spacingXRow) / 2;
        return row.map((_, i) => [startXRow + i * spacingXRow, y, 0] as [number, number, number]);
      });
    }
  }, [isWide, spacingXBase, spacingY, viewport.width]);

  const handleClick = (id: string) => {
    if (showHelp || showWin) return;
    if (!visited.includes(id)) {
      const newVisited = [...visited, id];
      setVisited(newVisited);
      if (newVisited.length === skills.length) setTimeout(() => setShowWin(true), 900);
    }
    setActiveSkill(id);
  };

  return (
    <group>
      <ambientLight intensity={0.85} />

      {/* 🔹 Piso más bajo */}
      <mesh position={[0, planeY, 0]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={-10}>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial
          color="#c7cecc"
          transparent
          opacity={0}       // 🔹 completamente invisible
          depthWrite={false}
        />
      </mesh>

      {/* Modales */}
      <Html center>
        <Modal open={showHelp} title="Juego: Conociendo al equipo Power Skills" onPrimary={() => setShowHelp(false)}>
          <p>Explora los cinco avatares. Toca cada uno para escuchar su aporte. Cuando los visites todos, avanzarás.</p>
          <Speech text="Explora los cinco avatares. Toca cada uno para escuchar su aporte." when={showHelp} lang="es-ES" />
        </Modal>
      </Html>

      <Html center>
        <Modal open={showWin} title="¡Excelente trabajo!" onPrimary={onWin} type="success">
          <p>Has conocido a todo el equipo Power Skills. ¡Tu curiosidad y liderazgo fortalecen la colaboración!</p>
          <Speech text="¡Excelente trabajo!" when={showWin} lang="es-ES" />
        </Modal>
      </Html>

      {/* 🔹 Avatares más altos y separados */}
      <Bounds fit observe clip margin={1.0}>
        <group position={[0, groupY, 0]}>
          {skills.map((skill, i) => {
            const [x, y, z] = positions[i] ?? [0, 0.7, 0];
            const active = visited.includes(skill.id);
            const approxWidth = Math.max(1.8, Math.min(3.8, labelFont * (skill.name.length * 0.36)));
            const approxHeight = labelFont * 2.0;

            return (
              <group key={skill.id} position={[x, y, z]} onClick={() => handleClick(skill.id)}>
                <mesh>
                  <sphereGeometry args={[R, 32, 32]} />
                  <meshStandardMaterial
                    color={active ? skill.color : theme.padBlue}
                    emissive={active ? (vivid.greenGlow ?? "#0a3") : (theme.glowBlue ?? "#013")}
                    emissiveIntensity={active ? 0.6 : 0.25}
                  />
                </mesh>
                <Label3D
                  text={skill.name}
                  fontSize={labelFont}
                  color={theme.text}
                  borderColor={theme.border}
                  width={approxWidth}
                  height={approxHeight}
                  yOffset={labelYOffset}
                />
              </group>
            );
          })}
        </group>
      </Bounds>

      {activeSkill && (
        <Speech
          text={skills.find((s) => s.id === activeSkill)?.text || ""}
          when={true}
          lang="es-ES"
        />
      )}
    </group>
  );
}
