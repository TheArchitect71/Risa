# Risa — local shop

A full-stack shopping application with an Angular frontend and an Express/MongoDB backend. Users can browse products, manage a cart, and view orders; the product administration area supports image uploads and editing.

## What you can do

- Sign up, log in, and browse a paginated product catalog.
- View product details and change cart quantities.
- Add, edit, and delete products with local image uploads.
- Manage SKU, category, quantity, and low-stock thresholds in the integrated Inventory page. Search, filter, view stock totals, and export a JSON copy.
- View existing orders and download authorized PDF invoices.

## Preview

![Risa product catalog](docs/screenshots/desktop.png)

Captured from the running application on September 30, 2026. Any sample records shown are demonstration or isolated test data, not data included with a fresh installation.

<details>
<summary>Mobile view</summary>

![Mobile risa product catalog](docs/screenshots/mobile.png)

</details>

## Run locally

Prerequisites: the Node version in `.nvmrc` (currently 26.10.0), npm, and a local MongoDB Community server. On this Mac, MongoDB Community 8.0.32 is unpacked in the ignored `.local/mongodb-bin/` directory because Homebrew installation is blocked by outdated Command Line Tools. A fresh clone needs its own MongoDB installation or official server archive. From the repository root:

```sh
npm ci
npm run setup:local
npm --prefix frontend ci
npm --prefix frontend run build
```

Start MongoDB in a foreground terminal using the local binary on this Mac:

```sh
mkdir -p .local/mongodb
./.local/mongodb-bin/bin/mongod --dbpath .local/mongodb --bind_ip 127.0.0.1 --port 27018 --replSet offline-rs
```

If that local replica set already runs on port 27018, reuse it rather than starting a second instance. In another terminal at the repository root:

```sh
npm run db:init
PORT=3001 npm start
```

Open [http://127.0.0.1:3001](http://127.0.0.1:3001). Port 3000 is occupied on this Mac; omit `PORT=3001` when that port is free. Keep both processes in the foreground and stop them with **Ctrl+C**. Setup creates a private, ignored `.env.local` without overwriting an existing file. Database initialization creates no application records. These defaults use local MongoDB; no Atlas account is required.

## Current scope

A fresh database starts empty. Legacy JSON products are preserved but are not automatically imported. Stripe checkout, email, and password-reset delivery are disabled by default and unavailable offline; the interface explains this. Optional online integrations require your own environment configuration. Express serves the built Angular frontend; legacy EJS templates remain reference/fallback files.

The Inventory page uses Risa's product records. Existing products without a quantity show **Not tracked** until you edit them. Records saved by the standalone Inventory Editor at port 5173 stay in that browser's local storage; they are not automatically copied into Risa.

## Development

```sh
npm run check
npm test
npm --prefix frontend run typecheck
npm --prefix frontend test -- --browsers=ChromeHeadless
```

Backend tests use a separate local MongoDB database. For frontend development, `npm --prefix frontend start` proxies API requests to port 3000.
