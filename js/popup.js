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
	    for(key in changes){
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
		let tbody = document.querySelector("tbody");

		if (item.url) {
			pageURL = item.url;
			getURL(item.url);
		} else {
			pageURL = "";
			showExport(false);
			document.getElementById("showURL").style.display = "none";
			setURLbasePreview();
		}
	});

	/** FUNCTIONS **/

	// Initial page loading
	function init(){
		showPage("about");
		showExport("false");
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
		document.getElementById("showURL").style.display = "block";

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
		
		chrome.browserAction.setBadgeText({ text: count.toString() });
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
		return previewList.map(e => e.join('=')).filter(function(x) {
		    return typeof x !== 'undefined';
		}).join('&');
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

	// Export the current table as CSV and populate the Output Box
	function exportCSV() {
		var csv = [];
		var rows = document.querySelectorAll("#getURL tr");
		
	    for (var i = 0; i < rows.length; i++) {
			var row = [], cols = rows[i].querySelectorAll("td, th");
			
	        for (var j = 0; j < cols.length; j++) 
	            row.push(cols[j].innerText);
	        
			csv.push(row.join(","));		
		}

	    return csv.join("\n");
	}

	// Export the current table as TSV and populate the Output Box
	function exportTSV() {
		var tsv = [];
		var rows = document.querySelectorAll("#getURL tr");
		
	    for (var i = 0; i < rows.length; i++) {
			var row = [], cols = rows[i].querySelectorAll("td, th");
			
	        for (var j = 0; j < cols.length; j++) 
	            row.push(cols[j].innerText);
	        
			tsv.push(row.join("\t"));		
		}

	    return tsv.join("\n");
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
					document.querySelector("#exportOutput").value = exportCSV();
					break;
				case "exportTSV":
					document.querySelector("#exportOutput").value = exportTSV();
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
			params[index][1] = encodeURIComponent(params[index][1]);
			previewList.push(params[index]);
			e.target.parentNode.style.backgroundColor = "#ffb347";
		} else {
			previewList.splice(preIn, 1);
			e.target.parentNode.style.backgroundColor = "";
		}
		setURLbasePreview();
	});
	
	// Reset but keep the history
	document.querySelector("#resetKeepHistory").addEventListener("click", function () {
		chrome.storage.sync.set({
			url: ''
		});
		chrome.browserAction.setBadgeText({ text: "" });
		window.location.reload();
	});

	// Reset everything, reset the history
	document.querySelector("#resetEverything").addEventListener("click", function () {
		chrome.storage.sync.set({
			url: '', CLread: false, history: ""
		});
		chrome.browserAction.setBadgeText({ text: "" });
		window.location.reload();
	});

	// Runs getURL on the history URL
	document.querySelector("#historyList").addEventListener("click", function (e) {
		if(e.target.dataset.action = "historyGetURL"){
			getURL(e.target.textContent);
		}
	});
}