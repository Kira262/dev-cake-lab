import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { ADMIN_BADGES } from "../data/admin.js";
import { asset } from "../lib/paths.js";
import {
  unlockAdmin,
  generatePhotos,
  publishProduct,
  deleteProduct,
} from "../lib/adminApi.js";
import {
  adminGenerateReady,
  adminPublishReady,
  draftToProduct,
  productDraftPhotos,
  readImageFile,
} from "../lib/adminForm.js";
import { brandProductPhoto } from "../lib/brandImage.js";
import {
  SHOP_CATEGORIES,
  categoryDefaults,
  nextProductId,
} from "../lib/extraProducts.js";

const EMPTY_DRAFT = {
  type: "",
  name: "",
  price: "",
  note: "",
  flavourOne: "",
  flavourTwo: "",
  badge: "",
  bestSeller: false,
  hero: "",
  detail: "",
};

export function AdminPage({ products = [], onPublished, onDeleted }) {
  const [password, setPassword] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const [editing, setEditing] = useState(null);
  const [type, setType] = useState("");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [note, setNote] = useState("");
  const [noteTouched, setNoteTouched] = useState(false);
  const [flavourOne, setFlavourOne] = useState("");
  const [flavourTwo, setFlavourTwo] = useState("");
  const [badge, setBadge] = useState("");
  const [bestSeller, setBestSeller] = useState(false);
  const [hero, setHero] = useState("");
  const [detail, setDetail] = useState("");
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState("");

  const draft = {
    type,
    name,
    price,
    note,
    flavourOne,
    flavourTwo,
    badge,
    bestSeller,
    hero,
    detail,
  };
  const canGenerate = adminGenerateReady(draft);
  const canPublish = adminPublishReady(draft);

  useEffect(() => {
    if (!type || noteTouched || editing) return;
    setNote(categoryDefaults(type, name).note);
  }, [type, name, noteTouched, editing]);

  const resetForm = () => {
    setEditing(null);
    setType(EMPTY_DRAFT.type);
    setName(EMPTY_DRAFT.name);
    setPrice(EMPTY_DRAFT.price);
    setNote(EMPTY_DRAFT.note);
    setNoteTouched(false);
    setFlavourOne(EMPTY_DRAFT.flavourOne);
    setFlavourTwo(EMPTY_DRAFT.flavourTwo);
    setBadge(EMPTY_DRAFT.badge);
    setBestSeller(EMPTY_DRAFT.bestSeller);
    setHero(EMPTY_DRAFT.hero);
    setDetail(EMPTY_DRAFT.detail);
  };

  const pickType = (next) => {
    setType(next);
    if (!editing) {
      setNoteTouched(false);
      setHero("");
      setDetail("");
    }
    setDone("");
  };

  const loadProduct = (product) => {
    const photos = productDraftPhotos(product);
    setEditing({
      id: product.id,
      slug: product.slug,
      art: product.art,
      unit: product.unit,
      bestSeller: product.bestSeller,
    });
    setType(product.type || "");
    setName(product.name || "");
    setPrice(product.price ? String(product.price) : "");
    setNote(product.note || "");
    setNoteTouched(true);
    setFlavourOne(product.flavours?.[0] || "");
    setFlavourTwo(product.flavours?.[1] || "");
    setBadge(product.badge || "");
    setBestSeller(Boolean(product.bestSeller));
    setHero(photos.hero);
    setDetail(photos.detail);
    setError("");
    setDone("");
  };

  const unlock = async (event) => {
    event.preventDefault();
    setError("");
    setUnlocking(true);
    try {
      await unlockAdmin(password);
      setUnlocked(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not unlock admin.");
    } finally {
      setUnlocking(false);
    }
  };

  const generate = async () => {
    if (!canGenerate) return;
    setError("");
    setDone("");
    setBusy("generate");
    try {
      const logo = asset("dev-cake-logo.png");
      const payload = {
        name: name.trim(),
        type,
        note: note.trim(),
        flavours: [flavourOne, flavourTwo]
          .map((item) => item.trim())
          .filter(Boolean),
      };
      const heroPhoto = await generatePhotos(password, { ...payload, shot: "hero" });
      setHero(await brandProductPhoto(heroPhoto.hero, logo));
      const detailPhoto = await generatePhotos(password, { ...payload, shot: "detail" });
      setDetail(await brandProductPhoto(detailPhoto.detail, logo));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not generate photos.");
    } finally {
      setBusy("");
    }
  };

  const upload = async (slot, file) => {
    if (!file) return;
    setError("");
    setDone("");
    setBusy(`upload:${slot}`);
    try {
      const raw = await readImageFile(file);
      const branded = await brandProductPhoto(raw, asset("dev-cake-logo.png"));
      if (slot === "hero") setHero(branded);
      else setDetail(branded);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not upload that photo.");
    } finally {
      setBusy("");
    }
  };

  const publish = async () => {
    if (!canPublish) return;
    setError("");
    setDone("");
    setBusy("publish");
    try {
      const payload = draftToProduct(
        draft,
        editing?.id || nextProductId(products),
        editing,
      );
      const saved = await publishProduct(password, payload);
      onPublished?.(saved.product || payload);
      setDone(`${payload.name} is on the shop.`);
      if (editing) {
        setEditing({
          ...editing,
          id: saved.product?.id || payload.id,
          slug: saved.product?.slug || payload.slug,
          art: payload.art,
          unit: payload.unit,
          bestSeller: payload.bestSeller,
        });
      } else {
        setName("");
        setPrice("");
        setNoteTouched(false);
        setFlavourOne("");
        setFlavourTwo("");
        setBadge("");
        setBestSeller(false);
        setHero("");
        setDetail("");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not publish.");
    } finally {
      setBusy("");
    }
  };

  const remove = async (product) => {
    if (!product?.slug) return;
    const ok = window.confirm(`Remove ${product.name} from the shop?`);
    if (!ok) return;
    setError("");
    setDone("");
    setBusy(`delete:${product.slug}`);
    try {
      await deleteProduct(password, product.slug);
      onDeleted?.(product.slug);
      if (editing?.slug === product.slug) resetForm();
      setDone(`${product.name} was removed.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete.");
    } finally {
      setBusy("");
    }
  };

  if (!unlocked) {
    return (
      <main id="main-content">
        <section className="page-hero wrap">
          <span className="kicker">BAKERY DESK</span>
          <h1>
            Manage the
            <br />
            <i>live menu.</i>
          </h1>
          <p>Staff only. Add, edit, or remove treats. Changes go live on GitHub after you save.</p>
        </section>
        <section className="wrap contact custom-cake">
          <form className="contact-form cake-form" onSubmit={unlock}>
            <label>
              Admin password
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
            {error && <p className="field-error">{error}</p>}
            <button className="primary" type="submit" disabled={unlocking || !password}>
              {unlocking ? "Checking…" : "Unlock"}
              {!unlocking && <ArrowRight size={17} />}
            </button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main id="main-content">
      <section className="page-hero wrap">
        <span className="kicker">BAKERY DESK</span>
        <h1>
          {editing ? "Edit a treat." : "Pick a category."}
          <br />
          <i>{editing ? name || "Then save." : "Then the details."}</i>
        </h1>
        <p>
          The list is the live shop. Create a new item, edit an existing one, or
          delete it. Generate photos, or upload your own.
        </p>
      </section>
      <section className="wrap contact custom-cake">
        <form
          className="contact-form cake-form"
          onSubmit={(event) => {
            event.preventDefault();
            publish();
          }}
        >
          <fieldset className="cake-choice">
            <legend>Category</legend>
            <div className="cake-pills cake-pills-wrap">
              {SHOP_CATEGORIES.map(([title]) => (
                <button
                  key={title}
                  type="button"
                  className={type === title ? "active" : ""}
                  aria-pressed={type === title}
                  onClick={() => pickType(title)}
                >
                  {title}
                </button>
              ))}
            </div>
          </fieldset>

          {type && (
            <>
              <label className="admin-edit-field">
                Name
                <input
                  type="text"
                  value={name}
                  maxLength={80}
                  placeholder="e.g. Salted caramel brownie"
                  onChange={(e) => setName(e.target.value)}
                />
              </label>
              <label className="admin-edit-field">
                Price (₹)
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </label>
              <label>
                Note
                <input
                  type="text"
                  value={note}
                  maxLength={120}
                  onChange={(e) => {
                    setNoteTouched(true);
                    setNote(e.target.value);
                  }}
                />
              </label>
              <label>
                Flavour one (optional)
                <input
                  type="text"
                  value={flavourOne}
                  maxLength={40}
                  placeholder="Milk"
                  onChange={(e) => setFlavourOne(e.target.value)}
                />
              </label>
              <label>
                Flavour two (optional)
                <input
                  type="text"
                  value={flavourTwo}
                  maxLength={40}
                  placeholder="Dark"
                  onChange={(e) => setFlavourTwo(e.target.value)}
                />
              </label>
              <fieldset className="cake-choice">
                <legend>Badge</legend>
                <div className="cake-pills cake-pills-wrap">
                  {ADMIN_BADGES.map((item) => (
                    <button
                      key={item || "none"}
                      type="button"
                      className={badge === item ? "active" : ""}
                      aria-pressed={badge === item}
                      onClick={() => setBadge(item)}
                    >
                      {item || "None"}
                    </button>
                  ))}
                </div>
              </fieldset>
              <label className="admin-check">
                <input
                  type="checkbox"
                  checked={bestSeller}
                  onChange={(e) => setBestSeller(e.target.checked)}
                />
                Show on Home as a best seller
              </label>

              <div className="admin-photos">
                <figure>
                  {hero ? (
                    <img src={hero} alt="Hero preview" />
                  ) : (
                    <div className="admin-photo-empty">Hero</div>
                  )}
                  <figcaption>Shop card</figcaption>
                  <label className="admin-upload">
                    {busy === "upload:hero" ? "Uploading…" : "Upload"}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      aria-label="Upload shop card"
                      disabled={Boolean(busy)}
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        event.target.value = "";
                        upload("hero", file);
                      }}
                    />
                  </label>
                </figure>
                <figure>
                  {detail ? (
                    <img src={detail} alt="Detail preview" />
                  ) : (
                    <div className="admin-photo-empty">Detail</div>
                  )}
                  <figcaption>Close-up</figcaption>
                  <label className="admin-upload">
                    {busy === "upload:detail" ? "Uploading…" : "Upload"}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      aria-label="Upload close-up"
                      disabled={Boolean(busy)}
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        event.target.value = "";
                        upload("detail", file);
                      }}
                    />
                  </label>
                </figure>
              </div>

              {error && <p className="field-error">{error}</p>}
              {done && <p className="form-success">{done}</p>}
              <div className="form-actions">
                <button
                  className="secondary"
                  type="button"
                  disabled={!canGenerate || Boolean(busy)}
                  onClick={generate}
                >
                  {busy === "generate" ? "Generating…" : "Generate photos"}
                  {busy !== "generate" && <ArrowRight size={17} />}
                </button>
                <button
                  className="primary"
                  type="submit"
                  disabled={!canPublish || Boolean(busy)}
                >
                  {busy === "publish"
                    ? "Saving…"
                    : editing
                      ? "Save changes"
                      : "Publish to shop"}
                  {busy !== "publish" && <ArrowRight size={17} />}
                </button>
              </div>
            </>
          )}
        </form>
        <aside className="cake-summary">
          <div>
            <span className="kicker">LIVE SHOP</span>
            <h3>All products</h3>
            <button
              className="secondary admin-new"
              type="button"
              onClick={() => {
                resetForm();
                setError("");
                setDone("");
              }}
            >
              New product
            </button>
            {products.length ? (
              SHOP_CATEGORIES.map(([title]) => {
                const group = products.filter((item) => item.type === title);
                if (!group.length) return null;
                return (
                  <div className="admin-menu-group" key={title}>
                    <h4>{title}</h4>
                    <ul className="admin-extra-list">
                      {group.map((item) => (
                        <li
                          key={item.slug || item.id}
                          className={editing?.slug === item.slug ? "active" : ""}
                        >
                          <button
                            type="button"
                            className="admin-menu-edit"
                            aria-label={`Edit ${item.name}`}
                            onClick={() => loadProduct(item)}
                          >
                            {item.name}
                            <small>₹{item.price}</small>
                          </button>
                          <button
                            type="button"
                            className="admin-menu-delete"
                            aria-label={`Delete ${item.name}`}
                            disabled={Boolean(busy)}
                            onClick={() => remove(item)}
                          >
                            {busy === `delete:${item.slug}` ? "Removing…" : "Delete"}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })
            ) : (
              <p>Nothing on the shop yet. Create a product, then publish.</p>
            )}
          </div>
        </aside>
      </section>
    </main>
  );
}
