import { Html } from "@react-three/drei";
import { useState } from "react";
import Modal from "../components/Modal";
import Speech from "../components/Speech";
import { theme, vivid } from "../theme";

type Props = { onWin: () => void };

export default function TeamExploreGame({ onWin }: Props) {
  const [visited, setVisited] = useState<string[]>([]);
  const [activeSkill, setActiveSkill] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(true);
  const [showWin, setShowWin] = useState(false); // ✅ nuevo modal de éxito

  const skills = [
    { id: "empatia", name: "Dra. Empatía", color: vivid.green, text: "Liderar con empatía es entender antes de decidir. Escuchar y motivar impulsa el bienestar del equipo." },
    { id: "adaptabilidad", name: "Ing. Adaptabilidad", color: vivid.blue, text: "En un entorno cambiante, cada desafío se convierte en una oportunidad para innovar." },
    { id: "colaboracion", name: "Lic. Colaboración", color: "#39D9A3", text: "Fomentar alianzas entre docentes, estudiantes y empresas multiplica la productividad." },
    { id: "estrategia", name: "Prof. Estrategia", color: "#4BA9E3", text: "Analizar, evaluar y cuestionar con propósito fortalece la calidad académica." },
    { id: "innovacion", name: "Mtra. Innovación", color: "#23C7C0", text: "Transformar ideas en mensajes claros inspira a toda la organización." },
  ];

  const handleClick = (id: string) => {
    if (showHelp || showWin) return;
    if (!visited.includes(id)) {
      const newVisited = [...visited, id];
      setVisited(newVisited);
      if (newVisited.length === skills.length) {
        setTimeout(() => setShowWin(true), 600);
      }
    }
    setActiveSkill(id);
  };

  return (
    <group>
      {/* Modal inicial de instrucciones */}
      <Html center>
        <Modal
          open={showHelp}
          title="Juego: Conociendo al equipo Power Skills"
          onPrimary={() => setShowHelp(false)}
        >
          <p>
            Explora los cinco avatares. Haz clic en cada uno para escuchar su aporte.
            Cuando los hayas visitado todos, pasarás a la próxima escena.
          </p>
          <Speech
            text="Explora los cinco avatares. Haz clic en cada uno para escuchar su aporte.
                  Cuando los hayas visitado todos,  pasarás a la próxima escena."
            when={showHelp}
            lang="es-ES"
          />
        </Modal>
      </Html>

      {/* ✅ Modal de éxito */}
      <Html center>
        <Modal
          open={showWin}
          title="¡Excelente trabajo!"
          onPrimary={onWin}
          type="success"
        >
          <p>
            Has conocido a todo el equipo Power Skills.
            Tu curiosidad y liderazgo fortalecen la colaboración.
          </p>
          <Speech
            text="¡Excelente trabajo! Has conocido a todo el equipo Power Skills.
                  Tu curiosidad y liderazgo fortalecen la colaboración."
            when={showWin}
            lang="es-ES"
          />
        </Modal>
      </Html>

      {/* Esferas de personajes */}
      {skills.map((skill, i) => (
        <mesh
          key={skill.id}
          position={[i * 1.6 - 3.2, 0.7, 0]}
          onClick={() => handleClick(skill.id)}
        >
          <sphereGeometry args={[0.55, 32, 32]} />
          <meshStandardMaterial
            color={visited.includes(skill.id) ? skill.color : theme.padBlue}
            emissive={visited.includes(skill.id) ? vivid.greenGlow : theme.glowBlue}
            emissiveIntensity={visited.includes(skill.id) ? 0.6 : 0.25}
          />
          <Html center position={[0, 1.1, 0]}>
            <div
              style={{
                background: "rgba(255,255,255,0.92)",
                padding: "6px 12px",
                borderRadius: 10,
                fontWeight: 700,
                fontSize: 14,
                color: theme.text,
                border: `1px solid ${theme.border}`,
              }}
            >
              {skill.name}
            </div>
          </Html>
        </mesh>
      ))}

      {/* Speech dinámico al hacer clic en personaje */}
      {activeSkill && (
        <Speech
          text={skills.find((s) => s.id === activeSkill)?.text || ""}
          when={true}
          lang="es-ES"
        />
      )}
    </group>
  );
}
