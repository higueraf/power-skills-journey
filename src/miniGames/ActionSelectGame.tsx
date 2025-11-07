import { Html } from "@react-three/drei";
import { useMemo, useState } from "react";
import Modal from "../components/Modal";
import Speech from "../components/Speech";
import { theme, vivid } from "../theme";

type Props = { onWin: () => void };

type Item = {
  id: string;
  label: string;
  correct: boolean;
  color: string;
  text: string; // speech breve al seleccionar correcto
};

export default function ActionSelectGame({ onWin }: Props) {
  // 3 correctos y 2 distractores
  const items: Item[] = useMemo(
    () => [
      {
        id: "comunicacion",
        label: "Comunicación efectiva",
        correct: true,
        color: vivid.blue,
        text:
          "Comunicación efectiva: mensajes claros y bidireccionales que mejoran el flujo de información.",
      },
      {
        id: "critico",
        label: "Pensamiento crítico",
        correct: true,
        color: vivid.green,
        text:
          "Pensamiento crítico: decisiones basadas en datos, análisis y reflexión constante.",
      },
      {
        id: "colaboracion",
        label: "Colaboración",
        correct: true,
        color: "#39D9A3",
        text:
          "Colaboración: trabajo en red entre docentes, estudiantes y entorno para multiplicar el impacto.",
      },
      // Distractores
      {
        id: "ruido",
        label: "Ego Superinflado",
        correct: false,
        color: "#9AA7B2",
        text: "",
      },
      {
        id: "aislamiento",
        label: "Aislamiento",
        correct: false,
        color: "#9AA7B2",
        text: "",
      },
    ],
    []
  );

  // Estado
  const [selected, setSelected] = useState<string[]>([]);
  const [showHelp, setShowHelp] = useState(true);
  const [showError, setShowError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showWin, setShowWin] = useState(false);
  const [speakText, setSpeakText] = useState("");

  // Layout en fila
  const baseX = -3.2;
  const gap = 1.6;

  const correctCount = items.filter((i) => i.correct).length;
  

  function toggle(id: string) {
    if (showHelp || showError || showWin) return;

    const it = items.find((i) => i.id === id);
    if (!it) return;

    // Si es distractor: error
    if (!it.correct) {
      setErrorMsg(
        `“${it.label}” no corresponde a una Power Skill en acción. Intenta con comportamientos que impulsen la comunicación, el análisis y la colaboración.`
      );
      setShowError(true);
      return;
    }

    // Correcto → activar
    const already = selected.includes(id);
    const next = already ? selected.filter((v) => v !== id) : [...selected, id];
    setSelected(next);

    // Speech breve al acertar
    if (!already && it.text) {
      setSpeakText(it.text);
    } else {
      setSpeakText("");
    }

    // Ganar cuando estén todos los correctos activos
    if (!already) {
      const nextCorrect = next.filter((v) => items.find((i) => i.id === v)?.correct).length;
      if (nextCorrect === correctCount) {
        setTimeout(() => setShowWin(true), 350);
      }
    }
  }

  return (
    <group position={[0, 0.8, 0]}>
      {/* Modal inicial (instrucciones) */}
      <Html center>
        <Modal
          open={showHelp}
          title="Juego: Power Skills en acción"
          onPrimary={() => setShowHelp(false)}
          type="info"
          primaryLabel="Comenzar"
        >
          <p>
            Activa las <b>3 conductas correctas</b> que demuestran Power Skills
            en acción: <i>Comunicación efectiva, Pensamiento crítico y Colaboración</i>.
            Evita los distractores.
          </p>
          <Speech
            text="Activa las tres conductas correctas que demuestran Power Skills en acción: Comunicación efectiva, Pensamiento crítico y Colaboración. Evita los distractores."
            when={showHelp}
            lang="es-ES"
          />
        </Modal>
      </Html>

      {/* Modal de error */}
      <Html center>
        <Modal
          open={showError}
          type="warning"
          title="Ups… conducta distractora"
          onPrimary={() => setShowError(false)}
          primaryLabel="Intentar de nuevo"
        >
          <p>{errorMsg || "Esa opción no impulsa las Power Skills en acción."}</p>
          <Speech
            text={errorMsg || "Esa opción no impulsa las Power Skills en acción. Inténtalo de nuevo."}
            when={showError}
            lang="es-ES"
          />
        </Modal>
      </Html>

      {/* Modal de éxito */}
      <Html center>
        <Modal
          open={showWin}
          type="success"
          title="¡Excelente! Power Skills en marcha"
          onPrimary={onWin}
          primaryLabel="Continuar"
        >
          <p>
            Has activado las conductas clave para poner en acción las Power Skills.
            ¡Sigamos!
          </p>
          <Speech
            text="Excelente. Has activado las conductas clave para poner en acción las Power Skills. Sigamos."
            when={showWin}
            lang="es-ES"
          />
        </Modal>
      </Html>

      {/* Speech corto al seleccionar un correcto */}
      {speakText && (
        <Speech text={speakText} when={true} lang="es-ES" />
      )}

      {/* Pads/esferas 3D con etiquetas */}
      {items.map((it, i) => {
        const active = selected.includes(it.id);
        return (
          <group key={it.id} position={[baseX + i * gap, 0, 0]}>
            <mesh onClick={() => toggle(it.id)} castShadow>
              <sphereGeometry args={[0.5, 32, 32]} />
              <meshStandardMaterial
                color={active ? it.color : theme.padBlue}
                emissive={active ? (it.correct ? vivid.greenGlow : theme.glowBlue) : theme.glowBlue}
                emissiveIntensity={active ? 0.5 : 0.25}
                metalness={0.08}
                roughness={0.35}
              />
            </mesh>

            <Html center position={[0, 1.0, 0]}>
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
                  width: 180,
                }}
              >
                {it.label}
              </div>
            </Html>
          </group>
        );
      })}

      {/* Hint siempre visible */}
      <Html center position={[0, 1.8, 0]}>
        <div
          style={{
            background: "rgba(255,255,255,0.9)",
            border: `1px solid ${theme.border}`,
            borderRadius: 12,
            padding: "6px 12px",
            color: theme.text,
            fontWeight: 700,
          }}
        >
          Activa 3 conductas correctas
        </div>
      </Html>
    </group>
  );
}
