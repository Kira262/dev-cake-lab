import { CakeSlice, Cookie } from "lucide-react";
import { asset } from "../lib/paths.js";
import { AssetImage } from "./AssetImage.jsx";

const ICON_SIZE = 72;

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

function CustomCake({ size = ICON_SIZE, strokeWidth = 1.55 }) {
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

function CategoryImage({ file }) {
  return (
    <AssetImage className="category-icon-img" src={asset(file)} alt="" />
  );
}

function CheesecakeImage() {
  return <CategoryImage file="cheesecake-category-icon.jpg" />;
}

function CupcakeImage() {
  return <CategoryImage file="cupcake-category-icon.jpg" />;
}

function CookieLavaTinImage() {
  return <CategoryImage file="cookie-lava-tin-category-icon.jpg" />;
}

function CakeBowlImage() {
  return <CategoryImage file="cake-bowl-category-icon.jpg" />;
}

const ICONS = {
  cake: CheesecakeImage,
  tin: CookieLavaTinImage,
  cookie: Cookie,
  jar: CakeBowlImage,
  cupcake: CupcakeImage,
  signature: CustomCake,
};

export function CategoryIcon({ type }) {
  const Icon = ICONS[type] || CakeSlice;
  return (
    <span className="category-icon" aria-hidden="true">
      <Icon size={ICON_SIZE} strokeWidth={1.55} />
    </span>
  );
}
