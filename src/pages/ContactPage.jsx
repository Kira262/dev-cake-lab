import { useEffect, useState } from "react";
import { ArrowRight, Mail, Phone } from "lucide-react";
import { InstagramIcon } from "../components/InstagramIcon.jsx";
import { CONTACTS, whatsappOrderUrl } from "../data/contacts.js";
import { orderMessage } from "../lib/cart.js";
import { readEnquiryDraft } from "../lib/draft.js";
import { enquiryWhatsAppText } from "../lib/enquiry.js";
import { MESSAGE_MAX, validateMessage } from "../lib/validate.js";

export function ContactPage({
  cart = [],
  total = 0,
  navigate,
}) {
  const draft = readEnquiryDraft();
  const [attempted, setAttempted] = useState(false);
  const bagText = orderMessage(cart, total);
  const [message, setMessage] = useState(() => bagText);

  useEffect(() => {
    setMessage(bagText);
  }, [bagText]);

  const topic = cart.length ? "Menu order" : "Enquiry";
  const messageResult = validateMessage(message);
  const canWhatsApp = messageResult.ok;
  const whatsappHref = whatsappOrderUrl(
    enquiryWhatsAppText({
      name: (draft.name || "").trim(),
      phone: (draft.phone || "").trim(),
      topic,
      message,
      fulfilment: draft.fulfilment,
      address: draft.address,
      area: draft.area,
      neededBy: draft.neededBy,
      time: draft.neededTime,
    }),
  );
  const messageError = attempted && !messageResult.ok ? messageResult.error : "";

  return (
    <main id="main-content">
      <section className="page-hero wrap">
        <span className="kicker">GET IN TOUCH</span>
        <h1>
          Let's make <i>something sweet.</i>
        </h1>
        <p>
          WhatsApp is fastest. Email if you prefer not to chat.{" "}
          {navigate ? (
            <button
              type="button"
              className="text-link"
              onClick={() => navigate("/custom")}
            >
              Custom cakes have their own brief.
            </button>
          ) : (
            "Custom cakes have their own brief."
          )}
        </p>
      </section>
      <section className="wrap contact">
        <form
          className="contact-form"
          onSubmit={(e) => e.preventDefault()}
          noValidate
        >
          <label>
            Tell us more
            <textarea
              id="enquiry-message"
              name="message"
              rows="5"
              maxLength={MESSAGE_MAX}
              value={message}
              aria-invalid={messageError ? "true" : "false"}
              aria-describedby={
                messageError ? "enquiry-message-error" : undefined
              }
              className={messageError ? "invalid" : ""}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Flavour, size, notes…"
            />
            {messageError && (
              <span className="field-error" id="enquiry-message-error">
                {messageError}
              </span>
            )}
          </label>
          {cart.length > 0 && (
            <p className="form-success">
              Your bag ({cart.reduce((sum, item) => sum + item.qty, 0)} items ·
              ₹{total.toLocaleString("en-IN")}) is included in this enquiry.
            </p>
          )}
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
              }}
            >
              WhatsApp this enquiry <ArrowRight size={17} />
            </a>
            <p className="field-hint">
              Opens a draft — tap Send in WhatsApp or we won't see the order.
            </p>
          </div>
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
            <span className="social-icon">
              <InstagramIcon size={18} />
            </span>
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
