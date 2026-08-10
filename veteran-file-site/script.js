const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const zipInput = $('#zipInput');
const zipStatus = $('#zipStatus');
const saveZipBtn = $('#saveZipBtn');
const menuBtn = $('#menuBtn');
const mainNav = $('#mainNav');

function cleanZip(value) {
  return (value || '').trim().replace(/[^0-9-]/g, '').slice(0, 10);
}

function updateRepLinks(zip) {
  $$('.rep-link').forEach((link) => {
    const type = link.dataset.type;
    const base = 'https://www.va.gov/get-help-from-accredited-representative/find-rep/';
    if (zip) {
      const params = new URLSearchParams({ address: zip, distance: '50', page: '1', perPage: '10', sort: 'distance_asc', type });
      link.href = `${base}?${params.toString()}`;
    } else {
      link.href = base;
    }
  });
}

function saveZip() {
  const zip = cleanZip(zipInput.value);
  if (!/^\d{5}(-\d{4})?$/.test(zip)) {
    zipStatus.textContent = 'Enter a valid 5-digit ZIP code.';
    zipStatus.style.color = '#a70d1d';
    return;
  }
  localStorage.setItem('tvfZip', zip);
  updateRepLinks(zip);
  zipStatus.textContent = `ZIP ${zip} saved. Representative links will use it when possible.`;
  zipStatus.style.color = '#315c40';
}

saveZipBtn.addEventListener('click', saveZip);
zipInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') saveZip(); });

const savedZip = localStorage.getItem('tvfZip');
if (savedZip) {
  zipInput.value = savedZip;
  updateRepLinks(savedZip);
}

menuBtn.addEventListener('click', () => {
  const open = mainNav.classList.toggle('open');
  menuBtn.setAttribute('aria-expanded', String(open));
});

$$('#mainNav a').forEach((link) => link.addEventListener('click', () => {
  mainNav.classList.remove('open');
  menuBtn.setAttribute('aria-expanded', 'false');
}));

const paths = {
  first: {
    title: 'Start with VA’s disability claim guide',
    text: 'Review what evidence you may need, then start your claim on VA.gov. If you want help, use the accredited-representative finder.',
    href: 'https://www.va.gov/disability/how-to-file-claim/',
    label: 'Open the official claim guide'
  },
  increase: {
    title: 'Review how VA handles increased-rating claims',
    text: 'If a service-connected condition has worsened, VA explains how to file for an increase and what evidence can support the request.',
    href: 'https://www.va.gov/disability/how-to-file-claim/when-to-file/',
    label: 'Review when to file'
  },
  denied: {
    title: 'Choose the right decision-review option',
    text: 'VA lists the available review paths, including Higher-Level Review, Supplemental Claims, and Board Appeals.',
    href: 'https://www.va.gov/decision-reviews/',
    label: 'Compare decision-review options'
  },
  health: {
    title: 'Find VA health care near you',
    text: 'Use the official VA locator to search for medical centers, clinics, and other nearby VA facilities.',
    href: 'https://www.va.gov/find-locations/',
    label: 'Find VA health care'
  },
  rep: {
    title: 'Find VA-accredited help',
    text: 'Search for a VSO representative, accredited attorney, or accredited claims agent. VSO representation on VA benefit claims is free.',
    href: 'https://www.va.gov/get-help-from-accredited-representative/find-rep/',
    label: 'Find an accredited representative'
  },
  housing: {
    title: 'Open VA housing assistance',
    text: 'VA provides resources for veterans who are homeless or at risk, along with information on home loans and housing grants.',
    href: 'https://www.va.gov/housing-assistance/',
    label: 'Open housing assistance'
  }
};

$$('.wizard-options button').forEach((button) => {
  button.addEventListener('click', () => {
    const item = paths[button.dataset.path];
    const result = $('#wizardResult');
    result.hidden = false;
    result.innerHTML = `<h3>${item.title}</h3><p>${item.text}</p><a href="${item.href}" target="_blank" rel="noopener">${item.label} →</a>`;
    result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
});

$('#year').textContent = new Date().getFullYear();
