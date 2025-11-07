import { useMemo, type JSX } from "react";
import * as THREE from "three";

export default function Avatar(props: JSX.IntrinsicElements["group"]) {
  const body = useMemo(() => new THREE.CapsuleGeometry(0.5, 1.3, 8, 16), []);
  const matBody = useMemo(
    () => new THREE.MeshStandardMaterial({ metalness: 0.2, roughness: 0.5, color: "#9aa6b2" }),
    []
  );

  return (
    <group {...props}>
      <mesh geometry={body} material={matBody} castShadow />
      <mesh position={[0, 1.2, 0]} castShadow>
        <icosahedronGeometry args={[0.35, 0]} />
        <meshStandardMaterial emissive={"#58a6ff"} emissiveIntensity={1.2} />
      </mesh>
    </group>
  );
}
