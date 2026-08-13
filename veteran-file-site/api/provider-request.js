export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed." });
  }

  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error: "Email service is not configured."
    });
  }

  const {
    practiceName,
    providerName,
    credentials,
    specialty,
    email,
    phone,
    website,
    states,
    telehealth,
    services,
    description,
    acknowledgement
  } = req.body || {};

  if (
    !practiceName ||
    !providerName ||
    !credentials ||
    !specialty ||
    !email ||
    !states ||
    !telehealth ||
    !description ||
    !acknowledgement
  ) {
    return res.status(400).json({
      error: "Please complete all required fields."
    });
  }

  if (!Array.isArray(services) || services.length === 0) {
    return res.status(400).json({
      error: "Please select at least one service."
    });
  }

  const safe = (value = "") =>
    String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  const serviceList = services
    .map((service) => `<li>${safe(service)}</li>`)
    .join("");

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:700px;margin:auto;color:#13233a;">
      <div style="background:#071a38;color:white;padding:24px;border-radius:12px 12px 0 0;">
        <h1 style="margin:0;font-size:24px;">New Provider Listing Request</h1>
        <p style="margin:8px 0 0;color:#d7e0ed;">The Veteran File</p>
      </div>

      <div style="border:1px solid #dbe3ed;border-top:none;padding:24px;border-radius:0 0 12px 12px;">

        <h2 style="font-size:18px;">Provider Information</h2>

        <p><strong>Practice / Provider:</strong><br>${safe(practiceName)}</p>
        <p><strong>Provider Name:</strong><br>${safe(providerName)}</p>
        <p><strong>Credentials:</strong><br>${safe(credentials)}</p>
        <p><strong>Specialty:</strong><br>${safe(specialty)}</p>

        <hr style="border:none;border-top:1px solid #dbe3ed;margin:24px 0;">

        <h2 style="font-size:18px;">Contact</h2>

        <p><strong>Email:</strong><br>
          <a href="mailto:${safe(email)}">${safe(email)}</a>
        </p>

        <p><strong>Phone:</strong><br>${safe(phone || "Not provided")}</p>

        <p><strong>Website:</strong><br>
          ${
            website
              ? `<a href="${safe(website)}">${safe(website)}</a>`
              : "Not provided"
          }
        </p>

        <hr style="border:none;border-top:1px solid #dbe3ed;margin:24px 0;">

        <h2 style="font-size:18px;">Practice Details</h2>

        <p><strong>States Licensed / Practicing:</strong><br>${safe(states)}</p>

        <p><strong>Telehealth:</strong><br>${safe(telehealth)}</p>

        <p><strong>Services Offered:</strong></p>
        <ul>${serviceList}</ul>

        <p><strong>Practice Description:</strong></p>
        <p style="white-space:pre-wrap;">${safe(description)}</p>

        <hr style="border:none;border-top:1px solid #dbe3ed;margin:24px 0;">

        <p style="font-size:12px;color:#617087;">
          The provider acknowledged that submission does not guarantee a listing
          and that inclusion does not constitute endorsement by The Veteran File
          or the U.S. Department of Veterans Affairs.
        </p>

      </div>
    </div>
  `;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "The Veteran File <listings@theveteranfile.org>",
        to: ["info@theveteranfile.org"],
        reply_to: email,
        subject: `Provider Listing Request | ${practiceName}`,
        html
      })
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("Resend error:", result);

      return res.status(response.status).json({
        error: result?.message || "Unable to send listing request."
      });
    }

    return res.status(200).json({
      success: true
    });

  } catch (error) {
    console.error("Provider email error:", error);

    return res.status(500).json({
      error: "Unable to submit the request right now."
    });
  }
}
