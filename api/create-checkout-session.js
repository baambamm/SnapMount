import Stripe from "stripe";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({ error: "Missing Stripe secret key" });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const { paymentType, quote } = req.body || {};

    if (!quote) {
      return res.status(400).json({ error: "Missing quote data" });
    }

    let amount;

    if (paymentType === "deposit") {
      amount = Math.round(Number(quote.deposit) * 100);
    } else if (paymentType === "full") {
      amount = Math.round(Number(quote.total) * 100);
    } else {
      return res.status(400).json({ error: "Invalid payment type" });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "SnapMount Service"
            },
            unit_amount: amount
          },
          quantity: 1
        }
      ],
      success_url: "https://snapmountaz.com?success=true",
      cancel_url: "https://snapmountaz.com?canceled=true"
    });

    return res.status(200).json({ url: session.url });

  } catch (error) {
    console.error("🔥 STRIPE ERROR:", error);
    return res.status(500).json({
      error: error.message || "Server error"
    });
  }
}
