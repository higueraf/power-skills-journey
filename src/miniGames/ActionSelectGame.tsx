import { Html } from "@react-three/drei";
import { useState, useMemo } from "react";
import Modal from "../components/Modal";
import AudioNarration from "../components/AudioNarration";
import { theme, vivid } from "../theme";

/**
 * Juego tipo “elige las acciones correctas”.
 * - Muestra 4 botones (puedes cambiar cantidad/etiquetas).
 * - Si el usuario selecciona todas las correctas (y ninguna incorrecta), gana.
 * - Si se equivoca, muestra modal de error para reintentar.
 */
type Props = {
  onWin: () => void;
  // Opcional: pasar acciones personalizadas y su "correct" (multi-respuesta permitida)
  actions?: Array<{ id: string; label: string; correct: boolean; voiceSrc?: string }>;
  // Opcional: mínimo de acciones correctas que hay que elegir (si no se quiere “todas”)
  requiredCorrectCount?: number;
};

export default function ActionSelectGame({
  onWin,
  actions,
  requiredCorrectCount,
}: Props) {
  // Default de ejemplo (2 correctas)
  const items = useMemo(
    () =>
      actions ??
      [
        { id: "a", label: "Escuchar activamente al equipo", correct: true,  voiceSrc: "/audio/21-action-a.mp3" },
        { id: "b", label: "Imponer sin diálogo",          correct: false, voiceSrc: "/audio/22-action-b.mp3" },
        { id: "c", label: "Alinear objetivos y métricas",  correct: true,  voiceSrc: "/audio/23-action-c.mp3" },
        { id: "d", label: "Ignorar retroalimentación",     correct: false, voiceSrc: "/audio/24-action-d.mp3" },
      ],
    [actions]
  );

  const mustPick = requiredCorrectCount ?? items.filter(i => i.correct).length;

  const [showHelp, setShowHelp] = useState(true);
  const [picked, setPicked] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [lastTouchedVoice, setLastTouchedVoice] = useState<string | null>(null);

  const toggle = (id: string, voiceSrc?: string) => {
    if (showHelp || showSuccess) return;
    setPicked((prev) => {
      const has = prev.includes(id);
      const next = has ? prev.filter(x => x !== id) : [...prev, id];
      // feedback por acción (opcional)
      if (voiceSrc) {
        setLastTouchedVoice(null);
        setTimeout(() => setLastTouchedVoice(voiceSrc), 0);
      }
      return next;
    });
  };

  const validate = () => {
    const correctIds = items.filter(i => i.correct).map(i => i.id).sort();
    const pickedSorted = [...picked].sort();

    const allCorrectPicked = correctIds.every(id => pickedSorted.includes(id));
    const noneWrong = pickedSorted.every(id => correctIds.includes(id));
    const meetsMin = picked.filter(id => correctIds.includes(id)).length >= mustPick;

    if (allCorrectPicked && noneWrong && meetsMin) {
      setShowSuccess(true);
      setShowError(false);
    } else {
      setShowError(true);
      setShowSuccess(false);
    }
  };

  const retry = () => {
    setShowError(false);
    setPicked([]);
  };

  return (
    <group>
      {/* Modal de ayuda */}
      <Html center>
        <Modal
          open={showHelp}
          title="Juego: Selecciona las acciones correctas"
          onPrimary={() => setShowHelp(false)}
        >
          <p>
            Marca las <b>acciones que fortalecen</b> el liderazgo adaptativo y la
            colaboración. Luego pulsa <b>Validar</b>.
          </p>
          <AudioNarration src="/audio/18-action-help.mp3" when={showHelp} rate={1} volume={1} />
        </Modal>
      </Html>

      {/* Lista de acciones (UI simple con Html) */}
      <Html center>
        <div
          style={{
            marginTop: 24,
            background: "rgba(255,255,255,0.9)",
            border: `1px solid ${theme.border}`,
            borderRadius: 14,
            padding: 16,
            minWidth: 320,
            maxWidth: 520,
            boxShadow: "0 10px 30px rgba(0,0,0,.12)",
          }}
        >
          <h3 style={{ marginTop: 0, color: theme.text }}>Elige acciones</h3>
          <div style={{ display: "grid", gap: 10 }}>
            {items.map((it) => {
              const isOn = picked.includes(it.id);
              return (
                <button
                  key={it.id}
                  onClick={() => toggle(it.id, it.voiceSrc)}
                  style={{
                    textAlign: "left",
                    borderRadius: 10,
                    padding: "10px 12px",
                    border: `2px solid ${isOn ? vivid.green : theme.border}`,
                    background: isOn ? "rgba(35, 199, 192, .12)" : "#fff",
                    color: theme.text,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {isOn ? "✅ " : "□ "} {it.label}
                </button>
              );
            })}
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
            <button
              onClick={validate}
              style={{
                background: vivid.green,
                color: "#0d1117",
                border: "none",
                borderRadius: 10,
                padding: "10px 14px",
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              Validar
            </button>
            <button
              onClick={() => setPicked([])}
              style={{
                background: "#eaeef2",
                color: theme.text,
                border: "1px solid #c7cbd1",
                borderRadius: 10,
                padding: "10px 14px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Limpiar
            </button>
          </div>
        </div>
      </Html>

      {/* Feedback por acción tocada (opcional) */}
      {lastTouchedVoice && (
        <Html>
          <AudioNarration
            key={lastTouchedVoice}
            src={lastTouchedVoice}
            when={!!lastTouchedVoice}
            rate={1}
            volume={1}
          />
        </Html>
      )}

      {/* Éxito */}
      <Html center>
        <Modal
          open={showSuccess}
          title="¡Excelente elección!"
          onPrimary={onWin}
          type="success"
        >
          <p>Elegiste correctamente las acciones que fortalecen al equipo.</p>
          <AudioNarration src="/audio/19-action-success.mp3" when={showSuccess} rate={1} volume={1} />
        </Modal>
      </Html>

      {/* Error */}
      <Html center>
        <Modal
          open={showError}
          title="Revisa tus selecciones"
          onPrimary={retry}
          type="warning"
          primaryLabel="Intentar de nuevo"
        >
          <p>Algunas acciones no son las adecuadas o faltan por seleccionar.</p>
          <AudioNarration src="/audio/20-action-error.mp3" when={showError} rate={1} volume={1} />
        </Modal>
      </Html>
    </group>
  );
}
