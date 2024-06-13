import parseErrorResponse from "../parseErrorResponse";

export interface PocketAccessToken {
	access_token: string;
	username: string;
	state: string;
}

export async function getAccessToken(consumerKey: string, code: string) {
	const requestData = {
		consumer_key: consumerKey,
		code,
	};

	const response = await fetch("https://getpocket.com/v3/oauth/authorize", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"X-Accept": "application/json",
		},
		body: JSON.stringify(requestData),
	});

	if (!response.ok) {
		const error = await parseErrorResponse(response);
		throw new Error(`Access token error: ${error.code} - ${error.message}`);
	}

	return response.json<PocketAccessToken>();
}
