chrome.contextMenus.onClicked.addListener(function (info, tab) {
	console.log(info.linkUrl);
	
	chrome.storage.sync.set({ 'url': info.linkUrl });
});

document.addEventListener('DOMContentLoaded', onInit, false);

function onInit(){
	chrome.storage.sync.set({ 'url': '' });
}

chrome.runtime.onInstalled.addListener(function () {
	chrome.contextMenus.create({
		"title": "getURL Parameters",
		"contexts": ["link"],
		"id": "context" + "link"
	});
});
