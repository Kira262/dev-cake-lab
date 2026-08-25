import { ADDRESS_MAX, DELIVERY_AREAS, FULFILMENT } from "../lib/validate.js";

export function FulfilmentFields({
  idPrefix = "enquiry",
  compact = false,
  fulfilment,
  onFulfilment,
  area,
  onArea,
  address,
  onAddress,
  areaError = "",
  addressError = "",
}) {
  const delivery = fulfilment === FULFILMENT.delivery;
  const labelId = `${idPrefix}-fulfil-label`;
  const areaLabelId = `${idPrefix}-area-label`;
  const addressId = `${idPrefix}-address`;
  const hintId = `${idPrefix}-address-hint`;
  const errorId = `${idPrefix}-address-error`;
  const areaErrorId = `${idPrefix}-area-error`;

  return (
    <div className="fulfil">
      <p className="fulfil-legend" id={labelId}>
        Pickup or delivery
      </p>
      <div className="fulfil-toggle" role="radiogroup" aria-labelledby={labelId}>
        <button
          type="button"
          role="radio"
          aria-checked={fulfilment === FULFILMENT.pickup}
          className={fulfilment === FULFILMENT.pickup ? "active" : ""}
          onClick={() => onFulfilment(FULFILMENT.pickup)}
        >
          Pickup
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={delivery}
          className={delivery ? "active" : ""}
          onClick={() => onFulfilment(FULFILMENT.delivery)}
        >
          Delivery
        </button>
      </div>
      {delivery ? (
        compact ? (
          <label className="fulfil-address">
            Area / address
            <input
              id={addressId}
              name="address"
              autoComplete="street-address"
              maxLength={ADDRESS_MAX}
              value={address}
              onChange={(e) => onAddress(e.target.value)}
              placeholder="Bodakdev, society name…"
            />
            <span className="field-hint" id={hintId}>
              Extra delivery charges — we'll quote on WhatsApp.
            </span>
          </label>
        ) : (
          <>
            <p className="fulfil-legend" id={areaLabelId}>
              Area
            </p>
            <div
              className="area-chips"
              role="radiogroup"
              aria-labelledby={areaLabelId}
            >
              {DELIVERY_AREAS.map((item) => (
                <button
                  key={item}
                  type="button"
                  role="radio"
                  aria-checked={area === item}
                  className={area === item ? "active" : ""}
                  onClick={() => onArea(item)}
                >
                  {item}
                </button>
              ))}
            </div>
            {areaError && (
              <span className="field-error" id={areaErrorId}>
                {areaError}
              </span>
            )}
            <label className="fulfil-address">
              Building / landmark
              <textarea
                id={addressId}
                name="address"
                rows="3"
                autoComplete="street-address"
                maxLength={ADDRESS_MAX}
                value={address}
                aria-invalid={addressError ? "true" : "false"}
                aria-describedby={addressError ? errorId : hintId}
                className={addressError ? "invalid" : ""}
                onChange={(e) => onAddress(e.target.value)}
                placeholder="House or society name, street, landmark"
              />
              <span className="field-hint" id={hintId}>
                Charges depend on the area. We'll confirm before sending.
              </span>
              {addressError && (
                <span className="field-error" id={errorId}>
                  {addressError}
                </span>
              )}
            </label>
          </>
        )
      ) : (
        <p className="fulfil-note">
          Free pickup at Ellisbridge. Delivery charges depend on your area.
        </p>
      )}
    </div>
  );
}
