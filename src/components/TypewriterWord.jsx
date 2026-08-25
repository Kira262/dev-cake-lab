import { useEffect, useState } from "react";

export const HERO_WORDS = [
  "obsession",
  "precision",
  "patience",
  "care",
  "heart",
  "love",
  "warmth",
  "joy",
];

const HOLD_MS = 2800;
const TYPE_MS = 70;
const DELETE_MS = 55;

function prefersReducedMotion() {
  return Boolean(
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches,
  );
}

export function TypewriterWord() {
  const [reduced, setReduced] = useState(prefersReducedMotion);
  const [index, setIndex] = useState(0);
  const [text, setText] = useState(HERO_WORDS[0]);
  const [phase, setPhase] = useState("hold");
  const [spoken, setSpoken] = useState(HERO_WORDS[0]);

  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!mq) return undefined;
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener?.("change", onChange);
    setReduced(mq.matches);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);

  useEffect(() => {
    if (reduced) {
      setText(HERO_WORDS[0]);
      setSpoken(HERO_WORDS[0]);
      setPhase("hold");
      setIndex(0);
      return undefined;
    }

    const word = HERO_WORDS[index];
    const delay =
      phase === "hold" ? HOLD_MS : phase === "delete" ? DELETE_MS : TYPE_MS;

    const timer = window.setTimeout(() => {
      if (phase === "hold") {
        setPhase("delete");
        return;
      }
      if (phase === "delete") {
        if (text.length === 0) {
          setIndex((i) => (i + 1) % HERO_WORDS.length);
          setPhase("type");
          return;
        }
        setText(text.slice(0, -1));
        return;
      }
      if (text === word) {
        setSpoken(word);
        setPhase("hold");
        return;
      }
      setText(word.slice(0, text.length + 1));
    }, delay);

    return () => window.clearTimeout(timer);
  }, [reduced, phase, text, index]);

  if (reduced) {
    return <span className="typewriter-slot">{HERO_WORDS[0]}</span>;
  }

  return (
    <span className="typewriter-slot">
      <span className="sr-only" aria-live="polite">
        {spoken}
      </span>
      <span aria-hidden="true">
        {text}
        <span className="typewriter-caret" />
      </span>
    </span>
  );
}
