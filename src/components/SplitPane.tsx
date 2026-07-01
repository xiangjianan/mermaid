import {
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState
} from "react";

const MIN_LEFT_PERCENT = 28;
const MAX_LEFT_PERCENT = 68;
const DEFAULT_LEFT_PERCENT = 42;
const KEYBOARD_STEP_PERCENT = 2;

type SplitPaneProps = {
  left: ReactNode;
  right: ReactNode;
  storageKey: string;
};

function clampLeftPercent(value: number) {
  const clampedValue = Math.min(MAX_LEFT_PERCENT, Math.max(MIN_LEFT_PERCENT, value));

  return Math.round(clampedValue * 100) / 100;
}

function getInitialLeftPercent(storageKey: string) {
  const storedValue = window.localStorage.getItem(storageKey);
  const parsedValue = storedValue === null ? Number.NaN : Number(storedValue);

  if (!Number.isFinite(parsedValue)) {
    return DEFAULT_LEFT_PERCENT;
  }

  return clampLeftPercent(parsedValue);
}

export function SplitPane({ left, right, storageKey }: SplitPaneProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const storageKeyRef = useRef(storageKey);
  const [leftPercent, setLeftPercent] = useState(() => getInitialLeftPercent(storageKey));

  const persistLeftPercent = (nextPercent: number) => {
    const clampedPercent = clampLeftPercent(nextPercent);
    setLeftPercent(clampedPercent);
    window.localStorage.setItem(storageKeyRef.current, String(clampedPercent));
  };

  useEffect(() => {
    storageKeyRef.current = storageKey;
  }, [storageKey]);

  useEffect(() => {
    const stopDragging = () => {
      isDraggingRef.current = false;
      document.body.classList.remove("is-resizing");
    };

    const updateFromClientX = (clientX: number) => {
      const bounds = rootRef.current?.getBoundingClientRect();

      if (!bounds || bounds.width <= 0) {
        return;
      }

      const nextPercent = clampLeftPercent(((clientX - bounds.left) / bounds.width) * 100);
      persistLeftPercent(nextPercent);
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!isDraggingRef.current) {
        return;
      }

      if (event.buttons !== 1) {
        stopDragging();
        return;
      }

      updateFromClientX(event.clientX);
    };

    const handlePointerUp = () => {
      if (isDraggingRef.current) {
        stopDragging();
      }
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      stopDragging();
    };
  }, []);

  const handlePointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    isDraggingRef.current = true;
    document.body.classList.add("is-resizing");
    event.currentTarget.setPointerCapture?.(event.pointerId);

    const bounds = rootRef.current?.getBoundingClientRect();

    if (!bounds || bounds.width <= 0) {
      return;
    }

    const nextPercent = clampLeftPercent(((event.clientX - bounds.left) / bounds.width) * 100);
    persistLeftPercent(nextPercent);
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      persistLeftPercent(leftPercent - KEYBOARD_STEP_PERCENT);
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      persistLeftPercent(leftPercent + KEYBOARD_STEP_PERCENT);
    }
  };

  return (
    <div
      ref={rootRef}
      className="split-pane"
      style={{ gridTemplateColumns: `${leftPercent}% 10px minmax(0, 1fr)` }}
    >
      <section className="split-pane__panel split-pane__panel--left">{left}</section>
      <button
        type="button"
        role="separator"
        aria-label="Resize panes"
        aria-orientation="vertical"
        aria-valuemin={MIN_LEFT_PERCENT}
        aria-valuemax={MAX_LEFT_PERCENT}
        aria-valuenow={leftPercent}
        className="split-pane__divider"
        onPointerDown={handlePointerDown}
        onKeyDown={handleKeyDown}
      >
        <span />
      </button>
      <section className="split-pane__panel split-pane__panel--right">{right}</section>
    </div>
  );
}
