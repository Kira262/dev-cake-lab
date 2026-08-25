import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ContactPage } from "../../pages/ContactPage.jsx";
import { CONTACTS } from "../../data/contacts.js";
import { lineTotal, orderMessage } from "../../lib/cart.js";
import { ENQUIRY_ENDPOINT } from "../../lib/enquiry.js";
import { isoDateFromToday } from "../../lib/schedule.js";

const cart = [
  {
    name: "Biscoff Cheesecake",
    qty: 1,
    price: 350,
    notes: "",
  },
];

function nameField() {
  return screen.getByRole("textbox", { name: /your name/i });
}
function emailField() {
  return screen.getByRole("textbox", { name: /email/i });
}
function phoneField() {
  return screen.getByRole("textbox", { name: /^phone$/i });
}

async function fillNamePhone(user, phone = "9876543210") {
  await user.type(nameField(), "Pavan");
  await user.type(phoneField(), phone);
}

async function fillSchedule(user, days = 3) {
  fireEvent.change(screen.getByLabelText(/^needed by/i), {
    target: { value: isoDateFromToday(days) },
  });
  await user.click(screen.getByRole("radio", { name: /^morning$/i }));
}

describe("ContactPage enquiry form", () => {
  afterEach(() => {
    localStorage.clear();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("shows a WhatsApp enquiry control without a review dialog", () => {
    render(<ContactPage />);

    expect(screen.getByText(/whatsapp this enquiry/i)).toBeTruthy();
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("shows email and phone errors and does not send", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    render(<ContactPage />);

    await user.type(nameField(), "Pavan");
    await user.type(emailField(), "a@b");
    await user.type(phoneField(), "123");
    await user.click(screen.getByRole("button", { name: /send email/i }));

    expect(screen.getByText(/valid email/i)).toBeTruthy();
    expect(screen.getByText(/indian mobile/i)).toBeTruthy();
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects missing @, spaces-only email, and letter phones", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    render(<ContactPage />);

    await user.type(nameField(), "Pavan");
    await user.type(emailField(), "not-an-email");
    await user.type(phoneField(), "letters");
    await user.click(screen.getByRole("button", { name: /send email/i }));

    expect(screen.getByText(/valid email/i)).toBeTruthy();
    expect(screen.getByText(/indian mobile/i)).toBeTruthy();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("blocks a whitespace name", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    render(<ContactPage />);

    await user.click(nameField());
    await user.keyboard("   ");
    await user.type(emailField(), "you@example.com");
    await user.type(phoneField(), "9876543210");
    await fillSchedule(user);
    await user.click(screen.getByRole("button", { name: /send email/i }));

    expect(screen.getByText(/enter your name/i)).toBeTruthy();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("requires a needed-by date for a custom cake", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    render(<ContactPage />);

    await fillNamePhone(user);
    await user.click(screen.getByRole("button", { name: /send email/i }));

    expect(screen.getByText(/pick a date/i)).toBeTruthy();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("sends the enquiry on one click without a review popup", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: "true" }),
    });
    vi.stubGlobal("fetch", fetchMock);
    render(<ContactPage />);

    await fillNamePhone(user, "+91 98765 43210");
    await user.type(emailField(), "you@example.com");
    await fillSchedule(user);
    await user.click(screen.getByRole("button", { name: /send email/i }));

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        ENQUIRY_ENDPOINT,
        expect.objectContaining({ method: "POST" }),
      ),
    );
    expect(
      screen.getByText(new RegExp(`enquiry sent to ${CONTACTS.email}`, "i")),
    ).toBeTruthy();
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("allows sending with name and phone when email is empty", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: "true" }),
    });
    vi.stubGlobal("fetch", fetchMock);
    render(<ContactPage />);

    await fillNamePhone(user);
    await fillSchedule(user);
    await user.click(screen.getByRole("button", { name: /send email/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.name).toBe("Pavan");
    expect(body.phone).toBe("+919876543210");
    expect(body.email).toBe("");
    expect(body.neededBy).toBe(isoDateFromToday(3));
    expect(body.slot).toBe("Morning");
  });

  it("prefills the cart message but still requires name and phone", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const total = lineTotal(cart[0]);
    render(<ContactPage cart={cart} total={total} orderTicket={1} />);

    expect(screen.getByRole("textbox", { name: /tell us more/i }).value).toContain(
      orderMessage(cart, total).trim(),
    );
    expect(screen.getByText(/your bag/i)).toBeTruthy();

    await user.click(screen.getByRole("button", { name: /send email/i }));
    expect(screen.getByText(/enter your name/i)).toBeTruthy();
    expect(screen.queryByText(/enter your email/i)).toBeNull();
    expect(screen.getByText(/indian mobile/i)).toBeTruthy();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("remembers name, phone, and email for a later visit", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<ContactPage />);

    await fillNamePhone(user);
    await user.type(emailField(), "you@example.com");
    unmount();

    render(<ContactPage />);
    expect(nameField().value).toBe("Pavan");
    expect(phoneField().value).toBe("9876543210");
    expect(emailField().value).toBe("you@example.com");
  });

  it("requires a delivery area and address before sending email", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    render(<ContactPage />);

    await fillNamePhone(user);
    await fillSchedule(user);
    await user.click(screen.getByRole("radio", { name: /^delivery$/i }));
    await user.click(screen.getByRole("button", { name: /send email/i }));

    expect(screen.getByText(/pick an area/i)).toBeTruthy();
    expect(screen.getByText(/quote charges/i)).toBeTruthy();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("includes the delivery area and address in the email send", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: "true" }),
    });
    vi.stubGlobal("fetch", fetchMock);
    render(<ContactPage />);

    await fillNamePhone(user);
    await fillSchedule(user);
    await user.click(screen.getByRole("radio", { name: /^delivery$/i }));
    await user.click(screen.getByRole("radio", { name: /^navrangpura$/i }));
    await user.type(
      screen.getByRole("textbox", { name: /building \/ landmark/i }),
      "near CEPT",
    );
    await user.click(screen.getByRole("button", { name: /send email/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.fulfilment).toBe("Delivery");
    expect(body.area).toBe("Navrangpura");
    expect(body.address).toBe("near CEPT");
  });
});
