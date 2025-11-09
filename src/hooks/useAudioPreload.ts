import { useEffect } from "react";

export default function useAudioPreload(srcs: string[]) {
  useEffect(() => {
    const audios = srcs.map((s) => {
      const a = new Audio();
      a.preload = "auto";
      a.src = s;
      return a;
    });
    return () => { audios.forEach(a => { a.src = ""; }); };
  }, [srcs]);
}
