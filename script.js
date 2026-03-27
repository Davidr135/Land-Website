const properties = [
  {
    id: crypto.randomUUID(),
    title: "Sunrise Bench Homestead",
    state: "Idaho",
    region: "Bonner County",
    price: 385000,
    acres: 42,
    parcel: "RP56N01W314800A",
    avgSlope: 9.2,
    slopeUnder10: 71,
    waterSource: "Year-round spring + seasonal creek",
    powerSource: "Hybrid solar + utility line at road",
    well: true,
    septic: true,
    waterRights: true,
    rainfall: 27,
    distCostco: 44,
    distHospital: 28,
    distTown: 11,
    distHardware: 13,
    distAirport: 52,
    geology: "Granite and glacial till; moderate drainage with low observed landslide risk.",
    taxHistory: "2025: $1,380 | 2024: $1,295 | 2023: $1,240"
  },
  {
    id: crypto.randomUUID(),
    title: "Mesa Orchard Parcel",
    state: "Colorado",
    region: "Delta County",
    price: 512000,
    acres: 61,
    parcel: "345712900021",
    avgSlope: 6.4,
    slopeUnder10: 84,
    waterSource: "Irrigation ditch + rain catchment",
    powerSource: "Grid with backup generator",
    well: false,
    septic: true,
    waterRights: true,
    rainfall: 16,
    distCostco: 57,
    distHospital: 21,
    distTown: 8,
    distHardware: 9,
    distAirport: 34,
    geology: "Alluvial fans over shale; fertile topsoil with mild salinity risk in low pockets.",
    taxHistory: "2025: $2,090 | 2024: $2,025 | 2023: $1,980"
  },
  {
    id: crypto.randomUUID(),
    title: "Ozark Ridge Retreat",
    state: "Missouri",
    region: "Shannon County",
    price: 265000,
    acres: 34,
    parcel: "09-6.0-13-000-000-001.01",
    avgSlope: 13.1,
    slopeUnder10: 49,
    waterSource: "Shared spring box + hauled water option",
    powerSource: "Off-grid solar",
    well: false,
    septic: false,
    waterRights: false,
    rainfall: 44,
    distCostco: 91,
    distHospital: 37,
    distTown: 15,
    distHardware: 16,
    distAirport: 109,
    geology: "Karst limestone; cave potential and sinkhole monitoring recommended.",
    taxHistory: "2025: $780 | 2024: $735 | 2023: $699"
  }
];

let activePropertyId = properties[0]?.id;

const listingGrid = document.getElementById("listingGrid");
const detailsPanel = document.getElementById("detailsPanel");
const resultsCount = document.getElementById("resultsCount");
const searchInput = document.getElementById("searchInput");
const applyFiltersBtn = document.getElementById("applyFiltersBtn");
const resetBtn = document.getElementById("resetBtn");

const filters = {
  minAcres: document.getElementById("minAcres"),
  maxPrice: document.getElementById("maxPrice"),
  maxSlope: document.getElementById("maxSlope"),
  waterRightsOnly: document.getElementById("waterRightsOnly"),
  wellOnly: document.getElementById("wellOnly")
};

const propertyForm = document.getElementById("propertyForm");
const listingCardTemplate = document.getElementById("listingCardTemplate");

function usd(value) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

function viabilityScore(property) {
  const slopeScore = Math.max(0, 100 - property.avgSlope * 4);
  const flatUsableScore = property.slopeUnder10;
  const waterInfraScore = [property.well, property.waterRights].filter(Boolean).length * 18;
  const septicScore = property.septic ? 12 : 0;
  const rainfallScore = Math.min(100, Math.max(0, (property.rainfall / 35) * 100));
  const accessPenalty = (property.distTown + property.distHospital + property.distHardware) / 3;

  const finalScore =
    slopeScore * 0.22 +
    flatUsableScore * 0.2 +
    waterInfraScore * 0.19 +
    septicScore * 0.09 +
    rainfallScore * 0.15 +
    Math.max(0, 100 - accessPenalty * 2) * 0.15;

  return Math.round(Math.min(100, finalScore));
}

function applyFilters(list) {
  const query = searchInput.value.trim().toLowerCase();
  return list.filter((property) => {
    if (query) {
      const searchable = `${property.title} ${property.state} ${property.region} ${property.parcel}`.toLowerCase();
      if (!searchable.includes(query)) return false;
    }

    if (filters.minAcres.value && property.acres < Number(filters.minAcres.value)) return false;
    if (filters.maxPrice.value && property.price > Number(filters.maxPrice.value)) return false;
    if (filters.maxSlope.value && property.avgSlope > Number(filters.maxSlope.value)) return false;
    if (filters.waterRightsOnly.value === "yes" && !property.waterRights) return false;
    if (filters.wellOnly.value === "yes" && !property.well) return false;

    return true;
  });
}

function renderListings() {
  const filtered = applyFilters(properties);
  listingGrid.innerHTML = "";

  if (!filtered.length) {
    listingGrid.innerHTML = `<p>No properties matched. Try relaxing filters.</p>`;
    detailsPanel.innerHTML = "<h2>Property Details</h2><p>No active property.</p>";
    resultsCount.textContent = "0 matching listings";
    return;
  }

  if (!filtered.some((p) => p.id === activePropertyId)) {
    activePropertyId = filtered[0].id;
  }

  filtered.forEach((property) => {
    const node = listingCardTemplate.content.cloneNode(true);
    const card = node.querySelector(".listing-card");
    const score = viabilityScore(property);

    card.querySelector(".listing-title").textContent = property.title;
    card.querySelector(".location").textContent = `${property.region}, ${property.state}`;
    card.querySelector(".acres").textContent = `${property.acres} acres`;
    card.querySelector(".price").textContent = usd(property.price);
    card.querySelector(".score").textContent = `Score ${score}/100`;
    card.querySelector(".parcel").textContent = `Parcel: ${property.parcel}`;

    if (property.id === activePropertyId) card.classList.add("selected");

    card.addEventListener("click", () => {
      activePropertyId = property.id;
      renderListings();
      renderDetails(property);
    });

    listingGrid.appendChild(node);
  });

  resultsCount.textContent = `${filtered.length} matching listing${filtered.length > 1 ? "s" : ""}`;
  renderDetails(filtered.find((p) => p.id === activePropertyId));
}

function boolText(flag) {
  return flag ? "Yes" : "No";
}

function renderDetails(property) {
  if (!property) {
    detailsPanel.innerHTML = "<h2>Property Details</h2><p>No active property.</p>";
    return;
  }

  const score = viabilityScore(property);

  detailsPanel.innerHTML = `
    <h2>${property.title}</h2>
    <p>${property.region}, ${property.state}</p>

    <div class="metrics-grid">
      <div class="metric"><span class="label">Homestead score</span><span class="value">${score}/100</span></div>
      <div class="metric"><span class="label">Acres</span><span class="value">${property.acres}</span></div>
      <div class="metric"><span class="label">Price</span><span class="value">${usd(property.price)}</span></div>
      <div class="metric"><span class="label">Avg slope</span><span class="value">${property.avgSlope}°</span></div>
      <div class="metric"><span class="label">Land under 10°</span><span class="value">${property.slopeUnder10}%</span></div>
      <div class="metric"><span class="label">Rainfall (annual)</span><span class="value">${property.rainfall} in</span></div>
    </div>

    <div class="kv-list">
      <div class="kv-item"><div class="k">Parcel number</div><div class="v">${property.parcel}</div></div>
      <div class="kv-item"><div class="k">Water source</div><div class="v">${property.waterSource}</div></div>
      <div class="kv-item"><div class="k">Power source</div><div class="v">${property.powerSource}</div></div>
      <div class="kv-item"><div class="k">Water rights included</div><div class="v">${boolText(property.waterRights)}</div></div>
      <div class="kv-item"><div class="k">Well on property</div><div class="v">${boolText(property.well)}</div></div>
      <div class="kv-item"><div class="k">Septic on property</div><div class="v">${boolText(property.septic)}</div></div>
      <div class="kv-item"><div class="k">Distance to Costco</div><div class="v">${property.distCostco} mi</div></div>
      <div class="kv-item"><div class="k">Distance to hospital</div><div class="v">${property.distHospital} mi</div></div>
      <div class="kv-item"><div class="k">Distance to town</div><div class="v">${property.distTown} mi</div></div>
      <div class="kv-item"><div class="k">Distance to hardware store</div><div class="v">${property.distHardware} mi</div></div>
      <div class="kv-item"><div class="k">Distance to airport</div><div class="v">${property.distAirport} mi</div></div>
    </div>

    <section class="long-text">
      <h4>Geology notes</h4>
      <p>${property.geology}</p>
    </section>
    <section class="long-text">
      <h4>Tax history</h4>
      <p>${property.taxHistory}</p>
    </section>
  `;
}

function propertyFromForm(formData) {
  return {
    id: crypto.randomUUID(),
    title: formData.get("title"),
    state: formData.get("state"),
    region: formData.get("region"),
    price: Number(formData.get("price")),
    acres: Number(formData.get("acres")),
    parcel: formData.get("parcel"),
    avgSlope: Number(formData.get("avgSlope")),
    slopeUnder10: Number(formData.get("slopeUnder10")),
    waterSource: formData.get("waterSource"),
    powerSource: formData.get("powerSource"),
    well: formData.get("well") === "on",
    septic: formData.get("septic") === "on",
    waterRights: formData.get("waterRights") === "on",
    rainfall: Number(formData.get("rainfall")),
    distCostco: Number(formData.get("distCostco")),
    distHospital: Number(formData.get("distHospital")),
    distTown: Number(formData.get("distTown")),
    distHardware: Number(formData.get("distHardware")),
    distAirport: Number(formData.get("distAirport")),
    geology: formData.get("geology"),
    taxHistory: formData.get("taxHistory")
  };
}

propertyForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(propertyForm);
  const property = propertyFromForm(formData);
  properties.unshift(property);
  activePropertyId = property.id;
  propertyForm.reset();
  renderListings();
});

applyFiltersBtn.addEventListener("click", renderListings);
searchInput.addEventListener("input", renderListings);

resetBtn.addEventListener("click", () => {
  Object.values(filters).forEach((input) => {
    input.value = input.tagName === "SELECT" ? "any" : "";
  });
  searchInput.value = "";
  renderListings();
});

renderListings();
