import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import { resetBodyScrollLock } from "../lib/scroll.js";

const sessionState = {
  id: "00000000-0000-4000-8000-000000000099",
  bag: [],
  draft: {},
};

vi.mock("../lib/session.js", () => ({
  SESSION_ID_KEY: "devCakeLab.sessionId",
  isSessionReady: () => true,
  getSessionId: () => sessionState.id,
  getBag: () => sessionState.bag,
  setBag: (bag) => {
    sessionState.bag = Array.isArray(bag) ? bag : [];
  },
  getDraft: () => sessionState.draft,
  patchDraft: (patch) => {
    sessionState.draft = { ...sessionState.draft, ...patch };
  },
  initSession: async () => sessionState,
  flushSession: async () => {},
}));

export function resetSessionState() {
  sessionState.bag = [];
  sessionState.draft = {};
}

afterEach(() => {
  cleanup();
  resetBodyScrollLock();
  resetSessionState();
});
