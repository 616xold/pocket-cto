import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

const getDeliveryReadiness = vi.fn();

vi.mock("../../lib/api", () => ({
  getDeliveryReadiness,
}));

vi.mock("../../components/delivery-readiness-card", () => ({
  DeliveryReadinessCard(props: {
    readiness: { companyKey: string; aggregateStatus: string } | null;
  }) {
    return props.readiness ? (
      <article>
        delivery-readiness-card:{props.readiness.companyKey}:
        {props.readiness.aggregateStatus}
      </article>
    ) : (
      <article>delivery-readiness-card:null</article>
    );
  },
}));

describe("DeliveryReadinessPage", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders the selected company's internal delivery-readiness posture", async () => {
    getDeliveryReadiness.mockResolvedValue({
      companyKey: "acme",
      aggregateStatus: "needs_review_before_delivery",
    });

    const mod = await import("./page");
    const html = renderToStaticMarkup(
      await mod.default({
        searchParams: Promise.resolve({ companyKey: " acme " }),
      }),
    );

    expect(getDeliveryReadiness).toHaveBeenCalledWith("acme");
    expect(html).toContain("Delivery-readiness boundary for acme.");
    expect(html).toContain("No send");
    expect(html).toContain(
      "delivery-readiness-card:acme:needs_review_before_delivery",
    );
    expect(html).not.toContain("<form");
    expect(html).not.toContain("<button");
  });

  it("defaults to the seeded demo company key", async () => {
    getDeliveryReadiness.mockResolvedValue(null);

    const mod = await import("./page");
    const html = renderToStaticMarkup(await mod.default({}));

    expect(getDeliveryReadiness).toHaveBeenCalledWith("acme");
    expect(html).toContain("Delivery-readiness boundary for acme.");
    expect(html).toContain("delivery-readiness-card:null");
  });
});
