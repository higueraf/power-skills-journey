// src/components/ThreeCanvas.tsx
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";

type Props = { children: React.ReactNode; sceneBg?: string };

export default function ThreeCanvas({ children, sceneBg = "#E8F1F8" }: Props) {
  return (
    <Canvas dpr={[1, 2]} shadows camera={{ position: [0, 2.5, 4.5], fov: 50 }}>
      {/* 🔹 color de fondo del scene (cielo) */}
      <color attach="background" args={[sceneBg]} />
      <ambientLight intensity={0.7} />
      <directionalLight position={[4, 6, 3]} intensity={1.2} castShadow />
      <Suspense fallback={null}>{children}</Suspense>
    </Canvas>
  );
}
