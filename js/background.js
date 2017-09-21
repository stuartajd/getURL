function onInit() {
	chrome.storage.sync.set({url: "", CLread: true});
}

chrome.contextMenus.onClicked.addListener(function (n, e) {
	chrome.storage.sync.set({
		url: n.linkUrl
	});

	count = Array.from(new URLSearchParams(new URL(n.linkUrl).search)).length;
	chrome.browserAction.setBadgeText({ text: count.toString() });	
});

document.addEventListener("DOMContentLoaded", onInit, !1), chrome.runtime.onInstalled.addListener(function () {
	chrome.contextMenus.create({
		title: "getURL",
		contexts: ["link"],
		id: "contextlink"
	});
	
	chrome.browserAction.setBadgeText({ text: "" });

});

chrome.runtime.onInstalled.addListener(function(details){
    if(details.reason == "install"){
        chrome.storage.sync.set({CLread: false});
    }else if(details.reason == "update"){
        chrome.storage.sync.set({CLread: false});
    }
});