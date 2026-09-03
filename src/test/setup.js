import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import { resetBodyScrollLock } from "../lib/scroll.js";

afterEach(() => {
  cleanup();
  resetBodyScrollLock();
});
