export const CONTACTS = {
  phoneDisplay: "+91 96382 41506",
  phoneTel: "+919638241506",
  email: "devscakelab@gmail.com",
  instagram: "DEVCAKELAB",
  instagramUrl: "https://www.instagram.com/devcakelab/",
  whatsappUrl: "https://wa.me/919638241506",
  addressName: "Dev's Cake Lab",
  addressLines: [
    "401, P.D. Apartment, Opp Mira Madhav Flat",
    "Ellisbridge, Ahmedabad, India 380006",
  ],
  mapsQuery:
    "41, Pritam Nagar Rd, Pritam Nagar, Paldi, Ahmedabad, Gujarat 380006, India",
  mapsLat: 23.0195896,
  mapsLng: 72.5662623,
  hoursLabel: "Daily",
  hoursDisplay: "11:00 AM — 1:00 AM",
};

export function pickupAddressText() {
  return [CONTACTS.addressName, ...CONTACTS.addressLines].join("\n");
}

export function mapsLink() {
  return `https://maps.google.com/?q=${encodeURIComponent(CONTACTS.mapsQuery)}`;
}

export function mapsEmbedSrc() {
  const pin = `${CONTACTS.mapsLat},${CONTACTS.mapsLng}`;
  return `https://maps.google.com/maps?q=${encodeURIComponent(pin)}&z=16&output=embed`;
}

export function whatsappOrderUrl(text = "") {
  const url = new URL(CONTACTS.whatsappUrl);
  const body = String(text || "").trim();
  if (body) url.searchParams.set("text", body);
  return url.toString();
}
