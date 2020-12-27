function ranks(...args) {
  var req = new XMLHttpRequest();
  var url =
    "https://aoe2.net/api/player/matches?game=aoe2de&count=1&" + args.join("=");
  req.open("GET", url, true);
  req.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      var data = JSON.parse(req.responseText);
      renderHTML(data);
    }
  };
  req.send();
}

function renderHTML(data) {
  var mapid = data[0].map_type;
  var mapreq = new XMLHttpRequest();
  var map_url =
    "https://raw.githubusercontent.com/GereksizPosta/NightBotCommands/master/datafiles/aoe2.json";
  mapreq.open("GET", map_url, true);
  mapreq.onload = function () {
    var mapdata = JSON.parse(mapreq.responseText);
    for (i in mapdata.map_type) {
      if (mapdata.map_type[i].id == mapid) {
        mapname = mapdata.map_type[i].string;
      }
    }
    document.getElementById("map").innerHTML = mapname;
    var maxp = data[0].num_players;
    var teams = [];

    t = 0;
    while (t < maxp) {
      teams.push(data[0].players[t].team);
      t++;
    }
    teams = [...new Set(teams)];

    var bgimgurl = "https://www.countryflags.io/";
    var bgimgend = "/flat/32.png";

    var players = [];

    for (i = 0; i < maxp; i++) {
      for (k in mapdata.civ) {
        if (mapdata.civ[k].id == data[0].players[i].civ) {
          pciv = mapdata.civ[k].string;
        }
      }
      for (c in mapdata.color) {
        if (mapdata.color[c].id == data[0].players[i].color) {
          pcolor = mapdata.color[c].string;
        }
      }
      var pname = data[0].players[i].name.slice(0, 8);
      var prating = data[0].players[i].rating;
      if (data[0].players[i].country == null) {
        var flag =
          "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/International_Flag_of_Planet_Earth.svg/64px-International_Flag_of_Planet_Earth.svg.png";
      } else {
        var flag = bgimgurl + data[0].players[i].country + bgimgend;
      }
      var pteam = data[0].players[i].team;
      var pid = data[0].players[i].profile_id;
      players[i] = {
        name: pname,
        p_id: pid,
        color: pcolor,
        civ: pciv,
        rating: prating,
        country: flag,
        team: pteam,
        maxp: maxp,
      };
    }

    players = players.sort(function (a, b) {
      return a.team - b.team;
    });

    for (t = 0; t < teams.length; t++) {
      var name = "team" + teams[t];
      newDiv = document.createElement("div");
      newDiv.setAttribute("id", name);
      document.getElementById("rank").appendChild(newDiv);

      if (t < teams.length - 1) {
        var vsDiv = document.createElement("div");
        vsDiv.setAttribute("class", "vs");
        document.getElementById(name).after(vsDiv);
        vsDiv.innerText = "VS";
      }
    }

    for (i = 0; i < players.length; i++) {
      const { country, civ, color, name, rating } = players[i];
      var ht =
        "<div class='wrap-player'><div class='player' style='background-image:url(" +
        country +
        "), url(./civ_crests/" +
        civ +
        ".png); '><span class='name' style='color:" +
        color +
        ";'>" +
        name +
        "</span><br/><span class='rating'>R: " +
        rating +
        "</span><br><span class='civ'>" +
        civ.slice(0, 9) +
        "</span></div></div></div>";
      var divn = "team" + players[i].team;
      document.getElementById(divn).innerHTML += ht;
    }
  };
  mapreq.send();
}
