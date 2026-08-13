
const $ = (selector) => document.querySelector(selector);

function sendGAEvent(eventName, params = {}) {
  if (typeof gtag === "function") {
    gtag("event", eventName, params);
  }
}

const year = $("#year");
if (year) year.textContent = new Date().getFullYear();

// Track labeled outbound links.
document.querySelectorAll("a[data-track]").forEach((link) => {
  link.addEventListener("click", () => {
    sendGAEvent("resource_click", {
      resource_name: link.dataset.track || "resource",
      link_url: link.href,
      link_text: link.textContent.trim()
    });
  });
});

// Close the CSS mobile menu after selecting a link.
document.querySelectorAll("#mobileNav a").forEach((link) => {
  link.addEventListener("click", () => {
    const toggle = $("#mobileMenuToggle");
    if (toggle) toggle.checked = false;
  });
});

// Track native "Where Do I Start?" cards.
document.querySelectorAll(".native-wizard details").forEach((card, index) => {
  card.addEventListener("toggle", () => {
    if (card.open) {
      const title = card.querySelector("summary strong")?.textContent?.trim() || `choice_${index + 1}`;
      sendGAEvent("wizard_choice", { choice_text: title });
    }
  });
});

// --- Live VA Facilities finder ---
const facilityZip = $("#zipInput");
const facilitySearchBtn = $("#searchFacilitiesBtn");
const facilityStatus = $("#facilityStatus");
const facilityResults = $("#facilityResults");
let selectedFacilityType = "";

document.querySelectorAll(".filter-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    selectedFacilityType = btn.dataset.facilityType || "";
  });
});

function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}

function typeLabel(type) {
  return {
    va_health_facility: "VA Health Care",
    vet_center: "Vet Center",
    va_benefits_facility: "VA Benefits Office",
    va_cemetery: "VA Cemetery"
  }[type] || "VA Facility";
}

function renderFacilities(payload) {
  const data = Array.isArray(payload.data) ? payload.data : [];
  const distances = new Map(
    (payload.meta?.distances || []).map((item) => [item.id, item.distance])
  );

  if (!data.length) {
    facilityResults.innerHTML = `
      <div class="empty-result">
        <strong>No sandbox results found.</strong>
        <p>Try another ZIP code or facility category. Sandbox data is test data and may be incomplete.</p>
      </div>`;
    return;
  }

  facilityResults.innerHTML = data.map((item) => {
    const attrs = item.attributes || {};
    const address = attrs.address?.physical || attrs.address?.mailing || {};
    const cityLine = [address.city, address.state, address.zip].filter(Boolean).join(" ");
    const lines = [address.address1, address.address2, address.address3, cityLine].filter(Boolean);
    const phone = attrs.phone?.main || "";
    const distance = distances.has(item.id)
      ? Number(distances.get(item.id)).toFixed(1)
      : "";
    const mapQuery = encodeURIComponent(lines.join(", "));

    return `
      <article class="facility-card">
        <div class="facility-card-top">
          <div>
            <span class="facility-type">${escapeHTML(typeLabel(attrs.facilityType))}</span>
            <h3>${escapeHTML(attrs.name || "VA Facility")}</h3>
          </div>
          ${distance ? `<span class="distance-badge">${distance} mi</span>` : ""}
        </div>
        ${attrs.classification ? `<p class="classification">${escapeHTML(attrs.classification)}</p>` : ""}
        ${lines.length ? `<p class="facility-address">${lines.map(escapeHTML).join("<br>")}</p>` : ""}
        ${phone ? `<p><a href="tel:${escapeHTML(phone.replace(/[^\d+]/g, ""))}">${escapeHTML(phone)}</a></p>` : ""}
        <div class="facility-actions">
          ${mapQuery ? `<a class="small-btn" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=${mapQuery}">Directions ↗</a>` : ""}
          ${attrs.website ? `<a class="small-btn outline" target="_blank" rel="noopener" href="${escapeHTML(attrs.website)}">VA page ↗</a>` : ""}
        </div>
      </article>`;
  }).join("");
}

async function searchVAFacilities() {
  if (!facilityZip || !facilitySearchBtn || !facilityStatus || !facilityResults) return;

  const zip = facilityZip.value.trim();

  if (!/^\d{5}$/.test(zip)) {
    facilityStatus.textContent = "Enter a valid 5-digit ZIP code.";
    facilityResults.innerHTML = "";
    facilityZip.focus();
    return;
  }

  facilitySearchBtn.disabled = true;
  facilitySearchBtn.textContent = "Searching…";
  facilityStatus.textContent = "Searching VA sandbox data…";
  facilityResults.innerHTML = `<div class="loading-result">Looking for VA resources in ZIP ${escapeHTML(zip)}…</div>`;

  try {
    const params = new URLSearchParams({ zip, per_page: "12" });
    if (selectedFacilityType) params.set("type", selectedFacilityType);

    const response = await fetch(`/api/facilities?${params.toString()}`);
    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload?.error || `Search failed (${response.status}).`);
    }

    facilityStatus.textContent =
      `Showing ${payload.data?.length || 0} sandbox result(s) for ${zip}.`;
    renderFacilities(payload);

    sendGAEvent("facility_search", {
      facility_type: selectedFacilityType || "all",
      result_count: payload.data?.length || 0
    });
  } catch (error) {
    console.error("VA facility finder:", error);
    facilityStatus.textContent = "We couldn't complete that search.";
    facilityResults.innerHTML = `
      <div class="empty-result error-result">
        <strong>Facility search unavailable.</strong>
        <p>${escapeHTML(error.message || "Please try again.")}</p>
        <a href="https://www.va.gov/find-locations/" target="_blank" rel="noopener">
          Use VA.gov's official locator ↗
        </a>
      </div>`;
  } finally {
    facilitySearchBtn.disabled = false;
    facilitySearchBtn.textContent = "Search VA resources";
  }
}

if (facilitySearchBtn) {
  facilitySearchBtn.addEventListener("click", searchVAFacilities);
}

if (facilityZip) {
  facilityZip.addEventListener("keydown", (event) => {
    if (event.key === "Enter") searchVAFacilities();
  });
}
