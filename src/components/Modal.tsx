import React from "react";
import { createPortal } from "react-dom";
import { theme, vivid } from "../theme";

type ModalKind = "info" | "success" | "warning";

type Props = {
  open: boolean;
  title?: string;
  onPrimary?: () => void;
  children?: React.ReactNode;
  type?: ModalKind;             // ← ahora incluye "warning"
  primaryLabel?: string;        // opcional: texto del botón
};

export default function Modal({
  open,
  title,
  onPrimary,
  children,
  type = "info",
  primaryLabel = "Continuar",
}: Props) {
  if (!open) return null;

  // Paletas por tipo
  const palettes: Record<ModalKind, { bg: string; accent: string }> = {
    success: {
      bg: "linear-gradient(135deg,#C7F7E4 0%,#B0F0FF 100%)",
      accent: vivid.green,
    },
    info: {
      bg: "linear-gradient(135deg,#E6FAFF 0%,#D7FBE8 100%)",
      accent: theme.primary,
    },
    warning: {
      bg: "linear-gradient(135deg,#FFF5D6 0%,#FFE6C7 100%)",
      // tono ámbar para advertencia (con buen contraste)
      accent: "#F5A524",
    },
  };

  const { bg, accent } = palettes[type];

  const node = (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2147483000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,.45)",
        backdropFilter: "blur(5px)",
        pointerEvents: "auto",
        animation: "fadeInOverlay .22s ease",
      }}
    >
      <div
        style={{
          width: "min(620px,92vw)",
          borderRadius: 20,
          border: `2px solid ${theme.border}`,
          background: bg,
          color: theme.text,
          boxShadow: "0 16px 48px rgba(0,0,0,.25)",
          padding: "24px 22px",
          textAlign: "center",
          animation: "fadeInModal .28s ease",
        }}
      >
        {title && (
          <h2 style={{ margin: "0 0 12px", fontSize: "1.6rem" }}>{title}</h2>
        )}
        <div style={{ fontSize: 18, lineHeight: 1.5, marginBottom: 18 }}>
          {children}
        </div>
        {onPrimary && (
          <button
            onClick={onPrimary}
            style={{
              background: accent,
              color: theme.text,
              border: "none",
              padding: "12px 20px",
              borderRadius: 12,
              fontWeight: 800,
              fontSize: 16,
              cursor: "pointer",
              boxShadow: "0 8px 24px rgba(0,0,0,.15)",
              transition: "transform .15s ease",
            }}
            onMouseEnter={(e) =>
              ((e.target as HTMLButtonElement).style.transform = "scale(1.04)")
            }
            onMouseLeave={(e) =>
              ((e.target as HTMLButtonElement).style.transform = "scale(1)")
            }
          >
            {primaryLabel}
          </button>
        )}
      </div>

      <style>
        {`
          @keyframes fadeInModal   { from{opacity:0; transform:scale(.94)} to{opacity:1; transform:scale(1)} }
          @keyframes fadeInOverlay { from{opacity:0;} to{opacity:1;} }
        `}
      </style>
    </div>
  );

  return createPortal(node, document.body);
}
