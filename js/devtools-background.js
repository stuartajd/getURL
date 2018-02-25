// Share a reference to our custom sidebar control
let sidebar = null;

// Create a custom sidebar control
chrome.devtools.panels.elements.createSidebarPane("Query Params", sidebarInstance => {
	sidebar = sidebarInstance;
	sidebar.setObject({});
});

// Listen to element selection change and get element HREF on change
chrome.devtools.panels.elements.onSelectionChanged.addListener(_ => {
	chrome.devtools.inspectedWindow.eval("$0.getAttribute('href')", (result, isException) => {
  		setSidebarParams(result);
    });
});

// Extract parameters from the given URL and show them in the sidebar
function setSidebarParams(url) {
	let params = getParamsFromUrl(url);
	sidebar.setObject(params);
}

// Get query parameters from a URL as an Object
function getParamsFromUrl(url) {
	let params = {};
	if (!url) return params;

	let searchParams = new URLSearchParams(new URL(url).search);
	for (let pair of searchParams.entries()) {
		let key = pair[0];
		let value = pair[1];

		// Set value if a single value for key
		if (typeof params[key] === 'undefined') {
			params[key] = value;
			continue;
		}

		// Stack values in an array if mulitple for a single key
		if (!Array.isArray(params[key])) {
			params[key] = [params[key]];
		}
		params[key].push(value);
	}
	return params;
}