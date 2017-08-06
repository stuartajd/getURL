window.onload = function () {
	chrome.storage.sync.get('url', function (item) {
		let empty = false;
		let tbody = document.querySelector("tbody");
		
		if (item.url) {
			let url = new URL(item.url);
			let searchParams = new URLSearchParams(url.search);
			
			tbody.innerHTML = "";
			
			let count = 0;
			
			for (let p of searchParams) {
				count++;
				var tr = document.createElement("tr");
				tr.innerHTML = "<td>" + p[0] + "</td><td>" + p[1] + "</td>";
				tbody.append(tr);
			}
			
			if(count === 0){
				empty=true;
			}
						
		} else {
			empty = true;
		}
		
		if(empty === true){
			var tr = document.createElement("tr");
			tr.innerHTML = "<td colspan=2>No Query Params To Display</td>";
			tbody.append(tr);
		}
	});

	document.getElementById("clear").addEventListener("click", function () {
		chrome.storage.sync.set({
			url: ''
		});

		window.location.reload();
	});

	document.getElementById("refresh").addEventListener("click", function () {
		window.location.reload();
	});


}