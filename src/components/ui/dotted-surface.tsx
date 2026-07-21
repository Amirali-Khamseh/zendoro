import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";

type DottedSurfaceProps = Omit<React.ComponentProps<"div">, "ref">;

const SPACING = 22;
const DOT_RADIUS = 1.2;
const WAVE_AMPLITUDE = 16;
const WAVE_SPEED = 0.02;

export function DottedSurface({ className, ...props }: DottedSurfaceProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!container || !canvas || !ctx) return;

    let width = 0;
    let height = 0;
    let time = 0;
    let animationId = 0;

    const resize = () => {
      // Measure the wrapper div (a plain block box, sized correctly by
      // inset-0 against Hero's real dimensions), not the canvas itself -
      // canvas is a replaced element and sizes unreliably on its own.
      const rect = container.getBoundingClientRect();
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

    // Window resize alone misses layout-driven size changes, like the
    // hero image below loading in and growing the section's height -
    // ResizeObserver catches any actual size change to the container.
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn("pointer-events-none absolute inset-0", className)}
      {...props}
    >
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
}
