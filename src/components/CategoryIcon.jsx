const ICON_SIZE = 72;

const SVG = {
  width: ICON_SIZE,
  height: ICON_SIZE,
  viewBox: "0 0 64 64",
  fill: "none",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
};

function Cheesecake() {
  return (
    <svg {...SVG}>
      <path
        d="M14 42V26l36-10v26z"
        fill="var(--paper)"
        stroke="var(--brown)"
        strokeWidth="2"
      />
      <path
        d="M14 42h36v6a3 3 0 0 1-3 3H17a3 3 0 0 1-3-3z"
        fill="var(--brown)"
      />
      <path d="M14 27 50 17" stroke="var(--rust)" strokeWidth="4" />
      <circle cx="44" cy="16" r="4" fill="var(--rust)" />
      <path d="M22 35h20" stroke="var(--gold)" strokeWidth="3" />
    </svg>
  );
}

function CookieLavaTin() {
  return (
    <svg {...SVG}>
      <circle
        cx="32"
        cy="33"
        r="21"
        fill="var(--brown)"
        stroke="var(--ink)"
        strokeWidth="2"
      />
      <circle
        cx="32"
        cy="33"
        r="14"
        fill="var(--gold)"
        stroke="var(--cream)"
        strokeWidth="2"
      />
      <circle cx="32" cy="33" r="6" fill="var(--rust)" />
      <circle cx="25" cy="26" r="2" fill="var(--ink)" />
      <circle cx="40" cy="27" r="2" fill="var(--ink)" />
      <circle cx="27" cy="41" r="2" fill="var(--ink)" />
      <circle cx="39" cy="40" r="2" fill="var(--ink)" />
    </svg>
  );
}

function Cookie() {
  return (
    <svg {...SVG}>
      <path
        d="M44 12a20 20 0 1 1-24 2 8 8 0 0 0 10 2 8 8 0 0 0 14-4z"
        fill="var(--gold)"
        stroke="var(--brown)"
        strokeWidth="2"
      />
      <circle cx="24" cy="26" r="2.6" fill="var(--brown)" />
      <circle cx="35" cy="34" r="2.6" fill="var(--brown)" />
      <circle cx="22" cy="40" r="2.6" fill="var(--brown)" />
      <circle cx="43" cy="24" r="2.2" fill="var(--brown)" />
      <circle cx="33" cy="47" r="2.2" fill="var(--brown)" />
    </svg>
  );
}

function CakeBowl() {
  return (
    <svg {...SVG}>
      <path
        d="M18 24c4-8 10-8 13-4 2-6 12-5 13 4"
        fill="var(--cream)"
        stroke="var(--brown)"
        strokeWidth="2"
      />
      <path
        d="M16 26h32l-4 24a5 5 0 0 1-5 4H25a5 5 0 0 1-5-4z"
        fill="var(--paper)"
        stroke="var(--brown)"
        strokeWidth="2"
      />
      <path d="M19 35h26" stroke="var(--rust)" strokeWidth="5" />
      <path d="M21 45h22" stroke="var(--gold)" strokeWidth="5" />
    </svg>
  );
}

function Cupcake() {
  return (
    <svg {...SVG}>
      <path
        d="M20 33c-3-7 2-11 6-9 0-7 10-8 12-1 5-2 9 3 6 10z"
        fill="var(--cream)"
        stroke="var(--brown)"
        strokeWidth="2"
      />
      <circle cx="32" cy="14" r="3.5" fill="var(--rust)" />
      <path
        d="M18 34h28l-4 18a4 4 0 0 1-4 3H26a4 4 0 0 1-4-3z"
        fill="var(--gold)"
        stroke="var(--brown)"
        strokeWidth="2"
      />
      <path
        d="M27 36l-1 17M32 36v17M37 36l1 17"
        stroke="var(--brown)"
        strokeWidth="1.6"
      />
    </svg>
  );
}

function Brownie() {
  return (
    <svg {...SVG}>
      <path
        d="M12 24h40v22a6 6 0 0 1-6 6H18a6 6 0 0 1-6-6z"
        fill="var(--brown)"
        stroke="var(--ink)"
        strokeWidth="2"
      />
      <path
        d="M12 24c4 4 8 4 13 0s10 4 14 0 9 4 13 0"
        stroke="var(--gold)"
        strokeWidth="3"
      />
      <circle cx="24" cy="38" r="2.4" fill="var(--ink)" />
      <circle cx="34" cy="34" r="2.4" fill="var(--ink)" />
      <circle cx="42" cy="41" r="2.4" fill="var(--ink)" />
      <path d="M18 18h8v6h-8z" fill="var(--gold)" stroke="var(--brown)" strokeWidth="1.6" />
    </svg>
  );
}

function CustomCake() {
  return (
    <svg {...SVG}>
      <path d="M31 18v8" stroke="var(--rust)" strokeWidth="3" />
      <path
        d="M31 17c0-3-3-3-2-6 3 2 6 3 5 6z"
        fill="var(--gold)"
        stroke="var(--gold)"
        strokeWidth="1.5"
      />
      <path
        d="M21 40V30a3 3 0 0 1 3-3h14a3 3 0 0 1 3 3v10z"
        fill="var(--paper)"
        stroke="var(--brown)"
        strokeWidth="2"
      />
      <path
        d="M14 54V44a3 3 0 0 1 3-3h30a3 3 0 0 1 3 3v10z"
        fill="var(--paper)"
        stroke="var(--brown)"
        strokeWidth="2"
      />
      <path
        d="M21 31c3 3 5 3 7 0s5 3 7 0 4 3 6 0"
        stroke="var(--rust)"
        strokeWidth="3"
      />
      <path
        d="M14 45c4 3 6 3 9 0s6 3 9 0 6 3 9 0 5 2 9 0"
        stroke="var(--rust)"
        strokeWidth="3"
      />
      <path d="M9 54h46" stroke="var(--brown)" strokeWidth="2.5" />
    </svg>
  );
}

const ICONS = {
  cake: Cheesecake,
  tin: CookieLavaTin,
  cookie: Cookie,
  jar: CakeBowl,
  cupcake: Cupcake,
  brownie: Brownie,
  signature: CustomCake,
};

export function CategoryIcon({ type }) {
  const Icon = ICONS[type] || Cheesecake;
  return (
    <span className="category-icon" aria-hidden="true">
      <Icon />
    </span>
  );
}
