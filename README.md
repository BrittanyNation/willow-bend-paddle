# Willow Bend Paddle Co. — Rental Booking Website + Express Back End

A fully functional booking website for **Willow Bend Paddle Co.**, a fictional kayak, canoe, and paddleboard rental studio on the made-up Bend Creek — with a **real Node.js + Express server in this repo** behind it.

**Live site (front end):** https://brittanynation.github.io/willow-bend-paddle/

## What it does

- **Fleet explorer** — 9 rental craft rendered from data, with working craft-type filter chips (kayak / canoe / paddleboard), live search, and sorting by price, seats, or name, plus a live result count and an honest empty state.
- **Booking flow** — pick a craft (or a guided trip, preselected from the Trips page), quantity, half/full day, and a date; launch times are generated per date with about 1 in 5 honestly marked booked out and disabled. Mondays are closed and rejected with a plain message. The summary updates live: rental + extras (dry bag, cooler, seat upgrade), 7% tax, total due at the dock, and the 20% hold.
- **Validated confirmation** — name, email, phone, date (including past-date and Monday checks), and launch time are all validated with inline errors. A successful booking ends in a confirmation with a generated `WB-XXXXXX` reference, saved so it stays visible under "Bookings saved in this browser."
- **Guided trips page** — three trips with real prices and group sizes, a working FAQ accordion, and a validated River Letter newsletter signup (duplicate signups are recognized, not double-saved).

## The course skill behind it

This is the **second course-track project** in the portfolio, built alongside Dr. Angela Yu's *Full-Stack Web Development Bootcamp* (Udemy). Step 1 was live APIs + async JavaScript ([Solstice Skies](https://github.com/BrittanyNation/solstice-skies)). This step is **Node.js + Express**:

- `server/server.js` — a complete Express app, commented section by section: middleware (`express.json()`, `express.static()`), routes with parameters (`GET /api/fleet/:id`), query strings (`GET /api/availability?date=…&craft=…`), server-side validation, and a write route (`POST /api/bookings`, 201 Created) with lookup by reference (`GET /api/bookings/:ref`).
- `server/data.js` — the data layer as a Node module (in-memory for this step; a real database is the next course step).
- `app.js` on the front end shows the fetch-with-fallback pattern: it tries the Express API first, and only uses its built-in copy of the same data when no server answers.

### Run the back end locally

```bash
cd server
npm install
npm start
```

Then open http://localhost:3000 — the banner on the site switches to **Live mode**, the fleet loads from `GET /api/fleet`, and bookings are saved by the server through `POST /api/bookings`.

### What is live vs local — honestly

GitHub Pages hosts **static files only**; it cannot run Node. So the published Pages demo runs the identical front end against its built-in copy of the fleet data, and bookings there are saved in the visitor's own browser (`localStorage`). The site banner and the booking confirmation both say which mode you are in. Nothing about the demo pretends a server answered when one did not — the server code is here, complete and runnable, and running it locally turns the same pages into the full-stack version.

## Design & build

Front-end design and build by Brittany Nation. Original concept work: brand, layout, and a fresh river palette — River Deep `#1B4965`, Aqua `#62B6CB`, Kayak Yellow `#FFC857`, Coral Launch `#EE6C4D`, Foam `#F7FBFC`, Ink `#14213D`, Sand Bank `#EFE6D8`. Design workflow in Sketch and Webflow; built by hand with HTML, CSS, and vanilla JavaScript, plus Node.js and Express for the back end. No affiliation with any real business is claimed — Willow Bend Paddle Co. is fictional.

## Files

- `index.html` — home + fleet explorer
- `book.html` — booking flow with live summary and confirmation
- `trips.html` — guided trips, FAQ accordion, newsletter signup
- `styles.css` — the full design system
- `app.js` — fleet loading (API + fallback), filters/search/sort, slot generation, booking validation and totals, trips page interactions
- `server/server.js` — the Express app (API routes + static hosting)
- `server/data.js` — fleet, trips, and bookings data module
- `server/package.json` — run with `npm install && npm start` inside `server/`
- `og-image.png` — 1200×627 social preview image in the project palette
