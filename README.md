# Naik Pharmacy Website

One-page online store for **Naik Pharmacy**, B-1/12, Gol Market Road, Sector D, LDA Colony, Lucknow 226012.

- Layout and animations based on the Ampul pharmacy template, in Naik Pharmacy's blue (#0070B8) and green (#88C040) brand colours
- Product catalogue with search, category filters, product details and a cart
- Checkout sends the order to the pharmacy on WhatsApp (073930 44779)
- Plain HTML, CSS and JavaScript in a single `index.html`, with no build step

## Run locally

Open `index.html` in a browser.

## Publish with GitHub Pages

1. Push this folder to a GitHub repository.
2. In the repository, open **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, select `main` and `/ (root)`, then **Save**.
4. The site appears at `https://<your-username>.github.io/<repository-name>/` after a minute or two.

## Updating products

Products are listed in the `P` array near the start of the script in `index.html`. Each product has a name, size, category, price, optional MRP (`mrp`) for a discount badge, and `rx: true` for prescription items.

> The current products, names and prices are demo samples. Replace them with the real catalogue before going live.
