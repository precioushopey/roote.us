# Shop-First Self-Serve Purchasing (Cart Revival) — Design Spec

**Date:** 2026-09-22
**Status:** Draft for review
**Source:** Mischa Mischka (product owner) QA feedback, reviewed from WhatsApp screenshots
(`C:\Users\jumua\Downloads\ROOTE\1.jpg`–`23.jpg`), finding #1 of 9: *"since you want to sell a
product, allow to shop straight, no need for customer to do analyse... click on shop products ->
choose what kind of hair you have, once selected, show right product to buy. Buy now buttons
missing completely."* Two rounds of clarifying questions with the user resolved the open product
decisions (§4).

---

## 1. What actually changes, in one paragraph

Every product on the shop (`/products`) and each product's own page (`/products/:slug`) gets a
working **"Add to Cart"** button, replacing "Start Free Hair Analysis" as that page's call to
action — for all 6 launch SKUs, with no assessment/quiz gate in front of the purchase. This
requires reviving a cart subsystem (state, page, checkout, header icon) that existed in this
codebase very recently and was cleanly deleted in one piece before this session started; the
revival restores it with "bag" terminology and paths renamed to "cart" throughout, per Mischa's
explicit correction elsewhere in the same feedback thread.

---

## 2. Why this is a smaller lift than it looks

A full `git show`/`git diff` against the commit that removed it turned up that **the entire bag/cart
feature already existed, fully working, one commit ago** — `store/cart.tsx` (reducer +
localStorage-persisted lines), `store/cartLines.ts` (resolves lines against a catalogue), a cart
page, a cart checkout page (reusing the shared `CheckoutFields` component), a cart success page, a
header cart icon with count badge, and a second `Order` kind (`BagOrder`) in `store/checkout.ts`
sitting alongside the existing `ProgramOrder`. `content/catalog.ts` — a thin, already-correct
product projection this cart code depends on — is still in the tree today, just currently unused.

So this is a **rename-and-restore**, not new architecture: `bag` → `cart` in every user-facing
string, path, and type name; reconnect the provider and routes; swap the CTA on the two shop
pages. No new state-management pattern, no new shared component, no schema redesign.

---

## 3. Scope of this change

### In scope

1. Revive `store/cart.tsx` (`CartProvider`/`useCart`) and `store/cartLines.ts` verbatim (§5).
2. Add a second `Order` variant to `store/checkout.ts`: `CartOrder` / `kind: 'cart'` (renamed from
   the deleted `BagOrder`/`'bag'`) (§6).
3. Revive the three cart routes, renamed: `/cart`, `/cart/checkout`, `/cart/success` (§7).
4. Revive the header cart icon (`CartLink`) with its count badge, in its previous position and
   styling — **not** restyled for prominence yet, see §9 (§8).
5. On `Products.tsx` and `ProductDetail.tsx`: replace the "Start Free Hair Analysis" CTA with
   "Add to Cart" for all 6 products, no medical-review gating, no quiz link left on either page
   (§9).
6. Fix every existing `bag.*`/`cart.*` i18n string, across all 6 locales, that currently says "bag"
   in its *value* ("Your bag", "Add to bag", "Open bag", etc.) to say "cart" instead. Key *names*
   are left as they are — some are already `cart.*`, some are `bag.*`; renaming keys is pure churn
   with no functional benefit (§10).
7. Fix `AppProfile.tsx`'s order-history line, which currently hardcodes every order's kind label as
   "Program" — a cart order needs its own label (§11).
8. This spec's own explicit exclusions list, so later findings don't duplicate or conflict with
   this work (§12).

### Out of scope (deliberately, per direct decisions already made)

- Cart-icon color/prominence and the "added to cart, continue shopping or view cart" confirmation
  popup Mischa asked for — that's finding #6 (cart UX), not this one. This pass gives "Add to Cart"
  a plain toast confirmation (the app's existing `ToastProvider`) and nothing more.
- Checkout field layout, the skip-login/guest flow, and the payment-method-selection step — that's
  finding #7 (checkout flow). This pass reuses `CheckoutFields` exactly as it exists today for
  `ProgramOrder`, applied unchanged to `CartOrder`, so the flow is clickable end to end; finding #7
  will redesign what this pass wires up, not rebuild it.
- Any health-condition purchase gate (Tal Alaluf's separate requirement) — flagged as unresolved in
  §12, not designed here.
- The hidden "Bundle & Save" section on `Products.tsx` — stays hidden and untouched. The revived
  cart's line type still supports a `bundle` kind (restored verbatim from the deleted code) so
  nothing blocks wiring bundles in later, but no bundle "Add to Cart" button is added now.
- Legacy `/bag/*` → `/cart/*` redirects — not added. The `/bag` paths were only ever in an
  uncommitted, never-deployed working tree; there's nothing live to redirect from.

---

## 4. Product decisions already made (for the record)

Resolved via two rounds of clarifying questions with the user before this spec was written:

| Question | Decision |
|---|---|
| Should Level 6/10/15 (`requiresMedicalReview: true`) also get direct Buy Now, or stay quiz-gated? | **Buy Now everywhere** — all 6 products, no gating at point of purchase. |
| Real multi-item cart, or single-item direct-to-checkout? | **Real cart** — multi-item, quantities, a cart page. |
| Does "Start Free Hair Analysis" stay as a secondary link on product pages? | **No — replaced entirely.** The quiz stays reachable elsewhere (nav, home) but not from the shop. |
| Should this pass also wire a working checkout, or stop at the cart page? | **Wire a working checkout now**, reusing the existing `CheckoutFields`/`submitPayment` machinery as-is. |

---

## 5. Data layer

Restore `src/store/cart.tsx` and `src/store/cartLines.ts` from the pre-deletion version
(`git show <parent-of-714cffb>:src/store/cart.tsx`), unchanged in logic:

- `CartLine = ({kind:'sku'; sku:string} | {kind:'bundle'; bundleId:string}) & {qty:number}`
- `useReducer` state, actions `ADD_SKU` / `ADD_BUNDLE` / `SET_QTY` / `REMOVE` / `CLEAR`, qty clamped
  1–20, persisted to `localStorage['cart']` via the existing `lsGet`/`lsSet` helpers.
- `resolveCartLines(lines, locale)` resolves against `content/catalog.ts`'s `findProduct`/
  `findBundle` — unchanged, that file is already correct and already derives from `products.ts`.

`CartProvider` goes back into `App.tsx`'s provider tree, in its previous position (alongside
`SessionProvider`/`AuthProvider`, wrapping `TrackingProvider`).

---

## 6. Order model

`store/checkout.ts` gets its second `Order` variant back, renamed:

```ts
export type CartOrder = {
  kind: 'cart';
  lines: CartLine[];
  contact: Contact;
  card: CardRef;
};

export type Order = ProgramOrder | CartOrder;
```

Order IDs: `cart-<timestamp>-<n>` (was `bag-...`). `submitPayment` already branches generically on
`order.kind` for ID prefixing — only the prefix string changes. `orders.ts`'s `OrderRecord.kind:
Order['kind']` needs no change; it already derives from the union.

---

## 7. Routes

Revive, renamed:

| Old (deleted) | New |
|---|---|
| `app/routes/bag/BagPage.tsx` | `app/routes/cart/CartPage.tsx` → `/cart` |
| `app/routes/bag/BagCheckout.tsx` | `app/routes/cart/CartCheckout.tsx` → `/cart/checkout` |
| `app/routes/bag/BagSuccess.tsx` | `app/routes/cart/CartSuccess.tsx` → `/cart/success` |

Logic is unchanged from the deleted versions (empty-cart guard, subtotal-only-if-every-line-priced
pending-chip behavior, order recording, cart-clear-on-success race avoidance) — only names, paths,
and copy change. `paths.ts` gets `PATHS.cart`, `PATHS.cartCheckout`, `PATHS.cartSuccess` back
(replacing the deleted `PATHS.bag*`). Registered in `marketingRoutes.tsx` the same way the bag
routes were.

---

## 8. Header

Revive `app/components/shell/CartLink.tsx` verbatim (bag icon → cart icon is already just a
`ShoppingBag` lucide icon with a count badge; no visual change needed for *this* pass) and its
wiring back into `Header.tsx` (`useCart()` + `<CartLink label={t('cart.open')} count={cart.count}
/>` in the same position it occupied before removal).

---

## 9. Shop pages

`Products.tsx`: `FindYourMatchCta` (the "Start Free Hair Analysis" button rendered on every
`ProductCard`) is replaced by an "Add to Cart" action calling `cart.add(product.slug)`, followed by
a toast (`useToast()`, already in the provider tree) confirming the add. Same replacement inside
the currently-hidden `BundleSection`'s `BundleCard` is **not** made — that component is out of
scope per §3.

`ProductDetail.tsx`: the hero's `<Button to={PATHS.analysis}>Start Free Hair Analysis</Button>`
becomes `<Button onClick={() => cart.add(product.slug)}>Add to Cart</Button>` + toast. The
"Requires medical review" / "No prescription needed" badge stays exactly as it is — that's
informational transparency, not a purchase gate, and is unaffected by this change.

The existing All/Thinning/Gray segmented filter on `Products.tsx` already satisfies "choose what
kind of hair you have" — untouched.

---

## 10. Copy

Every `bag.*`/`cart.*` message key whose *value* currently says "bag" gets corrected to say "cart,"
in all 6 locales (`en`/`he`/`ar`/`ru`/`fr`/`es`) — e.g. `'cart.add': 'Add to bag'` → `'Add to
cart'`, `'bag.title': 'Your bag'` → `'Your cart'`, `'cart.open': 'Open bag'` → `'Open cart'`, and so
on for all ~35 keys. Key *names* are left alone (both `bag.*` and `cart.*` namespaces already
coexist from before; renaming keys is mechanical churn with no functional benefit and this repo's
`pnpm i18n:check` validates cross-locale parity, not key naming). Verified via `pnpm i18n:check`
after the edit.

---

## 11. Order-history label fix

`AppProfile.tsx`'s order list currently renders `{t('app.profile.orders.program')} · {o.label}` for
every order unconditionally — accurate today only because `ProgramOrder` is the only kind that
exists. With `CartOrder` added, this needs a per-kind label. Add one new i18n key
(`app.profile.orders.cart`, e.g. "Order") and branch on `o.kind` in that render.

---

## 12. Explicitly open / deferred (not resolved by this document)

- **Tal Alaluf's health-condition purchase gate** ("someone with one of the background health
  conditions shouldn't be able to purchase anything before doctor approval") has no home under
  "Buy Now everywhere." The quiz was the only place that data was ever captured, and this pass
  removes the quiz from the purchase path entirely. This will need its own decision — most likely a
  short health-screener step inserted at cart/checkout time for the 3 medical-review SKUs — when
  that finding is tackled. Not designed here; flagging so it isn't silently dropped.
- Cart-icon visual prominence and the post-add confirmation popup pattern (finding #6).
- Checkout form field layout, guest/skip-login flow, and payment-method selection (finding #7).

---

## 13. Testing plan

No test suite exists in this repo (deliberate, per `CLAUDE.md`) — verification is:

- `pnpm typecheck` clean.
- `pnpm i18n:check` and `pnpm content:check` clean after the copy fixes in §10.
- `pnpm build` clean.
- Manual smoke test in a browser: add each of the 6 products to cart from both the shop grid and a
  product detail page, adjust quantity, remove a line, complete checkout end to end to the success
  page, and confirm the order appears correctly labeled on `/account/profile`.
