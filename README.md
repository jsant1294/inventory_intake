# JRTools v3.1 Bilingual

This build regenerates the JR Tools storefront + intake system as a bilingual EN/ES project.

## Included

- bilingual nav with EN / ES toggle
- bilingual storefront
- bilingual intake form
- bilingual inventory preview
- public product grid
- product detail page
- Supabase intake with image upload
- config-driven brand file for duplication

## Main routes

- `/`
- `/store`
- `/store/[sku]`
- `/intake`
- `/inventory`

## Translation system

Main translation file:

- `lib/translations.js`

Language provider:

- `components/LangProvider.js`

## Setup

1. Copy the example environment file and fill in your values:
   ```bash
   cp .env.example .env.local
   # Edit .env.local and set your Supabase and API keys
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## Required Supabase tables

- `brands`
- `tool_categories`
- `battery_platforms`
- `products`
- `inventory_lots`
- `product_images`

Create a public bucket:

- `product-images`

## Recommended indexes

## Contributing

We welcome contributions! To get started:

1. Fork this repository and create a new branch for your feature or fix.
2. Run `npm install` to set up dependencies.
3. Use `npm run lint` and `npm run test` to check your code before submitting.
4. Open a pull request with a clear description of your changes.

### Code Style

- Follow the Airbnb style guide (enforced by ESLint and Prettier).
- Use TypeScript for new files/components when possible.

### Testing

- Add or update tests for new features and bug fixes.
- Use Jest and React Testing Library for unit/integration tests.
- Use `jest-axe` for accessibility checks.

### Documentation

- Update this README or add comments in code for any new features or important changes.

---

For more details, see:

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Sentry for Next.js](https://docs.sentry.io/platforms/javascript/guides/nextjs/)

```sql
create unique index if not exists brands_name_key_idx on brands (name);
create unique index if not exists tool_categories_name_key_idx on tool_categories (name);
create unique index if not exists product_images_product_id_image_url_key_idx on product_images (product_id, image_url);
```

## Notes

This is a clean regenerated bilingual build for faster iteration. Test locally with your real Supabase schema before production deployment.
