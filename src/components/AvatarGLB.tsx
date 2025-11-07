// src/components/AvatarGLB.tsx
import { useGLTF, useAnimations } from "@react-three/drei";
import { useEffect, useRef, Suspense, type JSX } from "react";
import * as THREE from "three";

export function AvatarGLBInner(props: JSX.IntrinsicElements["group"]) {
  const group = useRef<THREE.Group>(null!);
  const gltf = useGLTF("/character.glb");
  const { actions } = useAnimations(gltf.animations, group);

  useEffect(() => {
    // Toma la primera acción disponible (si existe)
    const action: THREE.AnimationAction | undefined = actions
      ? (Object.values(actions)[0] as THREE.AnimationAction | undefined)
      : undefined;

    if (action) {
      action.reset().fadeIn(0.3).play();
    }

    // ⬇️ Limpieza correcta: devuelve SIEMPRE una función (no el resultado de fadeOut/play)
    return () => {
      if (action) {
        action.fadeOut(0.2);
        action.stop(); // si prefieres esperar el fadeOut, podrías usar un setTimeout interno
      }
    };
  }, [actions]);

  return <primitive object={gltf.scene} ref={group} scale={1.2} {...props} />;
}

export default function AvatarGLB(props: JSX.IntrinsicElements["group"]) {
  return (
    <Suspense fallback={null}>
      <AvatarGLBInner {...props} />
    </Suspense>
  );
}

useGLTF.preload("/character.glb");
