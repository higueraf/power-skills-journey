import { Html } from "@react-three/drei";
import { useMemo, useState } from "react";
import { useThree } from "@react-three/fiber";
import Modal from "../components/Modal";
import AudioNarration from "../components/AudioNarration"; // ⬅️ MP3
import { theme, vivid } from "../theme";

type Props = { onWin: () => void };

export default function BuildSentenceGame({ onWin }: Props) {
  const correctOrder = useMemo(
    () => ["El", "liderazgo", "adaptativo", "inspira", "al", "equipo"],
    []
  );

  const { viewport } = useThree();
  const vw = viewport.width;
  const vh = viewport.height;

  // ---- Parámetros base (en unidades 3D) ----
  const baseScale = 1.0;
  const barW = 0.95 * baseScale;
  const barH = 0.34 * baseScale;
  const barD = 0.55 * baseScale;

  const gapX = 1.35 * baseScale;
  const gapY = 0.85 * baseScale;

  const marginX = 0.45;
  const marginY = 0.45;

  // ---- ¿Cabe 1x6 a lo ancho? ----
  const needW_1x6 = (6 - 1) * gapX + barW;
  const fitsOneRow = needW_1x6 <= (vw - 2 * marginX);

  type Grid = { rows: number; cols: number };
  const candidates: Grid[] = fitsOneRow
    ? [{ rows: 1, cols: 6 }, { rows: 2, cols: 3 }, { rows: 3, cols: 2 }]
    : [{ rows: 2, cols: 3 }, { rows: 3, cols: 2 }, { rows: 1, cols: 6 }];

  const pickGrid = (): Grid => {
    for (const g of candidates) {
      const gridW = (Math.min(g.cols, 6) - 1) * gapX + barW;
      const gridH = g.rows * barH + (g.rows - 1) * gapY;
      const fitsW = gridW <= (vw - 2 * marginX);
      const fitsH = gridH <= (vh - 2 * marginY);
      if (fitsW && fitsH) return g;
    }
    return { rows: 3, cols: 2 };
  };

  const grid = pickGrid();

  const rawGridW = (Math.min(grid.cols, 6) - 1) * gapX + barW;
  const rawGridH = grid.rows * barH + (grid.rows - 1) * gapY;

  const maxW = Math.max(0.0001, vw - 2 * marginX);
  const maxH = Math.max(0.0001, vh - 2 * marginY);
  const scaleToFit = Math.min(maxW / rawGridW, maxH / rawGridH, 1.0);

  const positions = useMemo<[number, number, number][]>(() => {
    const cols = grid.cols;
    const rows = grid.rows;
    const totalW = (Math.min(cols, 6) - 1) * gapX;
    const totalH = (rows - 1) * gapY;
    const left = -totalW / 2;
    const top = totalH / 2;

    return correctOrder.map((_, idx) => {
      const r = Math.floor(idx / cols);
      const c = idx % cols;
      const x = left + c * gapX;
      const y = top - r * gapY;
      return [x, y, 0];
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grid.rows, grid.cols, gapX, gapY, correctOrder.length]);

  // ---- Estado de juego ----
  const [selected, setSelected] = useState<string[]>([]);
  const [showHelp, setShowHelp] = useState(true);
  const [showMessage, setShowMessage] = useState(false);
  const [showMessageError, setShowMessageError] = useState(false);
  const [message1, setMessage1] = useState<string | null>(null);
  const [message2, setMessage2] = useState<string | null>(null);

  const handleWordClick = (word: string) => {
    if (showHelp) return;
    if (selected.includes(word)) return;

    const newSelection = [...selected, word];
    setSelected(newSelection);

    if (newSelection.length === correctOrder.length) {
      const ok = JSON.stringify(newSelection) === JSON.stringify(correctOrder);
      if (ok) {
        setMessage1("Perfecto. Has construido la frase correctamente…");
        setMessage2("Has reconocido la importancia del Liderazgo Adaptativo.");
        setShowMessage(true);
      } else {
        setMessage1("El orden no es correcto.");
        setMessage2("Intenta de nuevo.");
        setShowMessageError(true);
      }
    }
  };

  const continueClick = () => {
    setShowMessageError(false);
    setSelected([]);
    setMessage1(null);
    setMessage2(null);
  };

  return (
    <group scale={scaleToFit}>
      {/* Modal de instrucciones (con MP3) */}
      <Html center>
        <Modal
          open={showHelp}
          title="Juego: Liderazgo Adaptativo"
          onPrimary={() => setShowHelp(false)}
          type="info"
        >
          <p>
            Toca las palabras en el <b>orden correcto</b> para formar la frase:
            <br />
            <i>“El liderazgo adaptativo inspira al equipo”.</i>
          </p>

          {/* 🔊 Narración MP3 mientras está el modal abierto */}
          <AudioNarration
            src="/audio/05-build-help.mp3"
            when={showHelp}
            rate={1}
            volume={1}
          />
        </Modal>
      </Html>

      {/* Palabras 3D interactivas */}
      {correctOrder.map((word, i) => {
        const pos = positions[i] || [0, 0, 0];
        const isPicked = selected.includes(word);
        return (
          <group key={word} position={pos}>
            <mesh onClick={() => handleWordClick(word)} castShadow frustumCulled={false}>
              <boxGeometry args={[barW, barH, barD]} />
              <meshStandardMaterial
                color={isPicked ? vivid.green : theme.padBlue}
                emissive={isPicked ? vivid.greenGlow : theme.glowBlue}
                emissiveIntensity={isPicked ? 0.6 : 0.25}
                roughness={0.4}
                metalness={0.08}
              />
            </mesh>

            <Html
              center
              position={[0, barH * 0.9, 0]}
              transform
              onPointerDown={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => handleWordClick(word)}
                onPointerDown={(e) => e.stopPropagation()}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleWordClick(word);
                  }
                }}
                style={{
                  color: theme.text,
                  fontWeight: 700,
                  fontSize: grid.rows >= 3 ? 6 : 5,
                  background: "rgba(255,255,255,0.85)",
                  borderRadius: 8,
                  padding: grid.rows >= 3 ? "3px 5px" : "4px 6px",
                  border: `1px solid ${theme.border}`,
                  cursor: "pointer",
                  userSelect: "none",
                  touchAction: "manipulation",
                  boxShadow: isPicked ? "0 0 10px rgba(0,0,0,.12)" : "none",
                }}
                aria-pressed={isPicked}
                role="button"
                tabIndex={0}
              >
                {word}
              </button>
            </Html>
          </group>
        );
      })}

      {/* Modal éxito */}
      <Html center>
        <Modal
          open={showMessage}
          title="Juego: Liderazgo Adaptativo"
          onPrimary={() => onWin()}
          type="success"
        >
          <p>
            {message1}
            <br />
            <i>{message2}</i>
          </p>

          {/* 🔊 MP3 éxito */}
          <AudioNarration
            src="/audio/06-build-success.mp3"
            when={showMessage}
            rate={1}
            volume={1}
          />
        </Modal>
      </Html>

      {/* Modal error */}
      <Html center>
        <Modal
          open={showMessageError}
          title="Juego: Liderazgo Adaptativo"
          onPrimary={continueClick}
          type="warning"
        >
          <p>
            {message1}
            <br />
            <i>{message2}</i>
          </p>

          {/* 🔊 MP3 error */}
          <AudioNarration
            src="/audio/07-build-error.mp3"
            when={showMessageError}
            rate={1}
            volume={1}
          />
        </Modal>
      </Html>
    </group>
  );
}
