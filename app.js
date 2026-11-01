/* =====================================================================
   Willow Bend Paddle Co. — app.js
   ---------------------------------------------------------------------
   COURSE NOTES (Full-Stack Bootcamp, step 2: Node.js + Express)
   This file is the FRONT END half of a full-stack pattern:

   1. The browser asks an Express server for data with fetch()
      (GET api/fleet). That server lives in /server/server.js.
   2. When this site is hosted on GitHub Pages there is NO server —
      Pages only hosts static files — so the fetch fails, we catch
      the error, and we fall back to FALLBACK_FLEET below, which
      mirrors server/data.js item for item. The page banner says
      honestly which mode you are in.
   3. Booking does the same dance: it tries POST api/bookings,
      and if no server answers, it saves the booking to
      localStorage instead — and the confirmation says which
      one happened. Nothing is faked silently.

   Run the real back end locally:
     cd server && npm install && npm start
     then open http://localhost:3000
   ===================================================================== */
"use strict";

/* ---- Fallback data (mirrors server/data.js — keep the two in sync) -- */
const FALLBACK_FLEET = [
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
const FALLBACK_TRIPS = [
  { id: "sunrise-trip", name: "Sunrise Bend Float (guided)",    type: "trip", seats: 8,  price: 45 },
  { id: "family-trip",  name: "Family Bend & Picnic (guided)",  type: "trip", seats: 12, price: 38 },
  { id: "moon-trip",    name: "Full-Moon Paddle (guided)",      type: "trip", seats: 10, price: 52 }
];

const $ = (sel, root) => (root || document).querySelector(sel);
const money = n => "$" + n.toFixed(2).replace(/\.00$/, "");

/* ---------------------------------------------------------------------
   loadFleet(): COURSE SKILL — the fetch-with-fallback pattern.
   Step 1: try the Express API. Step 2: if it answers OK, use its JSON.
   Step 3: if anything throws (no server on GitHub Pages), catch it and
   use the built-in copy. Either way the UI gets the same data shape,
   which is exactly the point of designing an API contract first.
--------------------------------------------------------------------- */
let apiMode = "fallback";
async function loadFleet() {
  try {
    const res = await fetch("api/fleet");
    if (!res.ok) throw new Error("API answered " + res.status);
    const data = await res.json();
    if (!Array.isArray(data.fleet)) throw new Error("Unexpected API shape");
    apiMode = "live";
    return data;
  } catch (err) {
    apiMode = "fallback";
    return { fleet: FALLBACK_FLEET, trips: FALLBACK_TRIPS };
  }
}

function showDataMode(el) {
  if (!el) return;
  el.textContent = apiMode === "live"
    ? "🟢 Live mode: this page is reading the fleet from the Node.js + Express server (GET /api/fleet)."
    : "🟡 Pages demo mode: GitHub Pages cannot run the Express server, so this page is using the built-in copy of the same fleet data. Run the server in /server locally to see it live.";
  el.classList.add(apiMode);
}

/* Deterministic "booked out" slots: the same date + craft always shows
   the same booked times (a tiny hash), so the pattern is stable and
   testable instead of random on every refresh. The Express server uses
   the same rule in server.js — one rule, two homes, like the data. */
function slotBooked(dateStr, craftId, slot) {
  const s = dateStr + "|" + craftId + "|" + slot;
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h % 5 === 0; // roughly 1 in 5 slots booked out
}
const SLOTS = ["8:00 AM", "9:30 AM", "11:00 AM", "12:30 PM", "2:00 PM", "3:30 PM"];

/* ============================ FLEET PAGE =========================== */
function initFleetPage() {
  const grid = $("#fleet-grid"), count = $("#result-count"), empty = $("#fleet-empty");
  let fleet = [], filter = "all", query = "", sort = "featured";

  function render() {
    let list = fleet.filter(item =>
      (filter === "all" || item.type === filter) &&
      (item.name + " " + item.blurb + " " + item.tag).toLowerCase().includes(query.toLowerCase()));
    if (sort === "price-low")  list = [...list].sort((a, b) => a.halfDay - b.halfDay);
    if (sort === "price-high") list = [...list].sort((a, b) => b.halfDay - a.halfDay);
    if (sort === "capacity")   list = [...list].sort((a, b) => b.seats - a.seats);
    if (sort === "name")       list = [...list].sort((a, b) => a.name.localeCompare(b.name));

    count.textContent = "Showing " + list.length + " of " + fleet.length + " craft";
    empty.hidden = list.length > 0;
    grid.innerHTML = list.map(item => `
      <article class="craft-card">
        <div class="craft-art ${item.type}">${item.type === "canoe" ? "🛶" : item.type === "sup" ? "🏄" : "🚣"}</div>
        <p class="craft-tag">${item.tag}</p>
        <h3>${item.name}</h3>
        <p>${item.blurb}</p>
        <p class="craft-meta">${item.seats} seat${item.seats > 1 ? "s" : ""} · ${item.type === "sup" ? "Paddleboard" : item.type[0].toUpperCase() + item.type.slice(1)}</p>
        <p class="craft-price">${money(item.halfDay)} <span>half day</span> · ${money(item.fullDay)} <span>full day</span></p>
        <a class="btn btn-yellow" href="book.html?craft=${item.id}">Book this craft</a>
      </article>`).join("");
  }

  document.querySelectorAll(".chip").forEach(chip => chip.addEventListener("click", () => {
    document.querySelectorAll(".chip").forEach(c => c.classList.remove("active"));
    chip.classList.add("active");
    filter = chip.dataset.filter;
    render();
  }));
  $("#search").addEventListener("input", e => { query = e.target.value; render(); });
  $("#sort").addEventListener("change", e => { sort = e.target.value; render(); });

  loadFleet().then(data => { fleet = data.fleet; showDataMode($("#data-mode")); render(); });
}

/* =========================== BOOKING PAGE ========================== */
function initBookingPage() {
  const form = $("#booking-form");
  const els = {
    craft: $("#craft"), qty: $("#qty"), duration: $("#duration"), date: $("#date"),
    slots: $("#slots"), slotError: $("#slot-error"), formError: $("#form-error"),
    name: $("#name"), email: $("#email"), phone: $("#phone")
  };
  let fleet = [], trips = [], selectedSlot = null;

  const bookable = () => [...fleet, ...trips];
  const current = () => bookable().find(i => i.id === els.craft.value);

  function fillCraftSelect() {
    const wanted = new URLSearchParams(location.search).get("craft");
    els.craft.innerHTML =
      `<optgroup label="Rentals">${fleet.map(i => `<option value="${i.id}">${i.name} — ${money(i.halfDay)} half / ${money(i.fullDay)} full</option>`).join("")}</optgroup>` +
      `<optgroup label="Guided trips">${trips.map(i => `<option value="${i.id}">${i.name} — ${money(i.price)} per person</option>`).join("")}</optgroup>`;
    if (wanted && bookable().some(i => i.id === wanted)) els.craft.value = wanted;
  }

  function renderSlots() {
    selectedSlot = null;
    els.slots.innerHTML = "";
    els.slotError.hidden = true;
    const d = els.date.value, item = current();
    if (!d || !item) { els.slots.innerHTML = `<p class="fine">Pick a date first and launch times will appear here.</p>`; updateSummary(); return; }
    const day = new Date(d + "T12:00:00");
    if (day.getDay() === 1) { // Closed Mondays — stated on the page, enforced here.
      els.slots.innerHTML = `<p class="fine">We rest the river on Mondays — no launches. Please pick another day.</p>`;
      updateSummary(); return;
    }
    SLOTS.forEach(slot => {
      const booked = slotBooked(d, item.id, slot);
      const b = document.createElement("button");
      b.type = "button"; b.className = "slot"; b.textContent = booked ? slot + " · full" : slot;
      b.disabled = booked;
      b.addEventListener("click", () => {
        document.querySelectorAll(".slot").forEach(s => s.classList.remove("selected"));
        b.classList.add("selected"); selectedSlot = slot; updateSummary();
      });
      els.slots.appendChild(b);
    });
    updateSummary();
  }

  function totals() {
    const item = current(); if (!item) return { rental: 0, addons: 0, tax: 0, total: 0, deposit: 0 };
    const qty = Math.min(6, Math.max(1, parseInt(els.qty.value || "1", 10)));
    const rental = item.type === "trip" ? item.price * qty
      : (els.duration.value === "full" ? item.fullDay : item.halfDay) * qty;
    const addons = [...document.querySelectorAll(".addon:checked")]
      .reduce((sum, a) => sum + Number(a.dataset.price) * qty, 0);
    const tax = (rental + addons) * 0.07;
    const total = rental + addons + tax;
    return { rental, addons, tax, total, deposit: total * 0.20, qty };
  }

  function updateSummary() {
    const item = current(), t = totals();
    $("#sum-craft").textContent = item ? item.name + " × " + t.qty : "—";
    $("#sum-when").textContent = els.date.value
      ? els.date.value + (selectedSlot ? " · " + selectedSlot : " · pick a launch time") : "Pick a date & time";
    $("#sum-rental").textContent = money(t.rental);
    $("#sum-addons").textContent = money(t.addons);
    $("#sum-tax").textContent = money(t.tax);
    $("#sum-total").textContent = money(t.total);
    $("#sum-deposit").textContent = money(t.deposit);
  }

  ["change", "input"].forEach(evt => form.addEventListener(evt, e => {
    if (e.target === els.date || e.target === els.craft) renderSlots(); else updateSummary();
  }));

  /* COURSE SKILL — sending data TO the server.
     POST api/bookings with a JSON body is the write half of the API.
     On the live Express server this returns 201 + the saved booking.
     On GitHub Pages the request fails, so we catch it and save to
     localStorage instead — and we tell the paddler which happened. */
  async function submitBooking(booking) {
    try {
      const res = await fetch("api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(booking)
      });
      if (!res.ok) throw new Error("API answered " + res.status);
      return { savedBy: "server", data: await res.json() };
    } catch (err) {
      const saved = JSON.parse(localStorage.getItem("wb-bookings") || "[]");
      saved.push(booking);
      localStorage.setItem("wb-bookings", JSON.stringify(saved));
      return { savedBy: "browser", data: booking };
    }
  }

  function renderMyBookings() {
    const saved = JSON.parse(localStorage.getItem("wb-bookings") || "[]");
    const box = $("#my-bookings"); if (!box) return;
    box.hidden = saved.length === 0;
    $("#booking-list").innerHTML = saved.map(b =>
      `<li><strong>${b.ref}</strong> — ${b.craftName}, ${b.date} at ${b.slot}, total ${money(b.total)}</li>`).join("");
  }

  form.addEventListener("submit", async e => {
    e.preventDefault();
    const errors = [];
    const item = current();
    if (!item) errors.push("Choose a craft.");
    if (!els.name.value.trim()) errors.push("Your name is needed for the dock list.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(els.email.value)) errors.push("That email does not look complete.");
    if (els.phone.value.replace(/\D/g, "").length < 7) errors.push("A phone number helps us reach you if the river changes plans.");
    if (!els.date.value) errors.push("Pick a date.");
    else {
      const day = new Date(els.date.value + "T12:00:00"), today = new Date(); today.setHours(0, 0, 0, 0);
      if (day < today) errors.push("That date is in the past — pick a day still ahead of us.");
      if (day.getDay() === 1) errors.push("We are closed on Mondays — please pick another day.");
    }
    if (els.date.value && !selectedSlot) { els.slotError.textContent = "Pick a launch time."; els.slotError.hidden = false; errors.push("Pick a launch time."); }

    if (errors.length) {
      els.formError.textContent = errors.join(" ");
      els.formError.hidden = false;
      return;
    }
    els.formError.hidden = true;

    const t = totals();
    const booking = {
      ref: "WB-" + Math.random().toString(36).slice(2, 8).toUpperCase(),
      craftId: item.id, craftName: item.name, qty: t.qty,
      duration: item.type === "trip" ? "guided trip" : els.duration.value,
      date: els.date.value, slot: selectedSlot,
      name: els.name.value.trim(), email: els.email.value.trim(),
      total: Number(t.total.toFixed(2)), deposit: Number(t.deposit.toFixed(2))
    };
    const result = await submitBooking(booking);

    $("#conf-text").textContent =
      `${booking.name.split(" ")[0]}, your ${item.name} is held for ${booking.date} at ${booking.slot}. ` +
      `Total due at the dock is ${money(booking.total)} (a ${money(booking.deposit)} hold today on the live site).`;
    $("#conf-ref").textContent = booking.ref;
    $("#conf-save-note").textContent = result.savedBy === "server"
      ? "Saved by the Express server through POST /api/bookings — you are running the full-stack version."
      : "Saved in this browser (localStorage), because GitHub Pages cannot run the Express server. Run /server locally and this same form saves to the back end instead.";
    if (result.savedBy === "server") {
      const saved = JSON.parse(localStorage.getItem("wb-bookings") || "[]");
      saved.push(booking); localStorage.setItem("wb-bookings", JSON.stringify(saved));
    }
    form.hidden = true;
    $("#confirmation").hidden = false;
    renderMyBookings();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  $("#book-again").addEventListener("click", () => {
    form.reset(); form.hidden = false; $("#confirmation").hidden = true;
    els.qty.value = 1; renderSlots(); updateSummary();
  });

  loadFleet().then(data => {
    fleet = data.fleet; trips = data.trips;
    showDataMode($("#data-mode"));
    fillCraftSelect(); renderSlots(); updateSummary(); renderMyBookings();
  });
}

/* ============================ TRIPS PAGE =========================== */
function initTripsPage() {
  document.querySelectorAll(".accordion").forEach(acc => {
    const head = $(".acc-head", acc), body = $(".acc-body", acc);
    head.addEventListener("click", () => {
      const open = head.getAttribute("aria-expanded") === "true";
      head.setAttribute("aria-expanded", String(!open));
      body.hidden = open;
    });
  });
  $("#newsletter-form").addEventListener("submit", e => {
    e.preventDefault();
    const email = $("#nl-email").value.trim(), msg = $("#nl-msg");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      msg.textContent = "That email does not look complete — check it and try again.";
      msg.className = "fine msg-error"; return;
    }
    const list = JSON.parse(localStorage.getItem("wb-newsletter") || "[]");
    if (list.includes(email)) { msg.textContent = "You are already on the River Letter list — see you at the next moon paddle."; msg.className = "fine msg-ok"; return; }
    list.push(email); localStorage.setItem("wb-newsletter", JSON.stringify(list));
    msg.textContent = "You are in! The next River Letter arrives with the new moon.";
    msg.className = "fine msg-ok";
    e.target.reset();
  });
}

window.WillowBend = { initFleetPage, initBookingPage, initTripsPage };
