// import app from "./http"; // UNCOMMENT THIS LINE
import config from "./config";
import getFeeds from "./getFeed";
import parseErrorResponse from "./parseErrorResponse";

export default {
	// fetch: app.fetch, // UNCOMMENT THIS LINE
	async scheduled(_: ScheduledEvent, env: Environment) {
		const saved =
			(await env.KV.get<Record<string, number>>(
				`${config.kvPrefix}saved`,
				"json",
			)) ?? {};
		const feed = await getFeeds();
		const toAdd = Object.keys(feed.byGuid).filter((e) => !saved[e]);
		const toRemove = Object.keys(saved).filter((e) => !feed.byGuid[e]);
		if (toAdd.length === 0 && toRemove.length === 0) {
			console.log("No changes");
			return;
		}
		if (toAdd.length) {
			console.log(`Adding ${toAdd.length}`);
		}
		if (toRemove.length) {
			console.log(`Removing ${toRemove.length}`);
		}
		console.log("To Add", toAdd, "To Remove", toRemove);
		const res = await fetch("https://getpocket.com/v3/send", {
			method: "POST",
			headers: {
				"Content-Type": "application/json; charset=UTF-8",
			},
			body: JSON.stringify({
				consumer_key: env.POCKET_PLATFORM_CONSUMER_KEY,
				access_token: env.POCKET_USER_AUTHORIZATION_TOKEN,
				actions: [
					...toAdd.map((e) => ({
						action: "add",
						url: feed.byGuid[e],
					})),
					...toRemove.map((e) => ({
						action: "delete",
						item_id: saved[e],
					})),
				],
			}),
		});
		if (!res.ok) {
			throw parseErrorResponse(res);
		}
		const data = await res.json<{
			action_results: {
				item_id: string;
				given_url: string;
			}[];
		}>();
		for (const add of toAdd) {
			saved[add] = Number(
				data.action_results.find((e) => e.given_url === feed.byGuid[add])
					?.item_id,
			);
		}
		for (const remove of toRemove) {
			delete saved[remove];
		}
		console.log(saved);
		await env.KV.put(`${config.kvPrefix}saved`, JSON.stringify(saved));
	},
};
