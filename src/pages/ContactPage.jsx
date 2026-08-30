import { useEffect, useState } from "react";
import { ArrowRight, Mail, Phone } from "lucide-react";
import { InstagramIcon } from "../components/InstagramIcon.jsx";
import { FulfilmentFields } from "../components/FulfilmentFields.jsx";
import { NeededByFields } from "../components/NeededByFields.jsx";
import { CONTACTS, gmailComposeUrl, whatsappOrderUrl } from "../data/contacts.js";
import { orderMessage } from "../lib/cart.js";
import { readEnquiryDraft, saveEnquiryDraft } from "../lib/draft.js";
import { enquiryWhatsAppText, submitEnquiry } from "../lib/enquiry.js";
import {
  EMAIL_MAX,
  ENQUIRY_TOPICS,
  FULFILMENT,
  MESSAGE_MAX,
  NAME_MAX,
  fulfilmentReady,
  minLeadDays,
  safeArea,
  safeFulfilment,
  safeTimeSlot,
  safeTopic,
  scheduleReady,
  scheduleRequired,
  validateAddress,
  validateArea,
  validateEmail,
  validateMessage,
  validateName,
  validateNeededBy,
  validatePhone,
  validateTimeSlot,
} from "../lib/validate.js";

export function ContactPage({ cart = [], total = 0, orderTicket = 0 }) {
  const draft = readEnquiryDraft();
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [attempted, setAttempted] = useState(false);
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
  const [slot, setSlot] = useState(() => safeTimeSlot(draft.slot));
  const [honey, setHoney] = useState("");
  const [topic, setTopic] = useState(
    cart.length ? "Menu order" : "Custom cake",
  );
  const [message, setMessage] = useState(() => orderMessage(cart, total));

  useEffect(() => {
    setMessage(orderMessage(cart, total));
  }, [orderTicket]);

  useEffect(() => {
    if (cart.length) setTopic("Menu order");
  }, [orderTicket, cart.length]);

  useEffect(() => {
    saveEnquiryDraft({
      name,
      email,
      phone,
      fulfilment,
      address,
      area,
      neededBy,
      slot,
    });
  }, [name, email, phone, fulfilment, address, area, neededBy, slot]);

  const topics = cart.length
    ? ENQUIRY_TOPICS
    : ENQUIRY_TOPICS.filter((item) => item !== "Menu order");
  const chosenTopic = safeTopic(topic, { allowMenuOrder: cart.length > 0 });
  const minDays = minLeadDays(chosenTopic);
  const dateRequired = scheduleRequired({
    fulfilment,
    topic: chosenTopic,
    hasCart: cart.length > 0,
  });
  const canWhatsApp =
    fulfilmentReady(fulfilment, address, area) &&
    scheduleReady({
      neededBy,
      slot,
      required: dateRequired,
      minDays,
    });
  const whatsappHref = whatsappOrderUrl(
    enquiryWhatsAppText({
      name: name.trim(),
      phone: phone.trim(),
      topic: chosenTopic,
      message,
      fulfilment,
      address,
      area,
      neededBy,
      slot,
    }),
  );

  const collectErrors = (values) => {
    const nameResult = validateName(values.name);
    const emailResult = validateEmail(values.email, { optional: true });
    const phoneResult = validatePhone(values.phone);
    const messageResult = validateMessage(values.message);
    const delivery = safeFulfilment(values.fulfilment) === FULFILMENT.delivery;
    const needDate = scheduleRequired({
      fulfilment: values.fulfilment,
      topic: chosenTopic,
      hasCart: cart.length > 0,
    });
    const lead = minLeadDays(chosenTopic);
    const areaResult = validateArea(values.area, { required: delivery });
    const addressResult = validateAddress(values.address, {
      required: delivery,
    });
    const dateResult = validateNeededBy(values.neededBy, {
      required: needDate,
      minDays: lead,
    });
    const slotResult = validateTimeSlot(values.slot, { required: needDate });
    return {
      errors: {
        name: nameResult.ok ? "" : nameResult.error,
        email: emailResult.ok ? "" : emailResult.error,
        phone: phoneResult.ok ? "" : phoneResult.error,
        message: messageResult.ok ? "" : messageResult.error,
        area: areaResult.ok ? "" : areaResult.error,
        address: addressResult.ok ? "" : addressResult.error,
        neededBy: dateResult.ok ? "" : dateResult.error,
        slot: slotResult.ok ? "" : slotResult.error,
      },
      values:
        nameResult.ok &&
        emailResult.ok &&
        phoneResult.ok &&
        messageResult.ok &&
        areaResult.ok &&
        addressResult.ok &&
        dateResult.ok &&
        slotResult.ok
          ? {
              name: nameResult.value,
              email: emailResult.value,
              phone: phoneResult.value,
              message: messageResult.value,
              address: addressResult.value,
              area: areaResult.value,
              neededBy: dateResult.value,
              slot: slotResult.value,
              fulfilment: safeFulfilment(values.fulfilment),
            }
          : null,
    };
  };

  const showError = (field) => attempted && errors[field];
  const fieldValues = {
    name,
    email,
    phone,
    message,
    address,
    area,
    neededBy,
    slot,
    fulfilment,
  };

  const sendEmail = async (e) => {
    e.preventDefault();
    setAttempted(true);
    setSent(false);
    setSendError("");
    const result = collectErrors(fieldValues);
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
        topic: chosenTopic,
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
        <span className="kicker">GET IN TOUCH</span>
        <h1>
          Let's make <i>something sweet.</i>
        </h1>
        <p>
          Fastest on WhatsApp. Pickup is free at Paldi. Delivery charges
          depend on your area — we'll confirm before sending.
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
          <label>
            Your name
            <input
              id="enquiry-name"
              name="name"
              autoComplete="name"
              maxLength={NAME_MAX}
              value={name}
              aria-invalid={showError("name") ? "true" : "false"}
              aria-describedby={showError("name") ? "enquiry-name-error" : undefined}
              className={showError("name") ? "invalid" : ""}
              onChange={(e) => setName(e.target.value)}
              onBlur={() =>
                attempted &&
                setErrors((current) => ({
                  ...current,
                  name: collectErrors(fieldValues).errors.name,
                }))
              }
              placeholder="Dev's favourite human"
            />
            <span className="field-hint" aria-hidden="true">
              Max {NAME_MAX} characters
            </span>
            {showError("name") && (
              <span className="field-error" id="enquiry-name-error">
                {errors.name}
              </span>
            )}
          </label>
          <label>
            Phone
            <input
              id="enquiry-phone"
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={phone}
              aria-invalid={showError("phone") ? "true" : "false"}
              aria-describedby={
                showError("phone") ? "enquiry-phone-error" : undefined
              }
              className={showError("phone") ? "invalid" : ""}
              onChange={(e) => setPhone(e.target.value)}
              onBlur={() =>
                attempted &&
                setErrors((current) => ({
                  ...current,
                  phone: collectErrors(fieldValues).errors.phone,
                }))
              }
              placeholder="+91 98765 43210"
            />
            {showError("phone") && (
              <span className="field-error" id="enquiry-phone-error">
                {errors.phone}
              </span>
            )}
          </label>
          <label>
            Email (optional)
            <input
              id="enquiry-email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              maxLength={EMAIL_MAX}
              value={email}
              aria-invalid={showError("email") ? "true" : "false"}
              aria-describedby={
                showError("email") ? "enquiry-email-error" : undefined
              }
              className={showError("email") ? "invalid" : ""}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() =>
                attempted &&
                setErrors((current) => ({
                  ...current,
                  email: collectErrors(fieldValues).errors.email,
                }))
              }
              placeholder="you@example.com"
            />
            <span className="field-hint" aria-hidden="true">
              Max {EMAIL_MAX} characters
            </span>
            {showError("email") && (
              <span className="field-error" id="enquiry-email-error">
                {errors.email}
              </span>
            )}
          </label>
          <NeededByFields
            idPrefix="enquiry"
            neededBy={neededBy}
            onNeededBy={setNeededBy}
            slot={slot}
            onSlot={setSlot}
            minDays={minDays}
            dateError={showError("neededBy") ? errors.neededBy : ""}
            slotError={showError("slot") ? errors.slot : ""}
          />
          <FulfilmentFields
            idPrefix="enquiry"
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
            What can we make?
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            >
              {topics.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label>
            Tell us more
            <textarea
              id="enquiry-message"
              name="message"
              rows="5"
              maxLength={MESSAGE_MAX}
              value={message}
              aria-invalid={showError("message") ? "true" : "false"}
              aria-describedby={
                showError("message") ? "enquiry-message-error" : undefined
              }
              className={showError("message") ? "invalid" : ""}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Flavour, size, budget, occasion..."
            ></textarea>
            <span className="field-hint" aria-hidden="true">
              {message.length.toLocaleString("en-IN")} /{" "}
              {MESSAGE_MAX.toLocaleString("en-IN")} characters · max about 200
              words
            </span>
            {showError("message") && (
              <span className="field-error" id="enquiry-message-error">
                {errors.message}
              </span>
            )}
          </label>
          {cart.length > 0 && (
            <p className="form-success">
              Your bag ({cart.reduce((sum, item) => sum + item.qty, 0)} items ·
              ₹{total.toLocaleString("en-IN")}) is included in this enquiry.
            </p>
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
              WhatsApp this enquiry <ArrowRight size={17} />
            </a>
            <button className="secondary" type="submit" disabled={sending}>
              {sending ? "Sending…" : "Send email"}
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
            <Phone size={18} />
            <h3>Call</h3>
            <p>
              <a href={`tel:${CONTACTS.phoneTel}`}>{CONTACTS.phoneDisplay}</a>
            </p>
          </div>
          <div>
            <Mail size={18} />
            <h3>Email</h3>
            <p>
              <a
                href={gmailComposeUrl()}
                target="_blank"
                rel="noopener noreferrer"
              >
                {CONTACTS.email}
              </a>
            </p>
          </div>
          <div>
            <InstagramIcon className="social-icon" size={18} />
            <h3>Instagram</h3>
            <p>
              <a
                href={CONTACTS.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {CONTACTS.instagram}
              </a>
            </p>
          </div>
        </aside>
      </section>
    </main>
  );
}
