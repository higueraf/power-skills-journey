import { useState } from "react";
import ThreeCanvas from "./ThreeCanvas";
import VideoIntro from "./VideoIntro";
import Modal from "./Modal";
import AudioNarration from "./AudioNarration";

type Props = {
  videoSrc: string;
  videoPoster?: string;
  children: React.ReactNode;
  introTitle?: string;
  introText?: string;
  introTitle2?: string;
  introText2?: string;

  // Solo dejaremos activo el audio del segundo modal
  introAudio2Src?: string;
  introAudio2Vtt?: string;
};

export default function SceneShell({
  videoSrc,
  videoPoster,
  children,
  introTitle = "Bienvenida",
  introText = "",
  introTitle2 = "Continuación",
  introText2 = "",
  introAudio2Src,
  introAudio2Vtt,
}: Props) {
  const [showIntro1, setShowIntro1] = useState(true);
  const [showIntro2, setShowIntro2] = useState(false);
  const [startVideo, setStartVideo] = useState(false);
  const [showGame, setShowGame] = useState(false);

  return (
    <div className="screen" style={{ background: "#E0F4FF" }}>
      {/* Modal 1: SIN audio */}
      <Modal
        open={showIntro1}
        title={introTitle}
        onPrimary={() => {
          setShowIntro1(false);
          setShowIntro2(true); // ← clic del usuario: habilita autoplay posterior
        }}
      >
        <p style={{ marginTop: 0 }}>{introText}</p>
        <p style={{ margin: "8px 0 0", opacity: 0.8 }}>
          Pulsa <b>Continuar</b> para seguir.
        </p>
      </Modal>

      {/* Modal 2: CON audio MP3 (autoplay tras el clic previo) */}
      <Modal
        open={showIntro2}
        title={introTitle2}
        onPrimary={() => {
          setShowIntro2(false);
          setStartVideo(true);
        }}
      >
        <p style={{ marginTop: 0 }}>{introText2}</p>
        <p style={{ margin: "8px 0 0", opacity: 0.8 }}>
          Pulsa <b>Continuar</b> para reproducir el video.
        </p>

        {introAudio2Src && (
          <AudioNarration
            src={introAudio2Src}          // "/audio/02-intro.mp3"
            captionsSrc={introAudio2Vtt}  // opcional .vtt
            when={showIntro2}             // se dispara al abrir el modal 2
            rate={1}
            volume={1}
          />
        )}
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
