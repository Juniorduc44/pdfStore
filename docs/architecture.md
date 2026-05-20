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
- `LNbits cloud`: invoice creation and payment status backend

## Flow

1. Store operator runs `npm run add-product`.
2. The script prompts for product metadata and copies files into the correct directories.
3. Storefront loads product catalog from `data/products.json`.
4. User selects a product and opens a LNURL-pay endpoint for that item.
5. API returns LUD-06 payRequest metadata for that product.
6. Wallet calls the callback with the requested amount.
7. API creates an invoice through LNbits and returns `pr`, `routes`, and a
   `successAction`.
8. After payment, wallet shows the `successAction`.
9. User opens a short-lived download URL to fetch the paid PDF.

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

## Important Constraint

LUD-09 URL success actions require the URL domain to match the LNURL callback
domain. That means a pure static frontend plus hosted LNbits paylinks is not
enough for time-limited file delivery on your own domain.

## Initial Recommendation

Use LUD-09 URL success actions and Vercel hosting:

- Next.js app routes and serverless endpoints on one domain
- LNbits API key stored in host environment variables
- paid PDFs stored outside the public web root
- preview excerpts stored publicly only as separate excerpt files, never as the full paid PDF

## Pricing Model

- Each product stores a base `pricing.amount` and `pricing.currency`.
- The import script calculates `priceSats` as an imported snapshot for sorting
  and fallback display.
- The storefront lets the user choose a display currency globally.
- LNURL pay requests calculate the current sats amount from the base price.
- A signed quote token is embedded into the LNURL callback URL so the sats
  amount stays fixed for that checkout session even if rates move afterward.
