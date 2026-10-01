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
const RESPONSIVE_WIDTHS = [400, 800];

function webpName(file) {
  return `${path.basename(file, path.extname(file))}.webp`;
}

function responsiveWebpName(file, width) {
  const stem = path.basename(file, path.extname(file));
  return `${stem}-${width}.webp`;
}

async function writeOgCover() {
  const logoPath = path.join(DIR, "dev-cake-logo.png");
  const outPath = path.join(DIR, "og-cover.jpg");
  const width = 1200;
  const height = 630;
  const background = await sharp({
    create: {
      width,
      height,
      channels: 3,
      background: { r: 250, g: 247, b: 242 },
    },
  })
    .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
    .toBuffer();
  const logo = await sharp(logoPath).resize({ width: 420, withoutEnlargement: true }).toBuffer();
  const meta = await sharp(logo).metadata();
  const left = Math.round((width - (meta.width || 420)) / 2);
  const top = Math.round((height - (meta.height || 420)) / 2);
  await sharp(background)
    .composite([{ input: logo, left, top }])
    .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
    .toFile(outPath);
  console.log("og-cover.jpg → social preview");
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

    if (name !== "dev-cake-logo.png" && name !== "og-cover.jpg") {
      for (const w of RESPONSIVE_WIDTHS) {
        const small = await sharp(src)
          .resize({ width: w, withoutEnlargement: true })
          .webp({ quality: WEBP_QUALITY })
          .toBuffer();
        await writeFile(path.join(DIR, responsiveWebpName(name, w)), small);
      }
    }

    const fallback =
      ext === ".png"
        ? await sharp(src).resize(resize).png({ compressionLevel: 9 }).toBuffer()
        : await sharp(src)
            .resize(resize)
            .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
            .toBuffer();
    const before = await stat(src);
    if (fallback.length < before.size && name !== "og-cover.jpg") {
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

  await writeOgCover();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
