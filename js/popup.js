window.onload = function () {
	document.querySelector(".container").style.display = "block";
	document.querySelector("footer").style.display = "block";
	document.querySelector("#changelog").style.display = "none";

	chrome.storage.sync.get('CLread', function(item){
		if(!item.CLread){
			document.querySelector(".container").style.display = "none";
			document.querySelector("footer").style.display = "none";
			document.querySelector("#changelog").style.display = "block";
		}
	});

	document.getElementById("close").addEventListener("click", function(){
		chrome.storage.sync.set({CLread: true});
		document.querySelector(".container").style.display = "block";
		document.querySelector("footer").style.display = "block";
		document.querySelector("#changelog").style.display = "none";
	});

	var params = [];
	var pageURL;

	chrome.storage.sync.get('url', function (item) {
		let tbody = document.querySelector("tbody");
		let count = 0;
		
		if (item.url) {
			pageURL = item.url.substring(0,item.url.indexOf("?"));
			document.getElementById("URLbase").textContent = pageURL;
			document.getElementById("URLbase").href = pageURL;
			document.getElementById("showURL").style.display = "block";

			let searchParams = new URLSearchParams(new URL(item.url).search);
					
			params = Array.from(searchParams);
			count = params.length;

			for(let param of searchParams){
				var tr 	= document.createElement("tr");
				var key = document.createElement("td");
				var val = document.createElement("td");

				tr.className += "param";

				key.textContent = param[0];
				val.textContent = param[1];
				
				tr.append(key);
				tr.append(val);
				
				tbody.append(tr);				
			}
			
			chrome.browserAction.setBadgeText({ text: count.toString() });
			setURLbasePreview();

		} else {
			pageURL = "";
			document.getElementById("showURL").style.display = "none";
			setURLbasePreview();
		}
		
		if(count === 0){
			pageURL = item.url;
			setURLbasePreview();
			var tr = document.createElement("tr");
			var td = document.createElement("td");
			td.colSpan = 2;
			td.textContent = "No query parameters to display";
			tr.append(td);
			tbody.append(tr);
		}	

	});

	var previewList = [];

	document.querySelector("tbody").addEventListener("click", function(e){
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
	
	document.getElementById("clear").addEventListener("click", function () {
		chrome.storage.sync.set({
			url: ''
		});
		chrome.browserAction.setBadgeText({ text: "" });
		window.location.reload();
	});

	document.getElementById("refresh").addEventListener("click", function () {
		window.location.reload();
	});

	function setURLbasePreview(){
		var urlParams = getSelectedURLParams();
		document.getElementById("URLbase").textContent = pageURL + (urlParams ? "?" + urlParams : "");
		document.getElementById("URLbase").href = pageURL + (urlParams ? "?" + urlParams : "");
	}

	function getSelectedURLParams(){
		return previewList.map(e => e.join('=')).filter(function(x) {
		    return typeof x !== 'undefined';
		}).join('&');
	}
}