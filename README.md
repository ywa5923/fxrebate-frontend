This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
pnpm remove critters

https://docs.google.com/document/d/1A97R-wjuhUc30sujR0_4c9BYv_NBbp4wkiDj_FKtOq0/edit?tab=t.0

https://www.figma.com/design/Z69xSXdpW6UL2KyR9LZp7Y/FXR?node-id=220-356&p=f&t=tqhYti1GmEl5Ybjp-0

## Usage Locations:

1. **`src/components/ui/calendar.tsx`** - This is your main Calendar component that wraps `react-day-picker`'s `DayPicker`
2. **`src/components/DynamicForm.tsx`** - Uses your Calendar component for date input fields
3. **`src/components/DynamicForm.tsx.new`** - Also uses the Calendar component

## How it's used:

```typescript
// In calendar.tsx
import { DayPicker } from "react-day-picker"

// In DynamicForm.tsx
import { Calendar } from "@/components/ui/calendar"

// Used for date input fields in your dynamic forms
<Calendar
  mode="single"
  selected={formField.value}
  onSelect={formField.onChange}
  initialFocus
/>
```

## The peer dependency warnings:

The warnings you saw are because:
- `react-day-picker@8.10.1` expects `date-fns@^2.28.0 || ^3.0.0` but you have `date-fns@4.1.0`
- `react-day-picker@8.10.1` expects `react@^16.8.0 || ^17.0.0 || ^18.0.0` but you have `react@19.0.0`

## Solutions:

1. **Update react-day-picker** to a newer version that supports React 19 and date-fns 4:
   ```bash
   pnpm update react-day-picker
   ```

2. **Or downgrade date-fns** to version 3:
   ```bash
   pnpm add date-fns@^3.0.0
   ```

The Calendar component is actively used in your DynamicForm for date input fields, so you should keep `react-day-picker` but consider updating it to resolve the peer dependency warnings.