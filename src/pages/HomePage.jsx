import { ArrowRight } from "lucide-react";
import { bestSellers as catalogBestSellers, reviews } from "../data/catalog.js";
import { CatHero } from "../components/CatHero.jsx";
import { CategoryCarousel } from "../components/CategoryCarousel.jsx";
import { FAQ } from "../components/FAQ.jsx";
import { ProductCard } from "../components/ProductCard.jsx";
import { TypewriterWord } from "../components/TypewriterWord.jsx";

export function HomePage({ navigate, add, bestSellers = catalogBestSellers }) {
  return (
    <main id="main-content">
      <section className="hero wrap">
        <div className="hero-copy">
          <span className="kicker">ARTISAN DESSERTS · DEV'S CAKE LAB</span>
          <h1>
            Baked with
            <br />
            <i>
              <TypewriterWord />
            </i>
          </h1>
          <p>
            Cheesecakes, cookies, cookie lava tins, cake bowls, cupcakes and
            brownies made with real butter, good chocolate and a ridiculous
            amount of care.
          </p>
          <div className="hero-actions">
            <button className="primary" onClick={() => navigate("/menu")}>
              Explore the menu <ArrowRight size={17} />
            </button>
            <button className="secondary" onClick={() => navigate("/custom")}>
              Custom cakes
            </button>
          </div>
          <div className="hero-proof">
            <span>CRAFTED.</span>
            <span>TESTED.</span>
            <span>PERFECTED.</span>
          </div>
        </div>
        <CatHero />
      </section>

      <section className="category-band">
        <div className="wrap">
          <div className="section-intro center">
            <span className="kicker">SOMETHING FOR EVERY SWEET TOOTH</span>
            <h2>Shop by category</h2>
            <p>
              Cheesecakes, cookies, cookie lava tins, cake bowls, cupcakes and
              brownies — pick a category and browse.
            </p>
          </div>
          <CategoryCarousel navigate={navigate} />
        </div>
      </section>

      <section className="wrap section">
        <div className="section-heading">
          <div>
            <span className="kicker">THE FAVOURITES</span>
            <h2>Best sellers</h2>
            <p>The things people come back for.</p>
          </div>
          <button className="text-link" onClick={() => navigate("/menu")}>
            View all treats <ArrowRight size={16} />
          </button>
        </div>
        <div className="products">
          {bestSellers.map((p, i) => (
            <ProductCard
              key={p.id}
              product={p}
              add={add}
              navigate={navigate}
              priority={i < 2}
            />
          ))}
        </div>
      </section>

      <section className="manifesto">
        <div className="wrap manifesto-grid">
          <div>
            <span className="kicker">WHY DEV'S?</span>
            <h2>
              Small-batch. Handmade.
              <br />
              <i>Worth remembering.</i>
            </h2>
          </div>
          <div className="manifesto-points">
            <div>
              <b>01</b>
              <span>Real ingredients</span>
              <p>Butter, cream, chocolate and fruit. No shortcuts.</p>
            </div>
            <div>
              <b>02</b>
              <span>Made to order</span>
              <p>
                Fresh batches with the care of a home kitchen and the finish of
                a pastry studio.
              </p>
            </div>
            <div>
              <b>03</b>
              <span>Beautifully yours</span>
              <p>Custom flavours, colours and cakes for your celebration.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="reviews">
        <div className="wrap">
          <div className="section-intro center">
            <span className="kicker">LOVED BY SWEET TOOTHS</span>
            <h2>Kind words</h2>
          </div>
          <div className="review-grid">
            {reviews.map(([quote, by]) => (
              <article key={by}>
                <div className="stars">★★★★★</div>
                <p>“{quote}”</p>
                <small>{by}</small>
              </article>
            ))}
          </div>
        </div>
      </section>

      <FAQ />
    </main>
  );
}
