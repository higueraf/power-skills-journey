type Listener = (exceptId?: string) => void;

class AudioBus {
  private listeners = new Set<Listener>();

  // 👇 deja claro que devuelve () => void
  onStopAll(fn: Listener): () => void {
    this.listeners.add(fn);
    // 👇 el cleanup NO debe devolver boolean; envuélvelo y no retornes nada
    return () => { this.listeners.delete(fn); };
  }

  stopAll(exceptId?: string) {
    for (const fn of this.listeners) fn(exceptId);
  }
}

export const audioBus = new AudioBus();
