// WIP: test connecting to server node, IDB stores
"use client";

import { createHelia, type Helia } from "helia";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

interface HeliaContextValue {
  helia: Helia | null;
  error: Error | null;
  starting: boolean;
}

const HeliaContext = createContext<HeliaContextValue>({
  helia: null,
  error: null,
  starting: true,
});

export function HeliaProvider({ children }: { children: ReactNode }) {
  const [helia, setHelia] = useState<Helia | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [starting, setStarting] = useState(true);

  useEffect(() => {
    let node: Helia | null = null;
    let cancelled = false;

    (async () => {
      try {
        node = await createHelia();
        if (cancelled) {
          await node.stop();
          return;
        }
        setHelia(node);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e : new Error(String(e)));
      } finally {
        if (!cancelled) setStarting(false);
      }
    })();

    return () => {
      cancelled = true;
      void node?.stop();
    };
  }, []);

  return (
    <HeliaContext.Provider value={{ helia, error, starting }}>
      {children}
    </HeliaContext.Provider>
  );
}

export function useHelia(): HeliaContextValue {
  const context = useContext(HeliaContext);
  if (!context) {
    throw new Error("useHelia must be used within a HeliaProvider");
  }
  return context;
}
