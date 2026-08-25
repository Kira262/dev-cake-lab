export const CONTACTS = {
  phoneDisplay: "+91 96382 41506",
  phoneTel: "+919638241506",
  email: "devscakelab@gmail.com",
  instagram: "DEVCAKELAB",
  instagramUrl: "https://www.instagram.com/devcakelab/",
  whatsappUrl: "https://wa.me/919638241506",
  addressName: "Dev's Cake Lab",
  addressLines: [
    "P.D. Apartment, Opp Mira Madhav Flat",
    "Ellisbridge, Ahmedabad, India 380006",
  ],
  mapsQuery:
    "P.D. Apartment, Opp Mira Madhav Flat, Ellisbridge, Ahmedabad, India 380006",
};

export function whatsappOrderUrl(text = "") {
  const url = new URL(CONTACTS.whatsappUrl);
  const body = String(text || "").trim();
  if (body) url.searchParams.set("text", body);
  return url.toString();
}

export function gmailComposeUrl({
  to = CONTACTS.email,
  subject = "",
  body = "",
} = {}) {
  const params = new URLSearchParams({
    view: "cm",
    fs: "1",
    to,
  });
  if (subject) params.set("su", subject);
  if (body) params.set("body", body);
  return `https://mail.google.com/mail/?${params.toString()}`;
}
