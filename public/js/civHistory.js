// const form = document.querySelector('form');
// const p1IDinput = document.getElementById('p1id');
// form.addEventListener('submit', formSubmitted);
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const p1id = urlParams.get('p1id');
const civID = urlParams.get('civid');
let games = urlParams.get('games');

async function getPlayerHistory(p1id) {
  if (!games) {
    games = 1000;
  }
  const dataURL = './api/' + p1id + '/' + games;
  const playerData = await fetch(dataURL, { mode: 'same-origin' }).then((response) => response.json());
  return playerData;
}

function getMapName(data, mapId) {
  let mapName = '';
  for (let c = 0; c < data.map_type.length; c++) {
    if (data.map_type[c]['id'] == mapId) {
      mapName = data.map_type[c]['string'];
    }
  }
  return mapName;
}

function getCivName(data, civID) {
  let civName = '';
  for (let c = 0; c < data.civ.length; c++) {
    if (data.civ[c]['id'] == civID) {
      civName = data.civ[c]['string'];
    }
  }
  return civName;
}

async function renderHTML(data, p1id) {
  const map_url = 'https://aoe2.net/api/strings?game=aoe2de&language=en';
  const mapData = await fetch(map_url, { mode: 'cors' }).then((response) => response.json());
  const shortData = data;
  const civList = document.getElementById('civList');
  civList.innerHTML = '';
  const playerURL = 'https://aoe2.net/#profile-';

  for (let g = 0; g < shortData.length; g++) {
    let p1rating = 0;
    let p1txtColor = '';
    let p1civ = '';
    let p1civName = '';
    let p1Won = '';
    let p2id = 0;
    let p2rating = 0;
    let p2link = '';
    let p2txtColor = '';
    let p2civ = '';
    let p2civName = '';
    let p2Won = '';
    let mapID = '';
    let mapName = '';
    let matchID = '';
    const matchURL = 'https://www.aoe2insights.com/match/';

    for (let p = 0; p < shortData[g].players.length; p++) {
      mapID = shortData[g].map_type;
      matchID = shortData[g].match_id;
      if (shortData[g].players[p]['profile_id'] == p1id) {
        p1rating = shortData[g].players[p].rating;
        p1civ = shortData[g].players[p].civ;
        if (shortData[g].players[p].won == false) {
          p1txtColor = 'lostTextColor';
          p1Won = '&#10060;';
        }
        if (shortData[g].players[p].won == true) {
          p1txtColor = 'wonTextColor';
          p1Won = '&#10004;';
        }
      }
      if (shortData[g].players[p]['profile_id'] != p1id) {
        p2rating = shortData[g].players[p].rating;
        p2id = shortData[g].players[p].profile_id;
        p2link = playerURL + p2id;
        p2civ = shortData[g].players[p].civ;
        if (shortData[g].players[p].won == false) {
          p2txtColor = 'lostTextColor';
          p2Won = '&#10060;';
        }
        if (shortData[g].players[p].won == true) {
          p2txtColor = 'wonTextColor';
          p2Won = '&#10004;';
        }
      }
    }
    for (let c = 0; c < mapData.civ.length; c++) {
      if (mapData.civ[c].id == p1civ) {
        p1civName = mapData.civ[c].string;
      }
      if (mapData.civ[c].id == p2civ) {
        p2civName = mapData.civ[c].string;
      }
    }
    for (let m = 0; m < mapData.map_type.length; m++) {
      if (mapData.map_type[m].id == mapID) {
        mapName = mapData.map_type[m].string;
      }
    }

    civList.innerHTML +=
      '<div class="row m-auto"><div class="civname text-start ' +
      p1txtColor +
      '"><img src="../civ_crests/' +
      p1civName +
      '.png" height="50px">&nbsp;<a class="text-decoration-none ' +
      p1txtColor +
      '" href="https://aoe2techtree.net/#' +
      p1civName +
      '" target="_blank">' +
      p1civName +
      '</a>&nbsp;' +
      p1Won +
      '</div><div class="text-center rating">' +
      p1rating +
      '</div><div class="mapname text-center"><a class="text-decoration-none text-white" href="' +
      matchURL +
      matchID +
      '" target="_blank">' +
      mapName +
      '</a></div><div class="text-center rating"><a class="text-decoration-none text-white" href="' +
      p2link +
      '" target="_blank">' +
      p2rating +
      '</a></div><div class="civname text-end ' +
      p2txtColor +
      '">' +
      p2Won +
      '&nbsp;<a class="text-decoration-none ' +
      p2txtColor +
      '" href="https://aoe2techtree.net/#' +
      p2civName +
      '" target="_blank">' +
      p2civName +
      '</a>&nbsp;' +
      '<img src="../civ_crests/' +
      p2civName +
      '.png" height="50px"></div></div>';
  }
}

async function onPageLoad() {
  let civData = await fetch('https://aoe2.net/api/strings?game=aoe2de&language=en').then((response) => response.json());
  const civName = getCivName(civData, civID);

  if (!queryString) {
    p1id = '247224';
  }
  let civHistoryData = [];
  if (!p1id || !Number.isInteger(+p1id)) {
    console.log('hello! error here');
    window.alert('Need to enter Player ID from aoe2.net');
  } else {
    let data = await getPlayerHistory(p1id);
    let finalData = [];
    for (let i = 0; i < data.length; i++) {
      if (data[i].num_players == 2) {
        for (let p = 0; p < data[i].players.length; p++) {
          if ((data[i].players[p].profile_id == p1id) & (data[i].players[p].civ == civID)) {
            finalData.push(data[i]);
          }
        }
      }
    }
    document.getElementById('games').innerHTML = ' ' + finalData.length;

    renderHTML(finalData, p1id);
  }
  const playerName = await getPlayerNames(p1id);
  const playerLink =
    '<a class="text-decoration-none text-white" href="singlegames.html?p1id=' + p1id + '">' + playerName + '</a>: ';
  document.getElementById('playername').insertAdjacentHTML('afterbegin', playerLink);
  document.getElementById('civname').insertAdjacentHTML('afterbegin', civName + ' ');
}
onPageLoad();
