import { Hono } from "hono";
import { nanoid } from "nanoid";
import config from "../config";
import { clear } from "./clear";
import { type PocketAccessToken, getAccessToken } from "./getAccessToken";
import getRequestToken from "./getRequestToken";

const app = new Hono<{ Bindings: Environment }>();

app.get("/", async ({ req, env }) => {
	const url = new URL(req.url);
	url.pathname = "/redirect";
	const urlState = nanoid();
	const authState = nanoid();
	let requestToken: string;
	try {
		requestToken = await getRequestToken(
			env.POCKET_PLATFORM_CONSUMER_KEY,
			url.toString(),
			authState,
		);
	} catch (e) {
		return new Response((e as Error).message, { status: 500 });
	}
	await env.KV.put(
		`${config.kvPrefix}auth/${urlState}`,
		JSON.stringify({
			requestToken,
			authState,
		}),
	);
	url.searchParams.set("state", urlState);
	return Response.redirect(
		`https://getpocket.com/auth/authorize?request_token=${requestToken}&redirect_uri=${encodeURIComponent(url.toString())}`,
		302,
	);
});

app.get("/clear", async ({ env, executionCtx }) => {
	executionCtx.waitUntil(env.KV.delete("saved"));
	return clear(
		env.POCKET_USER_AUTHORIZATION_TOKEN,
		env.POCKET_PLATFORM_CONSUMER_KEY,
	);
});

app.get("/redirect", async ({ req, env, executionCtx }) => {
	const url = new URL(req.url);
	const urlState = url.searchParams.get("state");
	if (!urlState) {
		return new Response("Missing state", { status: 400 });
	}
	const state = await env.KV.get<{
		requestToken: string;
		authState: string;
	}>(`${config.kvPrefix}auth/${urlState}`, "json");
	if (!state) {
		return new Response("Invalid state", { status: 400 });
	}
	executionCtx.waitUntil(env.KV.delete(`auth/${urlState}`));
	let accessToken: PocketAccessToken;
	try {
		accessToken = await getAccessToken(
			env.POCKET_PLATFORM_CONSUMER_KEY,
			state.requestToken,
		);
	} catch (e) {
		return new Response((e as Error).message, { status: 500 });
	}
	if (accessToken.state !== state.authState) {
		return new Response("Invalid state", { status: 400 });
	}
	return new Response(`Access Token:\n${accessToken.access_token}`);
});

export default app;
