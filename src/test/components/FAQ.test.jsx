import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { FAQ } from "../../components/FAQ.jsx";

describe("FAQ", () => {
  it("explains pickup, delivery charges, and custom-cake lead time", async () => {
    const user = userEvent.setup();
    render(<FAQ />);

    expect(screen.getByText(/2–4 days/i)).toBeTruthy();
    await user.click(screen.getByRole("button", { name: /pickup and delivery/i }));
    expect(screen.getByText(/charges depend on your area/i)).toBeTruthy();
    expect(screen.getByText(/401, P\.D\. Apartment/i)).toBeTruthy();
    expect(screen.getByText(/ellisbridge/i)).toBeTruthy();
    expect(screen.getByText(/11:00 AM–1:00 AM/i)).toBeTruthy();
  });
});
