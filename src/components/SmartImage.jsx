import { webpFromUrl } from "../lib/paths.js";

export function SmartImage({
  src,
  alt = "",
  className,
  priority = false,
}) {
  if (!src) return null;
  if (String(src).startsWith("data:")) {
    return (
      <img
        className={className}
        src={src}
        alt={alt}
        loading={priority ? undefined : "lazy"}
        decoding="async"
        fetchPriority={priority ? "high" : undefined}
      />
    );
  }
  return (
    <picture className="smart-picture">
      <source type="image/webp" srcSet={webpFromUrl(src)} />
      <img
        className={className}
        src={src}
        alt={alt}
        loading={priority ? undefined : "lazy"}
        decoding="async"
        fetchPriority={priority ? "high" : undefined}
      />
    </picture>
  );
}
