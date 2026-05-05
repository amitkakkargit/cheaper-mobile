# Cheaper Mobile

Expo and React Native mobile client for the Cheaper local marketplace. It connects to the same `cheaper-api` backend as the web app and supports browsing, login, seller creation, product posting, manual handoff confirmation, and reviews.

## Local Stack

- API: `http://localhost:3001`
- Web frontend: `http://localhost:3000`
- Android emulator API base: `http://10.0.2.2:3001`
- iOS simulator API base: `http://localhost:3001`
- Web build API base: current browser host with port `3001`

For physical device testing, the phone must be able to reach the API over your LAN. Use your machine's LAN IP and make sure the API CORS settings allow that origin.

## Setup

1. Start PostgreSQL and `../cheaper-api`.
2. Install dependencies:

```powershell
npm install
```

3. Start Expo:

```powershell
npm run start
```

4. Choose a target:

```powershell
npm run android
npm run ios
npm run web
```

## Main Screens

- Home feed: `app/(tabs)/index.tsx`
- Explore/search: `app/(tabs)/explore.tsx`
- Create seller: `app/(tabs)/create-seller.tsx`
- Post product: `app/(tabs)/post-product.tsx`
- Profile/login: `app/(tabs)/profile.tsx`
- Product detail: `app/product/[id].tsx`
- Seller detail: `app/seller/[id].tsx`

## Authentication Workflow

1. Open the Profile tab.
2. Request an OTP using phone or email.
3. Enter the OTP within 60 seconds.
4. API validates the OTP from the database.
5. API returns a JWT.
6. Mobile stores the JWT in Expo SecureStore as `cheaperAccessToken`.
7. Protected requests include `Authorization: Bearer <token>`.

In local development, OTP delivery is mocked. The API returns the OTP in the request response instead of sending real SMS or email.

## Profile Workflow

- Logged-out users can request and verify phone/email OTP.
- Logged-in users can view their account state.
- Users can update profile fields such as name and avatar URL.
- Users can log out, which clears the stored JWT.

The web app has a richer avatar picker/compressor. Mobile currently stores an avatar URL string through the shared profile API.

## Marketplace Workflow

1. Browse products in the Home or Explore tabs.
2. Open a product detail screen.
3. Log in when a protected action is needed.
4. Create a seller profile if the user wants to sell.
5. Post products from the Post Product tab.
6. Product records are saved in PostgreSQL through `cheaper-api`.
7. Product and seller details are shared with the web app because both clients use the same backend.

## Manual Handoff Workflow

Cheaper does not process payments. The buyer and seller meet in person and both confirm the handoff.

1. Buyer confirms they received the product.
2. Seller confirms the product was sold.
3. The API records both confirmations.
4. Reviews are allowed after both confirmations exist.

## Review Workflow

- Auth is required before posting reviews.
- A buyer can review a product they confirmed receiving after seller confirmation.
- The buyer can also review the seller for that confirmed product.
- Sellers cannot review their own product or their own seller profile.
- A seller can review another seller's product only when acting as the buyer in that transaction.
- The API enforces one product review per user/product and one seller review per user/seller.
- Public review displays should expose only reviewer name, rating, comment, and created date.
- Public review displays should not expose email, phone, JWTs, or private account details.

## API Integration

Shared API helpers live in `lib/api.ts`.

They cover:

- Login with phone OTP
- Login with email OTP
- Current user/profile fetch
- Profile update
- Logout
- Seller creation and seller detail fetch
- Product creation, list, and detail fetch
- Buyer confirmed bought
- Seller confirmed sold
- Product review creation and fetching
- Seller review creation and fetching

Types live in `lib/types.ts` and mirror the backend/web data contracts.

## Development Commands

```powershell
npm run start
npm run android
npm run ios
npm run web
npm run lint
```

## Full Local Startup Order

From separate terminals:

```powershell
cd d:\Projects\cheaper-all\cheaper-api
npm run start:dev
```

```powershell
cd d:\Projects\cheaper-all\cheaper-mobile
npm run start
```

For Android emulator testing, the app uses `10.0.2.2:3001` to reach your computer's API server.

For iOS simulator testing, `localhost:3001` maps to your computer.

For a real phone, update the mobile API base URL to your computer's LAN IP, for example `http://10.0.0.8:3001`, and keep both devices on the same network.

## Troubleshooting

If the app cannot reach the API:

- Confirm `cheaper-api` is running on `3001`.
- Confirm the emulator/device can reach the host machine.
- For Android emulator, use `10.0.2.2:3001`.
- For physical devices, use the host LAN IP instead of `localhost`.
- Confirm API CORS allows your app origin during local development.

If login says OTP was sent but no message arrives, that is expected locally. OTP delivery is mocked and the API response contains the code.

If product images from old sample URLs fail, use records seeded by the API and generated local images in the web app. External sample image/video hosts may return `403`.
