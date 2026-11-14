# Forex Brokers Reviews page

The page lives at `src/app/[locale]/(site)/forex-brokers/reviews`.

## Data loading

`page.tsx` reads the locale, the `broker_type` query parameter, the user's zone, and any `filter_*` query parameters. It requests:

```text
GET /api/v1/site/brokers?broker_type={broker_type}&language_code={locale}&zone_code={zone}
```

The response provides the broker rows, `table_columns_config`, `table_default_columns`, and `filters_config`. The request is kept in this route because the shared API helper currently omits `table_default_columns` from its returned object.

## Table rendering

`page.tsx` imports `ClientdataTable` from `@/components/ClientdataTable`. The component and its supporting files live together in `src/components/ClientdataTable`:

- `ClientdataTable.tsx` renders the page header, category tabs, and breadcrumbs.
- `ReviewsDataTable.tsx` owns search, column selection, sorting, and pagination using the project's installed `@tanstack/react-table` package and existing shadcn primitives.
- `BrokerTableCell.tsx` renders cell content.
- `reviews-table.ts` contains the API types and shared value/URL helpers.
- `index.ts` exports the component and its public types.

- `table_default_columns` determines which columns are initially visible.
- An always-visible `#` column numbers the displayed rows across pages (1–10, 11–20, etc.), following the current search and sort order.
- The column menu lists every entry in `table_columns_config`; selecting a column changes the visible columns in the browser.
- Column sorting is enabled only when that column has `allow_order_by: true`.
- `type: "boolean"` renders a check or cross for boolean values, `1`/`0` (numbers or strings), and `Yes`/`No`, `True`/`False`, or `Allowed`/`Not Allowed`. Missing values remain `—`; unknown values remain readable text.
- `type: "urls"` renders each `{ label, url }` entry as a labeled link opening in a new tab. Empty lists display `—`; entries without a valid HTTP(S) URL display their label as text.
- Text columns with `show_more_btn: true` have a 220px preview. Overflowing text gets a per-cell Show more / Show less button; short text does not get an unnecessary toggle.
- URL columns with `show_more_btn: true` preview the first link within 220px. Show more reveals all links and their full labels when the first label overflows or additional links exist. Show less restores the preview; links remain clickable in both states.
- Other cells use the backend `type` (`image`, `rating`, or text) to choose their renderer.
- Search matches all broker fields before local sorting and pagination, including hidden columns and lists. Filter changes use the shared `FilterPanel` and its `filters_config`.
- Pages contain 10 rows. The table and pagination controls use the same page index, clamped to the filtered result count. Invalid or out-of-range URL pages are replaced with a valid page. Automatic TanStack page resets are disabled; submitting search, changing sorting, and applying server filters reset the page explicitly. Column visibility changes preserve the page.

## URL state

The current category is stored in `broker_type`. Browser table state is reflected in:

- `columns`: comma-separated selected column keys.
- `order_by` and `order_direction`: the current sortable column and direction.
- `page`: the current one-based page number.
- `search`: the submitted table search.
- `filter_*`: filters managed by the shared filter panel.

Table state updates use the browser History API, which Next.js synchronizes with `useSearchParams`; pagination, sorting, search, and column visibility do not request another server-rendered page. Changing a category or applying filters updates the route data request.

Rating filters use radio groups with the existing star display. Each group writes one interval (for example `filter_overall_rating=3-4` or `filter_overall_rating=5`). Its Any/remove button deletes that parameter; other rating groups remain independent. Legacy comma-separated or repeated rating parameters retain their first non-empty selection. Normalization runs before both reviews and rebates API requests, and in the shared filter URL hook, including URL restoration. Other multi-value filters and range parameters retain their existing format.

## Appearance

Tailwind `dark:` variants follow the site's existing theme class. At small widths, category tabs stack vertically and the table scrolls horizontally, matching the mobile Figma layout while keeping all configured columns available.
