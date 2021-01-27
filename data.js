const color = [
  {
    id: 1,
    string: '#405BFE',
  },
  {
    id: 2,
    string: '#FF0000',
  },
  {
    id: 3,
    string: '#00FF00',
  },
  {
    id: 4,
    string: '#FFFF00',
  },
  {
    id: 5,
    string: '#00FFFF',
  },
  {
    id: 6,
    string: '#FF57B3',
  },
  {
    id: 7,
    string: '#797979',
  },
  {
    id: 8,
    string: '#FF9600',
  },
];

async function ranks(...args) {
  const url =
    'https://aoe2.net/api/player/matches?game=aoe2de&count=1&' + args.join('=');
  const response = await fetch(url, {
    mode: 'cors',
  });
  const data = await response.json();
  renderHTML(data);
}

function renderHTML(data) {
  const mapid = data[0].map_type;
  const mapreq = new XMLHttpRequest();
  const map_url = 'https://aoe2.net/api/strings?game=aoe2de&language=en';
  mapreq.open('GET', map_url, true);
  mapreq.onload = function () {
    const mapdata = JSON.parse(mapreq.responseText);
    for (i in mapdata.map_type) {
      if (mapdata.map_type[i].id == mapid) {
        mapname = mapdata.map_type[i].string;
      }
    }
    document.getElementById('map').innerHTML = mapname;
    const maxp = data[0].num_players;
    let teams = [];

    t = 0;
    while (t < maxp) {
      teams.push(data[0].players[t].team);
      t++;
    }
    teams = [...new Set(teams)];

    const bgimgurl = 'https://www.countryflags.io/';
    const bgimgend = '/flat/32.png';

    let players = [];

    for (i = 0; i < maxp; i++) {
      for (k in mapdata.civ) {
        if (data[0].players[i].civ == mapdata.civ[k].id) {
          pciv = mapdata.civ[k].string;
        }
      }
      for (c in color) {
        if (data[0].players[i].color == color[c].id) {
          pcolor = color[c].string;
        }
      }
      const pname = data[0].players[i].name.slice(0, 8);
      const prating = data[0].players[i].rating;
      if (data[0].players[i].country == null) {
        flag =
          'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/International_Flag_of_Planet_Earth.svg/64px-International_Flag_of_Planet_Earth.svg.png';
      } else {
        flag = bgimgurl + data[0].players[i].country + bgimgend;
      }
      const pteam = data[0].players[i].team;
      const pid = data[0].players[i].profile_id;
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
      const name = 'team' + teams[t];
      newDiv = document.createElement('div');
      newDiv.setAttribute('id', name);
      document.getElementById('rank').appendChild(newDiv);

      if (t < teams.length - 1) {
        const vsDiv = document.createElement('div');
        vsDiv.setAttribute('class', 'vs');
        document.getElementById(name).after(vsDiv);
        vsDiv.innerText = 'VS';
      }
    }

    for (i = 0; i < players.length; i++) {
      const { country, civ, color, name, rating } = players[i];
      const ht =
        "<div class='wrap-player'><div class='player' style='background-image:url(" +
        country +
        '), url(./civ_crests/' +
        civ +
        ".png); '><span class='name' style='color:" +
        color +
        ";'>" +
        name +
        "</span><br/><span class='rating'>R: " +
        rating +
        "</span><br><span class='civ'>" +
        civ.slice(0, 9) +
        '</span></div></div></div>';
      const divn = 'team' + players[i].team;
      document.getElementById(divn).innerHTML += ht;
    }
  };
  mapreq.send();
}
