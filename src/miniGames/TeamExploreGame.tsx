import { Html, Text, Bounds } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useMemo, useState, useRef, useEffect } from "react";
import { MeshBasicMaterial } from "three";
import Modal from "../components/Modal";
import AudioNarration from "../components/AudioNarration"; // ⬅️ MP3
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

  // 🔊 mapa de audios por avatar
  const voiceMap: Record<string, string> = {
    empatia: "/audio/10-empatia.mp3",
    adaptabilidad: "/audio/11-adaptabilidad.mp3",
    colaboracion: "/audio/12-colaboracion.mp3",
    estrategia: "/audio/13-estrategia.mp3",
    innovacion: "/audio/14-innovacion.mp3",
  };

  /** Escala base de los avatares */
  const SIZE_BOOST = 2.4;
  const baseScale = useMemo(() => {
    const w = viewport.width;
    const raw = Math.max(0.4, Math.min(0.62, w / 12));
    return raw * SIZE_BOOST;
  }, [viewport.width]);

  const R = 0.95 * baseScale;
  const labelFont = Math.max(0.16, R * 0.33);
  const labelYOffset = R * 1.35;

  /** Piso y grupo */
  const planeY = -viewport.height * 5.2;
  const groupY = viewport.height * 1.28;
  const spacingY = isMobile ? R * 4.4 : R * 3.2;

  /** Separación horizontal */
  const spacingXBase = isWide ? Math.max(3.6, viewport.width / 3.8) : Math.min(2.8, viewport.width / 2.4);
  const ROW_X_FACTORS = [2.6, 2.4, 2.2];

  /** Datos */
  const skills = [
    { id: "empatia", name: "Dra. Empatía", color: vivid.green, text: "Liderar con empatía es entender antes de decidir. Escuchar y motivar impulsa el bienestar del equipo." },
    { id: "adaptabilidad", name: "Ing. Adaptabilidad", color: vivid.blue, text: "En un entorno cambiante, cada desafío se convierte en una oportunidad para innovar." },
    { id: "colaboracion", name: "Lic. Colaboración", color: "#39D9A3", text: "Fomentar alianzas entre docentes, estudiantes y empresas multiplica la productividad." },
    { id: "estrategia", name: "Prof. Estrategia", color: "#4BA9E3", text: "Analizar, evaluar y cuestionar con propósito fortalece la calidad académica." },
    { id: "innovacion", name: "Mtra. Innovación", color: "#23C7C0", text: "Transformar ideas en mensajes claros inspira a toda la organización." },
  ];

  /** Posiciones (1 fila ancha o 2-2-1) */
  const positions = useMemo(() => {
    if (isWide) {
      const total = skills.length;
      const startX = -((total - 1) * spacingXBase) / 2;
      return skills.map((_, i) => [startX + i * spacingXBase, 1.0, 0] as [number, number, number]);
    } else {
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
    setActiveSkill(null); // reset para re-disparar audio aunque sea el mismo
    // pequeño timeout para asegurar nuevo render y volver a activar narración
    setTimeout(() => setActiveSkill(id), 0);
  };

  return (
    <group>
      <ambientLight intensity={0.85} />

      {/* Piso invisible */}
      <mesh position={[0, planeY, 0]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={-10}>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="green" transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* Modal de ayuda (con MP3) */}
      <Html center>
        <Modal open={showHelp} title="Juego: Conociendo al equipo Power Skills" onPrimary={() => setShowHelp(false)}>
          <p>Explora los cinco avatares. Toca cada uno para escuchar su aporte. Cuando los visites todos, avanzarás.</p>
          <AudioNarration src="/audio/08-team-help.mp3" when={showHelp} rate={1} volume={1} />
        </Modal>
      </Html>

      {/* Modal de victoria (con MP3) */}
      <Html center>
        <Modal open={showWin} title="¡Excelente trabajo!" onPrimary={onWin} type="success">
          <p>Has conocido a todo el equipo Power Skills. ¡Tu curiosidad y liderazgo fortalecen la colaboración!</p>
          <AudioNarration src="/audio/09-team-win.mp3" when={showWin} rate={1} volume={1} />
        </Modal>
      </Html>

      {/* Avatares */}
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

      {/* Voz del avatar activo (reproduce al tocar) */}
      {activeSkill && (
        <Html /* montamos fuera del modal para que no se destruya en cada clic */>
          <AudioNarration
            key={activeSkill}                  // fuerza nueva reproducción al cambiar
            src={voiceMap[activeSkill] || ""}
            when={!!activeSkill}
            rate={1}
            volume={1}
          />
        </Html>
      )}
    </group>
  );
}
