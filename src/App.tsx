import { Routes, Route, Navigate } from "react-router-dom";
import BackgroundMusic from "./components/BackgroundMusic"; // 👈 nuevo

// Escenas
import SceneWelcome from "./scenes/SceneWelcome";
import SceneContext from "./scenes/SceneContext";
import SceneTeam from "./scenes/SceneTeam";
import SceneChallenge from "./scenes/SceneChallenge";
import SceneInAction from "./scenes/SceneInAction";
import SceneResults from "./scenes/SceneResults";
import SceneReflection from "./scenes/SceneReflection";
import Credits from "./scenes/SceneCredits";

export default function App() {
  return (
    <>
      {/* 🎶 Música de fondo persistente */}
      <BackgroundMusic src="/audio/bg-music.mp3" volume={0.02} />

      <Routes>
        <Route path="/" element={<Navigate to="/welcome" replace />} />
        <Route path="/welcome" element={<SceneWelcome />} />
        <Route path="/context" element={<SceneContext />} />
        <Route path="/team" element={<SceneTeam />} />
        <Route path="/challenge" element={<SceneChallenge />} />
        <Route path="/in-action" element={<SceneInAction />} />
        <Route path="/results" element={<SceneResults />} />
        <Route path="/reflection" element={<SceneReflection />} />
        <Route path="/credits" element={<Credits />} />
        <Route path="*" element={<Navigate to="/welcome" replace />} />
      </Routes>
    </>
  );
}
