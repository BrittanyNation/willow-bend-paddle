/* =====================================================================
   server/server.js — a small, real Node.js + Express back end.
   ---------------------------------------------------------------------
   COURSE NOTES (Full-Stack Bootcamp, step 2: Node.js + Express)
   Read this top to bottom — it is the whole pattern in one file:

   1. require("express") loads the framework; express() creates the app.
   2. app.use(...) adds MIDDLEWARE — code every request passes through.
      express.json() reads JSON request bodies into req.body, and
      express.static(...) serves the front-end site files themselves,
      so one server hosts both the pages AND the API.
   3. app.get / app.post define ROUTES: a URL pattern + a handler
      function that receives (req, res) and answers with res.json(...).
   4. app.listen(PORT) starts the server actually accepting requests.

   Run it:
     cd server
     npm install     (downloads Express, once)
     npm start       (or: node server.js)
   Then open http://localhost:3000 — the banner on the site will say
   "Live mode" because GET /api/fleet now answers for real.

   GitHub Pages note: Pages cannot run Node, so the published demo
   uses the front end's built-in fallback data (see app.js). This
   server is the real back end, shipped in the repo to run locally.
   ===================================================================== */

const express = require("express");
const path = require("path");
const { fleet, trips, bookings } = require("./data");

const app = express();
const PORT = process.env.PORT || 3000;

/* ---- Middleware ---------------------------------------------------- */
app.use(express.json()); // parse JSON bodies (the booking form's POST)
// Serve the static site (one folder up) so http://localhost:3000
// shows the same pages GitHub Pages shows — plus a working API.
app.use(express.static(path.join(__dirname, "..")));

/* ---- Routes -------------------------------------------------------- */

// GET /api/fleet — the whole catalogue, rentals + guided trips.
app.get("/api/fleet", (req, res) => {
  res.json({ fleet, trips });
});

// GET /api/fleet/:id — one item. ":id" is a route PARAMETER:
// Express puts whatever is in that URL slot into req.params.id.
app.get("/api/fleet/:id", (req, res) => {
  const item = [...fleet, ...trips].find(i => i.id === req.params.id);
  if (!item) return res.status(404).json({ error: "No craft or trip with that id." });
  res.json(item);
});

// GET /api/availability?date=YYYY-MM-DD&craft=<id>
// Answers which launch slots are still open, using the same
// deterministic rule the front end uses in app.js (slotBooked).
const SLOTS = ["8:00 AM", "9:30 AM", "11:00 AM", "12:30 PM", "2:00 PM", "3:30 PM"];
function slotBooked(dateStr, craftId, slot) {
  const s = dateStr + "|" + craftId + "|" + slot;
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h % 5 === 0;
}
app.get("/api/availability", (req, res) => {
  const { date, craft } = req.query;
  if (!date || !craft) return res.status(400).json({ error: "Give me ?date=YYYY-MM-DD&craft=<id>." });
  res.json({ date, craft, slots: SLOTS.map(time => ({ time, booked: slotBooked(date, craft, time) })) });
});

// POST /api/bookings — the write route. The booking form sends JSON;
// we VALIDATE on the server too (never trust the browser alone),
// save to the in-memory bookings list, and answer 201 Created with
// the saved booking including its reference.
app.post("/api/bookings", (req, res) => {
  const b = req.body || {};
  const errors = [];
  const item = [...fleet, ...trips].find(i => i.id === b.craftId);
  if (!item) errors.push("Unknown craftId.");
  if (!b.name || !String(b.name).trim()) errors.push("Name is required.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.email || "")) errors.push("A valid email is required.");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(b.date || "")) errors.push("Date must be YYYY-MM-DD.");
  if (!SLOTS.includes(b.slot)) errors.push("Slot must be one of the launch times.");
  if (b.date && new Date(b.date + "T12:00:00").getDay() === 1) errors.push("Closed on Mondays.");
  if (errors.length) return res.status(400).json({ errors });

  const booking = {
    ref: "WB-" + Math.random().toString(36).slice(2, 8).toUpperCase(),
    craftId: item.id, craftName: item.name,
    qty: Math.min(6, Math.max(1, parseInt(b.qty || "1", 10))),
    duration: b.duration || "half", date: b.date, slot: b.slot,
    name: String(b.name).trim(), email: String(b.email).trim(),
    total: Number(b.total) || 0, deposit: Number(b.deposit) || 0,
    createdAt: new Date().toISOString()
  };
  bookings.push(booking);
  res.status(201).json(booking);
});

// GET /api/bookings/:ref — look a booking back up by its reference.
app.get("/api/bookings/:ref", (req, res) => {
  const booking = bookings.find(b => b.ref === req.params.ref);
  if (!booking) return res.status(404).json({ error: "No booking with that reference (server memory resets on restart)." });
  res.json(booking);
});

// Anything else under /api/ is a clean JSON 404, not an HTML error page.
app.use("/api", (req, res) => res.status(404).json({ error: "Unknown API route." }));

/* ---- Start --------------------------------------------------------- */
app.listen(PORT, () => {
  console.log(`Willow Bend server running at http://localhost:${PORT}`);
  console.log(`Try: http://localhost:${PORT}/api/fleet`);
});
