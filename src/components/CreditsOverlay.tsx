import { Html } from "@react-three/drei";
import { useState } from "react";
import AudioNarration from "../components/AudioNarration";
import { theme, vivid } from "../theme";

type Props = { onRestart: () => void; onMore: () => void };

export default function CreditsOverlay({ onRestart, onMore }: Props) {
  const [playOutro, setPlayOutro] = useState(false);

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

        {/* Nombres centrados en líneas separadas */}
        <div style={{ lineHeight: 1.6, fontSize: 18, textAlign: "center" }}>

          <p style={{ marginTop: 12 }}>
            Propuesta creada por el equipo representando por:
          </p>
                    <p style={{ margin: "6px 0" }}><b>Bracho Damelys</b></p>
          <p style={{ margin: "6px 0" }}><b>García Yamilet</b></p>
          <p style={{ margin: "6px 0" }}><b>Molina Otto</b></p>
          <p style={{ margin: "6px 0" }}><b>Nuñez Juan</b></p>
          <p style={{ margin: "6px 0" }}><b>Quintero Rosa</b></p>
          <p style={{ margin: "6px 0" }}><b>Ramírez Juan</b></p>
          <p style={{ marginTop: 12 }}>
             

            para el <b>Seminario Emergente II</b>, Tema: <b>“Power Skills”</b> del
            <b> Programa de Doctorado en Ciencias Gerenciales, VI Cohorte.</b> <b>UNEFM</b>
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

      {/* 1) Créditos; al terminar, dispara el cierre */}
      <AudioNarration
        src="/audio/36-credits.mp3"
        when={!playOutro}
        rate={1}
        volume={1}
        onEnded={() => setPlayOutro(true)}
      />

      {/* 2) Cierre del recorrido */}
      {playOutro && (
        <AudioNarration
          key="outro"
          src="/audio/37-outro.mp3"
          when={true}
          rate={1}
          volume={1}
        />
      )}
    </Html>
  );
}
