import { getDraft, patchDraft } from "./session.js";

export const ENQUIRY_DRAFT_KEY = "devCakeLab.enquiryDraft";

export function readEnquiryDraft() {
  return getDraft();
}

export function saveEnquiryDraft(patch) {
  patchDraft(patch);
}
