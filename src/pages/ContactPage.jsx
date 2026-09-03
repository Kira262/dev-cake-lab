import { useEffect, useState } from "react";
import { ArrowRight, Mail, Phone } from "lucide-react";
import { FulfilmentFields } from "../components/FulfilmentFields.jsx";
import { IdentityFields } from "../components/IdentityFields.jsx";
import { NeededByFields } from "../components/NeededByFields.jsx";
import { CONTACTS, whatsappOrderUrl } from "../data/contacts.js";
import { orderMessage } from "../lib/cart.js";
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
  scheduleRequired,
  validateAddress,
  validateArea,
  validateEmail,
  validateMessage,
  validateName,
  validateNeededBy,
  validateNeededTime,
  validatePhone,
} from "../lib/validate.js";

export function ContactPage({
  cart = [],
  total = 0,
  orderTicket = 0,
  navigate,
}) {
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
  const [message, setMessage] = useState(() => orderMessage(cart, total));

  useEffect(() => {
    setMessage(orderMessage(cart, total));
  }, [orderTicket]);

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

  const topic = cart.length ? "Menu order" : "Enquiry";
  const minDays = minLeadDays(topic);
  const dateRequired = scheduleRequired({ fulfilment });
  const canWhatsApp =
    fulfilmentReady(fulfilment, address) &&
    scheduleReady({
      neededBy,
      neededTime,
      required: dateRequired,
      minDays,
    });
  const whatsappHref = whatsappOrderUrl(
    enquiryWhatsAppText({
      name: name.trim(),
      phone: phone.trim(),
      topic,
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
    const needDate = scheduleRequired({ fulfilment: values.fulfilment });
    const nameResult = forEmail
      ? validateName(values.name)
      : { ok: true, value: values.name };
    const emailResult = validateEmail(values.email, { optional: true });
    const phoneResult = forEmail
      ? validatePhone(values.phone)
      : { ok: true, value: values.phone };
    const messageResult = validateMessage(values.message);
    const areaResult = validateArea(values.area, { required: false });
    const addressResult = validateAddress(values.address, {
      required: delivery,
    });
    const dateResult = validateNeededBy(values.neededBy, {
      required: needDate,
      minDays,
    });
    const timeResult = validateNeededTime(values.neededTime, {
      required: needDate,
    });
    return {
      errors: {
        name: nameResult.ok ? "" : nameResult.error,
        email: emailResult.ok ? "" : emailResult.error,
        phone: phoneResult.ok ? "" : phoneResult.error,
        message: messageResult.ok ? "" : messageResult.error,
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
        topic,
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
          WhatsApp is fastest. Email if you prefer not to chat.{" "}
          {navigate ? (
            <button type="button" className="text-link" onClick={() => navigate("/custom")}>
              Custom cakes have their own brief.
            </button>
          ) : (
            "Custom cakes have their own brief."
          )}
        </p>
      </section>
      <section className="wrap contact">
        <form className="contact-form" onSubmit={sendEmail} noValidate>
          {/* <label className="honeypot" aria-hidden="true">
            Company
            <input
              tabIndex={-1}
              autoComplete="off"
              value={honey}
              onChange={(e) => setHoney(e.target.value)}
            />
          </label>
          <NeededByFields
            idPrefix="enquiry"
            neededBy={neededBy}
            onNeededBy={setNeededBy}
            neededTime={neededTime}
            onNeededTime={setNeededTime}
            minDays={minDays}
            required={dateRequired}
            dateError={showError("neededBy") ? errors.neededBy : ""}
            timeError={showError("neededTime") ? errors.neededTime : ""}
          />
          <FulfilmentFields
            idPrefix="enquiry"
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
          /> */}
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
              placeholder="Flavour, size, notes…"
            />
            {showError("message") && (
              <span className="field-error" id="enquiry-message-error">
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
            <p className="field-hint">
              Opens a draft — tap Send in WhatsApp or we won't see the order.
            </p>
            {/* <button
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
            </button> */}
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
              <a href={`mailto:${CONTACTS.email}`}>{CONTACTS.email}</a>
            </p>
          </div>
          <div>
            <span className="social-icon">◎</span>
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
