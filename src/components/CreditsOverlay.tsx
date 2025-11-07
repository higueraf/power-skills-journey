import { Html } from "@react-three/drei";
import Speech from "./Speech";
import { theme, vivid } from "../theme";

type Props = {
  onRestart: () => void;
  onMore: () => void;
};

/**
 * Overlay de créditos centrado (DOM en Html).
 * Incluye Speech opcional de agradecimiento y dos botones:
 * - Reiniciar el viaje
 * - Conoce más sobre las Power Skills
 */
export default function CreditsOverlay({ onRestart, onMore }: Props) {
  return (
    <Html center>
      <div
        style={{
          width: "min(720px, 92vw)",
          borderRadius: 20,
          border: `2px solid ${theme.border}`,
          background: "linear-gradient(135deg,#E6FAFF 0%,#D7FBE8 100%)",
          color: theme.text,
          boxShadow: "0 16px 48px rgba(0,0,0,.25)",
          padding: "26px 24px",
          textAlign: "center",
        }}
      >
        <h2 style={{ margin: "0 0 10px", fontSize: "1.8rem" }}>Créditos</h2>

        <div style={{ lineHeight: 1.6, fontSize: 18 }}>
          <p style={{ margin: "6px 0" }}>
            <b>UNEFM – Maestría en Calidad y Productividad</b>
          </p>
          <p style={{ margin: "6px 0" }}>
            Propuesta creada por el equipo académico representando la Jefatura de la Maestría.
          </p>
          <p style={{ margin: "6px 0" }}>
            Seminario: <i>Power Skills para la Gerencia Moderna</i> — Noviembre 2025.
          </p>
        </div>

        <div style={{ marginTop: 18, opacity: 0.9, fontSize: 16 }}>
          <p>Gracias por recorrer este viaje. ¡Las Power Skills se construyen practicándolas cada día!</p>
        </div>

        <div
          style={{
            marginTop: 18,
            display: "flex",
            gap: 12,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={onRestart}
            style={{
              background: vivid.blue,
              color: "#fff",
              border: "none",
              padding: "12px 18px",
              borderRadius: 12,
              fontWeight: 800,
              cursor: "pointer",
              boxShadow: "0 8px 24px rgba(0,0,0,.15)",
            }}
          >
            🔁 Reiniciar el viaje
          </button>
          <button
            onClick={onMore}
            style={{
              background: vivid.green,
              color: "#0f2740",
              border: "none",
              padding: "12px 18px",
              borderRadius: 12,
              fontWeight: 800,
              cursor: "pointer",
              boxShadow: "0 8px 24px rgba(0,0,0,.15)",
            }}
          >
            🔗 Conoce más sobre las Power Skills
          </button>
        </div>
      </div>

      {/* Narración breve de cierre */}
      <Speech
        text="Gracias por acompañarnos en este viaje. Las Power Skills impulsan la calidad, la productividad y el liderazgo humano. ¡Hasta pronto!"
        when={true}
        lang="es-ES"
      />
    </Html>
  );
}
