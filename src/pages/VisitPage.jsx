import { MapPin } from "lucide-react";
import { CONTACTS, mapsEmbedUrl, mapsLinkUrl } from "../data/contacts.js";

export function VisitPage() {
  return (
    <main>
      <section className="page-hero wrap">
        <span className="kicker">COME SAY HELLO</span>
        <h1>
          Visit the <i>cake lab.</i>
        </h1>
        <p>
          Pick up a cake, stay for dessert, leave with something for tomorrow.
        </p>
      </section>
      <section className="wrap visit">
        <div className="visit-card">
          <h2>Find us</h2>
          <p className="visit-address">
            <MapPin
              className="visit-pin"
              size={22}
              color="#e53935"
              fill="#e53935"
              strokeWidth={1.5}
              aria-hidden="true"
            />
            <span>
              {CONTACTS.addressName}
              <br />
              {CONTACTS.mapsQuery}
            </span>
          </p>
          <div className="hours">
            <b>Mon–Sat</b>
            <span>10:00 AM — 10:00 PM</span>
            <b>Sunday</b>
            <span>10:00 AM — 8:00 PM</span>
          </div>
          <a
            className="maps-link"
            href={mapsLinkUrl()}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open in Google Maps
          </a>
        </div>
        <div className="visit-map-pin">
          <div className="visit-card map">
            <iframe
              title="Dev's Cake Lab at 41, Pritam Nagar Rd, Paldi, Ahmedabad"
              src={mapsEmbedUrl()}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
              sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-forms"
            />
          </div>
        </div>
      </section>
    </main>
  );
}
