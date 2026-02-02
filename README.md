# `next` recipe

The `next` recipe showcases one of the most powerful ways to implement Puck using to provide an authoring tool for any route in your Next app.

## Demonstrates

- Next.js App Router implementation
- JSON database implementation with HTTP API
- Catch-all routes to use puck for any route on the platform
- Incremental static regeneration (ISR) for all Puck pages

## Usage

Run the generator and enter `next` when prompted

```
npx create-puck-app my-app
```

Start the server

```
yarn dev
```

Navigate to the homepage at https://localhost:3000. To edit the homepage, access the Puck editor at https://localhost:3000/edit.

The editor in this repo is a single `/edit` entry point that switches between page types (location or city directory) using a query param.

## Using this recipe

To adopt this recipe you will need to:

- **IMPORTANT** Add authentication to `/edit` routes. **If you don't do this, Puck will be completely public.**
- Integrate your database into the API calls used by `/app/api/pages/publish/route.ts` and `/app/api/page-groups/*/publish/route.ts`
- Implement a custom puck configuration in `puck.config.tsx`

By default, this recipe will generate static pages by setting `dynamic` to [`force-static`](https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config#dynamic) in the `/app/[...puckPath]/page.tsx`. This will strip headers and cookies. If you need dynamic pages, you can delete this.
