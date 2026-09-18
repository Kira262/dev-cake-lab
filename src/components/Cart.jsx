import { useEffect, useState } from "react";
import { ArrowRight, Minus, Plus, X } from "lucide-react";
import { DessertArt } from "./DessertArt.jsx";
import { SmartImage } from "./SmartImage.jsx";
import { NeededByFields } from "./NeededByFields.jsx";
import { FulfilmentFields } from "./FulfilmentFields.jsx";
import { whatsappOrderUrl } from "../data/contacts.js";
import { orderWhatsAppText } from "../lib/cart.js";
import { readEnquiryDraft, saveEnquiryDraft } from "../lib/draft.js";
import { bagWhenFromDraft } from "../lib/schedule.js";
import { lockBodyScroll, unlockBodyScroll } from "../lib/scroll.js";
import { safeFulfilment } from "../lib/validate.js";

export function Cart({
  open,
  setOpen,
  cart,
  total,
  changeQty,
  navigate,
}) {
  const draft = readEnquiryDraft();
  const firstWhen = open ? bagWhenFromDraft(draft) : { date: "", time: "" };
  const [fulfilment, setFulfilment] = useState(() =>
    safeFulfilment(draft.fulfilment),
  );
  const [address, setAddress] = useState(() => draft.address || "");
  const [neededBy, setNeededBy] = useState(firstWhen.date);
  const [neededTime, setNeededTime] = useState(firstWhen.time);

  useEffect(() => {
    if (!open) return undefined;
    lockBodyScroll();
    return () => unlockBodyScroll();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const saved = readEnquiryDraft();
    const when = bagWhenFromDraft(saved);
    setFulfilment(safeFulfilment(saved.fulfilment));
    setAddress(saved.address || "");
    setNeededBy(when.date);
    setNeededTime(when.time);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    saveEnquiryDraft({ fulfilment, address, neededBy, neededTime });
  }, [open, fulfilment, address, neededBy, neededTime]);

  const whatsappHref = whatsappOrderUrl(
    orderWhatsAppText(cart, total, {
      fulfilment,
      address,
      neededBy,
      neededTime,
    }),
  );

  return (
    <>
      {open && <div className="overlay" onClick={() => setOpen(false)} />}
      <aside className={`cart ${open ? "open" : ""}`}>
        <div className="cart-head">
          <div>
            <h2>Sweet things</h2>
          </div>
          <button onClick={() => setOpen(false)}>
            <X />
          </button>
        </div>
        {cart.length ? (
          <>
            <div className="cart-scroll">
              <div className="cart-items">
                {cart.map((item) => (
                  <div className="cart-item" key={item.lineId}>
                    <div className="cart-art">
                      {item.image ? (
                        <SmartImage src={item.image} alt="" />
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
                        <button
                          type="button"
                          aria-label={`Decrease ${item.name} quantity`}
                          onClick={() => changeQty(item.lineId, -1)}
                        >
                          <Minus size={13} />
                        </button>
                        <span>{item.qty}</span>
                        <button
                          type="button"
                          aria-label={`Increase ${item.name} quantity`}
                          onClick={() => changeQty(item.lineId, 1)}
                        >
                          <Plus size={13} />
                        </button>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="remove"
                      aria-label={`Remove ${item.name}`}
                      onClick={() => changeQty(item.lineId, -item.qty)}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="cart-details">
                <NeededByFields
                  idPrefix="cart"
                  legend="When"
                  hint=""
                  minuteStep={15}
                  neededBy={neededBy}
                  onNeededBy={setNeededBy}
                  neededTime={neededTime}
                  onNeededTime={setNeededTime}
                />
                <FulfilmentFields
                  idPrefix="cart"
                  compact
                  fulfilment={fulfilment}
                  onFulfilment={setFulfilment}
                  address={address}
                  onAddress={setAddress}
                />
              </div>
            </div>
            <div className="cart-foot">
              <div className="cart-subtotal">
                <span>Subtotal</span>
                <strong>₹{total.toLocaleString("en-IN")}</strong>
              </div>
              <a
                className="primary"
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
              >
                Order on WhatsApp <ArrowRight size={17} />
              </a>
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
