import { useEffect, useState } from "react";
import { ArrowRight, Mail, Phone } from "lucide-react";
import { CONTACTS, gmailComposeUrl } from "../data/contacts.js";
import { orderMessage } from "../lib/cart.js";

export function ContactPage({ cart = [], total = 0, orderTicket = 0 }) {
  const [sent, setSent] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
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

  const sendEnquiry = (e) => {
    e.preventDefault();
    const body = [
      `Name: ${name}`,
      `Email: ${email}`,
      `Topic: ${topic}`,
      "",
      message,
    ].join("\n");
    const href = gmailComposeUrl({
      subject: `Dev's Cake Lab enquiry — ${topic}`,
      body,
    });
    window.open(href, "_blank", "noopener,noreferrer");
    setSent(true);
  };

  return (
    <main>
      <section className="page-hero wrap">
        <span className="kicker">GET IN TOUCH</span>
        <h1>
          Let's make <i>something sweet.</i>
        </h1>
        <p>Custom cakes, flavour enquiries and collaborations.</p>
      </section>
      <section className="wrap contact">
        <form className="contact-form" onSubmit={sendEnquiry}>
          <label>
            Your name
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Dev's favourite human"
            />
          </label>
          <label>
            Email
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </label>
          <label>
            What can we make?
            <select value={topic} onChange={(e) => setTopic(e.target.value)}>
              {cart.length > 0 && <option>Menu order</option>}
              <option>Custom cake</option>
              <option>Collaboration</option>
            </select>
          </label>
          <label>
            Tell us more
            <textarea
              rows="5"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Date, flavour, size, budget, occasion..."
            ></textarea>
          </label>
          {cart.length > 0 && (
            <p className="form-success">
              Your bag ({cart.reduce((sum, item) => sum + item.qty, 0)} items ·
              ₹{total.toLocaleString("en-IN")}) is included in this enquiry.
            </p>
          )}
          <button className="primary" type="submit">
            Send enquiry <ArrowRight size={17} />
          </button>
          {sent && (
            <p className="form-success">
              Gmail should open with this enquiry to {CONTACTS.email}.
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
