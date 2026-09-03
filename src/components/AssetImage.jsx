import { useState } from "react";
import { DessertArt } from "./DessertArt.jsx";

export function AssetImage({
  src,
  alt = "",
  className,
  artType,
  decoding = "async",
  ...rest
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    if (artType) return <DessertArt type={artType} />;
    return null;
  }

  return (
    <img
      className={className}
      src={src}
      alt={alt}
      decoding={decoding}
      onError={() => setFailed(true)}
      {...rest}
    />
  );
}
