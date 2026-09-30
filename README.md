# Risa local shop

Express 5 and Mongoose 9 backend with an Angular 22 frontend. MongoDB stays local; the default configuration rejects remote MongoDB hosts. Existing credential files and legacy JSON product/cart files are preserved. The two legacy JSON products have no MongoDB owner IDs and are not imported automatically. No persistent demo data is created.

## Run locally

Install Node 26.10.0 and MongoDB Community 9.0.2 locally. From this repository:

```sh
npm ci
npm run setup:local
npm --prefix frontend ci
npm --prefix frontend run build
mkdir -p .local/mongodb
mongod --dbpath .local/mongodb --bind_ip 127.0.0.1 --port 27018 --replSet offline-rs
```

Leave MongoDB in that foreground terminal. In a second terminal at this repository:

```sh
npm run db:init
npm start
```

Skip the MongoDB launch if the matching local `offline-rs` already runs on 27018. `db:init` only initializes the replica set; it creates no application records. `setup:local` generates a private session secret without overwriting an existing configuration. Stop foreground processes with Ctrl+C.

Open http://127.0.0.1:3000. Stop each foreground process with Ctrl+C. The ignored `.env.local` holds the local database URI and private session secret. Development frontend: `npm --prefix frontend start`, proxying the backend on port 3000.

## Features and offline behavior

Catalog pagination, signup/login, image uploads, product management, cart quantities, existing orders, and authorized PDF invoices work locally. Stripe payments and email/password-reset delivery are unavailable offline, as requested; checkout/reset controls explain this. Optional integration source is retained and disabled by default. No payment or email service was contacted during validation. Existing EJS templates remain reference/fallback files; the built Angular application is served by Express.

## Validation and compatibility

```sh
npm run check
npm test
npm --prefix frontend run build
npm --prefix frontend run typecheck
npm --prefix frontend test -- --browsers=ChromeHeadless
```

Mongo integration tests use and drop a uniquely named test database on localhost:27018. Browser tests used isolated fixtures, not the application database. Four backend and three Angular tests pass, plus desktop/mobile signup/login/upload/pagination/cart/edit/order/PDF/delete/logout flows. Clean installs report zero audit vulnerabilities.

Node is pinned to 26.10.0. TypeScript 6.0.3 is held within Angular 22's >=6.0 <6.1 range. Jasmine 6.3.0/types 6 are retained for the Zone/Karma test harness compatibility; Jasmine 7 migration remains separate. Mongoose 9.10.3 uses MongoDB driver 7.6.0/BSON 7.3.3, while connect-mongodb-session 5.0.0 uses driver 6.21.0/BSON 6.10.4. Session user IDs are stored as strings across that boundary. Mongoose schemas and model methods remain; obsolete execPopulate calls now await populate directly. Online Stripe/SMTP behavior is unverified because those services are disabled.
