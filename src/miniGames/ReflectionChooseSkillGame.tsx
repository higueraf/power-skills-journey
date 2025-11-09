import { Html, Bounds } from "@react-three/drei";
import { useMemo, useState } from "react";
import { useThree } from "@react-three/fiber";
import Modal from "../components/Modal";
import Speech from "../components/Speech";
import { theme, vivid } from "../theme";

type Props = { onWin: () => void };

type SkillId = "comunicacion" | "critico" | "empatia" | "adaptativo" | "colaboracion";
type Skill = {
  id: SkillId;
  label: string;
  color: string;
  text: string;
};

export default function ReflectionChooseSkillGame({ onWin }: Props) {
  const { size, viewport } = useThree();
  const isMobile = size.width < 640;
  const isTablet = size.width >= 640 && size.width < 1024;

  const skills = useMemo<Skill[]>(
    () => [
      {
        id: "comunicacion",
        label: "💬 Comunicación efectiva",
        color: vivid.blue,
        text: "Comunicación efectiva: expresar con claridad y escuchar activamente para conectar equipos.",
      },
      {
        id: "critico",
        label: "🧠 Pensamiento crítico",
        color: vivid.green,
        text: "Pensamiento crítico: analizar, contrastar evidencia y decidir con criterio.",
      },
      {
        id: "empatia",
        label: "💗 Empatía",
        color: "#47E1BC",
        text: "Empatía: comprender al otro para construir confianza y bienestar colectivo.",
      },
      {
        id: "adaptativo",
        label: "💫 Liderazgo adaptativo",
        color: "#53B8FF",
        text: "Liderazgo adaptativo: guiar el cambio y responder con flexibilidad ante lo inesperado.",
      },
      {
        id: "colaboracion",
        label: "🤝 Colaboración",
        color: "#39D9A3",
        text: "Colaboración: sumar talentos diversos para alcanzar metas compartidas.",
      },
    ],
    []
  );

  const [selected, setSelected] = useState<SkillId | null>(null);
  const [showHelp, setShowHelp] = useState(true);
  const [showError, setShowError] = useState(false);
  const [showWin, setShowWin] = useState(false);

  /** ---------- Tamaños responsivos ---------- */
  const sphereR = isMobile ? 0.48 : isTablet ? 0.48 : 0.56;
  const labelFontPx = isMobile ? 12 : 14;
  const labelWidth = isMobile ? 150 : 200;
  const labelYOffset = sphereR * 1.15;

  /** ---------- Desplazamientos globales ---------- */
  const planeY = isMobile
    ? -viewport.height * 5.8   // 🔽 más abajo en pantallas pequeñas
    : -viewport.height * 1.3;  // valor original para desktop/tablet

  const groupShiftY = isMobile
    ? viewport.height * 0.50   // 🔼 sube ligeramente el grupo
    : viewport.height * 0.12;


  /** ---------- Helpers de espaciado ---------- */
  const xSpacing = (cols: number) =>
    Math.min(
      sphereR * 4.4,
      Math.max(sphereR * 2.6, viewport.width / (cols + (isMobile ? 0.8 : 0.4)))
    );
  const rowGap = sphereR * (isMobile ? 3.1 : 3.4);

  /** ---------- Posiciones ---------- */
  const posById = useMemo<Record<SkillId, [number, number, number]>>(() => {
    if (!isMobile) {
      // GRID 3-2
      const colWTop = xSpacing(3);
      const colWBot = xSpacing(2);
      const yTop = 1.4;
      const yBot = yTop - rowGap;

      const topXs = [-colWTop, 0, colWTop];
      const botXs = [-colWBot * 0.6, colWBot * 0.6];

      return {
        comunicacion: [topXs[0], yTop, 0],
        critico: [topXs[1], yTop, 0],
        empatia: [topXs[2], yTop, 0],
        adaptativo: [botXs[0], yBot, 0],
        colaboracion: [botXs[1], yBot, 0],
      };
    }

    // GRID 2-1-2 (mobile)
    const colW = xSpacing(2);
    const yRow1 = 1.4;
    const yRow2 = yRow1 - rowGap;
    const yRow3 = yRow1 - 2 * rowGap;

    return {
      comunicacion: [-colW, yRow1, 0],
      critico: [colW, yRow1, 0],
      empatia: [0, yRow2, 0],
      adaptativo: [-colW, yRow3, 0],
      colaboracion: [colW, yRow3, 0],
    };
  }, [isMobile, viewport.width, sphereR]);

  const handleSelect = (id: SkillId) => {
    if (showHelp || showError || showWin) return;
    setSelected(id);
  };

  const handleConfirm = () => {
    if (!selected) {
      setShowError(true);
      return;
    }
    setShowWin(true);
  };

  const selectedText = selected ? skills.find((s) => s.id === selected)?.text || "" : "";

  return (
    <group>
      {/* Piso */}
      <mesh position={[0, planeY, 0]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={-10}>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color={theme.ground} transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* 👇 Encierra todo en Bounds para autoencuadre */}
      <Bounds fit clip observe margin={isMobile ? 1.35 : 1.1}>
        <group position={[0, groupShiftY, 0]}>
          {/* Esferas y etiquetas */}
          {skills.map((s) => {
            const [x, y, z] = posById[s.id];
            const active = selected === s.id;

            return (
              <group key={s.id} position={[x, y, z]}>
                {/* Esfera 3D clickeable */}
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

                {/* Etiqueta HTML también clickeable */}
                <Html center position={[0, labelYOffset, 0]}>
                  <div
                    onClick={() => handleSelect(s.id)} // 🔹 también selecciona
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
                      pointerEvents: "auto", // 🔹 activa el click del DOM
                      cursor: "pointer",     // 🔹 cursor de mano
                      userSelect: "none",    // 🔹 evita selección de texto
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

      {/* Modales */}
      <Html center>
        <Modal
          open={showHelp}
          title="Reflexión final: ¿Cuál te representa hoy?"
          onPrimary={() => setShowHelp(false)}
          type="info"
          primaryLabel="Comenzar"
        >
          <p>
            Elige la <b>Power Skill</b> con la que más te identificas. Luego pulsa{" "}
            <b>Confirmar elección</b>.
          </p>
          <Speech
            text="Elige la Power Skill con la que más te identificas. Luego pulsa Confirmar elección."
            when={showHelp}
            lang="es-ES"
          />
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
          <Speech
            text="Debes seleccionar una opción antes de confirmar. Toca uno de los orbes."
            when={showError}
            lang="es-ES"
          />
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
          <p>
            Excelente elección. Lleva esta Power Skill a tu práctica diaria. Pasemos a los créditos
            finales.
          </p>
          <Speech
            text="Excelente elección. Lleva esta Power Skill a tu práctica diaria. Pasemos a los créditos finales."
            when={showWin}
            lang="es-ES"
          />
        </Modal>
      </Html>

      {/* Narración dinámica */}
      {selectedText && <Speech text={selectedText} when={true} lang="es-ES" />}
    </group>
  );
}
