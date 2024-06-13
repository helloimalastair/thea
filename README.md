# Thea
*Save RSS Feeds to your Pocket account ✨automagically✨*

## Setup
1. Register a Pocket app [here](http://getpocket.com/developer/apps/new). Copy the `.dev.vars.example` file to `.dev.vars`, and paste your consumer key into the `POCKET_PLATFORM_CONSUMER_KEY` variable.
2. Uncomment the lines marked `UNCOMMENT THIS LINE` in the [`src/index.ts`](src/index.ts) file.
3. Run `pnpm install`(replace with package manager of choice), then run `pnpm dev`.
4. Visit the URL the dev process provides(should look like `http://localhost:8787/`, port may vary). Follow the Auth Flow Presented. When presented with the Access Token, copy it.
6. Re-add the comments to the lines you uncommented in step 2.
7. Create a new KV Namespace([how-to](https://developers.cloudflare.com/workers/wrangler/commands/#create-3)), or use an existing one. Paste the Namespace ID into the [`wrangler.json`](wrangler.json).
7. Configure the feeds you wish to follow in [`config.ts`](src/config.ts). You can also configure a prefix that Thea will use when writing to KV, to ensure it doesn't collide with other Workers/Pages Functions that use the same namespace.
7. Create two Worker Secrets with `wrangler`([how-to](https://developers.cloudflare.com/workers/wrangler/commands/#put-3)), being
	* `POCKET_PLATFORM_CONSUMER_KEY` - Your Pocket Consumer Key
	* `POCKET_USER_AUTHORIZATION_TOKEN` - The Access Token you copied in step 4.
8. Run `pnpm run deploy` to deploy the worker to Cloudflare. Updates can take a little while to start, but once they do, they should stay in-sync with the RSS Feed.

By default, Thea is set to update every 5 minutes. This can be adjusted in the `triggers.cron` section of the [`wrangler.json`](wrangler.json) file.

Authentication code inspired by [Pocket-SDK-TypeScript](https://github.com/mtreilly/pocket-sdk-typescript/) by [Michaél Reilly](https://github.com/mtreilly)