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

const urlParams = new URLSearchParams(window.location.search);
const proid = urlParams.get('profile_id');
const steamid = urlParams.get('steam_id');
let mod, pid;
result =
  proid != null
    ? ((mod = 'profile_id'), (pid = proid))
    : steamid != null
    ? ((mod = 'steam_id'), (pid = steamid))
    : ((mod = 'steam_id'), (pid = '76561198070386645'));

function ranks(...args) {
  const url = 'https://aoe2.net/api/player/matches?game=aoe2de&count=1&' + args.join('=');
  return fetch(url, { mode: 'cors' })
    .then((response) => response.json())
    .then((pdata) => {
      return pdata[0];
    })
    .catch((err) => console.log(err));
}

function renderHTML(data) {
  // console.log(data);
  // for (let i = 0; i < data.length; i++) {
  // console.log(data[i]);
  const ht =
    "<div class='wrap-player'><div class='player' style='background-image:url(" +
    data.flag +
    '), url(./civ_crests/' +
    data.civ +
    ".png); '><span class='name' style='color:" +
    data.color +
    ";'>" +
    data.name.slice(0, 8) +
    "</span><br/><span class='rating'>1v1: " +
    data.ratingOnevOne +
    "</span><br><span class='rating'>TR: " +
    data.rating +
    "</span><br><span class='civ'>" +
    data.civ.slice(0, 8) +
    '</span></div></div></div>';
  const divn = 'team' + data.team;
  document.getElementById(divn).innerHTML += ht;
  // }
}

function rankOneVOne(steam_id) {
  const url = 'https://aoe2.net/api/leaderboard?game=aoe2de&leaderboard_id=3&steam_id=' + steam_id;
  return fetch(url, { mode: 'cors' })
    .then((response) => response.json())
    .then((pOnedata) => {
      return pOnedata;
    })
    .catch((err) => console.log(err));
}

function map() {
  const map_url = 'https://aoe2.net/api/strings?game=aoe2de&language=en';
  return fetch(map_url, { mode: 'cors' })
    .then((response) => response.json())
    .then((mapdata) => {
      return mapdata;
    })
    .catch((err) => console.log(err));
}

function renderData() {
  ranks(mod, pid).then((pdata) => {
    playerRanks(pdata);
  });
}

function playerMap(mapData, currentMap) {
  for (i in mapData.map_type) {
    if (mapData.map_type[i].id == currentMap) {
      mapname = mapData.map_type[i].string;
    }
  }
  if (typeof mapname != 'undefined') {
    document.getElementById('map').innerHTML = mapname;
  } else {
    mapname = 'CustomMap';
    document.getElementById('map').innerHTML = mapname;
  }
}

async function playerData(mapData, arr) {
  const player = {};
  player['name'] = arr.name;
  player['rating'] = arr.rating;
  player['steam_id'] = arr.steam_id;
  player['profile_id'] = arr.profile_id;
  player['team'] = arr.team;

  let ratingOnevOne = await rankOneVOne(arr.steam_id).then((data) => {
    let oneVOnerating = 0;
    if (data.leaderboard[0] != null) {
      oneVOnerating = data.leaderboard[0].rating;
    }
    return oneVOnerating;
  });

  player['ratingOnevOne'] = ratingOnevOne;

  for (k in mapData.civ) {
    if (arr.civ == mapData.civ[k].id) {
      player['civ'] = mapData.civ[k].string;
    }
  }
  for (c in color) {
    if (arr.color == color[c].id) {
      player['color'] = color[c].string;
    }
  }

  if (arr.country == null) {
    player['flag'] =
      'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/International_Flag_of_Planet_Earth.svg/64px-International_Flag_of_Planet_Earth.svg.png';
  } else {
    const bgimgurl = 'https://www.countryflags.io/';
    const bgimgend = '/flat/32.png';
    player['flag'] = bgimgurl + arr.country + bgimgend;
  }
  return player;
}

function createDivs(teams) {
  for (t in teams) {
    const divname = 'team' + teams[t];
    newDiv = document.createElement('div');
    newDiv.setAttribute('id', divname);
    document.getElementById('rank').appendChild(newDiv);

    if (t < teams.length - 1) {
      const vsDiv = document.createElement('div');
      vsDiv.setAttribute('class', 'vs');
      document.getElementById(divname).after(vsDiv);
      vsDiv.innerText = 'VS';
    }
  }
}

async function playerRanks(pData) {
  const players = await pData.players;
  const currentMap = pData.map_type;
  map().then((mapdata) => {
    playerMap(mapdata, currentMap);
    const maxp = pData.num_players;
    let t = 0;
    let teams = [];
    while (t < maxp) {
      teams.push(players[t].team);
      t++;
    }
    teams = [...new Set(teams)];
    createDivs(teams);
    let playerJSON = [];
    for (p in players) {
      // const { name, rating, team, civ, color, flag, oneVoneRating }
      playerData(mapdata, players[p]).then((data) => {
        // console.log(data);
        renderHTML(data);
        // playerJSON.push(data);
      });
    }
  });
}

renderData();
