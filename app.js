const listings = [
  {
    name: 'Juniper Ridge Retreat',
    location: 'Coconino County, AZ',
    price: 189000,
    acres: 24,
    waterSource: true,
    buildablePct: 78,
    avgSlope: 6,
    leveling: 'Minimal',
    septic: 'Likely',
    power: '0.6 mi',
    cityDistance: 28,
    hardwareDistance: 17,
    costcoDistance: 49,
    hospitalDistance: 31,
    weather: 'Mild summers, 17" annual rainfall',
    zoning: 'Rural residential',
    parcel: '301-44-118A',
    personaScores: { all: 91, 'off-grid': 94, family: 82, farm: 88 },
    highlights: ['Existing shared well access', '78% buildable under 10° slope', 'Good balance of seclusion and services'],
    description: 'High-desert acreage with excellent build pads, established access, and a strong off-grid solar profile.'
  },
  {
    name: 'Cedar Basin Homestead',
    location: 'Klamath County, OR',
    price: 248000,
    acres: 41,
    waterSource: true,
    buildablePct: 64,
    avgSlope: 9,
    leveling: 'Moderate',
    septic: 'Perc test needed',
    power: 'On road frontage',
    cityDistance: 36,
    hardwareDistance: 24,
    costcoDistance: 71,
    hospitalDistance: 43,
    weather: 'Cold winters, 21" annual rainfall',
    zoning: 'Rural agricultural',
    parcel: 'R-9821-004C',
    personaScores: { all: 86, 'off-grid': 88, family: 77, farm: 92 },
    highlights: ['41 acres for rotational grazing', 'Strong rainfall and cooler growing season', 'Roadside power with private interior'],
    description: 'A larger parcel suited for food production, livestock, and long-term self-sufficiency planning.'
  },
  {
    name: 'Pine Mesa Escape',
    location: 'Las Animas County, CO',
    price: 129000,
    acres: 12,
    waterSource: false,
    buildablePct: 55,
    avgSlope: 11,
    leveling: 'Likely',
    septic: 'Likely',
    power: 'Solar ideal',
    cityDistance: 44,
    hardwareDistance: 27,
    costcoDistance: 94,
    hospitalDistance: 52,
    weather: 'Sunny, windy spring, 14" annual rainfall',
    zoning: 'Residential estate',
    parcel: '7103219005',
    personaScores: { all: 72, 'off-grid': 84, family: 58, farm: 63 },
    highlights: ['Low entry price', 'Excellent solar exposure', 'Remote feel for privacy seekers'],
    description: 'A budget-friendly off-grid parcel for buyers prioritizing independence and scenic seclusion.'
  }
];

const scoreCategories = [
  { label: 'Water & utilities', value: 88 },
  { label: 'Buildability & terrain', value: 81 },
  { label: 'Climate & food potential', value: 76 },
  { label: 'Access to essentials', value: 69 },
  { label: 'Regulatory & tax clarity', value: 84 }
];

const listingGrid = document.querySelector('#listingGrid');
const scoreBars = document.querySelector('#scoreBars');
const topMatchName = document.querySelector('#topMatchName');
const topMatchScore = document.querySelector('#topMatchScore');
const topMatchHighlights = document.querySelector('#topMatchHighlights');
const budgetFilter = document.querySelector('#budgetFilter');
const acreageFilter = document.querySelector('#acreageFilter');
const waterFilter = document.querySelector('#waterFilter');
const buildabilityFilter = document.querySelector('#buildabilityFilter');
const chips = [...document.querySelectorAll('.chip')];

let activePersona = 'all';

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(value);
}

function renderScoreBars() {
  scoreBars.innerHTML = scoreCategories
    .map(
      (category) => `
        <div class="score-row">
          <header>
            <span>${category.label}</span>
            <span>${category.value}/100</span>
          </header>
          <div class="bar"><div style="width: ${category.value}%"></div></div>
        </div>
      `
    )
    .join('');
}

function getFilteredListings() {
  return listings
    .filter((listing) => {
      const withinBudget = budgetFilter.value === 'all' || listing.price <= Number(budgetFilter.value);
      const hasAcreage = acreageFilter.value === 'all' || listing.acres >= Number(acreageFilter.value);
      const hasWater = waterFilter.value === 'all' || listing.waterSource;
      const buildableEnough =
        buildabilityFilter.value === 'all' || listing.buildablePct >= Number(buildabilityFilter.value);

      return withinBudget && hasAcreage && hasWater && buildableEnough;
    })
    .sort((a, b) => b.personaScores[activePersona] - a.personaScores[activePersona]);
}

function renderTopMatch(listingsToRender) {
  const topListing = listingsToRender[0];

  if (!topListing) {
    topMatchName.textContent = 'No parcels match';
    topMatchScore.textContent = '--';
    topMatchHighlights.innerHTML = '<li>Try widening the acreage or budget filters.</li>';
    return;
  }

  topMatchName.textContent = topListing.name;
  topMatchScore.textContent = topListing.personaScores[activePersona];
  topMatchHighlights.innerHTML = topListing.highlights.map((item) => `<li>${item}</li>`).join('');
}

function renderListings() {
  const filteredListings = getFilteredListings();

  renderTopMatch(filteredListings);

  listingGrid.innerHTML = filteredListings.length
    ? filteredListings
        .map(
          (listing) => `
            <article class="listing-card">
              <div class="listing-top">
                <div>
                  <h3>${listing.name}</h3>
                  <p class="listing-meta">${listing.location} • ${listing.acres} acres</p>
                </div>
                <div class="score-pill">Score ${listing.personaScores[activePersona]}</div>
              </div>

              <div>
                <div class="price">${formatCurrency(listing.price)}</div>
                <p class="listing-description">${listing.description}</p>
              </div>

              <div class="fact-grid">
                <div class="fact"><span>Water</span><strong>${listing.waterSource ? 'Existing source' : 'Needs well/catchment'}</strong></div>
                <div class="fact"><span>Buildable land</span><strong>${listing.buildablePct}% under 10°</strong></div>
                <div class="fact"><span>Average slope</span><strong>${listing.avgSlope}°</strong></div>
                <div class="fact"><span>Leveling</span><strong>${listing.leveling}</strong></div>
                <div class="fact"><span>Septic</span><strong>${listing.septic}</strong></div>
                <div class="fact"><span>Power</span><strong>${listing.power}</strong></div>
                <div class="fact"><span>Nearest city</span><strong>${listing.cityDistance} mi</strong></div>
                <div class="fact"><span>Hospital</span><strong>${listing.hospitalDistance} mi</strong></div>
                <div class="fact"><span>Costco</span><strong>${listing.costcoDistance} mi</strong></div>
                <div class="fact"><span>Parcel</span><strong>${listing.parcel}</strong></div>
              </div>

              <div class="listing-meta">${listing.zoning} • ${listing.weather} • Hardware store ${listing.hardwareDistance} mi</div>
            </article>
          `
        )
        .join('')
    : '<article class="listing-card"><h3>No matches found</h3><p class="listing-description">Adjust the filters to see more parcels.</p></article>';
}

[budgetFilter, acreageFilter, waterFilter, buildabilityFilter].forEach((filter) => {
  filter.addEventListener('change', renderListings);
});

chips.forEach((chip) => {
  chip.addEventListener('click', () => {
    activePersona = chip.dataset.persona;
    chips.forEach((item) => item.classList.toggle('active', item === chip));
    renderListings();
  });
});

renderScoreBars();
renderListings();
