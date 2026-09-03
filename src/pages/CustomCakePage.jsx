import { useEffect, useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import { FulfilmentFields } from "../components/FulfilmentFields.jsx";
import { IdentityFields } from "../components/IdentityFields.jsx";
import { NeededByFields } from "../components/NeededByFields.jsx";
import {
  CAKE_FLAVOURS,
  CAKE_OCCASIONS,
  CAKE_SHAPES,
  CAKE_SPONGES,
  CAKE_WEIGHTS,
} from "../data/customCake.js";
import { CONTACTS, mapsLink, whatsappOrderUrl } from "../data/contacts.js";
import {
  cakeShapeLabel,
  cakeWeightLabel,
  customCakeBriefReady,
  formatCustomCakeBrief,
} from "../lib/customCake.js";
import { readEnquiryDraft, saveEnquiryDraft } from "../lib/draft.js";
import { enquiryWhatsAppText, submitEnquiry } from "../lib/enquiry.js";
import { parseNeededTime } from "../lib/schedule.js";
import {
  FULFILMENT,
  MESSAGE_MAX,
  NOTES_MAX,
  fulfilmentReady,
  minLeadDays,
  safeArea,
  safeFulfilment,
  scheduleReady,
  validateAddress,
  validateArea,
  validateEmail,
  validateMessage,
  validateName,
  validateNeededBy,
  validateNeededTime,
  validatePhone,
} from "../lib/validate.js";

const TOPIC = "Custom cake";
const BRIEF_ERROR = "Tell us the occasion, size, and flavour.";

function ChoiceGroup({ legend, children }) {
  return (
    <fieldset className="cake-choice">
      <legend>{legend}</legend>
      {children}
    </fieldset>
  );
}

export function CustomCakePage() {
  const draft = readEnquiryDraft();
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [attempted, setAttempted] = useState(false);
  const [emailMode, setEmailMode] = useState(false);
  const [errors, setErrors] = useState({});
  const [name, setName] = useState(() => draft.name || "");
  const [email, setEmail] = useState(() => draft.email || "");
  const [phone, setPhone] = useState(() => draft.phone || "");
  const [fulfilment, setFulfilment] = useState(() =>
    safeFulfilment(draft.fulfilment),
  );
  const [address, setAddress] = useState(() => draft.address || "");
  const [area, setArea] = useState(() => safeArea(draft.area));
  const [neededBy, setNeededBy] = useState(() => draft.neededBy || "");
  const [neededTime, setNeededTime] = useState(
    () => parseNeededTime(draft.neededTime),
  );
  const [honey, setHoney] = useState("");
  const [weightId, setWeightId] = useState("");
  const [customWeight, setCustomWeight] = useState("");
  const [shapeId, setShapeId] = useState("");
  const [occasion, setOccasion] = useState("");
  const [sponge, setSponge] = useState("");
  const [flavour, setFlavour] = useState("");
  const [design, setDesign] = useState("");
  const [cakeMessage, setCakeMessage] = useState("");
  const [allergies, setAllergies] = useState("");

  useEffect(() => {
    saveEnquiryDraft({
      name,
      email,
      phone,
      fulfilment,
      address,
      area,
      neededBy,
      neededTime,
    });
  }, [name, email, phone, fulfilment, address, area, neededBy, neededTime]);

  const brief = useMemo(
    () => ({
      weightId,
      customWeight,
      shapeId,
      occasion,
      sponge,
      flavour,
      design,
      cakeMessage,
      allergies,
    }),
    [
      weightId,
      customWeight,
      shapeId,
      occasion,
      sponge,
      flavour,
      design,
      cakeMessage,
      allergies,
    ],
  );
  const message = formatCustomCakeBrief(brief);
  const briefReady = customCakeBriefReady(brief);
  const minDays = minLeadDays(TOPIC);
  const dateOk = scheduleReady({
    neededBy,
    neededTime,
    required: true,
    minDays,
  });
  const canWhatsApp =
    fulfilmentReady(fulfilment, address) && dateOk && briefReady;
  const whatsappHref = whatsappOrderUrl(
    enquiryWhatsAppText({
      name: name.trim(),
      phone: phone.trim(),
      topic: TOPIC,
      message,
      fulfilment,
      address,
      area,
      neededBy,
      time: neededTime,
    }),
  );

  const summary = {
    weight: cakeWeightLabel(brief) || "—",
    shape: cakeShapeLabel(shapeId) || "—",
    occasion: occasion || "—",
    sponge: sponge || "—",
    flavour: flavour || "—",
  };

  const fieldValues = {
    name,
    email,
    phone,
    message,
    address,
    area,
    neededBy,
    neededTime,
    fulfilment,
    briefReady,
  };

  const collectErrors = (values, { forEmail = false } = {}) => {
    const delivery = safeFulfilment(values.fulfilment) === FULFILMENT.delivery;
    const nameResult = forEmail
      ? validateName(values.name)
      : { ok: true, value: values.name };
    const emailResult = validateEmail(values.email, { optional: true });
    const phoneResult = forEmail
      ? validatePhone(values.phone)
      : { ok: true, value: values.phone };
    const messageResult = validateMessage(values.message);
    const notesOk = values.briefReady && messageResult.ok;
    const areaResult = validateArea(values.area, { required: false });
    const addressResult = validateAddress(values.address, {
      required: delivery,
    });
    const dateResult = validateNeededBy(values.neededBy, {
      required: true,
      minDays,
    });
    const timeResult = validateNeededTime(values.neededTime, { required: true });
    return {
      errors: {
        name: nameResult.ok ? "" : nameResult.error,
        email: emailResult.ok ? "" : emailResult.error,
        phone: phoneResult.ok ? "" : phoneResult.error,
        message: notesOk ? "" : BRIEF_ERROR,
        area: areaResult.ok ? "" : areaResult.error,
        address: addressResult.ok ? "" : addressResult.error,
        neededBy: dateResult.ok ? "" : dateResult.error,
        neededTime: timeResult.ok ? "" : timeResult.error,
      },
      values:
        nameResult.ok &&
        emailResult.ok &&
        phoneResult.ok &&
        notesOk &&
        areaResult.ok &&
        addressResult.ok &&
        dateResult.ok &&
        timeResult.ok
          ? {
              name: nameResult.value,
              email: emailResult.value,
              phone: phoneResult.value,
              message: messageResult.value,
              address: addressResult.value,
              area: areaResult.value,
              neededBy: dateResult.value,
              neededTime: timeResult.value,
              fulfilment: safeFulfilment(values.fulfilment),
            }
          : null,
    };
  };

  const showError = (field) => attempted && errors[field];

  const sendEmail = async (e) => {
    e.preventDefault();
    if (!emailMode) {
      setEmailMode(true);
      return;
    }
    setAttempted(true);
    setSent(false);
    setSendError("");
    const result = collectErrors(fieldValues, { forEmail: true });
    setErrors(result.errors);
    if (!result.values || sending) return;
    if (honey) {
      setSent(true);
      return;
    }
    setSending(true);
    try {
      await submitEnquiry({
        ...result.values,
        topic: TOPIC,
      });
      setSent(true);
    } catch (err) {
      setSendError(
        err instanceof Error
          ? err.message
          : "Could not send this enquiry. Please try again.",
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <main>
      <section className="page-hero wrap">
        <span className="kicker">CUSTOM CAKES</span>
        <h1>
          Made for your <i>date.</i>
        </h1>
        <p>
          Pick the size and flavour here. We quote, tweak the design, and take
          payment on WhatsApp — send reference photos in the chat after you tap
          Send.
        </p>
      </section>
      <section className="wrap contact custom-cake">
        <form className="contact-form" onSubmit={sendEmail} noValidate>
          <label className="honeypot" aria-hidden="true">
            Company
            <input
              tabIndex={-1}
              autoComplete="off"
              value={honey}
              onChange={(e) => setHoney(e.target.value)}
            />
          </label>

          <ChoiceGroup legend="Cake weight">
            <div className="cake-pills">
              {CAKE_WEIGHTS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={weightId === item.id ? "active" : ""}
                  aria-pressed={weightId === item.id}
                  onClick={() => setWeightId(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>
            {weightId === "custom" && (
              <label className="cake-nested">
                Custom weight
                <input
                  type="text"
                  value={customWeight}
                  maxLength={40}
                  placeholder="e.g. 3 kg, 24 cupcakes"
                  onChange={(e) => setCustomWeight(e.target.value)}
                />
              </label>
            )}
          </ChoiceGroup>

          <ChoiceGroup legend="Tall or wide">
            <div className="cake-shape">
              {CAKE_SHAPES.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={shapeId === item.id ? "active" : ""}
                  aria-pressed={shapeId === item.id}
                  onClick={() => setShapeId(item.id)}
                >
                  <strong>{item.label}</strong>
                  <span>{item.hint}</span>
                </button>
              ))}
            </div>
          </ChoiceGroup>

          <ChoiceGroup legend="Occasion">
            <div className="cake-pills cake-pills-wrap">
              {CAKE_OCCASIONS.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={occasion === item ? "active" : ""}
                  aria-pressed={occasion === item}
                  onClick={() => setOccasion(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </ChoiceGroup>

          <div className="cake-pair">
            <label>
              Sponge
              <select
                value={sponge}
                onChange={(e) => setSponge(e.target.value)}
              >
                <option value="">Select sponge</option>
                {CAKE_SPONGES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Flavour / filling
              <select
                value={flavour}
                onChange={(e) => setFlavour(e.target.value)}
              >
                <option value="">Select flavour</option>
                {CAKE_FLAVOURS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <NeededByFields
            idPrefix="custom"
            neededBy={neededBy}
            onNeededBy={setNeededBy}
            neededTime={neededTime}
            onNeededTime={setNeededTime}
            minDays={minDays}
            required
            dateError={showError("neededBy") ? errors.neededBy : ""}
            timeError={showError("neededTime") ? errors.neededTime : ""}
          />
          <FulfilmentFields
            idPrefix="custom"
            compact
            fulfilment={fulfilment}
            onFulfilment={(next) => {
              setFulfilment(next);
              if (next === FULFILMENT.pickup) {
                setErrors((current) => ({
                  ...current,
                  address: "",
                  area: "",
                }));
              }
            }}
            area={area}
            onArea={setArea}
            address={address}
            onAddress={setAddress}
            areaError={showError("area") ? errors.area : ""}
            addressError={showError("address") ? errors.address : ""}
          />

          <label>
            Design notes
            <textarea
              id="custom-message"
              name="message"
              rows="4"
              maxLength={MESSAGE_MAX}
              value={design}
              aria-invalid={showError("message") ? "true" : "false"}
              aria-describedby={
                showError("message") ? "custom-message-error" : "custom-message-hint"
              }
              className={showError("message") ? "invalid" : ""}
              onChange={(e) => setDesign(e.target.value)}
              placeholder="Theme, colours, flowers, toppers — or skip and tell us on WhatsApp."
            />
            <span className="field-hint" id="custom-message-hint">
              Occasion, size, and flavour can also go here if you skipped the
              buttons above.
            </span>
            {showError("message") && (
              <span className="field-error" id="custom-message-error">
                {errors.message}
              </span>
            )}
          </label>

          <label>
            Message on cake
            <input
              type="text"
              maxLength={NOTES_MAX}
              value={cakeMessage}
              onChange={(e) => setCakeMessage(e.target.value)}
              placeholder="Happy birthday Aya"
            />
          </label>

          <label>
            Allergies / special requests
            <textarea
              rows="3"
              maxLength={NOTES_MAX}
              value={allergies}
              onChange={(e) => setAllergies(e.target.value)}
              placeholder="Nut-free, less sweet"
            />
          </label>

          <p className="cake-quote-note">
            Orders are confirmed after we quote on WhatsApp. Advance (usually
            50%) is taken there — not on this site.
          </p>

          {emailMode && (
            <IdentityFields
              name={name}
              onName={setName}
              phone={phone}
              onPhone={setPhone}
              email={email}
              onEmail={setEmail}
              showError={showError}
              errors={errors}
            />
          )}
          {sendError && <p className="field-error">{sendError}</p>}
          <div className="form-actions">
            <a
              className="primary"
              href={canWhatsApp ? whatsappHref : undefined}
              target="_blank"
              rel="noopener noreferrer"
              aria-disabled={canWhatsApp ? undefined : "true"}
              onClick={(e) => {
                if (canWhatsApp) return;
                e.preventDefault();
                setAttempted(true);
                setErrors(collectErrors(fieldValues).errors);
              }}
            >
              WhatsApp this cake <ArrowRight size={17} />
            </a>
            <p className="field-hint">
              Opens a draft — tap Send in WhatsApp or we won't see the order.
            </p>
            <button
              className="secondary"
              type={emailMode ? "submit" : "button"}
              disabled={sending}
              onClick={
                emailMode
                  ? undefined
                  : () => {
                      setEmailMode(true);
                    }
              }
            >
              {sending ? "Sending…" : emailMode ? "Send email" : "Email instead"}
              {!sending && <ArrowRight size={17} />}
            </button>
          </div>
          {sent && (
            <p className="form-success">
              Enquiry sent to {CONTACTS.email}. We will get back to you shortly.
            </p>
          )}
        </form>
        <aside className="cake-summary">
          <div>
            <h3>Your cake</h3>
            <dl className="cake-dl">
              <div>
                <dt>Weight</dt>
                <dd>{summary.weight}</dd>
              </div>
              <div>
                <dt>Shape</dt>
                <dd>{summary.shape}</dd>
              </div>
              <div>
                <dt>Occasion</dt>
                <dd>{summary.occasion}</dd>
              </div>
              <div>
                <dt>Sponge</dt>
                <dd>{summary.sponge}</dd>
              </div>
              <div>
                <dt>Flavour</dt>
                <dd>{summary.flavour}</dd>
              </div>
            </dl>
          </div>
          <div>
            <h3>Quote</h3>
            <p>
              No price on the site. Send the brief and we'll quote on WhatsApp,
              then take a 50% advance there.
            </p>
          </div>
          <div>
            <h3>Lead time</h3>
            <p>2–4 days. Rush orders depend on the diary — ask on WhatsApp.</p>
          </div>
          <div>
            <h3>Pickup</h3>
            <p>
              {CONTACTS.addressName}
              <br />
              {CONTACTS.addressLines.join(", ")}
            </p>
            <a
              className="maps-link"
              href={mapsLink()}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open in Google Maps
            </a>
          </div>
        </aside>
      </section>
    </main>
  );
}
