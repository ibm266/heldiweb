"use client";

import { useEffect, useState } from "react";

/** Hide nav on scroll down; show again on scroll up. */
export function useNavScrollState(threshold = 72) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;

    function update() {
      const y = window.scrollY;
      const goingDown = y > lastY + 6;
      const goingUp = y < lastY - 6;

      if (y <= threshold) {
        setHidden(false);
      } else if (goingDown) {
        setHidden(true);
      } else if (goingUp) {
        setHidden(false);
      }

      lastY = y;
      ticking = false;
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    }

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  return { hidden };
}
