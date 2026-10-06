# React + Vite

## Deploying to Netlify

The T-shirt bulk offer spans this admin app, the sibling `acb_frontend` storefront, and the backend at `C:/Users/admin/Documents/acb_project`. Deploy the backend first, then both frontend builds.

In **T-shirt offer** (also linked from **Variants**), select the T-shirt designs, enable the offer, and save. Defaults are a minimum of 3 shirts and ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¹333 per shirt. Different selected designs, sizes, and colors count together; all eligible shirts receive the rate once the minimum is met. Other products are excluded. Percentage discounts do not stack on bulk-priced shirts unless the admin enables stacking. A lower regular price is retained.

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

Open **Store management > Announcements** to create or edit messages, choose a badge style and optional label, add an HTTP/HTTPS action link, and activate/deactivate saved announcements. Multiple messages can stay active together; the storefront cycles through them in creation order every 4 seconds with a smooth transition. Text is limited to 255 characters and badge labels to 15. The storefront renders the bar above navigation, wraps on mobile, and refreshes its visibility every 30 seconds and on tab focus.

Deploy the backend at `C:/Users/admin/Documents/acb_project` first, then rebuild/deploy this dashboard and `../acb_frontend`. Both Vite apps need `VITE_API_URL` pointing to the HTTPS backend with the `/api/` prefix. No announcement appears until one is saved as active.

The dashboard now uses real admin authentication instead of demo credentials. Sign in with the email/mobile number and password of an existing verified `User` whose role is `Admin`. Use a trusted database administration tool to assign that role to the intended verified store account if an admin does not exist; no default admin account is created. JWTs are stored in browser session storage, attached as Bearer authorization, verified when reopening the dashboard, and cleared on logout or expiry. Backend `JWT_SECRET` must be configured (the existing customer authentication setting).

Endpoints:

- `GET /api/announcement/active`: public; returns an array of all active documents in creation order, or `[]`, without caching.
- `GET /api/admin/announcements`: list all saved documents.
- `POST /api/admin/announcements`: create a document.
- `PUT /api/admin/announcements/:id`: update fields.
- `PATCH /api/admin/announcements/:id/toggle`: invert visibility, or send `{ "isActive": true/false }` to set it explicitly.
- `POST /api/admin/login`: authenticate using `{ "identifier": "email-or-mobile", "password": "..." }`.
- `GET /api/admin/session`: verify a valid Admin session.

All management endpoints require a valid JWT and the `Admin` role checked against the database. Announcement payloads use `{ text, badge: { type, text }, targetUrl, isActive }`; update/create also accept `badge_type`, `badge_text`, `target_url`, and `is_active`. Badge types are `offer`, `alert`, `new_launch`, and `info`. Links must be HTTP/HTTPS URLs without embedded credentials.

MongoDB stores `Announcement` documents and one `AnnouncementLock` document. Every mutation writes the singleton lock inside a transaction before updating announcements, so concurrent toggles of the same message serialize and failed saves roll back. Activating one message does not deactivate any others. This requires a MongoDB replica set or Atlas, as existing cart transactions already do. Transactions and collection creation must be permitted for the backend database account.

Validation: `node --test tests/*.test.mjs` and `npm run build` in each Vite app; `node --test tests/*.test.js` in the backend. Announcement tests use simulated database transactions and local HTTP servers for auth; they do not write to the live database.

## Discount & Offers Setup

Open **Store management > Discount & Offers Setup** to enable or disable each percentage rule, change its rate, and set the high-value order threshold. Each block saves independently. Rules live in the centralized MongoDB `discount_rules` collection, with one document per unique `ruleKey`, following the supplied schema. Missing documents are seeded once per backend process with active 10% first-order and active 5% milestone at ₹4999. Seeding uses `$setOnInsert` and preserves existing saved rules. The old `Discount` collection and its fixed document ID no longer determine checkout pricing.

Protected APIs: `GET /api/admin/discount-rules` returns `{ success, rules }`; `PUT /api/admin/discount-rules/:ruleKey` accepts `discountPercentage` (0–100), `minPurchaseAmount` (non-negative amount or null), and boolean `isActive`, returning `{ success, rule }`. Numeric values accept at most two decimal places. Only signed-in database-verified Admin accounts can manage rules.

Every cart quote, buy-now quote, and payment-order creation reads current active rules. First-order eligibility uses the authenticated customer ID and counts **all** existing orders, including pending/failed/refunded orders, as specified. Guests cannot receive this reward. Milestone eligibility uses the total after product promotions/bulk pricing, before percentage discounts, and includes orders exactly at the threshold. Null thresholds mean no minimum. Both discounts are additive against each eligible item's promoted price, rounded in paise and capped to avoid negative charges. The T-shirt offer's percentage-stacking switch is preserved. Saved orders, invoices and refunds retain their original paid amounts.

Deploy the backend changes to EC2 and the updated admin build to Netlify. The existing customer frontend already consumes server-calculated quotes; no storefront rebuild is needed for this feature. Cart calculation and payment creation now require the existing customer JWT; guest product quotes remain public. Backend regression checks: `node --test tests/*.test.js`; admin controls: `node --test tests/discountRules.test.mjs`, `npm run build`.

## Promotional popup campaigns

Open **Store management > Promotional popups** to create, edit, pause, delete and reorder campaigns. Drag saved rows or use their up/down arrows; order saves immediately. The editor previews the storefront card at desktop (840px), tablet (640px), and mobile (360px) widths. Mobile displays a compact image above the content by default. Image fit (crop/full image), image position, and mobile visibility can be adjusted per campaign. With no image or a failed image, mobile shows the content alone. Choose dark/light glass and promotion, newsletter signup, coupon unlock, or clearance countdown. Countdown campaigns require an end time; expired campaigns stop being served. Enter times locally; the backend stores UTC.

The first active campaign appears 5 seconds after the browser session begins, or as soon as campaign data arrives if loading takes longer. X, backdrop, Escape, or a successful CTA starts a persisted 90-second wait for the next campaign. Campaigns follow priority, creation date, and ID. Each dismissed campaign appears once per session; the queue stops when exhausted. Background refreshes can add new campaigns. Browser throttling can delay rendering in background tabs.

`sessionStorage.acbPopupQueueV1` records session start, last dismissal, next index, active ID, dismissed IDs and completed IDs. Reload/navigation preserves deadlines. Completed IDs also persist in `localStorage.acbCompletedPopupIdsV1` and are excluded in future sessions on that browser. Clearing browser storage clears this history. Editing a completed campaign does not reset its exclusion; create a new campaign for a new conversion opportunity.

Newsletter CTAs save normalized addresses once per campaign/email pair before recording completion. Failed signups remain available for retry. **View signups** shows the latest 200 addresses. This stores subscribers; it does not send emails or connect to an external marketing provider. Signup records are retained if a campaign is deleted. Coupon containers copy the configured code and show a green check with Copied! Copying alone does not dismiss or mark conversion. Popup coupon codes are display content; they do not create checkout discount rules.

Images upload to the existing S3 service via an authenticated API (JPG/PNG/WebP/AVIF, maximum 8 MB). EC2 needs the existing AWS region, bucket and credentials, with public read access for the resulting image URLs. Existing HTTP/HTTPS image URLs may also be pasted. Campaign deletion does not remove S3 images.

Deploy the backend first, then both Vite apps. Campaigns start disabled. Management requires a database-verified Admin JWT, and MongoDB transactions keep reordering consistent with concurrent edits.

Public API:

- `GET /api/promotional-popups/active`: sorted active/unexpired array.
- `POST /api/promotional-popups/:id/subscribe`: email field for an active newsletter campaign.

Protected API:

- `GET/POST /api/admin/promotional-popups`: list/create.
- `PUT/DELETE /api/admin/promotional-popups/:id`: update/delete.
- `PATCH /api/admin/promotional-popups/:id/toggle`: explicit isActive or invert.
- `PUT /api/admin/promotional-popups/reorder`: campaignIds array containing every saved ID once, in desired order.
- `POST /api/admin/promotional-popups/upload-image`: multipart image; returns imageUrl.
- `GET /api/admin/promotional-popups/:id/subscriptions`: latest 200 addresses, admin only.

Fields: title (120 characters), subtitle (500), imageUrl, ctaText (50), ctaUrl, couponCode (40), displayType, backgroundTheme, priority_order (positive integer), isActive, and optional endsAt (ISO date/null). CTA targets accept site paths starting with / or HTTP/HTTPS URLs. Unsafe schemes and protocol-relative URLs are rejected. The backend accepts snake-case aliases for URL/text/type/theme/status fields.

Popup checks: backend `node --test tests/popupCampaign.test.js`; storefront `node --test tests/popupQueue.test.mjs tests/popupUi.test.mjs`; admin `node --test tests/popupCampaigns.test.mjs`. Fake-clock tests check exact deadlines and persistence. Database and S3 tests use stubs without production writes. The card and CSS under src/components/promotions are identical copies in both frontend repositories; update both together for visual changes.
