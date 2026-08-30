import {
  CLOCK_HOURS,
  CLOCK_MINUTES,
  CLOCK_PERIODS,
  formatClockTime,
  parseClockTime,
} from "../lib/validate.js";

export function TimePicker({
  idPrefix = "enquiry",
  value,
  onChange,
  error = "",
}) {
  const parsed = parseClockTime(value);
  const hour = parsed?.hour || "";
  const minute = parsed?.minute || "";
  const period = parsed?.period || "";
  const hourId = `${idPrefix}-hour`;
  const errorId = `${idPrefix}-time-error`;

  const emit = (nextHour, nextMinute, nextPeriod) => {
    onChange(formatClockTime(nextHour, nextMinute, nextPeriod));
  };

  return (
    <div className="time-picker-block">
      <p className="fulfil-legend" id={`${idPrefix}-time-label`}>
        Time
      </p>
      <div
        className={`time-picker ${error ? "invalid" : ""}`}
        role="group"
        aria-labelledby={`${idPrefix}-time-label`}
      >
        <label className="time-picker-part">
          <span className="sr-only">Hour</span>
          <select
            id={hourId}
            name="hour"
            value={hour}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={error ? errorId : undefined}
            onChange={(e) =>
              emit(e.target.value, minute || "00", period || "AM")
            }
          >
            <option value="">HH</option>
            {CLOCK_HOURS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <span className="time-picker-colon" aria-hidden="true">
          :
        </span>
        <label className="time-picker-part">
          <span className="sr-only">Minute</span>
          <select
            name="minute"
            value={minute}
            aria-label="Minute"
            onChange={(e) => emit(hour || "10", e.target.value, period || "AM")}
          >
            <option value="">MM</option>
            {CLOCK_MINUTES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label className="time-picker-part period">
          <span className="sr-only">AM or PM</span>
          <select
            name="period"
            value={period}
            aria-label="AM or PM"
            onChange={(e) => emit(hour || "10", minute || "00", e.target.value)}
          >
            <option value="">AM/PM</option>
            {CLOCK_PERIODS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
      </div>
      {error && (
        <span className="field-error" id={errorId}>
          {error}
        </span>
      )}
    </div>
  );
}
