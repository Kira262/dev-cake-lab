import { useEffect, useState } from "react";
import { ArrowRight, Minus, Plus, X } from "lucide-react";
import { DessertArt } from "./DessertArt.jsx";
import { FulfilmentFields } from "./FulfilmentFields.jsx";
import { TimePicker } from "./TimePicker.jsx";
import { whatsappOrderUrl } from "../data/contacts.js";
import { orderWhatsAppText } from "../lib/cart.js";
import { readEnquiryDraft, saveEnquiryDraft } from "../lib/draft.js";
import { isoDateFromToday, parseISODate } from "../lib/schedule.js";
import { safeFulfilment, safeTimeSlot } from "../lib/validate.js";

export function Cart({
  open,
  setOpen,
  cart,
  total,
  changeQty,
  navigate,
  startOrder,
}) {
  const draft = readEnquiryDraft();
  const [fulfilment, setFulfilment] = useState(() =>
    safeFulfilment(draft.fulfilment),
  );
  const [address, setAddress] = useState(() => draft.address || "");
  const [neededBy, setNeededBy] = useState(
    () => (parseISODate(draft.neededBy) ? draft.neededBy : ""),
  );
  const [slot, setSlot] = useState(() => safeTimeSlot(draft.slot));

  useEffect(() => {
    if (!open) return;
    const saved = readEnquiryDraft();
    setFulfilment(safeFulfilment(saved.fulfilment));
    setAddress(saved.address || "");
    setNeededBy(parseISODate(saved.neededBy) ? saved.neededBy : "");
    setSlot(safeTimeSlot(saved.slot));
  }, [open]);

  useEffect(() => {
    saveEnquiryDraft({ fulfilment, address, neededBy, slot });
  }, [fulfilment, address, neededBy, slot]);

  const whatsappHref = whatsappOrderUrl(
    orderWhatsAppText(cart, total, { fulfilment, address, neededBy, slot }),
  );

  return (
    <>
      {open && <div className="overlay" onClick={() => setOpen(false)} />}
      <aside className={`cart ${open ? "open" : ""}`}>
        <div className="cart-head">
          <div>
            <span className="kicker">YOUR ORDER</span>
            <h2>Sweet things</h2>
          </div>
          <button onClick={() => setOpen(false)}>
            <X />
          </button>
        </div>
        {cart.length ? (
          <>
            <div className="cart-items">
              {cart.map((item) => (
                <div className="cart-item" key={item.lineId}>
                  <div className="cart-art">
                    {item.image ? (
                      <img src={item.image} alt="" />
                    ) : (
                      <DessertArt type={item.art} />
                    )}
                  </div>
                  <div>
                    <b>{item.name}</b>
                    <small>
                      ₹{item.price.toLocaleString("en-IN")}
                      {item.notes ? ` · ${item.notes}` : ""}
                    </small>
                    <div className="qty">
                      <button onClick={() => changeQty(item.lineId, -1)}>
                        <Minus size={13} />
                      </button>
                      <span>{item.qty}</span>
                      <button onClick={() => changeQty(item.lineId, 1)}>
                        <Plus size={13} />
                      </button>
                    </div>
                  </div>
                  <button
                    className="remove"
                    onClick={() => changeQty(item.lineId, -item.qty)}
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
            <div className="cart-foot">
              <div className="cart-subtotal">
                <span>Subtotal</span>
                <strong>₹{total.toLocaleString("en-IN")}</strong>
              </div>
              <label className="fulfil-address">
                When
                <input
                  id="cart-needed-by"
                  name="neededBy"
                  type="date"
                  min={isoDateFromToday(0)}
                  max={isoDateFromToday(60)}
                  value={neededBy}
                  onChange={(e) => setNeededBy(e.target.value)}
                />
                <span className="field-hint">
                  Optional — or skip and tell us on WhatsApp.
                </span>
              </label>
              <TimePicker
                idPrefix="cart"
                value={slot}
                onChange={setSlot}
              />
              <FulfilmentFields
                idPrefix="cart"
                compact
                fulfilment={fulfilment}
                onFulfilment={setFulfilment}
                address={address}
                onAddress={setAddress}
              />
              <a
                className="primary"
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
              >
                Order on WhatsApp <ArrowRight size={17} />
              </a>
              <button type="button" className="text-link" onClick={startOrder}>
                Email instead
              </button>
            </div>
          </>
        ) : (
          <div className="empty-cart">
            <div className="empty-cookie">♡</div>
            <h3>Your bag is waiting.</h3>
            <p>Add a cake. Add a cookie tin. Add a reason.</p>
            <button
              className="secondary"
              onClick={() => {
                setOpen(false);
                navigate("/menu");
              }}
            >
              Shop desserts
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
