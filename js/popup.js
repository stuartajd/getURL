window.onload = function () {
	/** VARS **/

	var urlHistory = [];
	var params = [];
	var pageURL;
	var previewList = [];

	/** INITIAL LOAD **/

	init();

	/** CHROME STORAGE **/

	chrome.storage.onChanged.addListener(function(changes, namespace) {
	    for(let key in changes){
	    	if(key === "url"){
	    		window.location.reload();
	    	}
	    }
	});

	chrome.storage.sync.get('history', function(item){
		if(item.history){
			urlHistory = JSON.parse(item.history);
		}
	});

	chrome.storage.sync.get('CLread', function(item){
		if(!item.CLread){
			showPage("changelog");
			chrome.storage.sync.set({CLread: true});
		}
	});

	chrome.storage.sync.get('url', function (item) {
		if (item.url) {
			pageURL = item.url;
			getURL(item.url);
		} else {
			pageURL = "";
			showExport(false);
			document.querySelectorAll(".showURL").forEach(el => el.style.display = "none");
			setURLbasePreview();
		}
	});

	/** FUNCTIONS **/

	// Initial page loading
	function init(){
		showPage("about");
		showExport(false);
	}

	// Show the export buttons
	function showExport(shown){
		document.getElementById("exportError").style.display = ((shown) ? "none" : "block");
		document.getElementById("exportTool").style.display = ((!shown) ? "none" : "block");
	}

	// getURL, export the current URL parameters and place them in the table
	function getURL(url){
		if(pageURL !== url){
			chrome.storage.sync.set({url: url});
		}
		
		previewList = [];
		let tbody = document.querySelector("#getURLtable");
		let count = 0;

		tbody.innerHTML = "";

		document.getElementById("fullURL").textContent = pageURL;
		document.getElementById("fullURL").href = pageURL;

		pageURL = url.substring(0,url.indexOf("?"));
		document.getElementById("URLbase").textContent = pageURL;
		document.getElementById("URLbase").href = pageURL;
		document.querySelectorAll(".showURL").forEach(el => el.style.display = "block");

		let searchParams = new URLSearchParams(new URL(url).search);
		params = Array.from(searchParams);
		count = params.length;

		if(count === 0){
			showExport(false);
			pageURL = url;
			setURLbasePreview();
			var tr = document.createElement("tr");
			var td = document.createElement("td");
			td.colSpan = 2;
			td.textContent = "No query parameters to display";
			tr.id = "notClickable";
			tr.append(td);
			tbody.append(tr);
		} else {
			for(let param of searchParams){

				var tr 	= document.createElement("tr");
				var key = document.createElement("td");
				var val = document.createElement("td");

				tr.className += "param";

				key.textContent = param[0];
				val.textContent = encodeURIComponent(param[1]);
				
				tr.append(key);
				tr.append(val);
				
				tbody.append(tr);				
			}
		}
		
		chrome.action.setBadgeText({ text: count.toString() });
		setURLbasePreview();
		showPage("getURL");
		showExport(true);
	}

	// Set the URL preview in the fieldset above the table
	function setURLbasePreview(){
		var urlParams = getSelectedURLParams();
		var preview = (urlParams ? "?" + urlParams : "");
		document.getElementById("URLbase").textContent = pageURL + preview;
		document.getElementById("URLbase").href = pageURL + preview;
	}

	// Get the URL parameters from the selected URL
	function getSelectedURLParams(){
		return previewList.map(p => p[0] + '=' + encodeURIComponent(p[1])).join('&');
	}

	// Set the requested page as shown, hide all the other pages
	function showPage(page){
		var pages = document.querySelectorAll("section");
		for(var pg of pages){
			if(pg.dataset.page === page){
				pg.style.display = "block";
			} else {
				pg.style.display = "none";
			}
		}
	}

	// Load up the history of URLs
	function loadHistory(){
		var ul = document.getElementById("historyList");
		ul.innerHTML = "";
		if(urlHistory.length == 0) return;
		for(var link of urlHistory){	
			var li = document.createElement("li");
			li.dataset.action="historyGetURL";
			li.textContent = link;
			ul.append(li);
		}
	}

	// Export the current table as delimited text for the Output Box
	function exportTable(separator) {
		return Array.from(document.querySelectorAll("#getURL tr")).map(function (row) {
			return Array.from(row.querySelectorAll("td, th")).map(function (cell) {
				var text = cell.innerText;
				// Quote anything that would otherwise break the columns
				if (text.includes(separator) || text.includes('"') || text.includes("\n")) {
					return '"' + text.replace(/"/g, '""') + '"';
				}
				return text;
			}).join(separator);
		}).join("\n");
	}
	
	/** EVENT LISTENERS **/

	// Main Action  /  GOTO Page Listeners
	document.addEventListener("click", function(e){
		if(e.target.dataset.goto){
			showPage(e.target.dataset.goto);
		}	

		if(e.target.dataset.action){
			switch(e.target.dataset.action){
				case "loadHistory":
					loadHistory();
					break;
				case "exportCSV":
					document.querySelector("#exportOutput").value = exportTable(",");
					break;
				case "exportTSV":
					document.querySelector("#exportOutput").value = exportTable("\t");
					break;
				case "resetKeepHistory":
					chrome.storage.sync.set({ url: '' });
					chrome.action.setBadgeText({ text: "" });
					window.location.reload();
					break;
				case "resetEverything":
					chrome.storage.sync.set({ url: '', CLread: false, history: "" });
					chrome.action.setBadgeText({ text: "" });
					window.location.reload();
					break;
			}
		}
	});

	// Clicking on the getURL table will highlight the specific row
	document.querySelector("tbody#getURLtable").addEventListener("click", function(e){
		if(e.target.parentNode.id === "notClickable" || e.target.id === "notClickable") return;
		var index = (e.target.parentNode.rowIndex - 1);
		var preIn = previewList.indexOf(params[index])
		if(preIn === -1){
			previewList.push(params[index]);
			e.target.parentNode.style.backgroundColor = "#ffb347";
		} else {
			previewList.splice(preIn, 1);
			e.target.parentNode.style.backgroundColor = "";
		}
		setURLbasePreview();
	});
	
	// Runs getURL on the history URL
	document.querySelector("#historyList").addEventListener("click", function (e) {
		if(e.target.dataset.action === "historyGetURL"){
			getURL(e.target.textContent);
		}
	});
}