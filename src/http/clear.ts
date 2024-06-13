import parseErrorResponse from "../parseErrorResponse";

export async function clear(token: string, key: string) {
	let res = await fetch("https://getpocket.com/v3/get", {
		method: "POST",
		headers: {
			"Content-Type": "application/json; charset=UTF-8",
		},
		body: JSON.stringify({
			consumer_key: key,
			access_token: token,
			state: "all",
		}),
	});
	if (!res.ok) {
		console.log(token, key);
		return Response.json(parseErrorResponse(res), {
			status: res.status,
		});
	}
	const data = await res.json<{
		list: Record<string, unknown>;
	}>();
	const actions = Object.keys(data.list).map((e) => ({
		action: "delete",
		item_id: e,
	}));
	if (actions.length) {
		res = await fetch("https://getpocket.com/v3/send", {
			method: "POST",
			headers: {
				"Content-Type": "application/json; charset=UTF-8",
			},
			body: JSON.stringify({
				consumer_key: key,
				access_token: token,
				actions,
			}),
		});
		if (!res.ok) {
			return Response.json(parseErrorResponse(res), {
				status: res.status,
			});
		}
	}
	return new Response("Done!");
}
