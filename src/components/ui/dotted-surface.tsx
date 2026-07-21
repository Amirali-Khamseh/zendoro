import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";

type DottedSurfaceProps = Omit<React.ComponentProps<"canvas">, "ref">;

const SPACING = 24;
const DOT_RADIUS = 2.4;
const WAVE_AMPLITUDE = 18;
const WAVE_SPEED = 0.02;

export function DottedSurface({ className, ...props }: DottedSurfaceProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let width = 0;
    let height = 0;
    let time = 0;
    let animationId = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      const cols = Math.ceil(width / SPACING) + 1;
      const rows = Math.ceil(height / SPACING) + 1;

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const x = col * SPACING;
          const phase = col * 0.4 + row * 0.3 + time;
          const y = row * SPACING + Math.sin(phase) * WAVE_AMPLITUDE;
          const alpha = 0.35 + 0.45 * ((Math.sin(phase) + 1) / 2);

          ctx.beginPath();
          ctx.arc(x, y, DOT_RADIUS, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(180, 190, 255, ${alpha.toFixed(3)})`;
          ctx.fill();
        }
      }

      time += WAVE_SPEED;
      animationId = requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={cn("pointer-events-none absolute inset-0 h-full w-full", className)}
      {...props}
    />
  );
}
