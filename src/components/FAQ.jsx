import { useState } from "react";
import { Minus, Plus } from "lucide-react";

export function FAQ() {
  const questions = [
    "How far ahead should I order a custom cake?",
    "Do you offer eggless or less-sweet options?",
    "How do I store my cake or desserts?",
  ];
  const [open, setOpen] = useState(0);
  return (
    <section className="wrap faq section">
      <div>
        <span className="kicker">QUESTIONS, ANSWERED</span>
        <h2>Frequently asked</h2>
        <p>Everything you need before placing an order.</p>
      </div>
      <div>
        {questions.map((q, i) => (
          <button
            key={q}
            className="faq-row"
            onClick={() => setOpen(open === i ? -1 : i)}
          >
            <span>{q}</span>
            {open === i ? <Minus size={16} /> : <Plus size={16} />}{" "}
            {open === i && (
              <small>
                {i === 0
                  ? "For custom cakes, 2–4 days is ideal. Rush orders depend on availability."
                  : i === 1
                    ? "Yes. Message us with your preference and we will suggest suitable flavours."
                    : "Most cakes should be refrigerated and brought to room temperature before serving."}
              </small>
            )}
          </button>
        ))}
      </div>
    </section>
  );
}
