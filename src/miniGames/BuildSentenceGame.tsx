import { Html } from "@react-three/drei";
import { useState } from "react";
import Modal from "../components/Modal";
import Speech from "../components/Speech";
import { theme, vivid } from "../theme";
import { SIZES } from "../constants3d";

type Props = {
  onWin: () => void;
};

/**
 * Mini-juego: Construye la frase correcta
 * Haz clic en las palabras en el orden correcto para formar la oración.
 */
export default function BuildSentenceGame({ onWin }: Props) {
  const correctOrder = ["El", "liderazgo", "adaptativo", "inspira", "al", "equipo"];
  const [selected, setSelected] = useState<string[]>([]);
  const [showHelp, setShowHelp] = useState(true);
  const [showMessage, setShowMessage] = useState(false);
  const [message1, setMessage1] = useState<string | null>(null);
  const [message2, setMessage2] = useState<string | null>(null);

  const handleWordClick = (word: string) => {
    if (showHelp) return;
    if (selected.includes(word)) return;
    const newSelection = [...selected, word];
    setSelected(newSelection);

    if (newSelection.length === correctOrder.length) {
      if (JSON.stringify(newSelection) === JSON.stringify(correctOrder)) {
        setMessage1("Perfecto. Has construido la frase correctamente...");
        setMessage2("Haz conocido la importancia del Liderazgo Adaptativo");
        setShowMessage(true)
      } else {
        setMessage1("Casi... El orden no es correcto.");
        setMessage2("Intenta de nuevo.");
        setShowMessage(true)
        setTimeout(() => {
          setSelected([]);
          setMessage1(null);
          setMessage2(null);
          setShowMessage(false)
        }, 1500);
      }
    }
  };

  return (
    <group>
      {/* Modal de instrucciones del juego */}
      <Html center>
        <Modal
          open={showHelp}
          title="Juego: Liderazgo Adaptativo"
          onPrimary={() => setShowHelp(false)}
        >
          <p>
            Haz clic en las palabras en el orden correcto para formar la frase:
            <br />
            <i>"El liderazgo adaptativo inspira al equipo."</i>
          </p>
          <Speech
            text="Haz clic en las palabras en el orden correcto para formar la frase: 
            El liderazgo adaptativo inspira al equipo."
            when={showHelp}
            lang="es-ES"
          />
        </Modal>
      </Html>

      {/* Palabras 3D interactivas */}
      {correctOrder.map((word, i) => (
        <mesh
          key={word}
          position={[i * 1.4 - 3.5, SIZES.baseY, 0]}
          onClick={() => handleWordClick(word)}
        >
          <boxGeometry args={[SIZES.barW, SIZES.barH, SIZES.barD]} />
          <meshStandardMaterial
            color={selected.includes(word) ? vivid.green : theme.padBlue}
            emissive={selected.includes(word) ? vivid.greenGlow : theme.glowBlue}
            emissiveIntensity={selected.includes(word) ? 0.6 : 0.25}
            roughness={0.4}
          />
          <Html center>
            <span
              style={{
                color: theme.text,
                fontWeight: 600,
                fontSize: 16,
                background: "rgba(255,255,255,0.7)",
                borderRadius: 6,
                padding: "2px 8px",
              }}
            >
              {word}
            </span>
          </Html>
        </mesh>
      ))}

      {/* Mensaje de resultado */}
      
      <Html center>
        <Modal
          open={showMessage}
          title="Juego: Liderazgo Adaptativo"
          onPrimary={() => onWin()}
        >
          <p>
            {message1}
            <br />
            <i>{message2}</i>
          </p>
          <Speech
            text={(message1||'')+(message2||'')}
            when={showMessage}
            lang="es-ES"
          />
        </Modal>
      </Html>
      
    </group>
  );
}
