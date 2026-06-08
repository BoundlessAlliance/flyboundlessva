const airlineSelect = document.getElementById('airline');
const airframeSelect = document.getElementById('airframe');
const registrationSelect = document.getElementById('registration');
const searchBtn = document.getElementById('searchBtn');
const resultsGrid = document.getElementById('resultsGrid');

const airlineLogoMap = {
  'American': 'assets/aal_icon.png',
  'American Airlines': 'assets/aal_icon.png',
  'Delta': 'assets/dal_icon.png',
  'Delta Air Lines': 'assets/dal_icon.png',
  'Southwest': 'assets/swa_icon.png',
  'Southwest Airlines': 'assets/swa_icon.png',
  'United': 'assets/ual_icon.png',
  'United Airlines': 'assets/ual_icon.png'
};

const airlineTailMap = {
  'American': 'assets/aal_tail.png',
  'American Airlines': 'assets/aal_tail.png',
  'Delta': 'assets/dal_tail.png',
  'Delta Air Lines': 'assets/dal_tail.png',
  'Southwest': 'assets/swa_tail.png',
  'Southwest Airlines': 'assets/swa_tail.png',
  'United': 'assets/ual_tail.png',
  'United Airlines': 'assets/ual_tail.png'
};

function uniqueValues(list, key) {
  return [...new Set(list.map(item => item[key]).filter(Boolean))].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
}

function setSelectOptions(select, placeholder, values) {
  select.innerHTML = `<option value="">${placeholder}</option>`;

  values.forEach(value => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = value;
    select.appendChild(option);
  });
}

function getFilteredAircraft() {
  const airline = airlineSelect.value;
  const airframe = airframeSelect.value;
  let registration = registrationSelect.value;

  if (registration === 'RANDOM') {
    const matchingAircraft = aircraftDatabase.filter(aircraft =>
      aircraft.airline === airline &&
      aircraft.airframe === airframe
    );

    if (!matchingAircraft.length) return [];

    const randomAircraft =
      matchingAircraft[Math.floor(Math.random() * matchingAircraft.length)];

    return [randomAircraft];
  }

  return aircraftDatabase.filter(aircraft => {
    const matchesAirline = !airline || aircraft.airline === airline;
    const matchesAirframe = !airframe || aircraft.airframe === airframe;
    const matchesRegistration =
      !registration || aircraft.registration === registration;

    return matchesAirline && matchesAirframe && matchesRegistration;
  });
}

function getLogo(airline) {
  return airlineLogoMap[airline] || 'assets/logo.png';
}

function getTailImage(airline) {
  return airlineTailMap[airline] || getLogo(airline);
}

function getFlightRadar24Url(registration) {
  return `https://www.flightradar24.com/data/aircraft/${encodeURIComponent(registration.toLowerCase())}`;
}


function aircraftCard(aircraft) {
  return `<article class="aircraft-showcase-card">
    <div class="aircraft-showcase-main">
      <div class="aircraft-image-stack">
        <img class="aircraft-tail-circle" src="${getTailImage(aircraft.airline)}" alt="${aircraft.airline} aircraft tail">
        <span class="aircraft-logo-circle">
          <img src="${getLogo(aircraft.airline)}" alt="${aircraft.airline} logo">
        </span>
      </div>

      <div class="aircraft-showcase-details">
        <div class="aircraft-showcase-header">
          <h3>${aircraft.airline}</h3>
          <span class="aircraft-status">Available</span>
        </div>

        <div class="aircraft-detail-line">
          <span class="aircraft-detail-icon">📝</span>
          <div>
            <small>Registration</small>
            <strong>${aircraft.registration}</strong>
          </div>
        </div>

        <div class="aircraft-detail-line">
          <span class="aircraft-detail-icon">✈</span>
          <div>
            <small>Aircraft Type</small>
            <strong>${aircraft.airframe}</strong>
          </div>
        </div>
      </div>
    </div>

    <a href="${getFlightRadar24Url(aircraft.registration)}" class="aircraft-showcase-footer" target="_blank" rel="noopener">
      <span>✓</span> View Details
    </a>
  </article>`;
}

function render(list) {
  if (!list.length) {
    resultsGrid.innerHTML = `<article class="result-card empty-result"><h3>No Aircraft Found</h3><p>Try changing the airline, airframe, or registration.</p></article>`;
    return;
  }

  resultsGrid.innerHTML = list.map(aircraftCard).join('');
}

function populateAirlines() {
  setSelectOptions(airlineSelect, 'Select Airline', uniqueValues(aircraftDatabase, 'airline'));
}

function populateAirframes() {
  const airline = airlineSelect.value;
  const aircraftForAirline = aircraftDatabase.filter(aircraft => !airline || aircraft.airline === airline);

  setSelectOptions(airframeSelect, 'Select Airframe', uniqueValues(aircraftForAirline, 'airframe'));
  setSelectOptions(registrationSelect, 'Select Registration', []);

  airframeSelect.disabled = !airline;
  registrationSelect.disabled = true;
}

function populateRegistrations() {
  const airline = airlineSelect.value;
  const airframe = airframeSelect.value;

  const matchingAircraft = aircraftDatabase.filter(aircraft => {
    return aircraft.airline === airline && aircraft.airframe === airframe;
  });

  const registrations = uniqueValues(matchingAircraft, 'registration');

    registrationSelect.innerHTML = `
      <option value="">Select Registration</option>
      <option value="RANDOM">🎲 Random Registration</option>
    `;

    registrations.forEach(reg => {
      const option = document.createElement('option');
      option.value = reg;
      option.textContent = reg;
      registrationSelect.appendChild(option);
    });
  registrationSelect.disabled = !airline || !airframe;
}

function showStartingMessage() {
  resultsGrid.innerHTML = `<article class="result-card empty-result">
    <h3>Select an Aircraft</h3>
    <p>Choose an airline, then an available airframe, then a registration number.</p>
  </article>`;
}

populateAirlines();
populateAirframes();
showStartingMessage();

airlineSelect.addEventListener('change', () => {
  populateAirframes();
  showStartingMessage();
});

airframeSelect.addEventListener('change', () => {
  populateRegistrations();
  showStartingMessage();
});

registrationSelect.addEventListener('change', () => {
  if (registrationSelect.value) {
    render(getFilteredAircraft());
  }
});

searchBtn.addEventListener('click', () => {
  render(getFilteredAircraft());
});
