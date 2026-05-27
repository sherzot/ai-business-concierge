/**
 * OnboardingTour — lightweight tour without external dependency.
 *
 * Usage:
 *   const { startTour } = useTour();
 *   startTour(DASHBOARD_STEPS);
 *
 * Each step has:
 *   target: CSS selector for the element to highlight
 *   title: step heading
 *   content: explanation text
 *   placement?: "top" | "bottom" | "left" | "right" (default: "bottom")
 */

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X, ArrowRight } from "lucide-react";

export type TourStep = {
  target: string;       // CSS selector
  title: string;
  content: string;
  placement?: "top" | "bottom" | "left" | "right";
};

type TourContextValue = {
  startTour: (steps: TourStep[]) => void;
  endTour: () => void;
};

const TourContext = createContext<TourContextValue>({ startTour: () => {}, endTour: () => {} });

export function useTour() {
  return useContext(TourContext);
}

// ─── TourProvider ─────────────────────────────────────────────────────────────
export function TourProvider({ children }: { children: React.ReactNode }) {
  const [steps, setSteps] = useState<TourStep[]>([]);
  const [stepIdx, setStepIdx] = useState(0);
  const [active, setActive] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const rafRef = useRef<number>(0);

  const startTour = useCallback((s: TourStep[]) => {
    setSteps(s);
    setStepIdx(0);
    setActive(true);
  }, []);

  const endTour = useCallback(() => {
    setActive(false);
    setSteps([]);
    setRect(null);
  }, []);

  // Track target element position
  useEffect(() => {
    if (!active || steps.length === 0) return;
    const step = steps[stepIdx];

    function measure() {
      const el = document.querySelector(step.target);
      if (el) {
        const r = el.getBoundingClientRect();
        setRect(r);
        el.scrollIntoView({ block: "center", behavior: "smooth" });
      }
      rafRef.current = requestAnimationFrame(measure);
    }
    rafRef.current = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(rafRef.current);
  }, [active, stepIdx, steps]);

  // Keyboard: Escape to close, ArrowRight/Enter to advance
  useEffect(() => {
    if (!active) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") endTour();
      if (e.key === "ArrowRight" || e.key === "Enter") {
        setStepIdx((i) => {
          if (i + 1 >= steps.length) { endTour(); return i; }
          return i + 1;
        });
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, steps, endTour]);

  return (
    <TourContext.Provider value={{ startTour, endTour }}>
      {children}
      {active && rect && steps[stepIdx] && createPortal(
        <TourOverlay
          step={steps[stepIdx]}
          stepIdx={stepIdx}
          totalSteps={steps.length}
          rect={rect}
          onNext={() => {
            if (stepIdx + 1 >= steps.length) endTour();
            else setStepIdx((i) => i + 1);
          }}
          onClose={endTour}
        />,
        document.body
      )}
    </TourContext.Provider>
  );
}

// ─── TourOverlay ──────────────────────────────────────────────────────────────
const PADDING = 8;   // padding around highlighted element
const CARD_W  = 280; // tooltip card width

function TourOverlay({ step, stepIdx, totalSteps, rect, onNext, onClose }: {
  step: TourStep;
  stepIdx: number;
  totalSteps: number;
  rect: DOMRect;
  onNext: () => void;
  onClose: () => void;
}) {
  const placement = step.placement ?? "bottom";

  // ── compute card position ──────────────────────────────────────────────────
  let top = 0, left = 0;
  const vw = window.innerWidth, vh = window.innerHeight;
  const cx = rect.left + rect.width / 2;

  if (placement === "bottom") {
    top  = rect.bottom + PADDING;
    left = Math.max(8, Math.min(cx - CARD_W / 2, vw - CARD_W - 8));
  } else if (placement === "top") {
    top  = rect.top - PADDING - 160;   // approx card height
    left = Math.max(8, Math.min(cx - CARD_W / 2, vw - CARD_W - 8));
  } else if (placement === "right") {
    top  = rect.top + rect.height / 2 - 60;
    left = Math.min(rect.right + PADDING, vw - CARD_W - 8);
  } else {
    top  = rect.top + rect.height / 2 - 60;
    left = Math.max(8, rect.left - CARD_W - PADDING);
  }
  top = Math.max(8, Math.min(top, vh - 200));

  // ── spotlight clip rect ────────────────────────────────────────────────────
  const spotX = rect.left - PADDING;
  const spotY = rect.top - PADDING;
  const spotW = rect.width + PADDING * 2;
  const spotH = rect.height + PADDING * 2;

  return (
    <>
      {/* Dark overlay with spotlight hole */}
      <div
        className="fixed inset-0 z-[9000] pointer-events-auto"
        style={{
          background: `rgba(0,0,0,0.55)`,
          WebkitMaskImage: `
            radial-gradient(ellipse at 50% 50%, transparent 0, transparent 100%),
            linear-gradient(black, black)
          `,
          maskImage: `
            radial-gradient(ellipse at 50% 50%, transparent 0, transparent 100%),
            linear-gradient(black, black)
          `,
          maskComposite: "exclude",
          WebkitMaskComposite: "xor",
        }}
        onClick={onClose}
      />
      {/* Spotlight border ring */}
      <div
        className="fixed z-[9001] pointer-events-none rounded-lg ring-2 ring-indigo-400 ring-offset-0"
        style={{
          top: spotY, left: spotX, width: spotW, height: spotH,
          boxShadow: "0 0 0 9999px rgba(0,0,0,0.55)",
          borderRadius: 8,
        }}
      />

      {/* Tooltip card */}
      <div
        className="fixed z-[9002] w-[280px] bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden"
        style={{ top, left }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">
            {stepIdx + 1} / {totalSteps}
          </span>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-0.5 bg-slate-100 mx-4">
          <div
            className="h-0.5 bg-indigo-500 transition-all duration-300"
            style={{ width: `${((stepIdx + 1) / totalSteps) * 100}%` }}
          />
        </div>

        {/* Content */}
        <div className="px-4 pt-3 pb-4">
          <p className="text-sm font-bold text-slate-900 mb-1">{step.title}</p>
          <p className="text-xs text-slate-600 leading-relaxed">{step.content}</p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 pb-4 gap-2">
          <button
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
          >
            O'tkazib yuborish
          </button>
          <button
            onClick={onNext}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors"
          >
            {stepIdx + 1 < totalSteps ? (
              <><ArrowRight size={12} /> Keyingi</>
            ) : (
              "Tayyor ✓"
            )}
          </button>
        </div>
      </div>
    </>
  );
}
