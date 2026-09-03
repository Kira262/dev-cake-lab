import { CONTACTS } from "../data/contacts.js";
import { asset } from "../lib/paths.js";
import { AssetImage } from "./AssetImage.jsx";

export function Footer({ navigate }) {
  return (
    <footer>
      <div className="wrap footer-grid">
        <div>
          <button
            className="wordmark footer-mark"
            onClick={() => navigate("/")}
            aria-label="The Dev's Cake Lab home"
          >
            <AssetImage
              className="wordmark-logo"
              src={asset("dev-cake-logo.png")}
              alt="The Dev's Cake Lab"
            />
          </button>
          <p>Crafted, tested and perfected in small batches.</p>
        </div>
        <div>
          <h4>EXPLORE</h4>
          <button onClick={() => navigate("/menu")}>Menu</button>
          <button onClick={() => navigate("/visit")}>Visit</button>
        </div>
        <div>
          <h4>ORDERS</h4>
          <button onClick={() => navigate("/custom")}>Custom cakes</button>
          <button onClick={() => navigate("/contact")}>Contact</button>
        </div>
        <div>
          <h4>FOLLOW</h4>
          <a
            href={CONTACTS.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Instagram
          </a>
          <a
            href={CONTACTS.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            WhatsApp
          </a>
        </div>
      </div>
      <div className="wrap footer-bottom">
        <span>© 2026 Dev's Cake Lab</span>
        <span>Crafted. Tested. Perfected.</span>
      </div>
    </footer>
  );
}
