const FOODS = [
  "Pizza",
  "Burgers",
  "Sushi",
  "Tacos",
  "Thai",
  "Indian",
  "Korean",
  "Mediterranean"
];

const foodFilters = document.getElementById("foodFilters");
const spinBtn = document.getElementById("spinBtn");
const respinBtn = document.getElementById("respinBtn");
const nearbyBtn = document.getElementById("nearbyBtn");
const spinner = document.getElementById("spinner");
const resultText = document.getElementById("resultText");
const postSpin = document.getElementById("postSpin");
const nearbyList = document.getElementById("nearbyList");
const radiusInput = document.getElementById("radiusInput");

let selectedCuisine = null;

renderFoodFilters();
spinBtn.addEventListener("click", spin);
respinBtn.addEventListener("click", spin);
nearbyBtn.addEventListener("click", findNearby);

function renderFoodFilters() {
  FOODS.forEach((food) => {
    const label = document.createElement("label");
    const input = document.createElement("input");
    input.type = "checkbox";
    input.value = food;
    input.checked = true;

    label.appendChild(input);
    label.append(` ${food}`);
    foodFilters.appendChild(label);
  });
}

function getSelectedFoods() {
  return [...foodFilters.querySelectorAll('input[type="checkbox"]:checked')].map(
    (input) => input.value
  );
}

function getMode() {
  return document.querySelector('input[name="mode"]:checked').value;
}

function spin() {
  const selectedFoods = getSelectedFoods();

  if (!selectedFoods.length) {
    resultText.textContent = "Select at least one food type first.";
    postSpin.classList.add("hidden");
    return;
  }

  spinner.textContent = getModeIcon(getMode());
  spinner.classList.add("spinning");
  resultText.textContent = "Spinning...";
  postSpin.classList.add("hidden");

  setTimeout(() => {
    const chosen = selectedFoods[Math.floor(Math.random() * selectedFoods.length)];
    selectedCuisine = chosen;

    spinner.classList.remove("spinning");
    resultText.textContent = `You got: ${chosen}`;
    postSpin.classList.remove("hidden");
  }, 1200);
}

function getModeIcon(mode) {
  if (mode === "dice") return "🎲";
  if (mode === "darts") return "🎯";
  return "🎡";
}

function findNearby() {
  if (!selectedCuisine) {
    resultText.textContent = "Spin first to pick a cuisine.";
    return;
  }

  setNearbyMessage("Checking your location...");

  if (!navigator.geolocation) {
    setNearbyMessage("Geolocation is not supported in this browser.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async ({ coords }) => {
      try {
        const radius = Number(radiusInput.value) || 5;
        const params = new URLSearchParams({
          cuisine: selectedCuisine,
          lat: String(coords.latitude),
          lng: String(coords.longitude),
          radiusMiles: String(radius)
        });

        const response = await fetch(`/api/nearby?${params.toString()}`);
        const data = await response.json();

        if (!response.ok) {
          setNearbyMessage(data.error || "Unable to fetch places.");
          return;
        }

        if (!data.results || !data.results.length) {
          setNearbyMessage(`No ${selectedCuisine} spots found nearby.`);
          return;
        }

        nearbyList.textContent = "";
        data.results.forEach((place) => {
          const item = document.createElement("li");
          const name = document.createElement("strong");
          name.textContent = place.name;

          item.appendChild(name);
          item.append(
            ` — ${place.address || "No address"} (⭐ ${place.rating || "N/A"})`
          );

          nearbyList.appendChild(item);
        });
      } catch (error) {
        setNearbyMessage("Something went wrong while finding places.");
      }
    },
    () => {
      setNearbyMessage(
        "Location access denied. Enable location to search nearby restaurants."
      );
    }
  );
}

function setNearbyMessage(message) {
  nearbyList.textContent = "";
  const item = document.createElement("li");
  item.textContent = message;
  nearbyList.appendChild(item);
}
