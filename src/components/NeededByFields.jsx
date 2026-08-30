import { isoDateFromToday } from "../lib/schedule.js";
import { TimePicker } from "./TimePicker.jsx";

export function NeededByFields({
  idPrefix = "enquiry",
  neededBy,
  onNeededBy,
  slot,
  onSlot,
  minDays = 0,
  dateError = "",
  slotError = "",
}) {
  const dateId = `${idPrefix}-needed-by`;
  const dateErrorId = `${idPrefix}-needed-by-error`;
  const hintId = `${idPrefix}-needed-by-hint`;

  return (
    <div className="fulfil needed-by">
      <label className="fulfil-address">
        Needed by
        <input
          id={dateId}
          name="neededBy"
          type="date"
          min={isoDateFromToday(minDays)}
          max={isoDateFromToday(60)}
          value={neededBy}
          aria-invalid={dateError ? "true" : "false"}
          aria-describedby={dateError ? dateErrorId : hintId}
          className={dateError ? "invalid" : ""}
          onChange={(e) => onNeededBy(e.target.value)}
        />
        <span className="field-hint" id={hintId}>
          {minDays >= 2
            ? "Custom cakes need 2–4 days. Rush orders depend on availability."
            : "We'll confirm if this date works."}
        </span>
        {dateError && (
          <span className="field-error" id={dateErrorId}>
            {dateError}
          </span>
        )}
      </label>
      <TimePicker
        idPrefix={idPrefix}
        value={slot}
        onChange={onSlot}
        error={slotError}
      />
    </div>
  );
}
