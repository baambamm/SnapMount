import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  try {
    const { paymentType, quote } = req.body;

    let amount;

    if (paymentType === "deposit") {
      amount = Math.round(quote.deposit * 100);
    } else if (paymentType === "full") {
      amount = Math.round(quote.total * 100);
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
              name: `SnapMount Service (${paymentType})`,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      success_url: "https://snapmountarizona.com?success=true",
      cancel_url: "https://snapmountarizona.com?canceled=true",
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
}
