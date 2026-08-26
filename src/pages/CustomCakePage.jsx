import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { FulfilmentFields } from "../components/FulfilmentFields.jsx";
import { IdentityFields } from "../components/IdentityFields.jsx";
import { NeededByFields } from "../components/NeededByFields.jsx";
import { CONTACTS, mapsLink, whatsappOrderUrl } from "../data/contacts.js";
import { readEnquiryDraft, saveEnquiryDraft } from "../lib/draft.js";
import { enquiryWhatsAppText, submitEnquiry } from "../lib/enquiry.js";
import { parseNeededTime } from "../lib/schedule.js";
import {
  FULFILMENT,
  MESSAGE_MAX,
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
  const [message, setMessage] = useState("");

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

  const minDays = minLeadDays(TOPIC);
  const dateOk = scheduleReady({
    neededBy,
    neededTime,
    required: true,
    minDays,
  });
  const canWhatsApp =
    fulfilmentReady(fulfilment, address) &&
    dateOk &&
    message.trim().length >= 6;
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
    const notesOk = String(values.message || "").trim().length >= 6;
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
        message:
          messageResult.ok && notesOk
            ? ""
            : messageResult.ok
              ? "Tell us the occasion, size, and flavour."
              : messageResult.error,
        area: areaResult.ok ? "" : areaResult.error,
        address: addressResult.ok ? "" : addressResult.error,
        neededBy: dateResult.ok ? "" : dateResult.error,
        neededTime: timeResult.ok ? "" : timeResult.error,
      },
      values:
        nameResult.ok &&
        emailResult.ok &&
        phoneResult.ok &&
        messageResult.ok &&
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
          Give us 2–4 days. Tell us the occasion, how many you're feeding, and
          the flavour — we'll sketch something on WhatsApp.
        </p>
      </section>
      <section className="wrap contact">
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
            Occasion, size, flavour
            <textarea
              id="custom-message"
              name="message"
              rows="5"
              maxLength={MESSAGE_MAX}
              value={message}
              aria-invalid={showError("message") ? "true" : "false"}
              aria-describedby={
                showError("message") ? "custom-message-error" : undefined
              }
              className={showError("message") ? "invalid" : ""}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Birthday for 12, vanilla sponge, less sweet, pale pink…"
            />
            {showError("message") && (
              <span className="field-error" id="custom-message-error">
                {errors.message}
              </span>
            )}
          </label>
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
        <aside>
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
          <div>
            <h3>Quotes</h3>
            <p>
              We don't price custom cakes on the site. Send the brief and we'll
              quote on WhatsApp.
            </p>
          </div>
        </aside>
      </section>
    </main>
  );
}
