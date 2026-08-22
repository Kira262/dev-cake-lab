export function makeLineId(product, extras = {}) {
  const message = (extras.message || "").trim();
  const notes = (extras.notes || "").trim();
  return `${product.id}::${message}::${notes}`;
}

export function lineTotal(item) {
  return item.price * item.qty;
}

export function orderMessage(cart, total) {
  if (!cart.length) return "";
  const lines = cart.map((item) => {
    const extras = [
      item.message && `message: ${item.message}`,
      item.notes && `notes: ${item.notes}`,
    ].filter(Boolean);
    const extra = extras.length ? ` (${extras.join("; ")})` : "";
    return `• ${item.name} × ${item.qty}${extra} — ₹${lineTotal(item).toLocaleString("en-IN")}`;
  });
  return `I'd like to order:\n${lines.join("\n")}\n\nSubtotal: ₹${total.toLocaleString("en-IN")}\n\n`;
}
