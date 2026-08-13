
const stateData = window.STATE_BENEFITS_DATA || {};
const stateSelect = document.querySelector("#stateSelect");
const stateEmpty = document.querySelector("#stateEmpty");
const statePublished = document.querySelector("#statePublished");
const stateComingSoon = document.querySelector("#stateComingSoon");
const benefitGrid = document.querySelector("#benefitGrid");
const providerYear = document.querySelector("#year");
if (providerYear) providerYear.textContent = new Date().getFullYear();

let activeCategory = "";

function esc(v=""){return String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));}

Object.values(stateData)
  .sort((a,b)=>a.name.localeCompare(b.name))
  .forEach((state)=>{
    const opt=document.createElement("option");
    opt.value=Object.keys(stateData).find(k=>stateData[k]===state);
    opt.textContent=state.name;
    stateSelect.appendChild(opt);
  });

function renderBenefits(state){
  const benefits=(state.benefits||[]).filter(b=>!activeCategory || b.category===activeCategory);
  benefitGrid.innerHTML=benefits.map(b=>`
    <article class="benefit-card">
      <span class="benefit-category">${esc(b.category)}</span>
      <h3>${esc(b.title)}</h3>
      <p>${esc(b.summary)}</p>
      <div class="benefit-source">Source: ${esc(b.source)}</div>
      <p><a href="${esc(b.url)}" target="_blank" rel="noopener">${esc(b.cta)} ↗</a></p>
    </article>`).join("");
}

function loadState(slug,{push=true}={}){
  const state=stateData[slug];
  stateEmpty.hidden=!!slug;
  statePublished.hidden=true;
  stateComingSoon.hidden=true;
  if(!slug || !state) return;

  stateSelect.value=slug;

  if(push){
    const url=new URL(location.href);
    url.searchParams.set("state",slug);
    history.pushState({state:slug},"",url);
  }

  if(!state.published){
    document.querySelector("#comingSoonName").textContent=`${state.name} Veteran benefits`;
    stateComingSoon.hidden=false;
    return;
  }

  document.querySelector("#stateAbbr").textContent=`${state.abbr} • VERIFIED STARTING POINTS`;
  document.querySelector("#stateName").textContent=`${state.name} Veteran benefits`;
  document.querySelector("#stateIntro").textContent=state.intro;
  const agency=document.querySelector("#stateAgencyLink");
  agency.textContent=state.agency.name;
  agency.href=state.agency.url;
  document.querySelector("#lastReviewed").textContent=`Last reviewed: ${state.lastReviewed}`;
  statePublished.hidden=false;
  renderBenefits(state);

  document.title=`${state.name} Veteran Benefits | The Veteran File`;
  const desc=`Find ${state.name} Veteran benefits, tax programs, education resources, employment support, claims assistance, housing resources, and official state links.`;
  let meta=document.querySelector('meta[name="description"]');
  if(meta) meta.setAttribute("content",desc);
}

stateSelect.addEventListener("change",()=>loadState(stateSelect.value));

document.querySelectorAll(".benefit-filter").forEach(btn=>{
  btn.addEventListener("click",()=>{
    document.querySelectorAll(".benefit-filter").forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");
    activeCategory=btn.dataset.category||"";
    const slug=stateSelect.value;
    if(slug && stateData[slug]?.published) renderBenefits(stateData[slug]);
  });
});

window.addEventListener("popstate",()=>{
  const slug=new URL(location.href).searchParams.get("state")||"";
  loadState(slug,{push:false});
});

const pathParts = location.pathname.split("/").filter(Boolean);

const pathState =
  pathParts[0] === "state-benefits" && pathParts[1]
    ? pathParts[1]
    : "";

const queryState =
  new URL(location.href).searchParams.get("state") || "";

const initial = pathState || queryState;

if (initial) {
  loadState(initial, { push: false });
}
