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
