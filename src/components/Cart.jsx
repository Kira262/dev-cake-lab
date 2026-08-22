import { ArrowRight, Minus, Plus, X } from "lucide-react";
import { DessertArt } from "./DessertArt.jsx";

export function Cart({ open, setOpen, cart, total, changeQty, navigate, startOrder }) {
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
                      {item.message ? ` · “${item.message}”` : ""}
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
              <div>
                <span>Subtotal</span>
                <strong>₹{total.toLocaleString("en-IN")}</strong>
              </div>
              <p>Delivery calculated at checkout.</p>
              <button className="primary" onClick={startOrder}>
                Continue to order <ArrowRight size={17} />
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
