import { XMLParser } from "fast-xml-parser";
import config from "./config";

const parser = new XMLParser();

async function getSingleFeed(url: string) {
	return parser.parse(await (await fetch(url)).text()).rss.channel.item as {
		link: string;
		guid?: string;
	}[];
}
export default async function getFeeds() {
	const iterator = config.feeds.map(async (e) => ({
		prefix: e.feedPrefix,
		items: await getSingleFeed(e.feedUrl),
		guidCleanup: e.guidCleanup,
	}));
	const mergedFeed = {
		byGuid: {} as Record<string, string>,
		byLink: {} as Record<string, string>,
	};
	for await (const feed of iterator) {
		for (const item of feed.items) {
			let guid = item.guid ?? item.link;
			if (feed.guidCleanup) {
				guid = feed.guidCleanup(guid);
			}
			guid = feed.prefix + guid;
			mergedFeed.byGuid[guid] = item.link;
			mergedFeed.byLink[item.link] = guid;
		}
	}
	return mergedFeed;
}
