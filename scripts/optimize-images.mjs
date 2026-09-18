import { readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIR = path.join(ROOT, "public", "assets");
const PHOTO_MAX = 1200;
const LOGO_MAX = 256;
const WEBP_QUALITY = 75;
const JPEG_QUALITY = 78;

function webpName(file) {
  return `${path.basename(file, path.extname(file))}.webp`;
}

async function run() {
  const names = await readdir(DIR);
  for (const name of names) {
    const ext = path.extname(name).toLowerCase();
    if (![".jpg", ".jpeg", ".png"].includes(ext)) continue;

    const src = path.join(DIR, name);
    const max = name === "dev-cake-logo.png" ? LOGO_MAX : PHOTO_MAX;
    const resize = { width: max, withoutEnlargement: true };

    const webpBuf = await sharp(src)
      .resize(resize)
      .webp({ quality: WEBP_QUALITY })
      .toBuffer();
    await writeFile(path.join(DIR, webpName(name)), webpBuf);

    const fallback =
      ext === ".png"
        ? await sharp(src).resize(resize).png({ compressionLevel: 9 }).toBuffer()
        : await sharp(src)
            .resize(resize)
            .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
            .toBuffer();
    const before = await stat(src);
    if (fallback.length < before.size) {
      try {
        await writeFile(src, fallback);
      } catch (err) {
        console.warn(`skip shrink ${name}: ${err.message}`);
      }
    }

    console.log(
      `${name} → ${webpName(name)} (${Math.round(webpBuf.length / 1024)} KB)`,
    );
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
