type PocketRSSConfigItems = {
	feedPrefix: string;
	feedUrl: string;
	guidCleanup?: (guid: string) => string;
}[];

interface Config {
	feeds: PocketRSSConfigItems;
	kvPrefix?: string;
}

const config: Config = {
	feeds: [
		{
			feedPrefix: "dr-inln:",
			feedUrl: "https://www.dr.dk/nyheder/service/feeds/indland",
			guidCleanup: (guid: string) => guid.slice(22),
		},
	],
	kvPrefix: "thea:",
};

export default config;
