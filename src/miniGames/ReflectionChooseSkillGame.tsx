import { Html } from "@react-three/drei";
import { useMemo, useState } from "react";
import Modal from "../components/Modal";
import Speech from "../components/Speech";
import { theme, vivid } from "../theme";

type Props = { onWin: () => void };

type Skill = {
  id: "comunicacion" | "critico" | "empatia" | "adaptativo" | "colaboracion";
  label: string;
  color: string;
  text: string; // speech al seleccionar
};

export default function ReflectionChooseSkillGame({ onWin }: Props) {
  const skills = useMemo<Skill[]>(
    () => [
      {
        id: "comunicacion",
        label: "💬 Comunicación efectiva",
        color: vivid.blue,
        text:
          "Comunicación efectiva: expresar con claridad y escuchar activamente para conectar equipos.",
      },
      {
        id: "critico",
        label: "🧠 Pensamiento crítico",
        color: vivid.green,
        text:
          "Pensamiento crítico: analizar, contrastar evidencia y decidir con criterio.",
      },
      {
        id: "empatia",
        label: "💗 Empatía",
        color: "#47E1BC",
        text:
          "Empatía: comprender al otro para construir confianza y bienestar colectivo.",
      },
      {
        id: "adaptativo",
        label: "💫 Liderazgo adaptativo",
        color: "#53B8FF",
        text:
          "Liderazgo adaptativo: guiar el cambio y responder con flexibilidad ante lo inesperado.",
      },
      {
        id: "colaboracion",
        label: "🤝 Colaboración",
        color: "#39D9A3",
        text:
          "Colaboración: sumar talentos diversos para alcanzar metas compartidas.",
      },
    ],
    []
  );

  const [selected, setSelected] = useState<Skill["id"] | null>(null);
  const [showHelp, setShowHelp] = useState(true);
  const [showError, setShowError] = useState(false);
  const [showWin, setShowWin] = useState(false);

  // Layout semicircular
  const radius = 3.2;
  const centerY = 0.8;

  function handleSelect(id: Skill["id"]) {
    if (showHelp || showError || showWin) return;
    setSelected(id);
  }

  function handleConfirm() {
    if (!selected) {
      setShowError(true);
      return;
    }
    setShowWin(true);
  }

  const selectedText =
    selected ? skills.find((s) => s.id === selected)?.text || "" : "";

  return (
    <group>
      {/* Orbes 3D con etiquetas */}
      {skills.map((s, i) => {
        const angle = (-Math.PI / 2) + (i * (Math.PI / (skills.length - 1))); // semicirculo
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius * 0.55;
        const active = selected === s.id;

        return (
          <group key={s.id} position={[x, centerY, z]}>
            <mesh onClick={() => handleSelect(s.id)} castShadow>
              <sphereGeometry args={[0.55, 32, 32]} />
              <meshStandardMaterial
                color={active ? s.color : theme.padBlue}
                emissive={active ? vivid.greenGlow : theme.glowBlue}
                emissiveIntensity={active ? 0.6 : 0.25}
                metalness={0.08}
                roughness={0.35}
              />
            </mesh>
            <Html center position={[0, 1.05, 0]}>
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
                {s.label}
              </div>
            </Html>
          </group>
        );
      })}

      {/* Botón Confirmar (solo UI DOM) */}
      <Html center position={[0, 0.2, 0]}>
        <button
          onClick={handleConfirm}
          style={{
            background: theme.primary,
            color: theme.text,
            border: "none",
            padding: "10px 18px",
            borderRadius: 12,
            fontWeight: 800,
            cursor: "pointer",
            boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
          }}
        >
          Confirmar elección
        </button>
      </Html>

      {/* Instrucciones */}
      <Html center>
        <Modal
          open={showHelp}
          title="Reflexión final: ¿Cuál te representa hoy?"
          onPrimary={() => setShowHelp(false)}
          type="info"
          primaryLabel="Comenzar"
        >
          <p>
            Elige la <b>Power Skill</b> con la que más te identificas en este momento.
            Después pulsa <b>Confirmar elección</b>. Escucharás una breve descripción al seleccionar.
          </p>
          <Speech
            text="Elige la Power Skill con la que más te identificas en este momento. Después pulsa Confirmar elección. Escucharás una breve descripción al seleccionar."
            when={showHelp}
            lang="es-ES"
          />
        </Modal>
      </Html>

      {/* Error: no seleccionó */}
      <Html center>
        <Modal
          open={showError}
          type="warning"
          title="Primero elige una Power Skill"
          onPrimary={() => setShowError(false)}
          primaryLabel="Elegir ahora"
        >
          <p>
            Debes seleccionar una opción antes de confirmar. Haz clic en uno de los orbes.
          </p>
          <Speech
            text="Debes seleccionar una opción antes de confirmar. Haz clic en uno de los orbes."
            when={showError}
            lang="es-ES"
          />
        </Modal>
      </Html>

      {/* Éxito: continuar a Créditos */}
      <Html center>
        <Modal
          open={showWin}
          type="success"
          title="¡Gracias por elegir!"
          onPrimary={onWin}
          primaryLabel="Continuar"
        >
          <p>
            Excelente elección. Lleva esta Power Skill a tu práctica diaria.
            Pasemos a los créditos finales.
          </p>
          <Speech
            text="Excelente elección. Lleva esta Power Skill a tu práctica diaria. Pasemos a los créditos finales."
            when={showWin}
            lang="es-ES"
          />
        </Modal>
      </Html>

      {/* Speech dinámico al seleccionar */}
      {selectedText && <Speech text={selectedText} when={true} lang="es-ES" />}
    </group>
  );
}
