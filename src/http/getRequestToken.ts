import parseErrorResponse from "../parseErrorResponse";

function getRequestTokenUrl(
	consumerKey: string,
	redirectUri: string,
	state?: string,
) {
	const requestData = {
		consumer_key: consumerKey,
		redirect_uri: redirectUri,
		state,
	};

	return fetch("https://getpocket.com/v3/oauth/request", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"X-Accept": "application/json",
		},
		body: JSON.stringify(requestData),
	});
}

export default async function getRequestToken(
	consumerKey: string,
	redirectUri: string,
	state?: string,
): Promise<string> {
	const response = await getRequestTokenUrl(consumerKey, redirectUri, state);

	if (!response.ok) {
		const error = await parseErrorResponse(response);
		throw new Error(`Request token error: ${error.code} - ${error.message}`);
	}

	const { code } = await response.json<{
		code: string;
	}>();
	return code;
}
