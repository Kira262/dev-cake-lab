import { EMAIL_MAX, NAME_MAX } from "../lib/validate.js";

export function IdentityFields({
  name,
  onName,
  phone,
  onPhone,
  email,
  onEmail,
  showError,
  errors,
  onBlurField,
}) {
  return (
    <>
      <label>
        Your name
        <input
          id="enquiry-name"
          name="name"
          autoComplete="name"
          maxLength={NAME_MAX}
          value={name}
          aria-invalid={showError("name") ? "true" : "false"}
          aria-describedby={showError("name") ? "enquiry-name-error" : undefined}
          className={showError("name") ? "invalid" : ""}
          onChange={(e) => onName(e.target.value)}
          onBlur={() => onBlurField?.("name")}
          placeholder="Dev's favourite human"
        />
        {showError("name") && (
          <span className="field-error" id="enquiry-name-error">
            {errors.name}
          </span>
        )}
      </label>
      <label>
        Phone
        <input
          id="enquiry-phone"
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          value={phone}
          aria-invalid={showError("phone") ? "true" : "false"}
          aria-describedby={
            showError("phone") ? "enquiry-phone-error" : undefined
          }
          className={showError("phone") ? "invalid" : ""}
          onChange={(e) => onPhone(e.target.value)}
          onBlur={() => onBlurField?.("phone")}
          placeholder="+91 98765 43210"
        />
        {showError("phone") && (
          <span className="field-error" id="enquiry-phone-error">
            {errors.phone}
          </span>
        )}
      </label>
      <label>
        Email (optional)
        <input
          id="enquiry-email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          maxLength={EMAIL_MAX}
          value={email}
          aria-invalid={showError("email") ? "true" : "false"}
          aria-describedby={
            showError("email") ? "enquiry-email-error" : undefined
          }
          className={showError("email") ? "invalid" : ""}
          onChange={(e) => onEmail(e.target.value)}
          onBlur={() => onBlurField?.("email")}
          placeholder="you@example.com"
        />
        <span className="field-hint">
          Optional — only if you'd rather we reply by email. WhatsApp already
          has your number.
        </span>
        {showError("email") && (
          <span className="field-error" id="enquiry-email-error">
            {errors.email}
          </span>
        )}
      </label>
    </>
  );
}
