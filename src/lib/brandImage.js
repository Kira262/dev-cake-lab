const SIZE = 1024;
const BADGE = 232;
const INNER = 216;
const MARGIN = 36;

export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not load that photo."));
    img.src = src;
  });
}

function drawCover(ctx, img, size) {
  const scale = Math.max(size / img.width, size / img.height);
  const width = img.width * scale;
  const height = img.height * scale;
  ctx.drawImage(img, (size - width) / 2, (size - height) / 2, width, height);
}

export async function brandProductPhoto(source, logoSrc) {
  const [photo, logo] = await Promise.all([
    loadImage(source),
    loadImage(logoSrc),
  ]);
  const canvas = document.createElement("canvas");
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not brand this photo.");
  ctx.fillStyle = "#efe1cf";
  ctx.fillRect(0, 0, SIZE, SIZE);
  drawCover(ctx, photo, SIZE);

  const cx = MARGIN + BADGE / 2;
  const cy = MARGIN + BADGE / 2;
  ctx.beginPath();
  ctx.arc(cx, cy, BADGE / 2 - 1, 0, Math.PI * 2);
  ctx.fillStyle = "#fffaf2";
  ctx.fill();
  ctx.strokeStyle = "#e6d4bf";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, INNER / 2, 0, Math.PI * 2);
  ctx.clip();
  ctx.drawImage(
    logo,
    cx - INNER / 2,
    cy - INNER / 2,
    INNER,
    INNER,
  );
  ctx.restore();

  return canvas.toDataURL("image/jpeg", 0.82);
}
