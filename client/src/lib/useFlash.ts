import { useCallback, useEffect, useRef, useState } from "react";

export function useFlash(ms = 3000) {
  const [active, setActive] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const flash = useCallback(() => {
    clearTimeout(timer.current);
    setActive(true);
    timer.current = setTimeout(() => setActive(false), ms);
  }, [ms]);

  useEffect(() => () => clearTimeout(timer.current), []);

  return [active, flash] as const;
}