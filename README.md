# React + Vite

## Deploying to Netlify

The T-shirt bulk offer spans this admin app, the sibling `acb_frontend` storefront, and the backend at `C:/Users/admin/Documents/acb_project`. Deploy the backend first, then both frontend builds.

In **T-shirt offer** (also linked from **Variants**), select the T-shirt designs, enable the offer, and save. Defaults are a minimum of 3 shirts and â‚¹333 per shirt. Different selected designs, sizes, and colors count together; all eligible shirts receive the rate once the minimum is met. Other products are excluded. Percentage discounts do not stack on bulk-priced shirts unless the admin enables stacking. A lower regular price is retained.

The backend stores settings in the `TshirtOffer` collection. `GET/PUT /api/tshirt-offer` reads/saves the settings, and `POST /api/order/quote` calculates prices using the same engine as cart totals and checkout. The offer is initially disabled until eligible products are selected and saved. Saved order line prices include discounts so order history, bills, cancellations, and returns use the paid prices.

- Set the build command to `npm run build` and the publish directory to `dist`.
- Add `VITE_API_URL` in Netlify's environment variables with the same API base URL used in your local `.env`. Use your hosted HTTPS backend URL, including any API path prefix.
- Trigger a new production build after changing the variable. Vite includes this value in the JavaScript at build time.
- For manual deployments, run `npm run build` with `VITE_API_URL` configured locally, then upload the new `dist` folder.

The `public/_redirects` file supplies the fallback for React Router pages. If login works but categories cannot load, check that the API URL was present during the build and that the backend allows requests from your Netlify domain.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Announcement bar

Open **Store management > Announcements** to create or edit messages, choose a badge style and optional label, add an HTTP/HTTPS action link, and activate/deactivate saved announcements. Activating a message automatically hides all others. Text is limited to 255 characters and badge labels to 15. The storefront renders the bar above navigation, wraps on mobile, and refreshes its visibility every 30 seconds and on tab focus.

Deploy the backend at `C:/Users/admin/Documents/acb_project` first, then rebuild/deploy this dashboard and `../acb_frontend`. Both Vite apps need `VITE_API_URL` pointing to the HTTPS backend with the `/api/` prefix. No announcement appears until one is saved as active.

The dashboard now uses real admin authentication instead of demo credentials. Sign in with the email/mobile number and password of an existing verified `User` whose role is `Admin`. Use a trusted database administration tool to assign that role to the intended verified store account if an admin does not exist; no default admin account is created. JWTs are stored in browser session storage, attached as Bearer authorization, verified when reopening the dashboard, and cleared on logout or expiry. Backend `JWT_SECRET` must be configured (the existing customer authentication setting).

Endpoints:

- `GET /api/announcement/active`: public; returns the active document or `null`, without caching.
- `GET /api/admin/announcements`: list all saved documents.
- `POST /api/admin/announcements`: create a document.
- `PUT /api/admin/announcements/:id`: update fields.
- `PATCH /api/admin/announcements/:id/toggle`: invert visibility, or send `{ "isActive": true/false }` to set it explicitly.
- `POST /api/admin/login`: authenticate using `{ "identifier": "email-or-mobile", "password": "..." }`.
- `GET /api/admin/session`: verify a valid Admin session.

All management endpoints require a valid JWT and the `Admin` role checked against the database. Announcement payloads use `{ text, badge: { type, text }, targetUrl, isActive }`; update/create also accept `badge_type`, `badge_text`, `target_url`, and `is_active`. Badge types are `offer`, `alert`, `new_launch`, and `info`. Links must be HTTP/HTTPS URLs without embedded credentials.

MongoDB stores `Announcement` documents and one `AnnouncementLock` document. Every mutation writes the singleton lock inside a transaction before updating announcements, so concurrent activations serialize and failed saves roll back. This requires a MongoDB replica set or Atlas, as existing cart transactions already do. Transactions and collection creation must be permitted for the backend database account.

Validation: `node --test tests/*.test.mjs` and `npm run build` in each Vite app; `node --test tests/*.test.js` in the backend. Announcement tests use simulated database transactions and local HTTP servers for auth; they do not write to the live database.
