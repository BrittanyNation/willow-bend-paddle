/* =====================================================================
   server/data.js — the data layer for the Express server.
   COURSE NOTES: in a real full-stack app this would be a database
   (that is course step 3). For step 2 the data lives in a plain
   JavaScript module that server.js requires — the API contract
   (the shape of each object) is what matters, and it matches the
   FALLBACK_FLEET copy in ../app.js item for item, so the front end
   works identically with or without this server running.
   ===================================================================== */

const fleet = [
  { id: "solo-explorer",  name: "Solo Explorer Kayak",   type: "kayak", seats: 1, halfDay: 28, fullDay: 44, blurb: "Our most-rented boat. Stable, forgiving, and happy in slow water.", tag: "Best for first-timers" },
  { id: "tandem-drift",   name: "Tandem Drift Kayak",    type: "kayak", seats: 2, halfDay: 42, fullDay: 66, blurb: "Two seats, one steering job to negotiate. Great for pairs and picnics.", tag: "Best for pairs" },
  { id: "angler-pro",     name: "Angler Pro Kayak",      type: "kayak", seats: 1, halfDay: 36, fullDay: 56, blurb: "Fishing kayak with rod holders and a wide, steady platform for casting.", tag: "Fishing ready" },
  { id: "kid-splash",     name: "Kid Splash Kayak",      type: "kayak", seats: 1, halfDay: 22, fullDay: 34, blurb: "Short, light, and nearly impossible to tip. Sized for paddlers 6–12.", tag: "Kids 6–12" },
  { id: "bend-classic",   name: "Bend Classic Canoe",    type: "canoe", seats: 2, halfDay: 40, fullDay: 62, blurb: "The traditional two-person canoe, with room for a cooler in the middle.", tag: "The classic" },
  { id: "family-hauler",  name: "Family Hauler Canoe",   type: "canoe", seats: 3, halfDay: 48, fullDay: 74, blurb: "Three seats and a flat floor — two adults, one kid, zero arguments about space.", tag: "Families" },
  { id: "cargo-canoe",    name: "Cargo Canoe",           type: "canoe", seats: 2, halfDay: 46, fullDay: 70, blurb: "Extra-deep hull for camping gear, big dogs, and ambitious picnic plans.", tag: "Big loads" },
  { id: "drift-sup",      name: "Drift Paddleboard",     type: "sup",   seats: 1, halfDay: 30, fullDay: 48, blurb: "Wide inflatable board, very stable. Standing optional, sitting encouraged.", tag: "Most stable board" },
  { id: "sunset-sup",     name: "Sunset Paddleboard",    type: "sup",   seats: 1, halfDay: 34, fullDay: 52, blurb: "A slightly sleeker board for paddlers who have found their balance.", tag: "For steady standers" }
];

const trips = [
  { id: "sunrise-trip", name: "Sunrise Bend Float (guided)",    type: "trip", seats: 8,  price: 45 },
  { id: "family-trip",  name: "Family Bend & Picnic (guided)",  type: "trip", seats: 12, price: 38 },
  { id: "moon-trip",    name: "Full-Moon Paddle (guided)",      type: "trip", seats: 10, price: 52 }
];

/* Bookings live in memory for step 2 — they reset when the server
   restarts. Persisting them in a real database is course step 3. */
const bookings = [];

module.exports = { fleet, trips, bookings };
