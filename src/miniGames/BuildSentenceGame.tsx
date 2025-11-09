import { Html } from "@react-three/drei";
import { useMemo, useState, useEffect } from "react";
import { useThree } from "@react-three/fiber";
import Modal from "../components/Modal";
import AudioNarration from "../components/AudioNarration";
import { theme, vivid } from "../theme";

type Props = { onWin: () => void };

export default function BuildSentenceGame({ onWin }: Props) {
  const correctOrder = useMemo(
    () => ["El", "liderazgo", "adaptativo", "inspira", "al", "equipo"],
    []
  );

  // --- barajar (Fisher–Yates) ---
  const shuffle = <T,>(arr: T[]) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  // palabras a mostrar (desordenadas)
  const [words, setWords] = useState<string[]>([]);

  // baraja al montar
  useEffect(() => {
    setWords(shuffle(correctOrder));
  }, [correctOrder]);

  const { viewport, size } = useThree();
  const vw = viewport.width;
  const vh = viewport.height;

  const isMobile = size.width < 640;
  const isTablet = size.width >= 640 && size.width < 1024;

  // ---- Tamaños base ----
  const baseScale = isMobile ? 0.9 : 1.0;
  const barW = 0.95 * baseScale;
  const barH = 0.34 * baseScale;
  const barD = 0.55 * baseScale;

  // 👉 Altura "real" de una celda (cubo + label)
  const labelH = (isMobile ? 0.55 : 0.5) * baseScale; // alto estimado del chip Html
  const cellH = barH + labelH;

  // gaps
  const gapX = (isMobile ? 1.05 : 1.35) * baseScale;
  const gapY = (isMobile ? 0.60 : 0.75) * baseScale;

  // márgenes seguros
  const marginX = 0.45;
  const marginY = isMobile ? 1.20 : 0.60;

  // ---- Grid: móvil fijo 3×2; resto trata de encajar ----
  type Grid = { rows: number; cols: number };
  const pickGrid = (): Grid => {
    if (isMobile) return { rows: 3, cols: 2 };
    const candidates: Grid[] = [{ rows: 1, cols: 6 }, { rows: 2, cols: 3 }, { rows: 3, cols: 2 }];
    for (const g of candidates) {
      const gridW = (Math.min(g.cols, 6) - 1) * gapX + barW;
      const gridH = g.rows * cellH + (g.rows - 1) * gapY;
      const fitsW = gridW <= (vw - 2 * marginX);
      const fitsH = gridH <= (vh - 2 * marginY);
      if (fitsW && fitsH) return g;
    }
    return { rows: 3, cols: 2 };
  };
  const grid = pickGrid();

  // Tamaño del grid SIN escalar
  const rawGridW = (Math.min(grid.cols, 6) - 1) * gapX + barW;
  const rawGridH = grid.rows * cellH + (grid.rows - 1) * gapY;

  // Auto-fit
  const maxW = Math.max(0.0001, vw - 2 * marginX);
  const maxH = Math.max(0.0001, vh - 2 * marginY);
  const scaleToFit = Math.min(maxW / rawGridW, maxH / rawGridH, 1.0);

  // Posiciones centradas (usando cellH), basadas en cantidad de palabras
  const positions = useMemo<[number, number, number][]>(() => {
    const cols = grid.cols;
    const rows = grid.rows;

    const totalW = (Math.min(cols, 6) - 1) * gapX;
    const totalH = (rows - 1) * (cellH + gapY);

    const left = -totalW / 2;
    const top = totalH / 2;

    return (words.length ? words : correctOrder).map((_, idx) => {
      const r = Math.floor(idx / cols);
      const c = idx % cols;
      const x = left + c * gapX;
      const y = top - r * (cellH + gapY);
      return [x, y, 0];
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grid.rows, grid.cols, gapX, gapY, cellH, words.length]);

  // Estado
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
    // re-barajar al reintentar
    setWords(shuffle(correctOrder));
  };

  return (
    <group scale={scaleToFit} position={[0, 0, 0]}>
      {/* Modal ayuda */}
      <Html center>
        <Modal
          open={showHelp}
          title="Juego: Liderazgo Adaptativo"
          onPrimary={() => {
            setShowHelp(false);
            // opcional: barajar al cerrar ayuda
            setWords(shuffle(correctOrder));
          }}
          type="info"
        >
          <p>
            Toca las palabras en el <b>orden correcto</b> para formar la frase:
            <br />
            <i>“El liderazgo adaptativo inspira al equipo”.</i>
          </p>
          <AudioNarration src="/audio/05-build-help.mp3" when={showHelp} rate={1} volume={1} />
        </Modal>
      </Html>

      {/* Celdas (renderiza palabras barajadas) */}
      {(words.length ? words : correctOrder).map((word, i) => {
        const pos = positions[i] || [0, 0, 0];
        const isPicked = selected.includes(word);
        const labelOffsetY = barH * 1.15;

        return (
          <group key={`${word}-${i}`} position={pos} scale={isMobile ? 1.03 : 1}>
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
              position={[0, labelOffsetY, 0]}
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
                  color: isPicked ? "#fff" : theme.text,
                  fontWeight: 700,
                  fontSize: isMobile ? 5.2 : grid.rows >= 3 ? 6 : 5,
                  background: isPicked
                    ? "linear-gradient(135deg, #2ea043, #58a6ff)" // 💡 fondo activo con degradado
                    : "rgba(255,255,255,0.92)",
                  borderRadius: 10,
                  padding: isMobile ? "3px 6px" : grid.rows >= 3 ? "3px 5px" : "4px 6px",
                  border: `1px solid ${theme.border}`,
                  cursor: "pointer",
                  userSelect: "none",
                  touchAction: "manipulation",
                  boxShadow: isPicked
                    ? "0 0 15px rgba(88,166,255,0.5)"
                    : "0 0 5px rgba(0,0,0,.1)",
                  transition: "all 0.25s ease",
                  transform: isPicked ? "scale(1.05)" : "scale(1)",
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

      {/* Éxito */}
      <Html center>
        <Modal open={showMessage} title="Juego: Liderazgo Adaptativo" onPrimary={() => onWin()} type="success">
          <p>
            {message1}
            <br />
            <i>{message2}</i>
          </p>
          <AudioNarration src="/audio/06-build-success.mp3" when={showMessage} rate={1} volume={1} />
        </Modal>
      </Html>

      {/* Error */}
      <Html center>
        <Modal open={showMessageError} title="Juego: Liderazgo Adaptativo" onPrimary={continueClick} type="warning">
          <p>
            {message1}
            <br />
            <i>{message2}</i>
          </p>
          <AudioNarration src="/audio/07-build-error.mp3" when={showMessageError} rate={1} volume={1} />
        </Modal>
      </Html>
    </group>
  );
}
