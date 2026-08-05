const aircraftFamilySelect = document.getElementById('aircraftFamily');
const airframeSelect = document.getElementById('airframe');
const airlineSelect = document.getElementById('airline');
const registrationSelect = document.getElementById('registration');
const searchBtn = document.getElementById('searchBtn');
const resultsGrid = document.getElementById('resultsGrid');

const airlineTailMap = {
  // #region USA Carriers
  'American Airlines': 'assets/AAL_Tail.webp',
  'United Airlines': 'assets/UAL_Tail.webp',
  'Delta Air Lines': 'assets/DAL_Tail.webp',
  'Allegiant Air': 'assets/AAY_Tail.webp',
  'GlobalX': 'assets/GXA_Tail.webp',
  'JetBlue': 'assets/JBU_Tail.webp',
  'Frontier Airlines': 'assets/FFT_Tail.webp',
  'Southwest Airlines': 'assets/SWA_Tail.webp',
  'Alaska Airlines': 'assets/ASA_Tail.webp',
  'Sun Country Airlines': 'assets/SCX_Tail.webp',
  'National Airlines': 'assets/NCR_Tail.webp',
  'Hawaiian Airlines (Alaska)': 'assets/HAL_Tail.webp',
  // #endregion

  // #region EU Carriers
  'easyJet': 'assets/EZY_Tail.webp',
  'British Airways': 'assets/BAW_Tail.webp',
  'Eurowings': 'assets/EWG_Tail.webp',
  'Lufthansa': 'assets/DLH_Tail.webp',
  'Brussels Airlines': 'assets/BEL_Tail.webp',
  'Wizz Air': 'assets/WZZ_Tail.webp',
  'Vueling': 'assets/VLG_Tail.webp',
  'Air France': 'assets/AFR_Tail.webp',
  'Finnair': 'assets/FIN_Tail.webp',
  'easyJet': 'assets/EZY_Tail.webp',
  'Jetstar': 'assets/JST_Tail.webp',
  'Ryanair': 'assets/RYR_Tail.webp',
  'Jet2.com': 'assets/EXS_Tail.webp',
  'TUI fly': 'assets/TUI_Tail.webp',
  'Transavia': 'assets/TRA_Tail.webp',
  'Norwegian Air Shuttle': 'assets/NOZ_Tail.webp',
  'Iberia': 'assets/IBE_Tail.webp',
  'LEVEL': 'assets/LVL_Tail.webp',
  'Swiss': 'assets/SWS_Tail.webp',
  'Virgin Atlantic': 'assets/VIR_Tail.webp',
  'Aer Lingus': 'assets/EIN_Tail.webp',
  'TAP Air Portugal': 'assets/TAP_Tail.webp',
  'Condor': 'assets/CFG_Tail.webp',
  'ITA Airways': 'assets/ITY_Tail.webp',
  'Corsair': 'assets/CRL_Tail.webp',
  'KLM': 'assets/KLM_Tail.webp',
  'EuroAtlantic Airways': 'assets/MMZ_Tail.webp',
  'French Bee': 'assets/FBU_Tail.webp',
  // #endregion

  // #region Other Carriers
  'Air Canada': 'assets/ACA_Tail.webp',
  // #endregion
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

function getRandomValue(values) {
  if (!values.length) return null;

  return values[Math.floor(Math.random() * values.length)];
}

function getFilteredAircraft() {
  const selectedFamily = aircraftFamilySelect.value;
  const selectedAirframe = airframeSelect.value;
  const selectedAirline = airlineSelect.value;
  const selectedRegistration = registrationSelect.value;

  if (
    !selectedFamily ||
    !selectedAirframe ||
    !selectedAirline ||
    !selectedRegistration
  ) {
    return [];
  }

  let possibleAircraft = [...aircraftDatabase];
  const family =
    selectedFamily === 'RANDOM'
      ? getRandomValue(
          uniqueValues(
            possibleAircraft.map(aircraft => ({
              family: getAircraftFamily(aircraft.airframe)
            })),
            'family'
          )
        )
      : selectedFamily;

  possibleAircraft = possibleAircraft.filter(
    aircraft => getAircraftFamily(aircraft.airframe) === family
  );
  const airframe =
    selectedAirframe === 'RANDOM'
      ? getRandomValue(
          uniqueValues(possibleAircraft, 'airframe')
        )
      : selectedAirframe;

  possibleAircraft = possibleAircraft.filter(
    aircraft => aircraft.airframe === airframe
  );
  const airline =
    selectedAirline === 'RANDOM'
      ? getRandomValue(
          uniqueValues(possibleAircraft, 'airline')
        )
      : selectedAirline;

  possibleAircraft = possibleAircraft.filter(
    aircraft => aircraft.airline === airline
  );
  if (selectedRegistration === 'RANDOM') {
    const registration = getRandomValue(
      uniqueValues(possibleAircraft, 'registration')
    );

    return possibleAircraft.filter(
      aircraft => aircraft.registration === registration
    ).slice(0, 1);
  }

  return possibleAircraft.filter(
    aircraft => aircraft.registration === selectedRegistration
  );
}

function getLogo(airline) {
  return airlineLogoMap[airline] || 'assets/logo.webp';
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

function getAircraftFamily(airframe) {
  const normalized = String(airframe || '').toUpperCase();

  if (
    normalized.includes('A319') ||
    normalized.includes('A320') ||
    normalized.includes('A321')
  ) {
    return 'A320 Family';
  }

  if (
    normalized.includes('B737') ||
    normalized.includes('B738') ||
    normalized.includes('B739') ||
    normalized.includes('B38M')
  ) {
    return 'B737 Family';
  }

  if (
    normalized.includes('A332') ||
    normalized.includes('A333') ||
    normalized.includes('A339')
  ) {
    return 'A330 Family';
  }

  if (
    normalized.includes('B772') ||
    normalized.includes('B77W')
  ) {
    return 'B777 Family';
  }

  if (
    normalized.includes('A359') ||
    normalized.includes('A35K')
  ) {
    return 'A350 Family';
  }

  if (
    normalized.includes('B748')
  ) {
    return 'B747 Family';
  }

  if (
    normalized.includes('A388')
  ) {
    return 'A380 Family';
  }

  if (
    normalized.includes('CRJ7') ||
    normalized.includes('CRJ9')
  ) {
    return 'CRJ Family';
  }

  return 'Other';
}

function populateAircraftFamilies() {
  const families = uniqueValues(
    aircraftDatabase.map(aircraft => ({
      family: getAircraftFamily(aircraft.airframe)
    })),
    'family'
  );

  setSelectOptions(aircraftFamilySelect, 'Select Aircraft Family', families);

const anyFamily = document.createElement('option');
anyFamily.value = 'RANDOM';
anyFamily.textContent = '🎲 Any Aircraft Family';
aircraftFamilySelect.insertBefore(anyFamily, aircraftFamilySelect.options[1]);

  airframeSelect.disabled = true;
  airlineSelect.disabled = true;
  registrationSelect.disabled = true;
}

function populateAirframes() {
  const family = aircraftFamilySelect.value;

  const matchingAircraft = aircraftDatabase.filter(aircraft => {

    const familyMatch =
      family === 'RANDOM' ||
      !family ||
      getAircraftFamily(aircraft.airframe) === family;

    return familyMatch;
  });

  setSelectOptions(
    airframeSelect,
    'Select Aircraft Type',
    uniqueValues(matchingAircraft, 'airframe')
  );

  const anyType = document.createElement('option');
  anyType.value = 'RANDOM';
  anyType.textContent = '🎲 Any Aircraft Type';
  airframeSelect.insertBefore(anyType, airframeSelect.options[1]);

  setSelectOptions(airlineSelect, 'Select Airline', []);
  setSelectOptions(registrationSelect, 'Select Registration', []);

  airframeSelect.disabled = !family;
  airlineSelect.disabled = true;
  registrationSelect.disabled = true;
}

function populateAirlines() {
  const family = aircraftFamilySelect.value;
  const airframe = airframeSelect.value;

  const matchingAircraft = aircraftDatabase.filter(aircraft => {

    const familyMatch =
      family === 'RANDOM' ||
      !family ||
      getAircraftFamily(aircraft.airframe) === family;

    const typeMatch =
      airframe === 'RANDOM' ||
      !airframe ||
      aircraft.airframe === airframe;

    return familyMatch && typeMatch;
  });

  setSelectOptions(
    airlineSelect,
    'Select Airline',
    uniqueValues(matchingAircraft, 'airline')
  );

  const anyAirline = document.createElement('option');
  anyAirline.value = 'RANDOM';
  anyAirline.textContent = '🎲 Any Airline';
  airlineSelect.insertBefore(anyAirline, airlineSelect.options[1]);

  setSelectOptions(registrationSelect, 'Select Registration', []);

  airlineSelect.disabled = !family || !airframe;
  registrationSelect.disabled = true;
}

function populateRegistrations() {
  const family = aircraftFamilySelect.value;
  const airframe = airframeSelect.value;
  const airline = airlineSelect.value;

  const matchingAircraft = aircraftDatabase.filter(aircraft => {

    const familyMatch =
      family === 'RANDOM' ||
      !family ||
      getAircraftFamily(aircraft.airframe) === family;

    const typeMatch =
      airframe === 'RANDOM' ||
      !airframe ||
      aircraft.airframe === airframe;

    const airlineMatch =
      airline === 'RANDOM' ||
      !airline ||
      aircraft.airline === airline;

    return familyMatch && typeMatch && airlineMatch;
  });

  registrationSelect.innerHTML = `
    <option value="">Select Registration</option>
    <option value="RANDOM">🎲 Random Registration</option>
  `;

  uniqueValues(matchingAircraft, 'registration').forEach(registration => {
    const option = document.createElement('option');
    option.value = registration;
    option.textContent = registration;
    registrationSelect.appendChild(option);
  });

  registrationSelect.disabled = !family || !airframe || !airline;
}

function showStartingMessage() {
  resultsGrid.innerHTML = `<article class="result-card empty-result">
    <h3>Select an Aircraft</h3>
    <p>Choose an aircraft family, aircraft type, airline, and registration number.</p>
  </article>`;
}

populateAircraftFamilies();
showStartingMessage();

aircraftFamilySelect.addEventListener('change', () => {
  populateAirframes();
  showStartingMessage();
});

airframeSelect.addEventListener('change', () => {
  populateAirlines();
  showStartingMessage();
});

airlineSelect.addEventListener('change', () => {
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
