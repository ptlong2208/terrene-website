'use client';

import { useEffect, useRef } from 'react';

import { usePreloaderDone } from '@/app/hooks/usePreloaderDone';

const DEFS = [
  { src: '/physics/Chawan.svg', w: 188, h: 137 },
  { src: '/physics/Chasen.svg', w: 92, h: 148 },
  { src: '/physics/Chasaku.svg', w: 182, h: 24 },
  { src: '/physics/Chawan.svg', w: 142, h: 103 },
  { src: '/physics/Chasen.svg', w: 74, h: 119 },
  { src: '/physics/Chasaku.svg', w: 144, h: 19 },
];

interface CtaPhysicsProps {
  className?: string;
}

export default function CtaPhysics({ className }: CtaPhysicsProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const preloaderDone = usePreloaderDone();

  useEffect(() => {
    if (!preloaderDone) return;
    const wrap = wrapRef.current;
    if (!wrap) return;

    let W = wrap.clientWidth;
    let H = wrap.clientHeight;
    if (!W || !H) return;

    let cancelled = false;
    let rafId: number;
    let resizeTimer: ReturnType<typeof setTimeout>;
    let destroyFn: (() => void) | null = null;

    import('matter-js').then(
      ({ Engine, Runner, World, Bodies, Body, Mouse, MouseConstraint, Events }) => {
        if (cancelled) return;

        const engine = Engine.create();
        engine.gravity.y = 1.1;

        // DOM images + physics bodies
        const items = DEFS.map((d, i) => {
          const img = document.createElement('img');
          img.src = d.src;
          img.draggable = false;
          img.style.cssText = [
            'position:absolute',
            'top:0',
            'left:0',
            `width:${d.w}px`,
            `height:${d.h}px`,
            'cursor:grab',
            'user-select:none',
            '-webkit-user-drag:none',
            'will-change:transform',
          ].join(';');
          wrap.appendChild(img);

          const x = W * (0.52 + Math.random() * 0.42);
          const y = -140 - i * 130;
          const body = Bodies.rectangle(x, y, d.w, d.h, {
            restitution: 0.3,
            friction: 0.55,
            frictionAir: 0.014,
            chamfer: { radius: Math.min(14, d.h / 2) },
          });
          Body.setAngle(body, (Math.random() - 0.5) * 0.7);
          Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.04);
          return { img, body, w: d.w, h: d.h };
        });

        World.add(
          engine.world,
          items.map((it) => it.body)
        );

        // Static walls rebuilt on resize
        const T = 400;
        let walls: Matter.Body[] = [];
        function buildWalls() {
          if (walls.length) World.remove(engine.world, walls);
          walls = [
            Bodies.rectangle(W / 2, H + T / 2, W + T * 4, T, { isStatic: true }),
            Bodies.rectangle(-T / 2, H / 2, T, H * 5, { isStatic: true }),
            Bodies.rectangle(W + T / 2, H / 2, T, H * 5, { isStatic: true }),
          ];
          World.add(engine.world, walls);
        }
        buildWalls();

        // Mouse drag
        const mouse = Mouse.create(wrap);
        const mc = MouseConstraint.create(engine, {
          mouse,
          constraint: { stiffness: 0.18 },
        });
        World.add(engine.world, mc);

        // Prevent Matter.js hijacking page scroll
        const mouseAny = mouse as unknown as Record<string, EventListener>;
        mouse.element.removeEventListener('mousewheel', mouseAny['mousewheel']);
        mouse.element.removeEventListener('DOMMouseScroll', mouseAny['mousewheel']);
        mouse.element.removeEventListener('wheel', mouseAny['mousewheel']);
        mouse.element.removeEventListener('touchmove', mouseAny['mousemove']);

        // Cursor feedback
        Events.on(mc, 'startdrag', () => {
          const dragged = items.find((it) => it.body === mc.body);
          if (dragged) dragged.img.style.cursor = 'grabbing';
        });
        Events.on(mc, 'enddrag', () => {
          items.forEach((it) => (it.img.style.cursor = 'grab'));
        });

        // rAF sync: physics position → DOM transform
        function frame() {
          for (const it of items) {
            const { x, y } = it.body.position;
            it.img.style.transform = `translate(${x - it.w / 2}px,${y - it.h / 2}px) rotate(${it.body.angle}rad)`;
          }
          rafId = requestAnimationFrame(frame);
        }
        frame();

        // Start engine when section enters view
        const runner = Runner.create();
        let started = false;
        const observer = new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting && !started) {
              started = true;
              Runner.run(runner, engine);
              observer.disconnect();
            }
          },
          { threshold: 0.1 }
        );
        observer.observe(wrap);

        // Rebuild walls on resize
        function onResize() {
          clearTimeout(resizeTimer);
          resizeTimer = setTimeout(() => {
            if (!wrap) return;
            const nw = wrap.clientWidth;
            const nh = wrap.clientHeight;
            if (!nw || !nh) return;
            W = nw;
            H = nh;
            buildWalls();
          }, 200);
        }
        window.addEventListener('resize', onResize);

        destroyFn = () => {
          cancelAnimationFrame(rafId);
          observer.disconnect();
          window.removeEventListener('resize', onResize);
          Runner.stop(runner);
          World.clear(engine.world, false);
          Engine.clear(engine);
          items.forEach((it) => it.img.remove());
        };
      }
    );

    return () => {
      cancelled = true;
      destroyFn?.();
    };
  }, [preloaderDone]);

  return (
    <div
      ref={wrapRef}
      aria-hidden="true"
      className={`absolute inset-0 overflow-hidden max-md:hidden touch-pan-y${className ? ` ${className}` : ''}`}
    />
  );
}
