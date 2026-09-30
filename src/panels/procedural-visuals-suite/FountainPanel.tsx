import React, { useEffect, useRef } from "react";
import type { IDockviewPanelProps } from "dockview";
import { onOsc, sendOsc, retain } from "./channels";
import type { ProceduralSuiteParams } from "./types";
import { getAvailableAddress, getControlAddress, getPingAddress } from "./channels";
import "./Panel.css";

// Fountain config defaults
let config = {
  trailFade: 0.2,
  sources: 1,
  particleSize: 4,
  animSpeed: 1.0,
  colorScheme: 'viridis'
};

const baseGravity = 0.15;

const interpolators: Record<string, (t: number) => string> = {
  viridis: (t) => {
    const r = Math.floor(255 * (0.267 + 0.7 * t));
    const g = Math.floor(255 * (0.005 + 0.9 * t));
    const b = Math.floor(255 * (0.329 + 0.1 * (1 - t)));
    return `rgb(${r}, ${g}, ${b})`;
  },
  turbo: (t) => {
    const r = Math.floor(255 * Math.sin(t * Math.PI));
    const g = Math.floor(255 * Math.sin(t * Math.PI + 0.5));
    const b = Math.floor(255 * Math.cos(t * Math.PI * 0.5));
    return `rgb(${r}, ${g}, ${b})`;
  },
  magma: (t) => {
    const r = Math.floor(255 * Math.pow(t, 0.5));
    const g = Math.floor(255 * Math.pow(t, 1.5));
    const b = Math.floor(255 * Math.pow(t, 3.0));
    return `rgb(${r}, ${g}, ${b})`;
  },
  rainbow: (t) => `hsl(${t * 360}, 80%, 60%)`,
  cool: (t) => `hsl(${180 + t * 60}, 80%, 60%)`
};

class Particle {
  x: number; y: number; vx: number; vy: number;
  t: number; life: number; decay: number; baseSize: number; size: number;

  constructor(x: number, y: number, t: number) {
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 6 * config.animSpeed;
    this.vy = ((Math.random() * -10) - 2) * config.animSpeed;
    this.t = t;
    this.life = 1.0;
    this.decay = (Math.random() * 0.02 + 0.005) * (1 / config.animSpeed);
    this.baseSize = config.particleSize;
    this.size = this.baseSize * (0.5 + Math.random() * 0.5);
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += baseGravity * config.animSpeed;
    this.life -= this.decay;
  }

  draw(ctx: CanvasRenderingContext2D) {
    const color = interpolators[config.colorScheme](this.t);
    ctx.save();
    ctx.globalAlpha = this.life;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

export default function FountainPanel(props: IDockviewPanelProps<ProceduralSuiteParams>) {
  const docId = props.params?.documentId || "default";
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);

  useEffect(() => {
    const availableAddress = getAvailableAddress(docId, 'fountain');
    retain(availableAddress);
    sendOsc(availableAddress, [{ type: 'boolean', value: true }]);

    const unsubPing = onOsc(getPingAddress(docId), () => {
      sendOsc(availableAddress, [{ type: 'boolean', value: true }]);
    });

    const unsubs = [
      onOsc(getControlAddress(docId, 'fountain', 'trailFade'), (_, args) => { config.trailFade = args[0].value; }),
      onOsc(getControlAddress(docId, 'fountain', 'sources'), (_, args) => { config.sources = args[0].value; }),
      onOsc(getControlAddress(docId, 'fountain', 'particleSize'), (_, args) => { config.particleSize = args[0].value; }),
      onOsc(getControlAddress(docId, 'fountain', 'animSpeed'), (_, args) => { config.animSpeed = args[0].value; }),
      onOsc(getControlAddress(docId, 'fountain', 'colorScheme'), (_, args) => { config.colorScheme = args[0].value; }),
    ];

    return () => {
      sendOsc(availableAddress, [{ type: 'boolean', value: false }]);
      unsubPing();
      unsubs.forEach(u => u());
    };
  }, [docId]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.parentElement?.clientWidth || 800;
      canvas.height = canvas.parentElement?.clientHeight || 600;
    };
    window.addEventListener('resize', resize);
    resize();

    let animationFrameId: number;

    const loop = () => {
      ctx.fillStyle = `rgba(19, 19, 26, ${config.trailFade})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const spacing = canvas.width / (config.sources + 1);
      for (let i = 1; i <= config.sources; i++) {
        const x = spacing * i;
        const y = canvas.height - 20;
        const t = (i / (config.sources + 1) + Date.now() / 5000) % 1.0;
        const count = Math.floor(Math.random() * 4) + 2;
        for (let j = 0; j < count; j++) {
          particlesRef.current.push(new Particle(x, y, t));
        }
      }

      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.update();
        if (p.life <= 0) particlesRef.current.splice(i, 1);
        else p.draw(ctx);
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="procedural-viz-root">
      <canvas ref={canvasRef} />
    </div>
  );
}
