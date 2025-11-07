import { Routes, Route, Navigate } from "react-router-dom";

// Escenas (asegúrate de tener estos archivos creados)
import SceneWelcome from "./scenes/SceneWelcome";        // 1
import SceneContext from "./scenes/SceneContext";        // 2
import SceneTeam from "./scenes/SceneTeam";              // 3
import SceneChallenge from "./scenes/SceneChallenge";    // 4
import SceneInAction from "./scenes/SceneInAction";      // 5
import SceneResults from "./scenes/SceneResults";        // 6
import SceneReflection from "./scenes/SceneReflection";  // 7
import Credits from "./scenes/SceneCredits";                  // 8

export default function App() {
  return (
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
  );
}
