// Service workers are torn down between events, so history always comes from storage.
function getHistory(callback) {
	chrome.storage.sync.get('history', function (item) {
		callback(item.history ? JSON.parse(item.history) : []);
	});
}

chrome.runtime.onStartup.addListener(function () {
	chrome.storage.sync.set({ url: "", CLread: true });
});

chrome.contextMenus.onClicked.addListener(function (n, e) {
	getHistory(function (urlHistory) {
		urlHistory.unshift(n.linkUrl);

		if (urlHistory.length > 10) {
			urlHistory.pop();
		}

		chrome.storage.sync.set({ url: n.linkUrl, history: JSON.stringify(urlHistory) });

		let count = Array.from(new URLSearchParams(new URL(n.linkUrl).search)).length;
		chrome.action.setBadgeText({ text: count.toString() });
	});
});

chrome.runtime.onInstalled.addListener(function (details) {
	chrome.contextMenus.create({
		title: "getURL",
		contexts: ["link"],
		id: "contextlink"
	});

	chrome.action.setBadgeText({ text: "" });
	chrome.storage.sync.set({ CLread: false });
});
