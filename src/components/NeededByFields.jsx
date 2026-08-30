import { useEffect, useState } from "react";
import {
  fromTwelveHourParts,
  isoDateFromToday,
  toTwelveHourParts,
} from "../lib/schedule.js";

const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));

function TimePicker({
  idPrefix,
  value,
  onChange,
  invalid = false,
  describedBy,
}) {
  const saved = toTwelveHourParts(value);
  const [hour, setHour] = useState(saved.hour);
  const [minute, setMinute] = useState(saved.minute);
  const [period, setPeriod] = useState(saved.period || "AM");

  useEffect(() => {
    if (!value) return;
    const next = toTwelveHourParts(value);
    setHour(next.hour);
    setMinute(next.minute);
    setPeriod(next.period);
  }, [value]);

  const commit = (nextHour, nextMinute, nextPeriod) => {
    if (!nextHour && !nextMinute) {
      onChange?.("");
      return;
    }
    const parsed = fromTwelveHourParts({
      hour: nextHour,
      minute: nextMinute,
      period: nextPeriod,
    });
    onChange?.(parsed);
  };

  const hourId = `${idPrefix}-hour`;
  const minuteId = `${idPrefix}-minute`;

  return (
    <div className={`time-picker${invalid ? " invalid" : ""}`}>
      <label className="time-part" htmlFor={hourId}>
        <span className="sr-only">Hour</span>
        <select
          id={hourId}
          name="neededHour"
          aria-invalid={invalid ? "true" : "false"}
          aria-describedby={describedBy}
          value={hour}
          onChange={(e) => {
            const next = e.target.value;
            setHour(next);
            commit(next, minute, period);
          }}
        >
          <option value="">HH</option>
          {HOURS.map((item) => (
            <option key={item} value={item}>
              {item.padStart(2, "0")}
            </option>
          ))}
        </select>
      </label>
      <span className="time-colon" aria-hidden="true">
        :
      </span>
      <label className="time-part" htmlFor={minuteId}>
        <span className="sr-only">Minute</span>
        <select
          id={minuteId}
          name="neededMinute"
          aria-invalid={invalid ? "true" : "false"}
          aria-describedby={describedBy}
          value={minute}
          onChange={(e) => {
            const next = e.target.value;
            setMinute(next);
            commit(hour, next, period);
          }}
        >
          <option value="">MM</option>
          {MINUTES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>
      <div className="time-period" role="group" aria-label="AM or PM">
        {["AM", "PM"].map((item) => (
          <button
            key={item}
            type="button"
            className={period === item ? "active" : ""}
            aria-pressed={period === item}
            onClick={() => {
              setPeriod(item);
              commit(hour, minute, item);
            }}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}

export function NeededByFields({
  idPrefix = "enquiry",
  neededBy,
  onNeededBy,
  neededTime = "",
  onNeededTime,
  minDays = 0,
  dateError = "",
  timeError = "",
  required = false,
  legend,
}) {
  const dateId = `${idPrefix}-needed-by`;
  const dateErrorId = `${idPrefix}-needed-by-error`;
  const timeErrorId = `${idPrefix}-needed-time-error`;
  const hintId = `${idPrefix}-needed-by-hint`;
  const title = legend || (required ? "Needed by" : "Needed by (optional)");

  return (
    <div className="fulfil needed-by">
      <p className="fulfil-legend">{title}</p>
      <div className="needed-by-row">
        <label className="fulfil-address" htmlFor={dateId}>
          Date
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
        </label>
        <div className="fulfil-address">
          Time
          <TimePicker
            idPrefix={idPrefix}
            value={neededTime}
            onChange={onNeededTime}
            invalid={Boolean(timeError)}
            describedBy={timeError ? timeErrorId : hintId}
          />
        </div>
      </div>
      <span className="field-hint" id={hintId}>
        {minDays >= 2
          ? "Custom cakes need 2–4 days. Rush orders depend on availability."
          : "Optional — or skip and tell us on WhatsApp."}
      </span>
      {dateError && (
        <span className="field-error" id={dateErrorId}>
          {dateError}
        </span>
      )}
      {timeError && (
        <span className="field-error" id={timeErrorId}>
          {timeError}
        </span>
      )}
    </div>
  );
}
