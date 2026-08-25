export const ENQUIRY_DRAFT_KEY = "devCakeLab.enquiryDraft";

export function readEnquiryDraft() {
  try {
    const raw = localStorage.getItem(ENQUIRY_DRAFT_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function saveEnquiryDraft(patch) {
  try {
    const next = { ...readEnquiryDraft(), ...patch };
    localStorage.setItem(ENQUIRY_DRAFT_KEY, JSON.stringify(next));
  } catch {
    /* ignore quota / private mode */
  }
}
