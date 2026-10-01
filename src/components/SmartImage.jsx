import {
  isRemoteImageUrl,
  prefersPlainImage,
  responsiveWebpSrcSet,
  webpFromUrl,
} from "../lib/paths.js";

export function SmartImage({
  src,
  alt = "",
  className,
  priority = false,
  srcSet,
  sizes,
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
  if (isRemoteImageUrl(src) || prefersPlainImage(src)) {
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
  const webp = webpFromUrl(src);
  const resolvedSrcSet = srcSet || responsiveWebpSrcSet(src);
  return (
    <picture className="smart-picture">
      {resolvedSrcSet ? (
        <source type="image/webp" srcSet={resolvedSrcSet} sizes={sizes} />
      ) : (
        <source type="image/webp" srcSet={webp} />
      )}
      <img
        className={className}
        src={src}
        alt={alt}
        loading={priority ? undefined : "lazy"}
        decoding="async"
        fetchPriority={priority ? "high" : undefined}
        sizes={resolvedSrcSet ? sizes : undefined}
      />
    </picture>
  );
}
