# Architecture

## Goal

Sell PDFs with anonymous LNURL-pay checkout, no self-hosted Lightning node, and
time-limited downloads after payment.

## Recommended Shape

- `app/`: storefront pages and same-project API routes
- `components/`: product grid and Lightning checkout UI
- `data/products.json`: generated product catalog
- `storage/pdfs/`: private paid files
- `public/uploads/previews/`: public preview files
- `OpenNode`: charge creation, Lightning invoice delivery, and status backend

## Flow

1. Store operator runs `npm run add-product`.
2. The script prompts for product metadata and copies files into the correct directories.
3. Storefront loads product catalog from `data/products.json`.
4. User opens the product page and starts a browser checkout session.
5. API creates an OpenNode charge for that product.
6. The UI renders the returned BOLT11 invoice and optional hosted checkout URL.
7. The product page polls charge status until OpenNode reports `paid`.
8. API mints a short-lived download token after settlement.
9. User downloads the paid PDF.

## Added Storefront Basics

- search by title, description, author, or tags
- tag filters
- featured product support
- draft/live visibility control
- page count and file size display
- optional preview per title
- tokenized post-payment delivery
- separate preview excerpt enforcement so the paid file is never exposed publicly
- base-price product model with live FX display and quote-locked sats checkout
- browser checkout session with settlement polling and manual unlock button
- verified OpenNode webhook for asynchronous charge events

## Important Constraint

LUD-09 URL success actions require the URL domain to match the LNURL callback
domain. That means a pure static frontend plus hosted LNbits paylinks is not
enough for time-limited file delivery on your own domain.

## Initial Recommendation

Use OpenNode and Vercel hosting:

- Next.js app routes and serverless endpoints on one domain
- OpenNode API key stored in host environment variables
- paid PDFs stored outside the public web root
- preview excerpts stored publicly only as separate excerpt files, never as the full paid PDF

## Pricing Model

- Each product stores a base `pricing.amount` and `pricing.currency`.
- The import script calculates `priceSats` as an imported snapshot for sorting
  and fallback display.
- The storefront lets the user choose a display currency globally.
- OpenNode charges are created from the current base price for each checkout.
- The browser tracks a signed checkout session token and unlocks the paid file
  only after the matching charge is verified as settled.
