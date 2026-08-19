"use client";

import { useEffect, useRef } from "react";
import styles from "./GradientBubbles.module.scss";

/**
 * Configuración de cada blob que sigue al cursor.
 * `ease` es el divisor del lerp: valores más altos = más inercia (más lento).
 * `offsetX/offsetY` desplazan el punto de reposo para que no se apilen
 * todos en el mismo lugar cuando el cursor se detiene.
 */
const INTERACTIVE_BUBBLES = [
  { key: "interactive", ease: 20, offsetX: 0, offsetY: 0 },
  { key: "interactive2", ease: 35, offsetX: -80, offsetY: 60 },
  { key: "interactive3", ease: 55, offsetX: 120, offsetY: -70 },
  { key: "interactive4", ease: 80, offsetX: -150, offsetY: -110 },
] as const;

/** Blobs con animación puramente CSS (sin interacción). */
const STATIC_BUBBLES = ["g1", "g2", "g3", "g4", "g5", "g6", "g7", "g8"] as const;

type GradientBubblesProps = {
  /** Clases extra para el contenedor raíz. */
  className?: string;
};

export default function GradientBubbles({ className }: GradientBubblesProps) {
  const bubbleRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    // Snapshot de los nodos montados + su estado de animación.
    const bubbles = INTERACTIVE_BUBBLES.map((config, i) => {
      const el = bubbleRefs.current[i];
      return el ? { el, ...config, curX: 0, curY: 0 } : null;
    }).filter((b): b is NonNullable<typeof b> => b !== null);

    if (bubbles.length === 0) return;

    let targetX = 0;
    let targetY = 0;
    let frameId = 0;

    const move = () => {
      for (const bubble of bubbles) {
        // Misma fórmula de suavizado que el original: cur += (target - cur) / ease
        bubble.curX += (targetX + bubble.offsetX - bubble.curX) / bubble.ease;
        bubble.curY += (targetY + bubble.offsetY - bubble.curY) / bubble.ease;
        bubble.el.style.transform = `translate(${Math.round(bubble.curX)}px, ${Math.round(bubble.curY)}px)`;
      }
      frameId = requestAnimationFrame(move);
    };

    const handleMouseMove = (event: MouseEvent) => {
      targetX = event.clientX;
      targetY = event.clientY;
    };

    window.addEventListener("mousemove", handleMouseMove);
    frameId = requestAnimationFrame(move);

    // Cleanup: sin esto quedarían el listener y el rAF vivos al cambiar de ruta.
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <div
      className={
        className ? `${styles.gradientBg} ${className}` : styles.gradientBg
      }
      aria-hidden="true"
    >
      {/* Filtro SVG que fusiona los blobs (efecto gelatinoso).
          Debe vivir en el árbol de la página para que url(#goo) lo resuelva. */}
      <svg xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="goo">
            <feGaussianBlur
              in="SourceGraphic"
              stdDeviation="10"
              result="blur"
            />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8"
              result="goo"
            />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>

      <div className={styles.gradientsContainer}>
        {STATIC_BUBBLES.map((name) => (
          <div key={name} className={styles[name]} />
        ))}

        {INTERACTIVE_BUBBLES.map((bubble, i) => (
          <div
            key={bubble.key}
            ref={(el) => {
              bubbleRefs.current[i] = el;
            }}
            className={styles[bubble.key]}
          />
        ))}
      </div>
    </div>
  );
}
