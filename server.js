const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const SERP_API_KEY = process.env.SERP_API_KEY;

app.use(express.static(path.join(__dirname, "public")));

app.get("/api/nearby", async (req, res) => {
  const cuisine = req.query.cuisine;
  const lat = req.query.lat;
  const lng = req.query.lng;
  const radiusMiles = req.query.radiusMiles || "5";

  if (!cuisine || !lat || !lng) {
    return res.status(400).json({
      error: "Missing required query params: cuisine, lat, lng"
    });
  }

  if (!SERP_API_KEY) {
    return res.json({
      source: "mock",
      results: [
        {
          name: `Sample ${cuisine} Spot`,
          address: "Set SERP_API_KEY to fetch live results",
          rating: "N/A"
        }
      ]
    });
  }

  const radiusMeters = Math.max(1000, Math.round(Number(radiusMiles) * 1609.34));

  try {
    const params = new URLSearchParams({
      api_key: SERP_API_KEY,
      engine: "google_maps",
      q: `${cuisine} food`,
      ll: `@${lat},${lng},14z`,
      type: "search",
      google_domain: "google.com"
    });

    const response = await fetch(`https://serpapi.com/search.json?${params.toString()}`);

    if (!response.ok) {
      return res.status(502).json({ error: "Failed to fetch from SerpApi" });
    }

    const data = await response.json();
    const places = Array.isArray(data.local_results) ? data.local_results : [];

    const filtered = places.filter((place) => {
      if (!place.gps_coordinates) {
        return true;
      }

      const distance = haversineDistanceMiles(
        Number(lat),
        Number(lng),
        Number(place.gps_coordinates.latitude),
        Number(place.gps_coordinates.longitude)
      );

      return Number.isFinite(distance) ? distance <= Number(radiusMiles) : true;
    });

    res.json({
      source: "serpapi",
      results: filtered.slice(0, 10).map((place) => ({
        name: place.title,
        address: place.address,
        rating: place.rating || "N/A"
      }))
    });
  } catch (error) {
    res.status(500).json({ error: "Error fetching nearby places" });
  }
});

app.listen(PORT, () => {
  console.log(`Food Decider starter app running on http://localhost:${PORT}`);
});

function haversineDistanceMiles(lat1, lon1, lat2, lon2) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 3958.8;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;

  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
