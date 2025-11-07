
import { Html } from "@react-three/drei";
import { useMemo, useState } from "react";
import { useThree } from "@react-three/fiber";
import Modal from "../components/Modal";
import Speech from "../components/Speech";
import { theme, vivid } from "../theme";

type Props = {
  onWin: () => void;
};

/**
 * Mini-juego: Construye la frase correcta (responsive)
 * - En pantallas anchas, 1 fila con 6 palabras.
 * - En móviles, 2 filas x 3 columnas.
 * - Tamaños y espaciados se adaptan al viewport 3D.
 */
export default function BuildSentenceGame({ onWin }: Props) {
  const correctOrder = useMemo(
    () => ["El", "liderazgo", "adaptativo", "inspira", "al", "equipo"],
    []
  );

  const { viewport } = useThree(); // ancho/alto en unidades 3D a z=0
  const vw = viewport.width;

  // Heurística simple de responsive (ajústala a tu gusto)
  const isNarrow = vw < 6.2; // ~móvil vertical
  const scale = isNarrow ? 0.85 : 1.0;

  // Dimensiones de cada bloque/knob 3D
  const barW = 0.95 * scale;
  const barH = 0.34 * scale;
  const barD = 0.55 * scale;

  // Espaciados
  const gapX = isNarrow ? 1.25 * scale : 1.4 * scale;
  const gapY = 0.9 * scale;

  // Layout positions:
  // - Narrow: 2 filas x 3 columnas
  // - Wide: 1 fila, centrado
  const positions = useMemo<[number, number, number][]>(() => {
    if (isNarrow) {
      // 2 filas x 3 columnas
      // indices: 0..5
      // fila 0: 0,1,2 ; fila 1: 3,4,5
      const cols = 3;
      const rows = 2;
      const totalW = (cols - 1) * gapX;
      const left = -totalW / 2;
      const topY = 1.1; // altura de la fila superior
      const rowY = [topY, topY - gapY];

      return correctOrder.map((_, idx) => {
        const r = Math.floor(idx / cols);
        const c = idx % cols;
        const x = left + c * gapX;
        const y = rowY[r];
        return [x, y, 0];
      });
    } else {
      // 1 fila con 6 elementos centrados
      const n = correctOrder.length;
      const totalW = (n - 1) * gapX;
      const left = -totalW / 2;
      const y = 0.9; // altura base
      return correctOrder.map((_, i) => [left + i * gapX, y, 0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNarrow, gapX, gapY, correctOrder]);

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
      const ok =
        JSON.stringify(newSelection) === JSON.stringify(correctOrder);
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
    <group>
      {/* Modal de instrucciones del juego */}
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
          <Speech
            text="Toca las palabras en el orden correcto para formar la frase: El liderazgo adaptativo inspira al equipo."
            when={showHelp}
            lang="es-ES"
          />
        </Modal>
      </Html>

      {/* Palabras 3D interactivas (responsive) */}
      // ...importaciones y resto del componente iguales...

{correctOrder.map((word, i) => {
  const pos = positions[i] || [i * 1.4 - 3.5, 0.9, 0];
  const isPicked = selected.includes(word);

  return (
    <group key={word} position={pos}>
      {/* Cubo 3D clicable */}
      <mesh onClick={() => handleWordClick(word)} castShadow>
        <boxGeometry args={[barW, barH, barD]} />
        <meshStandardMaterial
          color={isPicked ? vivid.green : theme.padBlue}
          emissive={isPicked ? vivid.greenGlow : theme.glowBlue}
          emissiveIntensity={isPicked ? 0.6 : 0.25}
          roughness={0.4}
          metalness={0.08}
        />
      </mesh>

      {/* Label Html también clicable */}
      <Html
        center
        position={[0, barH * 0.9, 0]}
        transform
        // asegura que el DOM reciba el click y no “pase” al mesh
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
            fontSize: isNarrow ? 6 : 5,
            background: "rgba(255,255,255,0.85)",
            borderRadius: 8,
            padding: isNarrow ? "3px 5px" : "4px 6px",
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


      {/* Modal de resultado */}
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
          <Speech
            text={`${message1 ?? ""} ${message2 ?? ""}`}
            when={showMessage}
            lang="es-ES"
          />
        </Modal>
      </Html>
      <Html center>
        <Modal
          open={showMessageError}
          title="Juego: Liderazgo Adaptativo"
          onPrimary={() => continueClick()}
          type="warning"
        >
          <p>
            {message1}
            <br />
            <i>{message2}</i>
          </p>
          <Speech
            text={`${message1 ?? ""} ${message2 ?? ""}`}
            when={showMessageError}
            lang="es-ES"
          />
        </Modal>
      </Html>
    </group>
  );
}
