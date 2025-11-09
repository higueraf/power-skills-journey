import { Html } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { theme, vivid } from "../theme";
import Modal from "../components/Modal";
import Speech from "../components/Speech";

export default function BalanceTradeoffGame({ onWin }: { onWin: () => void }) {
  const groupRef = useRef<THREE.Group>(null!);
  const { size, gl } = useThree();

  // Evita scroll/pinch del navegador durante el drag táctil
  useEffect(() => {
    gl.domElement.style.touchAction = "none";
  }, [gl]);

  const isMobile = size.width < 640;
  const isTablet = size.width >= 640 && size.width < 1024;

  // 🔹 Escala y medidas (más chico en mobile)
  const SCALE = isMobile ? 0.48 : isTablet ? 0.85 : 1.0;
  const railHalf = 1.6;                  // en coordenadas LOCALES del grupo
  const tolerance = isMobile ? 0.95 : 0.85; // tolerancia (local)
  const knobRadius = isMobile ? 0.16 : 0.22;
  const labelFontPx = isMobile ? 10 : 13;
  const groupY = isMobile ? 0.48 : 0.9;

  const [x, setX] = useState(0);
  const [drag, setDrag] = useState(false);
  const [showHelp, setShowHelp] = useState(true);
  const [won, setWon] = useState(false);
  const [showError, setShowError] = useState(false);

  const inGreen = Math.abs(x) < tolerance;
  const clamp = (v: number) => Math.max(-railHalf, Math.min(railHalf, v));

  // 🔧 Raycast robusto: intersección con el plano del grupo (y=0 del grupo)
  const tmpPlane = useMemo(() => new THREE.Plane(), []);
  const tmpVec = useMemo(() => new THREE.Vector3(), []);
  const tmpQuat = useMemo(() => new THREE.Quaternion(), []);
  const tmpPos = useMemo(() => new THREE.Vector3(), []);

  const getLocalXFromEvent = (e: any) => {
    const ray: THREE.Ray = e.ray; // world-space ray
    // Plano del grupo en world-space: normal = (0,1,0) transformada por el grupo; punto = origen del grupo
    groupRef.current.getWorldPosition(tmpPos);
    groupRef.current.getWorldQuaternion(tmpQuat);
    const worldNormal = tmpVec.set(0, 1, 0).applyQuaternion(tmpQuat).normalize();
    tmpPlane.setFromNormalAndCoplanarPoint(worldNormal, tmpPos);

    const hit = ray.intersectPlane(tmpPlane, tmpVec);
    if (!hit) return x; // si no intersecta, mantenemos x actual
    // Convertimos el punto de mundo a local del grupo y usamos su X
    const local = hit.clone();
    groupRef.current.worldToLocal(local);
    return local.x;
  };

  // Finalizar drag si sueltan fuera del lienzo
  useEffect(() => {
    const up = () => setDrag(false);
    window.addEventListener("pointerup", up, { passive: true });
    window.addEventListener("pointercancel", up, { passive: true });
    return () => {
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, []);

  // Arrastre desde el riel (hit-area invisible)
  function onRailDown(e: any) {
    e.stopPropagation();
    setDrag(true);
    const localX = getLocalXFromEvent(e);
    setX(clamp(localX));
    if (showHelp) setShowHelp(false);
  }
  function onRailMove(e: any) {
    if (!drag) return;
    e.stopPropagation();
    const localX = getLocalXFromEvent(e);
    setX(clamp(localX));
  }
  function onRailUp(e: any) {
    e.stopPropagation();
    setDrag(false);
    setWon(inGreen);
    setShowError(!inGreen);
  }

  // Arrastre desde el knob
  function onKnobDown(e: any) {
    e.stopPropagation();
    setDrag(true);
    if (showHelp) setShowHelp(false);
  }
  function onKnobMove(e: any) {
    if (!drag) return;
    e.stopPropagation();
    const localX = getLocalXFromEvent(e);
    setX(clamp(localX));
  }
  function onKnobUp(e: any) {
    e.stopPropagation();
    setDrag(false);
    setWon(inGreen);
    setShowError(!inGreen);
  }

  // 🔹 Posición horizontal de etiquetas (más centradas en mobile)
  const labelOffset = isMobile ? railHalf + 0.2 : railHalf + 0.55;


  return (
    // 📱 Escalamos todo y trabajamos SIEMPRE en coordenadas locales del grupo
    <group ref={groupRef} position={[0, groupY, 0]} scale={[SCALE, SCALE, SCALE]}>
      {/* Zona verde (ancho en local) */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[tolerance * 2.2, 0.26, 1, 1]} />
        <meshStandardMaterial
          color={theme.padGreen}
          transparent
          opacity={0.6}
          emissive={theme.glowGreen}
          emissiveIntensity={0.22}
          depthWrite={false}
        />
      </mesh>

      {/* Riel visible */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[railHalf * 2 + 0.3, 0.12, 0.12]} />
        <meshStandardMaterial
          color={theme.padBlue}
          roughness={0.35}
          metalness={0.08}
          emissive={theme.glowBlue}
          emissiveIntensity={0.15}
        />
      </mesh>

      {/* 🔍 Riel "hit area" invisible, más alto y grueso para touch */}
      <mesh
        position={[0, 0, 0]}
        onPointerDown={onRailDown}
        onPointerMove={onRailMove}
        onPointerUp={onRailUp}
      >
        <boxGeometry
          // más grande en móvil para capturar toques imprecisos
          args={[
            railHalf * 2 + (isMobile ? 1.0 : 0.6),
            isMobile ? 0.9 : 0.6,
            isMobile ? 0.9 : 0.6,
          ]}
        />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* Topes decorativos */}
      <mesh position={[-railHalf - 0.5, 0, 0]}>
        <boxGeometry args={[0.4, 0.12, 0.12]} />
        <meshStandardMaterial color={vivid.green} emissive={vivid.greenGlow} emissiveIntensity={0.2} />
      </mesh>
      <mesh position={[railHalf + 0.5, 0, 0]}>
        <boxGeometry args={[0.4, 0.12, 0.12]} />
        <meshStandardMaterial color={vivid.blue} emissive={vivid.blueGlow} emissiveIntensity={0.2} />
      </mesh>

      {/* Knob */}
      <mesh
        position={[x, 0, 0]}
        onPointerDown={onKnobDown}
        onPointerMove={onKnobMove}
        onPointerUp={onKnobUp}
        castShadow
      >
        <sphereGeometry args={[knobRadius, 32, 32]} />
        <meshStandardMaterial
          color={inGreen ? vivid.green : vivid.blue}
          emissive={inGreen ? vivid.greenGlow : theme.glowBlue}
          emissiveIntensity={inGreen ? 0.5 : 0.25}
          metalness={0.15}
          roughness={0.35}
        />
      </mesh>

      {/* Labels */}
      <Html center position={[-labelOffset, 0.45, 0]}>
        <div
          style={{
            background: "rgba(255,255,255,0.9)",
            border: `1px solid ${theme.border}`,
            borderRadius: 10,
            padding: isMobile ? "2px 7px" : "4px 9px",
            color: theme.text,
            fontWeight: 800,
            fontSize: labelFontPx,
            whiteSpace: "nowrap",
          }}
        >
          Enfoque humano
        </div>
      </Html>

      <Html center position={[labelOffset, 0.45, 0]}>
        <div
          style={{
            background: "rgba(255,255,255,0.9)",
            border: `1px solid ${theme.border}`,
            borderRadius: 10,
            padding: isMobile ? "2px 7px" : "4px 9px",
            color: theme.text,
            fontWeight: 800,
            fontSize: labelFontPx,
            whiteSpace: "nowrap",
          }}
        >
          Productividad
        </div>
      </Html>


      {/* Instrucciones */}
      <Html center>
        <Modal open={showHelp} title="Juego: Conociendo al equipo Power Skills" onPrimary={() => setShowHelp(false)}>
          <p>
            Arrastra la <b>esfera</b> sobre el riel y suéltala dentro de la <b>zona verde</b> para lograr el balance.
          </p>
          <Speech
            text="Arrastra la esfera sobre la guía y suéltala dentro de la zona verde para lograr el balance."
            when={showHelp}
            lang="es-ES"
          />
        </Modal>
      </Html>

      {/* Éxito */}
      <Html center>
        <Modal open={won} title="Juego: Conociendo al equipo Power Skills" onPrimary={() => onWin()}>
          <p>¡Muy bien! Encontraste un balance saludable. Pulsa <b>Continuar</b>.</p>
          <Speech text="Muy bien. Encontraste un balance saludable. Pulsa Continuar." when={won} lang="es-ES" />
        </Modal>
      </Html>

      {/* Error */}
      <Html center>
        <Modal
          open={showError}
          type="warning"
          title="Suelta dentro del equilibrio"
          onPrimary={() => setShowError(false)}
          primaryLabel="Intentar de nuevo"
        >
          <p>Suelta la esfera dentro de la <b>zona verde</b> para lograr el balance.</p>
          <Speech text="Suelta la esfera dentro de la zona verde para lograr el balance." when={showError} lang="es-ES" />
        </Modal>
      </Html>
    </group>
  );
}
