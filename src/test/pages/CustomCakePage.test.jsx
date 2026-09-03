import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CustomCakePage } from "../../pages/CustomCakePage.jsx";
import { CONTACTS } from "../../data/contacts.js";
import { ENQUIRY_ENDPOINT } from "../../lib/enquiry.js";
import { isoDateFromToday } from "../../lib/schedule.js";

describe("CustomCakePage", () => {
  afterEach(() => {
    localStorage.clear();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("asks for a date and brief before WhatsApp", async () => {
    const user = userEvent.setup();
    render(<CustomCakePage />);

    expect(screen.getByText(/made for your/i)).toBeTruthy();
    expect(screen.getAllByText(/2–4 days/i).length).toBeGreaterThan(0);
    const link = screen.getByText(/whatsapp this cake/i).closest("a");
    expect(link.getAttribute("aria-disabled")).toBe("true");

    await user.click(link);
    expect(screen.getByText(/pick a date/i)).toBeTruthy();
    expect(screen.getByText(/pick a time/i)).toBeTruthy();
    expect(screen.getByText(/tell us the occasion, size, and flavour/i)).toBeTruthy();
  });

  it("prefills WhatsApp with the custom cake brief", async () => {
    const user = userEvent.setup();
    render(<CustomCakePage />);

    const day = isoDateFromToday(3);
    fireEvent.change(screen.getByLabelText(/^date$/i), {
      target: { value: day },
    });
    fireEvent.change(screen.getByLabelText(/^hour$/i), {
      target: { value: "4" },
    });
    fireEvent.change(screen.getByLabelText(/^minute$/i), {
      target: { value: "30" },
    });
    await user.click(screen.getByRole("button", { name: /^pm$/i }));
    await user.click(screen.getByRole("button", { name: /^birthday$/i }));
    await user.click(screen.getByRole("button", { name: /^1 kg$/i }));
    await user.type(
      screen.getByRole("textbox", { name: /design notes/i }),
      "Birthday for 12, vanilla, less sweet",
    );

    const href = screen
      .getByRole("link", { name: /whatsapp this cake/i })
      .getAttribute("href");
    const text = new URL(href).searchParams.get("text");
    expect(text).toContain("custom cake");
    expect(text).toContain("Birthday for 12");
    expect(text).toContain("401, P.D. Apartment");
  });

  it("emails the custom brief after revealing contact fields", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: "true" }),
    });
    vi.stubGlobal("fetch", fetchMock);
    render(<CustomCakePage />);

    fireEvent.change(screen.getByLabelText(/^date$/i), {
      target: { value: isoDateFromToday(3) },
    });
    fireEvent.change(screen.getByLabelText(/^hour$/i), {
      target: { value: "4" },
    });
    fireEvent.change(screen.getByLabelText(/^minute$/i), {
      target: { value: "30" },
    });
    await user.click(screen.getByRole("button", { name: /^pm$/i }));
    await user.click(screen.getByRole("button", { name: /^anniversary$/i }));
    await user.click(screen.getByRole("button", { name: /^1 kg$/i }));
    await user.type(
      screen.getByRole("textbox", { name: /design notes/i }),
      "Anniversary cake, 8 slices, chocolate",
    );
    await user.click(screen.getByRole("button", { name: /email instead/i }));
    await user.type(screen.getByRole("textbox", { name: /your name/i }), "Pavan");
    await user.type(screen.getByRole("textbox", { name: /^phone$/i }), "9876543210");
    await user.click(screen.getByRole("button", { name: /send email/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.topic).toBe("Custom cake");
    expect(body.message).toContain("Anniversary cake");
    expect(
      screen.getByText(new RegExp(`enquiry sent to ${CONTACTS.email}`, "i")),
    ).toBeTruthy();
  });
});
