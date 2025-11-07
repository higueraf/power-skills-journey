import { Html } from "@react-three/drei";
import { useState } from "react";
import { theme } from "../theme";
import { SIZES } from "../constants3d";

const qs = [
  { t:"La comunicación efectiva reduce retrabajo.", a:true },
  { t:"El pensamiento crítico ignora datos cualitativos.", a:false },
  { t:"La empatía fortalece el clima laboral.", a:true },
  { t:"La colaboración limita la innovación.", a:false },
];

export default function QuizRaiseBarsGame({ onWin }: { onWin: () => void }) {
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);

  function answer(v:boolean){
    if (v === qs[idx].a) setScore(s=>s+1);
    const n = idx+1;
    if (n >= qs.length) {
      const final = score + (v===qs[idx].a ? 1 : 0);
      final >= 3 ? onWin() : (setIdx(0), setScore(0));
    } else setIdx(n);
  }

  return (
    <group>
      {/* barras pastel tamaño medio (ancho+profundidad mayores) */}
      {[0,1,2,3].map(i => {
        const h = i < score ? (1.6 + i*0.25) : 0.25;
        return (
          <mesh key={i} position={[-2 + i*1.3, h/2, 0]}>
            <boxGeometry args={[SIZES.barW, h, SIZES.barD]} />
            <meshStandardMaterial color={i%2===0 ? theme.padBlue : theme.padGreen} roughness={0.4} />
          </mesh>
        );
      })}
      <Html center position={[0,2.3,0]}>
        <div className="bubble" style={{background:"rgba(231,246,243,.92)", color:"#0F2740", borderColor:"#B7D7E8", minWidth:360}}>
          <div><b>Verdadero/Falso</b>: {qs[idx].t}</div>
          <div style={{display:"flex", gap:8, marginTop:8}}>
            <button className="btn" onClick={()=>answer(true)}>Verdadero</button>
            <button className="btn ghost" onClick={()=>answer(false)}>Falso</button>
          </div>
          <div className="note">Aciertos: {score}/{qs.length}</div>
        </div>
      </Html>
    </group>
  );
}
