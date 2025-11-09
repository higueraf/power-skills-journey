import { Html, Bounds } from "@react-three/drei";
import { useMemo, useState } from "react";
import { useThree } from "@react-three/fiber";
import Modal from "../components/Modal";
import AudioNarration from "../components/AudioNarration"; // ⬅️ MP3
import { theme, vivid } from "../theme";

type Props = { onWin: () => void };

type SkillId = "comunicacion" | "critico" | "empatia" | "adaptativo" | "colaboracion";
type Skill = { id: SkillId; label: string; color: string; text: string };

export default function ReflectionChooseSkillGame({ onWin }: Props) {
  const { size, viewport } = useThree();
  const isMobile = size.width < 640;
  const isTablet = size.width >= 640 && size.width < 1024;

  const skills = useMemo<Skill[]>(
    () => [
      { id: "comunicacion", label: "💬 Comunicación efectiva", color: vivid.blue,
        text: "Comunicación efectiva: expresar con claridad y escuchar activamente para conectar equipos." },
      { id: "critico",      label: "🧠 Pensamiento crítico",   color: vivid.green,
        text: "Pensamiento crítico: analizar, contrastar evidencia y decidir con criterio." },
      { id: "empatia",      label: "💗 Empatía",               color: "#47E1BC",
        text: "Empatía: comprender al otro para construir confianza y bienestar colectivo." },
      { id: "adaptativo",   label: "💫 Liderazgo adaptativo",  color: "#53B8FF",
        text: "Liderazgo adaptativo: guiar el cambio y responder con flexibilidad ante lo inesperado." },
      { id: "colaboracion", label: "🤝 Colaboración",          color: "#39D9A3",
        text: "Colaboración: sumar talentos diversos para alcanzar metas compartidas." },
    ],
    []
  );

  // 🔊 narraciones por skill seleccionada
  const voiceBySkill: Record<SkillId, string> = {
    comunicacion: "/audio/31-skill-comunicacion.mp3",
    critico:      "/audio/32-skill-critico.mp3",
    empatia:      "/audio/33-skill-empatia.mp3",
    adaptativo:   "/audio/34-skill-adaptativo.mp3",
    colaboracion: "/audio/35-skill-colaboracion.mp3",
  };

  const [selected, setSelected] = useState<SkillId | null>(null);
  const [showHelp, setShowHelp] = useState(true);
  const [showError, setShowError] = useState(false);
  const [showWin, setShowWin] = useState(false);

  /** Tamaños responsivos */
  const sphereR = isMobile ? 0.48 : isTablet ? 0.48 : 0.56;
  const labelFontPx = isMobile ? 12 : 14;
  const labelWidth = isMobile ? 150 : 200;
  const labelYOffset = sphereR * 1.15;

  /** Desplazamientos */
  const planeY = isMobile ? -viewport.height * 5.8 : -viewport.height * 1.3;
  const groupShiftY = isMobile ? viewport.height * 0.50 : viewport.height * 0.12;

  /** Helpers de espaciado */
  const xSpacing = (cols: number) =>
    Math.min(sphereR * 4.4, Math.max(sphereR * 2.6, viewport.width / (cols + (isMobile ? 0.8 : 0.4))));
  const rowGap = sphereR * (isMobile ? 3.1 : 3.4);

  /** Posiciones */
  const posById = useMemo<Record<SkillId, [number, number, number]>>(() => {
    if (!isMobile) {
      const colWTop = xSpacing(3);
      const colWBot = xSpacing(2);
      const yTop = 1.4;
      const yBot = yTop - rowGap;
      const topXs = [-colWTop, 0, colWTop];
      const botXs = [-colWBot * 0.6, colWBot * 0.6];
      return {
        comunicacion: [topXs[0], yTop, 0],
        critico:      [topXs[1], yTop, 0],
        empatia:      [topXs[2], yTop, 0],
        adaptativo:   [botXs[0], yBot, 0],
        colaboracion: [botXs[1], yBot, 0],
      };
    }
    const colW = xSpacing(2);
    const yRow1 = 1.4, yRow2 = yRow1 - rowGap, yRow3 = yRow1 - 2 * rowGap;
    return {
      comunicacion: [-colW, yRow1, 0],
      critico:      [ colW, yRow1, 0],
      empatia:      [ 0,    yRow2, 0],
      adaptativo:   [-colW, yRow3, 0],
      colaboracion: [ colW, yRow3, 0],
    };
  }, [isMobile, viewport.width, sphereR]);

  const handleSelect = (id: SkillId) => {
    if (showHelp || showError || showWin) return;
    // para re-reproducir si vuelven a tocar la misma
    setSelected(null);
    setTimeout(() => setSelected(id), 0);
  };

  const handleConfirm = () => {
    if (!selected) { setShowError(true); return; }
    setShowWin(true);
  };

  return (
    <group>
      {/* Piso */}
      <mesh position={[0, planeY, 0]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={-10}>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color={theme.ground} transparent opacity={0} depthWrite={false} />
      </mesh>

      <Bounds fit clip observe margin={isMobile ? 1.35 : 1.1}>
        <group position={[0, groupShiftY, 0]}>
          {skills.map((s) => {
            const [x, y, z] = posById[s.id];
            const active = selected === s.id;
            return (
              <group key={s.id} position={[x, y, z]}>
                {/* Esfera 3D */}
                <mesh onClick={() => handleSelect(s.id)} castShadow>
                  <sphereGeometry args={[sphereR, 32, 32]} />
                  <meshStandardMaterial
                    color={active ? s.color : theme.padBlue}
                    emissive={active ? vivid.greenGlow : theme.glowBlue}
                    emissiveIntensity={active ? 0.6 : 0.25}
                    metalness={0.08}
                    roughness={0.35}
                  />
                </mesh>
                {/* Etiqueta HTML */}
                <Html center position={[0, labelYOffset, 0]}>
                  <div
                    onClick={() => handleSelect(s.id)}
                    style={{
                      background: "rgba(255,255,255,0.92)",
                      border: `1px solid ${theme.border}`,
                      borderRadius: 12,
                      padding: isMobile ? "5px 10px" : "6px 12px",
                      color: theme.text,
                      fontWeight: 800,
                      fontSize: labelFontPx,
                      textAlign: "center",
                      width: labelWidth,
                      lineHeight: 1.25,
                      whiteSpace: "normal",
                      pointerEvents: "auto",
                      cursor: "pointer",
                      userSelect: "none",
                    }}
                  >
                    {s.label}
                  </div>
                </Html>
              </group>
            );
          })}

          {/* Botón Confirmar */}
          <Html center position={[0, isMobile ? -1.8 : 0.1, 0]}>
            <button
              onClick={handleConfirm}
              style={{
                background: theme.primary,
                color: theme.text,
                border: "none",
                padding: isMobile ? "9px 16px" : "10px 18px",
                borderRadius: 12,
                fontWeight: 800,
                cursor: "pointer",
                boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
              }}
            >
              Confirmar elección
            </button>
          </Html>
        </group>
      </Bounds>

      {/* Modales con MP3 */}
      <Html center>
        <Modal
          open={showHelp}
          title="¿Cuál Power Skill te representa hoy?"
          onPrimary={() => setShowHelp(false)}
          type="info"
          primaryLabel="Comenzar"
        >
          <p>Elige la <b>Power Skill</b> con la que más te identificas. Luego pulsa <b>Confirmar elección</b>.</p>
          <AudioNarration src="/audio/28-reflection-help.mp3" when={showHelp} rate={1} volume={1} />
        </Modal>
      </Html>

      <Html center>
        <Modal
          open={showError}
          type="warning"
          title="Primero elige una Power Skill"
          onPrimary={() => setShowError(false)}
          primaryLabel="Elegir ahora"
        >
          <p>Debes seleccionar una opción antes de confirmar. Toca uno de los orbes.</p>
          <AudioNarration src="/audio/29-reflection-error.mp3" when={showError} rate={1} volume={1} />
        </Modal>
      </Html>

      <Html center>
        <Modal
          open={showWin}
          type="success"
          title="¡Gracias por elegir!"
          onPrimary={onWin}
          primaryLabel="Continuar"
        >
          <p>Excelente elección. Lleva esta Power Skill a tu práctica diaria. Pasemos a los créditos finales.</p>
          <AudioNarration src="/audio/30-reflection-success.mp3" when={showWin} rate={1} volume={1} />
        </Modal>
      </Html>

      {/* Narración dinámica de la skill seleccionada */}
      {selected && (
        <Html>
          <AudioNarration
            key={selected}                 // forza replay al cambiar de skill
            src={voiceBySkill[selected]}   // 31..35 según skill
            when={!!selected}
            rate={1}
            volume={1}
          />
        </Html>
      )}
    </group>
  );
}
