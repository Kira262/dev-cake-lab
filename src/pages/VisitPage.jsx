import React from "react";
import { MapPin } from "lucide-react";
import { CONTACTS } from "../data/contacts.js";

export function VisitPage() {
  const mapsEmbed = `https://maps.google.com/maps?q=${encodeURIComponent(CONTACTS.mapsQuery)}&z=15&output=embed`;
  const mapsLink = `https://maps.google.com/?q=${encodeURIComponent(CONTACTS.mapsQuery)}`;

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
          <MapPin size={21} />
          <h2>Find us</h2>
          <p>
            {CONTACTS.addressName}
            {CONTACTS.addressLines.map((line) => (
              <React.Fragment key={line}>
                <br />
                {line}
              </React.Fragment>
            ))}
          </p>
          <div className="hours">
            <b>Mon–Sat</b>
            <span>10:00 AM — 8:00 PM</span>
            <b>Sunday</b>
            <span>11:00 AM — 6:00 PM</span>
          </div>
          <a
            className="maps-link"
            href={mapsLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open in Google Maps
          </a>
        </div>
        <div className="visit-card map">
          <iframe
            title="Dev's Cake Lab at P.D. Apartment, Ellisbridge, Ahmedabad"
            src={mapsEmbed}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
            sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-forms"
          />
          <p>
            Pickup, custom cake consultations and dessert gifting are available
            here.
          </p>
        </div>
      </section>
    </main>
  );
}
