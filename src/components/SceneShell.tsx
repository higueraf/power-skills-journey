import { useState } from "react";
import ThreeCanvas from "./ThreeCanvas";
import VideoIntro from "./VideoIntro";
import Modal from "./Modal";
import Speech from "./Speech";

type Props = {
  videoSrc: string;
  videoPoster?: string;
  children: React.ReactNode;
  introTitle?: string;
  introText?: string;
  introTitle2?: string;
  introText2?: string; // se narra en este segundo modal
};

export default function SceneShell({
  videoSrc,
  videoPoster,
  children,
  introTitle = "Bienvenida",
  introText = "",
  introTitle2 = "Continuación",
  introText2 = "",
}: Props) {
  const [showIntro1, setShowIntro1] = useState(true);
  const [showIntro2, setShowIntro2] = useState(false);
  const [startVideo, setStartVideo] = useState(false);
  const [showGame, setShowGame] = useState(false);

  return (
    <div className="screen" style={{ background: "#E0F4FF" }}>
      {/* Modal 1: breve, sin voz */}
      <Modal
        open={showIntro1}
        title={introTitle}
        onPrimary={() => {
          setShowIntro1(false);
          setShowIntro2(true);
        }}
      >
        <p style={{ marginTop: 0 }}>{introText}</p>
        <p style={{ margin: "8px 0 0", opacity: 0.8 }}>
          Pulsa <b>Continuar</b> para seguir.
        </p>
      </Modal>

      {/* Modal 2: continuación con speech */}
      <Modal
        open={showIntro2}
        title={introTitle2}
        onPrimary={() => {
          setShowIntro2(false);
          setStartVideo(true); // al cerrar este, arrancamos video
          try { window.speechSynthesis?.resume(); } catch {}
        }}
      >
        <p style={{ marginTop: 0 }}>{introText2}</p>
        <p style={{ margin: "8px 0 0", opacity: 0.8 }}>
          Pulsa <b>Continuar</b> para reproducir el video.
        </p>
        {/* narración automática SOLO mientras está este modal */}
        <Speech text={introText2} when={showIntro2} lang="es-ES" />
      </Modal>

      {/* Video o juego */}
      {!showGame ? (
        <VideoIntro
          src={videoSrc}
          poster={videoPoster}
          onEnd={() => setShowGame(true)}
          overlayBg="linear-gradient(135deg, #E0F4FF 0%, #D7F3E3 100%)"
          startNow={startVideo}
        />
      ) : (
        <ThreeCanvas>{children}</ThreeCanvas>
      )}
    </div>
  );
}
