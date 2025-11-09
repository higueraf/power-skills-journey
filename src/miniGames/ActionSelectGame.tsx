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
  const isMobile = size.width < 640;
  const isTablet = size.width >= 640 && size.width < 1024;
  const isWide = !isMobile && !isTablet;

  const skills = useMemo(
    () => [
      { id: "empatia", name: "Dra. Empatía", color: vivid.green, text: "Liderar con empatía es entender antes de decidir. Escuchar y motivar impulsa el bienestar del equipo." },
      { id: "adaptabilidad", name: "Ing. Adaptabilidad", color: vivid.blue, text: "En un entorno cambiante, cada desafío se convierte en una oportunidad para innovar." },
      { id: "colaboracion", name: "Lic. Colaboración", color: "#39D9A3", text: "Fomentar alianzas entre docentes, estudiantes y empresas multiplica la productividad." },
      { id: "estrategia", name: "Prof. Estrategia", color: "#4BA9E3", text: "Analizar, evaluar y cuestionar con propósito fortalece la calidad académica." },
      { id: "innovacion", name: "Mtra. Innovación", color: "#23C7C0", text: "Transformar ideas en mensajes claros inspira a toda la organización." },
    ],
    []
  );

  // 🔹 Tamaño base de las esferas
  const SIZE_BOOST = 2.0;
  const baseScale = useMemo(() => {
    const raw = Math.max(0.32, Math.min(0.5, viewport.width / 14));
    return raw * SIZE_BOOST;
  }, [viewport.width]);

  let R = (isMobile ? 0.72 : 1) * 0.95 * baseScale;
  // ⬇️ Reducimos el tamaño en desktop
  if (!isMobile && !isTablet) {
    R *= 0.8;
  }

  const labelFont = Math.max(0.13, R * (isMobile ? 0.26 : 0.32));
  const labelYOffset = R * (isMobile ? 1.05 : 1.15);

  // 🔹 Piso y altura del grupo
  const planeY = -viewport.height * 1.3;
  const groupY = (!isMobile && !isTablet)
    ? viewport.height * 0.16
    : viewport.height * (isMobile ? 0.30 : 0.42);

  // 🔹 Escala global del grupo en mobile
  const GROUP_SCALE = isMobile ? Math.min(1, Math.max(0.62, viewport.width / 6.6)) : 1;

  // 🔹 Espaciados
  const spacingY = R * (isMobile ? 2.4 : 4.5);

  const computeRowSpacingX = (itemsInRow: number) => {
    const minByRadius = R * (isMobile ? 3.5 : 2.1);
    const maxByViewport = viewport.width / (itemsInRow + (isMobile ? 1.2 : 1.0));
    const capped = Math.min(maxByViewport, R * 3.0);
    return Math.max(minByRadius, capped);
  };

  // 🔹 Posiciones adaptativas
  const positions = useMemo<[number, number, number][]>(() => {
    if (isWide) {
      const total = skills.length;
      const sx = computeRowSpacingX(total);
      const startX = -((total - 1) * sx) / 2;
      const rowY = 0.7; // centrado en web
      return skills.map((_, i) => [startX + i * sx, rowY, 0]);
    }

    const rows = [[0, 1], [2, 3], [4]];
    const rowYStart = isMobile ? 1.55 : 2.6;
    const res: [number, number, number][] = [];
    rows.forEach((row, rIdx) => {
      const sx = computeRowSpacingX(row.length);
      const y = rowYStart - rIdx * spacingY;
      const startX = -((row.length - 1) * sx) / 2;
      row.forEach((idx, i) => {
        res[idx] = [startX + i * sx, y, 0];
      });
    });
    return res;
  }, [isWide, skills.length, viewport.width, spacingY, R, isMobile]);

  const handleClick = (id: string) => {
    if (showHelp || showWin) return;
    if (!visited.includes(id)) {
      const newVisited = [...visited, id];
      setVisited(newVisited);
      if (newVisited.length === skills.length) setTimeout(() => setShowWin(true), 700);
    }
    setActiveSkill(id);
  };

  return (
    <group>
      <ambientLight intensity={0.9} />

      {/* Piso invisible */}
      <mesh position={[0, planeY, 0]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={-10}>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#c7cecc" transparent opacity={0} depthWrite={false} />
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

      {/* Avatares */}
      <Bounds observe clip margin={1.1} fit>
        <group position={[0, groupY, 0]} scale={[GROUP_SCALE, GROUP_SCALE, GROUP_SCALE]}>
          {skills.map((skill, i) => {
            const [x, y, z] = positions[i] ?? [0, 1.1, 0];
            const active = visited.includes(skill.id);

            const approxWidth = Math.max(
              1.4,
              Math.min(3.2, labelFont * (skill.name.length * (isMobile ? 0.30 : 0.34)))
            );
            const approxHeight = labelFont * (isMobile ? 1.5 : 1.8);

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
