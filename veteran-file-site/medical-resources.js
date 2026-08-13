
const providers = [
  // Keep this array empty until real providers are reviewed.
  // Example structure for later:
  // {
  //   name: "Example Medical Group",
  //   credentials: "MD",
  //   specialty: "Neurology",
  //   specialtyKey: "neurology",
  //   states: ["SC", "NC", "GA"],
  //   telehealth: true,
  //   services: ["nexus", "imo", "records"],
  //   serviceLabels: ["Nexus opinions", "Independent medical opinions", "Records reviews"],
  //   website: "https://example.com"
  // }
];

const search = document.querySelector("#providerSearch");
const service = document.querySelector("#serviceFilter");
const specialty = document.querySelector("#specialtyFilter");
const grid = document.querySelector("#providerGrid");
const status = document.querySelector("#providerStatus");
const year = document.querySelector("#year");
if (year) year.textContent = new Date().getFullYear();

function esc(value=""){
  return String(value).replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  })[c]);
}

function render(){
  const q = (search?.value || "").trim().toLowerCase();
  const serviceValue = service?.value || "";
  const specialtyValue = specialty?.value || "";

  const filtered = providers.filter((p) => {
    const haystack = [
      p.name, p.credentials, p.specialty,
      ...(p.states || []), ...(p.serviceLabels || [])
    ].join(" ").toLowerCase();

    const matchesSearch = !q || haystack.includes(q);
    const matchesService = !serviceValue || (p.services || []).includes(serviceValue);
    const matchesSpecialty = !specialtyValue || p.specialtyKey === specialtyValue;
    return matchesSearch && matchesService && matchesSpecialty;
  });

  status.textContent = providers.length
    ? `${filtered.length} provider${filtered.length === 1 ? "" : "s"} shown.`
    : "Provider directory framework is live. Curated listings have not been published yet.";

  if (!filtered.length) {
    grid.innerHTML = `
      <div class="provider-empty">
        <h3>${providers.length ? "No providers match those filters." : "Provider listings are coming soon."}</h3>
        <p>${providers.length
          ? "Try a different service, specialty, state, or search term."
          : "The Veteran File will only publish real provider information after review. No sample or invented providers are displayed as actual medical resources."}</p>
      </div>`;
    return;
  }

  grid.innerHTML = filtered.map((p) => `
    <article class="provider-card">
      <span class="provider-credentials">${esc(p.credentials || "Independent provider")}</span>
      <h3>${esc(p.name)}</h3>
      <div class="provider-specialty">${esc(p.specialty || "")}</div>
      <div class="provider-tags">
        ${(p.serviceLabels || []).map(label => `<span class="provider-tag">${esc(label)}</span>`).join("")}
        ${p.telehealth ? `<span class="provider-tag">Telehealth</span>` : ""}
      </div>
      <div class="provider-meta">
        ${p.states?.length ? `<p><strong>States:</strong> ${p.states.map(esc).join(", ")}</p>` : ""}
        ${p.website ? `<p><a href="${esc(p.website)}" target="_blank" rel="noopener">Visit provider website ↗</a></p>` : ""}
      </div>
    </article>
  `).join("");
}

[search, service, specialty].forEach(el => {
  el?.addEventListener("input", render);
  el?.addEventListener("change", render);
});

render();

// --- Provider listing request form ---
const providerRequestForm = document.querySelector("#providerRequestForm");
const providerSubmitBtn = document.querySelector("#providerSubmitBtn");
const providerFormStatus = document.querySelector("#providerFormStatus");

if (providerRequestForm) {
  providerRequestForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(providerRequestForm);

    const services = formData.getAll("services");

    if (!services.length) {
      providerFormStatus.textContent = "Please select at least one service.";
      providerFormStatus.className = "provider-form-status error";
      return;
    }

    const payload = {
      practiceName: formData.get("practiceName")?.trim(),
      providerName: formData.get("providerName")?.trim(),
      credentials: formData.get("credentials")?.trim(),
      specialty: formData.get("specialty")?.trim(),
      email: formData.get("email")?.trim(),
      phone: formData.get("phone")?.trim(),
      website: formData.get("website")?.trim(),
      states: formData.get("states")?.trim(),
      telehealth: formData.get("telehealth"),
      services,
      description: formData.get("description")?.trim(),
      acknowledgement: formData.get("acknowledgement") === "on"
    };

    providerSubmitBtn.disabled = true;
    providerSubmitBtn.textContent = "Submitting…";

    providerFormStatus.textContent = "Sending your request…";
    providerFormStatus.className = "provider-form-status";

    try {
      const response = await fetch("/api/provider-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Unable to submit your request.");
      }

      providerFormStatus.textContent =
        "Request received. The Veteran File will review your submission.";

      providerFormStatus.className = "provider-form-status success";

      providerRequestForm.reset();

      if (typeof sendGAEvent === "function") {
        sendGAEvent("provider_listing_request", {
          form_name: "medical_provider_directory"
        });
      }

    } catch (error) {
      console.error("Provider listing request:", error);

      providerFormStatus.textContent =
        error.message || "Something went wrong. Please try again.";

      providerFormStatus.className = "provider-form-status error";

    } finally {
      providerSubmitBtn.disabled = false;
      providerSubmitBtn.textContent = "Submit Listing Request";
    }
  });
}
