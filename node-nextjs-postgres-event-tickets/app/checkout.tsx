"use client";

import { useState } from "react";

export function Checkout({ eventId, priceCents, stripeReady }: { eventId: string; priceCents: number; stripeReady: boolean }) {
  const [quantity, setQuantity] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId, quantity }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Checkout could not start.");
      window.location.assign(result.url);
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : "Checkout could not start.");
      setBusy(false);
    }
  }

  return (
    <section className="checkout">
      <span className="eyebrow">Choose your seats</span>
      <div className="quantity">
        <button aria-label="Remove one ticket" onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
        <strong>{quantity}</strong>
        <button aria-label="Add one ticket" onClick={() => setQuantity(Math.min(6, quantity + 1))}>+</button>
      </div>
      <div className="total">
        <span>Total</span>
        <strong>${((priceCents * quantity) / 100).toFixed(2)}</strong>
      </div>
      <button className="buy" disabled={busy} onClick={submit}>
        {busy ? "Preparing your ticket…" : stripeReady ? "Continue to Stripe test checkout" : "Complete free test order"}
      </button>
      <p className="mode">{stripeReady ? "Stripe test mode is connected." : "Free test order mode. No payment key needed."}</p>
      {error && <p className="error">{error}</p>}
    </section>
  );
}
