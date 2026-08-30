import { CakeSlice, Cookie } from "lucide-react";

function iconProps(size, strokeWidth) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };
}

function CakeNoCandles({ size = 36, strokeWidth = 1.6 }) {
  return (
    <svg {...iconProps(size, strokeWidth)}>
      <path d="M4 18h16" />
      <path d="M5 18v-3.5A2.5 2.5 0 0 1 7.5 12h9A2.5 2.5 0 0 1 19 14.5V18" />
      <path d="M8 12V9.5A2.5 2.5 0 0 1 10.5 7h3A2.5 2.5 0 0 1 16 9.5V12" />
      <path d="M7.5 12c.8-.7 1.8-1 2.8-1 1.2 0 2.2.5 3.2 1 1 .5 2 .8 3 .5" />
    </svg>
  );
}

function CupcakeNoCandles({ size = 36, strokeWidth = 1.6 }) {
  return (
    <svg {...iconProps(size, strokeWidth)}>
      <path d="M9.9 13.6h4.2L13.4 19.8h-2.8z" />
      <path d="M11.05 13.6v6.2M12.95 13.6v6.2" />
      <path d="M9.3 13.6c.15-1.55 1.35-2.55 2.7-2.55s2.55 1 2.7 2.55" />
    </svg>
  );
}

function CustomCake({ size = 36, strokeWidth = 1.6 }) {
  return (
    <svg {...iconProps(size, strokeWidth)}>
      <path d="M4.5 19h11.2" />
      <path d="M5.4 19v-3.2A2.2 2.2 0 0 1 7.6 13.6h6.5A2.2 2.2 0 0 1 15.8 15.8V19" />
      <path d="M8.2 13.6V10.8A2.1 2.2 0 0 1 10.3 8.6h2.2A2.1 2.1 0 0 1 12.6 10.8V13.6" />
      <path d="M16.4 5.2 20.1 8.2" />
      <path d="M15.2 6.3 19 9.4 17.4 11.4 13.6 8.3z" />
      <path d="M13.6 8.3 12.4 9.6" />
    </svg>
  );
}

function CookieLavaTin({ size = 36, strokeWidth = 1.6 }) {
  return (
    <svg {...iconProps(size, strokeWidth)}>
      <ellipse cx="12" cy="17.8" rx="7.4" ry="2.05" />
      <path d="M4.6 12.6v5.2" />
      <path d="M19.4 12.6v5.2" />
      <ellipse cx="12" cy="12.5" rx="7.4" ry="2.5" />
      <path d="M6.4 12.2c1.2-2.6 2.9-3.9 5.6-3.9 2.7 0 4.4 1.3 5.6 3.9" />
      <path d="M12 15.1c.1 1.8.2 3.1 0 4.2" />
      <path d="M10.8 16c.8 1.6 1.6 1.6 2.4 0" />
    </svg>
  );
}

const ICONS = {
  cake: CakeSlice,
  tin: CookieLavaTin,
  cookie: Cookie,
  jar: CakeNoCandles,
  cupcake: CupcakeNoCandles,
  signature: CustomCake,
};

export function CategoryIcon({ type }) {
  const Icon = ICONS[type] || CakeSlice;
  return (
    <span className="category-icon" aria-hidden="true">
      <Icon size={36} strokeWidth={1.6} />
    </span>
  );
}
