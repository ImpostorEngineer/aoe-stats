var rankdata = document.getElementById("rank");
var ranks;
function ranks() {
	var req = new XMLHttpRequest();
	var url = 'https://aoe2.net/api/player/matches?game=aoe2de&steam_id=76561198070386645&count=1';
	req.open('GET', url, true);
	req.onload = function() {
 		var data = JSON.parse(req.responseText);
 		renderHTML(data);
	};
req.send();
};

function renderHTML(data) {
	var mapid = data[0].map_type;
	var mapreq = new XMLHttpRequest();
	mapreq.open('GET', 'aoe2.json');
	mapreq.onload = function () {
		var mapdata = JSON.parse(mapreq.responseText);
		for (i in mapdata.map_type) {
			if (mapdata.map_type[i].id == mapid) {
				mapname = mapdata.map_type[i].string;
			}
		}
		document.getElementById('map').innerHTML = mapname;
		var maxp = data[0].num_players;
		var htmlstringa = "";
		var htmlstringb = "";		
		for (i = 0; i < maxp; i += 2) {
			for (k in mapdata.civ) { 
				if (mapdata.civ[k].id == data[0].players[i].civ) {
					playerciv = mapdata.civ[k].string.slice(0,9);
				}
			}
		htmlstringa += "<div class='player'><span class='name'>" + data[0].players[i].name.slice(0,8) + "</span><br/><span class='rating'>R: " + data[0].players[i].rating + "</span><br><span class='civ'>" + playerciv + "<br></div>";
		}
		for (i = 1; i < maxp; i += 2) {
			for (k in mapdata.civ) { 
				if (mapdata.civ[k].id == data[0].players[i].civ) {
					playerciv = mapdata.civ[k].string.slice(0,9);
				}
			}
		htmlstringb += "<div class='player'><span class='name'>" + data[0].players[i].name.slice(0,8) + "</span><br/><span class='rating'>R: " + data[0].players[i].rating + "</span><br><span class='civ'>" + playerciv + "<br></div>";
		}

		rankdata.innerHTML = htmlstringa + "<div style='float:left; width:70px; height:120px; text-align:center;margin-top:25pt; color:#f00;'> VS </div>" + htmlstringb;
	};
	mapreq.send();
}
