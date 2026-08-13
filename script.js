const $=s=>document.querySelector(s);const zip=$("#zipInput"),current=$("#currentZip"),status=$("#zipStatus"),toast=$("#toast");
function valid(v){return /^\d{5}$/.test(v)}
function load(){const z=localStorage.getItem("tvfZip");if(z){zip.value=z;current.textContent=z}}load();
$("#saveZipBtn").onclick=()=>{const z=zip.value.trim();if(!valid(z)){status.textContent="Enter a valid 5-digit ZIP code.";return}localStorage.setItem("tvfZip",z);current.textContent=z;status.textContent="ZIP saved on this device.";show("ZIP saved");};
$("#clearZipBtn").onclick=()=>{localStorage.removeItem("tvfZip");zip.value="";current.textContent="Not set";status.textContent="ZIP cleared.";};
document.querySelectorAll(".copy-zip").forEach(b=>b.onclick=async()=>{const z=localStorage.getItem("tvfZip")||zip.value.trim();if(!valid(z)){status.textContent="Enter and save your ZIP first.";zip.focus();return}await navigator.clipboard.writeText(z);show("ZIP "+z+" copied — paste it into the official search.");});
function show(t){toast.textContent=t;toast.classList.add("show");setTimeout(()=>toast.classList.remove("show"),2400)}
const paths={
first:{title:"Start a disability claim",text:"Review VA's filing guide, gather supporting evidence, and consider free help from an accredited VSO.",url:"https://www.va.gov/disability/how-to-file-claim/",label:"Open VA filing guide"},
increase:{title:"Request an increased rating",text:"VA treats this as an increased disability compensation claim. Review what evidence can support that your service-connected condition has worsened.",url:"https://www.va.gov/disability/how-to-file-claim/when-to-file/",label:"Review when to file"},
denied:{title:"Choose a decision review option",text:"Compare Higher-Level Review, Supplemental Claim, and Board Appeal. The right lane depends on what you disagree with and whether you have new evidence.",url:"https://www.va.gov/decision-reviews/",label:"Compare review options"},
health:{title:"Find VA health care",text:"Use the official VA location finder for medical centers, outpatient clinics, and other VA facilities.",url:"https://www.va.gov/find-locations/",label:"Find VA locations"},
rep:{title:"Find accredited help",text:"Use VA's official accreditation tools. VSO representation is available free of charge; attorneys and claims agents may charge fees in permitted situations.",url:"https://www.va.gov/get-help-from-accredited-representative/",label:"Find accredited help"},
housing:{title:"Get housing support",text:"VA has programs for veterans who are homeless or at risk of homelessness, plus home-loan and housing assistance resources.",url:"https://www.va.gov/homeless/",label:"Open housing help"}
};
document.querySelectorAll("[data-path]").forEach(b=>b.onclick=()=>{const p=paths[b.dataset.path],r=$("#wizardResult");r.innerHTML=`<h3>${p.title}</h3><p>${p.text}</p><a href="${p.url}" target="_blank">${p.label} →</a>`;r.hidden=false;r.scrollIntoView({behavior:"smooth",block:"nearest"});});

$("#year").textContent=new Date().getFullYear();

// Google Analytics interaction tracking
function sendGAEvent(eventName, params = {}) {
  if (typeof gtag === "function") {
    gtag("event", eventName, params);
  }
}

// Track key outbound resource links.
document.querySelectorAll("a[data-track]").forEach(link => {
  link.addEventListener("click", () => {
    sendGAEvent("resource_click", {
      resource_name: link.dataset.track,
      link_url: link.href,
      link_text: link.textContent.trim()
    });
  });
});

// Track "Where Do I Start?" selections.
document.querySelectorAll("[data-path]").forEach(button => {
  button.addEventListener("click", () => {
    sendGAEvent("wizard_choice", {
      choice: button.dataset.path,
      choice_text: button.textContent.trim().replace(/\s+/g, " ")
    });
  });
});

// Track successful ZIP use without sending the ZIP itself.
const gaZipButton = document.querySelector("#saveZipBtn");
if (gaZipButton) {
  gaZipButton.addEventListener("click", () => {
    const value = document.querySelector("#zipInput")?.value.trim() || "";
    if (/^\d{5}$/.test(value)) {
      sendGAEvent("zip_search_used", { valid_zip: true });
    }
  });
}

document.querySelectorAll("#mobileNav a").forEach(link => {
  link.addEventListener("click", () => {
    const details = document.querySelector(".mobile-menu");
    if (details) details.removeAttribute("open");
  });
});

const facilityZip=document.querySelector("#zipInput"),facilitySearchBtn=document.querySelector("#searchFacilitiesBtn"),facilityStatus=document.querySelector("#facilityStatus"),facilityResults=document.querySelector("#facilityResults");let selectedFacilityType="";
document.querySelectorAll(".filter-btn").forEach(btn=>btn.addEventListener("click",()=>{document.querySelectorAll(".filter-btn").forEach(b=>b.classList.remove("active"));btn.classList.add("active");selectedFacilityType=btn.dataset.facilityType||"";}));
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
function typeLabel(t){return({"va_health_facility":"VA Health Care","vet_center":"Vet Center","va_benefits_facility":"VA Benefits Office","va_cemetery":"VA Cemetery"})[t]||"VA Facility";}
function renderFacilities(p){const d=Array.isArray(p.data)?p.data:[],dist=new Map((p.meta?.distances||[]).map(x=>[x.id,x.distance]));if(!d.length){facilityResults.innerHTML='<div class="empty-result"><strong>No sandbox results found.</strong><p>Try another ZIP or category.</p></div>';return}facilityResults.innerHTML=d.map(x=>{const a=x.attributes||{},ad=a.address?.physical||a.address?.mailing||{},lines=[ad.address1,ad.address2,ad.address3,[ad.city,ad.state,ad.zip].filter(Boolean).join(" ")].filter(Boolean),ph=a.phone?.main||"",mi=dist.has(x.id)?Number(dist.get(x.id)).toFixed(1):"",mq=encodeURIComponent(lines.join(", "));return `<article class="facility-card"><div class="facility-card-top"><div><span class="facility-type">${esc(typeLabel(a.facilityType))}</span><h3>${esc(a.name||"VA Facility")}</h3></div>${mi?`<span class="distance-badge">${mi} mi</span>`:""}</div>${a.classification?`<p class="classification">${esc(a.classification)}</p>`:""}${lines.length?`<p class="facility-address">${lines.map(esc).join("<br>")}</p>`:""}${ph?`<p><a href="tel:${esc(ph.replace(/[^\d+]/g,""))}">${esc(ph)}</a></p>`:""}<div class="facility-actions">${mq?`<a class="small-btn" target="_blank" href="https://www.google.com/maps/search/?api=1&query=${mq}">Directions ↗</a>`:""}${a.website?`<a class="small-btn outline" target="_blank" href="${esc(a.website)}">VA page ↗</a>`:""}</div></article>`}).join("")}
async function searchVAFacilities(){const z=facilityZip?.value.trim()||"";if(!/^\d{5}$/.test(z)){facilityStatus.textContent="Enter a valid 5-digit ZIP code.";return}facilitySearchBtn.disabled=true;facilitySearchBtn.textContent="Searching…";facilityStatus.textContent="Searching VA sandbox data…";facilityResults.innerHTML=`<div class="loading-result">Looking near ${esc(z)}…</div>`;try{const q=new URLSearchParams({zip:z,per_page:"12"});if(selectedFacilityType)q.set("type",selectedFacilityType);const r=await fetch(`/api/facilities?${q}`),p=await r.json();if(!r.ok)throw new Error(p.error||"Search failed.");facilityStatus.textContent=`Showing ${p.data?.length||0} sandbox result(s) for ${z}.`;renderFacilities(p);if(typeof gtag==="function")gtag("event","facility_search",{facility_type:selectedFacilityType||"all",result_count:p.data?.length||0});}catch(e){facilityStatus.textContent="We couldn't complete that search.";facilityResults.innerHTML=`<div class="empty-result error-result"><strong>Facility search unavailable.</strong><p>${esc(e.message)}</p><a href="https://www.va.gov/find-locations/" target="_blank">Use VA.gov's locator ↗</a></div>`}finally{facilitySearchBtn.disabled=false;facilitySearchBtn.textContent="Search VA resources"}}
facilitySearchBtn?.addEventListener("click",searchVAFacilities);facilityZip?.addEventListener("keydown",e=>{if(e.key==="Enter")searchVAFacilities()});
