# HairHealth.ai / Landbot Lead-Gen Integration — Design Spec

**Date:** 2026-09-08
**Status:** Draft for review
**Source:** WhatsApp thread "ROOTÉ & HairAI" (2026-09-04 → 2026-09-08, transcript in
`C:\Users\jumua\Pictures\Screenshots\ROOTE and HAIRAI Convo\`) + `HairHealth_HubSpot_Integration_Guide.docx`
sent by HairHealth.ai on 2026-09-08.

---

## 1. What actually got negotiated

ROOTÉ's dev team (Marwell Mercado) asked HairHealth.ai (Pratik, Nyayabrata) seven rounds of detailed
integration questions — payload schema, HMAC signing spec, retry policy, correlation-ID stability,
sandbox credentials. **None of those were ever answered.** What was confirmed instead, explicitly,
twice, is a different and much simpler architecture:

> **"ROOTÉ Website → HairHealth.ai → Hair Analysis → Our HubSpot."** — Marwell, confirmed by Pratik:
> *"Yes exactly this flow. We will do the integration and send test data to inspect."*

Concretely:

- HairHealth.ai's **Landbot** chatbot (already trialed by ROOTÉ at `roote.vercel.app/test/landbot/fullpage`)
  collects the visitor's questionnaire answers and hair photos on HairHealth.ai's own hosted widget.
- HairHealth.ai's AI HairScan analyzes them.
- The result is written **directly into ROOTÉ's own HubSpot account** — contact fields, the submitted
  photo(s), the Q&A responses, and the HairScan results (grading, density estimate, product/treatment
  recommendations) — via a **HubSpot Private App** that ROOTÉ provisions and hands a write-scoped
  token to.
- **There is no callback, webhook, or API of any kind back to ROOTÉ's frontend or backend.** An
  earlier proposal (an outbound webhook to a ROOTÉ-provided endpoint, with `analysis_id`, HMAC
  signing, async delivery) was floated by HairHealth.ai first, then superseded by the direct-to-HubSpot
  design once ROOTÉ asked to confirm the architecture. Nothing built against that earlier proposal
  would match what's actually shipping.

### What ROOTÉ has already provisioned (per the thread, 2026-09-08)

| Field | Value |
|---|---|
| Private App name | `HairHealth.ai` |
| Destination List ID | `5` |
| Scopes granted | Contacts Read/Write, Lists Read/Write, Files Read/Write |
| Access token | Not yet shared in the thread — Pratik said he'd send it "securely after the meeting" |

The thread ends with ROOTÉ asking HairHealth.ai to push one complete test HairScan into HubSpot so
the mapping can be inspected. HairHealth.ai agreed to test and report back; **no test data had been
confirmed sent as of this spec.**

### Still genuinely unknown

Every one of these was asked for, at least once, and never answered:

- Exact HubSpot property names each field lands in
- Whether/how re-analysis of the same contact is handled (overwrite vs. duplicate)
- Any correlation ID between "a visit to `/hair-scan`" and "a HubSpot contact" — there isn't one
  today; HairHealth.ai owns identity resolution entirely on their side
- Failure-case shape (Pratik: *"all failed analysis are handled by us and you will only get successful
  analysis result data"* — i.e., ROOTÉ will never see a failure signal at all)
- Timing/SLA beyond "depends on the traffic of the website"

---

## 2. Why this doesn't feed ROOTÉ's own product flow

This repo's `/analysis` → `/report/:reportId` → `/program` pipeline is ROOTÉ's actual product: a
questionnaire + optional photos produce a `HairAnalysis` that stays in the visitor's own browser
session (`sessionStore`) and drives the personalized report, plan, and purchase. `src/domain/analysis/provider.ts`
already anticipated a real computer-vision vendor plugging into that pipeline via the
`HairAnalysisProvider` interface, and named HairHealth.ai as the presumed target (PO decision #23,
2026-09-04) — reasonably, at the time, since no contract existed yet to say otherwise.

We now know that guess doesn't hold: HairHealth.ai's confirmed product for ROOTÉ never returns data
to ROOTÉ at all — it terminates in ROOTÉ's HubSpot. There is no synchronous "send a photo, get a
`HairAnalysis` back" contract on offer, and nothing in the thread suggests one is coming. So:

- **The in-app `/analysis` flow keeps using ROOTÉ's own deterministic model** (`deriveAnalysis`) as
  its only real implementation. The `HairAnalysisProvider` seam stays in the code (it's good
  architecture for *some* future CV vendor), but its comments must stop naming HairHealth.ai, since
  that claim is now known false.
- **HairHealth.ai / Landbot becomes a separate, secondary lead-generation surface** — a marketing
  touchpoint that captures leads into HubSpot for the sales/marketing team, structurally unconnected
  to the report/plan/checkout/program pipeline. This matches how it was actually first introduced in
  the thread (Justine: *"For the AI bot assessment, I used a Landbot test page"* — presented as a
  parallel experiment, not a replacement for Precious's in-app design).

---

## 3. Scope of this change

### In scope

1. A new standalone route, `/hair-scan`, that fullpage-embeds HairHealth.ai's Landbot widget.
2. A `LandbotFullpageEmbed` component implementing Landbot's real, documented Fullpage-embed contract
   (see §4), env-var-gated and safely deployable before the real bot config exists.
3. A nav entry making `/hair-scan` reachable, visually distinct from the existing "Start free hair
   analysis" CTA that drives `/analysis`.
4. Renaming `hairhealthAdapter.ts` → `remoteAnalysisAdapter.ts` and scrubbing HairHealth.ai-specific
   naming/claims from `provider.ts`, `analyzeHair.ts`, and `.env.example`, replacing them with an
   honest "vendor TBD" framing.
5. Correcting two now-false privacy-policy claims (EN + HE) that name `hairhealth.ai` as the recipient
   of in-app assessment photos/answers, and adding an accurate disclosure of the real data flow
   (Landbot → HairHealth.ai → ROOTÉ's HubSpot, for marketing follow-up).
6. This spec, as the artifact a backend/ops person needs to pick up the actual remaining work (which
   is almost entirely outside this repo — see §6).

### Out of scope

- Anything requiring the HubSpot Private App token, a payload schema, or a webhook receiver — none of
  that exists in the confirmed architecture. If HairHealth.ai's promised test HairScan surfaces a
  schema worth reacting to, that's a follow-up spec, not this one.
- Replacing or modifying the in-app `/analysis` flow's real (deterministic) analysis logic.
- A real `HairAnalysisProvider` implementation for any CV vendor — the seam stays open, unimplemented.

---

## 4. `LandbotFullpageEmbed` — technical contract

Landbot's documented Fullpage embed (`dev.landbot.io/sdks/widgets`) is a script injection + JS
constructor call, no container element required:

```html
<script>
  (function () {
    var s = document.createElement('script');
    s.type = 'module';
    s.async = true;
    s.addEventListener('load', function () {
      setTimeout(function () {
        new Landbot.Fullpage({ configUrl: '...' });
      }, 500);
    });
    s.src = 'https://cdn.landbot.io/landbot-3/landbot-3.0.0.mjs';
    document.body.appendChild(s);
  })();
</script>
```

`configUrl` is the bot-specific config URL HairHealth.ai issues per bot — ROOTÉ doesn't have this
value yet (only a `roote.vercel.app/test/landbot/fullpage` demo link, not the underlying config URL).

### Component behavior

- Reads `import.meta.env.VITE_LANDBOT_CONFIG_URL`.
- **Unset** (the default, and the state this ships in): render a static, on-brand placeholder card —
  no broken page, no console errors, safe to deploy today. Copy: something like "Our AI chat is being
  connected — check back soon," styled consistently with other pending/placeholder surfaces in the
  app (see `PendingChip` conventions in `src/content/pending.ts` for the house style, even though this
  isn't a `pending.config` value — it's infra config, not product content).
- **Set:** inject the script exactly once (guard against double-injection across route re-entries),
  then call `new Landbot.Fullpage({ configUrl })` after the script's `load` event.
- **Known limitation, documented in-code and here:** Landbot's public docs describe no destroy/unmount
  API. Because this is a client-routed SPA, navigating away from `/hair-scan` will not necessarily
  tear down whatever DOM the widget injected. This is a real gap to verify once a live `configUrl`
  exists — flagged rather than silently ignored.

### Config

`.env.example` gains:

```
# HairHealth.ai lead-gen widget (Landbot Fullpage embed) — optional.
# While unset, /hair-scan renders a "not yet connected" placeholder instead of the live widget.
# This captures leads directly into HairHealth.ai's HubSpot integration (see
# docs/superpowers/specs/2026-09-08-hairhealth-landbot-integration-design.md) — it is NOT connected
# to ROOTÉ's own /analysis flow or session state in any way.
VITE_LANDBOT_CONFIG_URL=
```

---

## 5. Route, nav, and copy

| | |
|---|---|
| Path | `PATHS.hairScan = '/hair-scan'` |
| Mounting | Added to the existing `{ element: <FunnelShell />, children: [...] }` block in `App.tsx`, alongside `/login` and `/program/*`. Reuses `FunnelShell`'s wordmark + locale-toggle chrome — no new layout code. |
| Nav entry | A second link in `Header.tsx`'s `NAV` array (desktop) + mobile drawer list, labeled distinctly from `marketing.nav.cta` ("Start free hair analysis") so visitors don't read the two as the same feature. Shipped as `marketing.nav.hairScan` = "AI Chat" (EN) / "צ׳אט AI" (HE). |
| Page copy | A short intro line above the embed disclosing it's powered by a partner (HairHealth.ai) and linking to Privacy — see §5.1. |

### 5.1 On-page disclosure

Because the widget collects name/email/photos directly through HairHealth.ai's own UI (not ROOTÉ's),
add one sentence above the embed, in both locales, naming the partner and linking to `/privacy`. Exact
wording drafted alongside the i18n keys during implementation, following the existing disclaimer voice
(`roote.config.disclaimers`).

---

## 6. Privacy policy correction (EN + HE)

Current (`src/i18n/messages/en.ts`, mirrored in `he.ts`):

- `marketing.legal.privacy.s2.body`: *"If a clinical analysis provider (hairhealth.ai) is enabled for
  your session, your photos and answers are sent to that provider solely to generate the assessment;
  otherwise they never leave your device."*
- `marketing.legal.privacy.s5.body`: *"...and — if enabled for your session — the hairhealth.ai
  analysis provider, which receives your photos and answers to generate your assessment."*
- `roote.config.ts` → `disclaimers.demo`: *"Demo: analysis figures are illustrative; production
  integrates hairhealth.ai."*

All three assert that HairHealth.ai receives data from the in-app **assessment** flow. That's false —
HairHealth.ai receives nothing from `/analysis`; it only receives what a visitor gives the separate
`/hair-scan` Landbot widget. This is corrected as follows:

- §2/§5: drop the vendor-specific claim about the assessment flow (it stays accurately described as
  fully client-side, no third party). Add a new, separate sentence disclosing the actual third-party
  flow: visiting `/hair-scan` sends whatever the visitor submits there to HairHealth.ai, who write it
  into ROOTÉ's HubSpot for marketing follow-up.
- `disclaimers.demo`: reworded to drop the specific vendor name, since which CV vendor (if any) will
  eventually power `/analysis` is genuinely undecided — e.g. "production integrates a clinical
  analysis provider" (kept marked pending-legal-review, per existing convention).

Both languages updated together, per `src/i18n/messages.test.ts`'s parity requirement.

---

## 7. Codebase renames (removing the false "HairHealth.ai = our CV vendor" premise)

| File | Change |
|---|---|
| `src/domain/analysis/hairhealthAdapter.ts` | Renamed to `remoteAnalysisAdapter.ts`. Exports renamed (`isHairhealthConfigured`→`isRemoteAnalysisConfigured`, `requestHairhealthAnalysis`→`requestRemoteAnalysis`, types `HairhealthInput`/`HairhealthResponse`→`RemoteAnalysisInput`/`RemoteAnalysisResponse`). Header comment rewritten: vendor TBD, HairHealth.ai's actual confirmed product is the unrelated Landbot/HubSpot lead-gen integration documented in this spec. |
| `src/domain/analysis/analyzeHair.ts` | Import updated; `source: 'hairhealth' \| 'local'` → `source: 'remote' \| 'local'`; comment updated. |
| `src/domain/analysis/provider.ts` | Comment/PO-decision-#23 note updated to reflect the 2026-09-08 correction; `source === 'hairhealth'` → `source === 'remote'`. |
| `.env.example` | `VITE_HAIRHEALTH_API_URL`/`VITE_HAIRHEALTH_API_KEY` → `VITE_CV_PROVIDER_API_URL`/`VITE_CV_PROVIDER_API_KEY`; comment rewritten; `VITE_LANDBOT_CONFIG_URL` added (§4). |
| `src/domain/tracking/metrics.test.ts` | The `'hairhealth.ai'` string used as an arbitrary pass-through-test value renamed to something vendor-neutral (e.g. `'remote-provider'`) — low-stakes hygiene, bundled with the rest of this rename since it's in the same area. |

No behavior changes from these renames beyond the string values of `source`/`provider` fields — both
already free-form (`provider: string` in `qualitativeMetrics`), so no type contracts break.

---

## 8. What's left for a backend/ops person (the actual "ready for integration" checklist)

Given the confirmed architecture, there is almost nothing for a *backend* to build — HairHealth.ai
writes directly to HubSpot using a token ROOTÉ issues, with no ROOTÉ-hosted endpoint in the loop. The
real remaining checklist is:

1. Get the real `configUrl` for the Landbot bot from HairHealth.ai and set `VITE_LANDBOT_CONFIG_URL`.
2. Receive the HubSpot Private App access token securely (Pratik still owes this) and store it only in
   HubSpot's own UI / wherever HubSpot workflows need it — **never in this repo, never in any
   frontend-reachable config**, since it's a write-scoped CRM credential.
3. Verify HairHealth.ai's promised test HairScan lands correctly in HubSpot List ID `5` and confirm
   the actual property mapping — none of that is knowable until they send it.
4. Decide, separately from this spec, whether ROOTÉ ever wants analysis data to flow *back* out of
   HubSpot into ROOTÉ's own systems (e.g. via a HubSpot workflow webhook) — nothing in the current
   agreement provides this, and it would be new scope.
5. Verify the Landbot Fullpage widget's SPA-unmount behavior in a real browser once `configUrl` is
   live (§4's flagged limitation).
6. Verify the on-page disclosure (the "powered by our partner HairHealth.ai" `LegalNotice` on
   `/hair-scan`) is actually visible once a real `configUrl` is live — the Landbot Fullpage widget
   appends its own full-viewport DOM to `document.body` with no container element (per §4), which
   may cover the page's own title/intro/disclosure exactly when the widget (and the data sharing
   it discloses) is active. Unverifiable until a real bot is connected; check alongside item 5.

---

## 9. Testing plan

- `LandbotFullpageEmbed`: unconfigured → placeholder renders, no script injected. Configured → script
  tag injected once (mock the DOM/`document.createElement`), `Landbot.Fullpage` constructor called
  with the right `configUrl` after simulated `load`.
- Route/nav: `/hair-scan` reachable and rendered inside `FunnelShell`; new nav link present and
  distinguishable from the existing analysis CTA in both `Header.test.tsx` assertions.
- Rename fallout: no dedicated test file exists for `analyzeHair`/`provider`/`remoteAnalysisAdapter`
  (none existed for `hairhealthAdapter` either) — the rename is guarded entirely by the type system
  (`AnalyzeHairResult['source']` is a literal union, so a missed reference is a compile error, not a
  silent runtime bug) plus the full suite passing with zero regressions.
- `src/i18n/messages.test.ts` (parity) and `src/content/pending.test.ts` stay green with the copy
  changes.
- `pnpm typecheck` and `pnpm test` (52+ files) must both stay clean, per repo rules.

---

## 10. Open questions (not blocking this spec, but not to be silently assumed later)

- Exact HubSpot field mapping, retry/idempotency behavior, and failure signaling — HairHealth.ai never
  answered these despite being asked three separate times. Anyone integrating further should not
  assume any particular shape until HairHealth.ai's test payload actually arrives.
- Final nav copy/label for `/hair-scan` — proposed in §5, not locked.
- Whether ROOTÉ ever wants a path for HubSpot data to flow back into ROOTÉ's own systems (§8.4) — no
  current requirement, flagged only so it isn't lost.
