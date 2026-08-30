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

async function revealEmail(user) {
  await user.click(screen.getByRole("button", { name: /email instead/i }));
}

async function fillNamePhone(user, phone = "9876543210") {
  await user.type(nameField(), "Pavan");
  await user.type(phoneField(), phone);
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
    expect(
      screen.getByText(/tap send in whatsapp or we won't see the order/i),
    ).toBeTruthy();
    expect(screen.getByRole("link", { name: CONTACTS.email }).getAttribute("href")).toBe(
      `mailto:${CONTACTS.email}`,
    );
    expect(
      screen.getByRole("link", { name: CONTACTS.instagram }).getAttribute("href"),
    ).toBe(CONTACTS.instagramUrl);
    expect(screen.getByText(/email if you prefer not to chat/i)).toBeTruthy();
    expect(screen.getAllByText(/401, P\.D\. Apartment/i).length).toBeGreaterThan(0);
    expect(
      screen.getByRole("link", { name: /open in google maps/i }),
    ).toBeTruthy();
    expect(screen.queryByTitle(/401, P\.D\. Apartment/i)).toBeNull();
    expect(screen.queryByRole("textbox", { name: /your name/i })).toBeNull();
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("shows email and phone errors and does not send", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    render(<ContactPage />);

    await revealEmail(user);
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

    await revealEmail(user);
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

    await revealEmail(user);
    await user.click(nameField());
    await user.keyboard("   ");
    await user.type(emailField(), "you@example.com");
    await user.type(phoneField(), "9876543210");
    await user.click(screen.getByRole("button", { name: /send email/i }));

    expect(screen.getByText(/enter your name/i)).toBeTruthy();
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

    await revealEmail(user);
    await fillNamePhone(user, "+91 98765 43210");
    await user.type(emailField(), "you@example.com");
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
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.topic).toBe("Enquiry");
    expect(body.time).toBe("(not set)");
  });

  it("allows sending with name and phone when email is empty", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: "true" }),
    });
    vi.stubGlobal("fetch", fetchMock);
    render(<ContactPage />);

    await revealEmail(user);
    await fillNamePhone(user);
    await user.click(screen.getByRole("button", { name: /send email/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.name).toBe("Pavan");
    expect(body.phone).toBe("+919876543210");
    expect(body.email).toBe("");
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

    await revealEmail(user);
    await user.click(screen.getByRole("button", { name: /send email/i }));
    expect(screen.getByText(/enter your name/i)).toBeTruthy();
    expect(screen.queryByText(/enter your email/i)).toBeNull();
    expect(screen.getByText(/indian mobile/i)).toBeTruthy();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("remembers name, phone, and email for a later visit", async () => {
    const user = userEvent.setup({ delay: null });
    const { unmount } = render(<ContactPage />);

    await revealEmail(user);
    await fillNamePhone(user);
    await user.type(emailField(), "you@example.com");
    unmount();

    render(<ContactPage />);
    await user.click(screen.getByRole("button", { name: /email instead/i }));
    expect(nameField().value).toBe("Pavan");
    expect(phoneField().value).toBe("9876543210");
    expect(emailField().value).toBe("you@example.com");
  });

  it("requires a delivery address before sending email", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    render(<ContactPage />);

    await revealEmail(user);
    await fillNamePhone(user);
    await user.click(screen.getByRole("radio", { name: /^delivery$/i }));
    await user.click(screen.getByRole("button", { name: /send email/i }));

    expect(screen.getByText(/quote charges/i)).toBeTruthy();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("includes the delivery address in the email send", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: "true" }),
    });
    vi.stubGlobal("fetch", fetchMock);
    render(<ContactPage />);

    await revealEmail(user);
    await fillNamePhone(user);
    await user.click(screen.getByRole("radio", { name: /^delivery$/i }));
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
    await user.type(
      screen.getByRole("textbox", { name: /area \/ address/i }),
      "Navrangpura, near CEPT",
    );
    await user.click(screen.getByRole("button", { name: /send email/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.fulfilment).toBe("Delivery");
    expect(body.address).toBe("Navrangpura, near CEPT");
  });
});
