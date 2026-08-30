import { useState } from "react";
import { Minus, Plus } from "lucide-react";

const ITEMS = [
  {
    q: "How far ahead should I order a custom cake?",
    a: "Give us 2–4 days. Rush orders depend on availability — ask on WhatsApp.",
  },
  {
    q: "How does pickup and delivery work?",
    a: "Pickup is free at 41, Pritam Nagar Rd, Pritam Nagar, Paldi, Ahmedabad, Gujarat 380006. Mon–Sat 10:00 AM–10:00 PM, Sunday 10:00 AM–8:00 PM. Delivery charges depend on your area; we quote on WhatsApp after we see the address. We do not calculate fees on the site.",
  },
  {
    q: "Do you offer eggless or less-sweet options?",
    a: "Yes. Add it in the packing notes or tell us on WhatsApp and we will suggest suitable flavours.",
  },
  {
    q: "How do I store my cake or desserts?",
    a: "Most cakes should be refrigerated and brought to room temperature before serving.",
  },
];

export function FAQ() {
  const [open, setOpen] = useState(0);
  return (
    <section className="wrap faq section">
      <div>
        <span className="kicker">QUESTIONS, ANSWERED</span>
        <h2>Frequently asked</h2>
        <p>Everything you need before placing an order.</p>
      </div>
      <div>
        {ITEMS.map((item, i) => (
          <button
            key={item.q}
            className="faq-row"
            onClick={() => setOpen(open === i ? -1 : i)}
          >
            <span>{item.q}</span>
            {open === i ? <Minus size={16} /> : <Plus size={16} />}{" "}
            {open === i && <small>{item.a}</small>}
          </button>
        ))}
      </div>
    </section>
  );
}
