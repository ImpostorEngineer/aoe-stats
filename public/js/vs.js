const form = document.querySelector('form');
const p1IDinput = document.getElementById('p1id');
const p2IDinput = document.getElementById('p2id');
form.addEventListener('submit', formSubmitted);

window.onload = async function onPageLoad() {
  const p1id = '199325';
  const p2id = '196240';
  let data = await getPlayers(p1id, p2id);
  calculateWinRate(data, p1id, p2id);
  document.getElementById('loading').style.display = 'none';
};

async function formSubmitted(event) {
  event.preventDefault();
  const p1id = p1IDinput.value;
  const p2id = p2IDinput.value;
  document.getElementById('loading').style.display = 'inline-block';
  let data = await getPlayers(p1id, p2id);
  calculateWinRate(data, p1id, p2id);
  document.getElementById('loading').style.display = 'none';
}

async function getPlayers(p1id, p2id) {
  const dataURL = './api/vs/' + p1id + '/' + p2id;
  const playerData = await fetch(dataURL, { mode: 'same-origin' }).then((response) => response.json());
  return playerData;
}

async function renderHTML(playerData, data, p1id, p2id) {
  const map_url = 'https://aoe2.net/api/strings?game=aoe2de&language=en';
  const mapData = await fetch(map_url, { mode: 'cors' }).then((response) => response.json());
  const shortData = data.slice(0, 5);

  const p1name = document.getElementById('p1name');
  const p2name = document.getElementById('p2name');
  const p1rate = document.getElementById('p1rate');
  const p2rate = document.getElementById('p2rate');
  const p1content = document.getElementById('p1content');
  const p2content = document.getElementById('p2content');
  const p1Civs = document.getElementById('p1Civs');
  const p2Civs = document.getElementById('p2Civs');
  p1Civs.innerHTML = '';
  p2Civs.innerHTML = '';

  p1name.innerHTML = playerData.playerName;
  p2name.innerHTML = playerData.opponentName;
  p1rate.innerHTML = playerData.winRate + '%';
  p2rate.innerHTML = playerData.loseRate + '%';
  p1content.innerHTML = playerData.playedCount - playerData.loseCount;
  p2content.innerHTML = playerData.loseCount;

  for (let g = 0; g < shortData.length; g++) {
    let p1txtColor = 'text-primary';
    let p1civ = '';
    let p1civName = '';
    let p1Won = '&#10004;';
    let p2txtColor = 'text-primary';
    let p2civ = '';
    let p2civName = '';
    let p2Won = '&#10004;';

    for (let p = 0; p < shortData[g].players.length; p++) {
      if (shortData[g].players[p][idType] == p1id) {
        p1civ = shortData[g].players[p].civ;
        if (shortData[g].players[p].won == false) {
          p1txtColor = 'text-danger';
          p1Won = '&#10060;';
        }
      }
      if (shortData[g].players[p][idType] == p2id) {
        p2civ = shortData[g].players[p].civ;
        if (shortData[g].players[p].won == false) {
          p2txtColor = 'text-danger';
          p2Won = '&#10060;';
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
    p1Civs.innerHTML +=
      '<div class="' +
      p1txtColor +
      '"><img src="../civ_crests/' +
      p1civName +
      '.png" height="50px">&nbsp;' +
      p1civName +
      '&nbsp;' +
      p1Won +
      '</div>';
    p2Civs.innerHTML +=
      '<div class="' +
      p2txtColor +
      '">' +
      p2Won +
      '&nbsp;' +
      p2civName +
      '&nbsp;' +
      '<img src="../civ_crests/' +
      p2civName +
      '.png" height="50px"></div>';
  }
}

function calculateWinRate(data, p1id, p2id) {
  if (p1id.length > 7) {
    idType = 'steam_id';
  } else {
    idType = 'profile_id';
  }

  let finalData = {};
  finalData.loseCount = 0;
  finalData.playedCount = data.length;

  for (let g = 0; g < data.length; g++) {
    for (let p = 0; p < data[g].players.length; p++) {
      if (data[g].players[p][idType] == p1id) {
        finalData.playerName = data[g].players[p].name;
      }
      if (data[g].players[p][idType] == p2id && data[g].players[p].won == true) {
        finalData.opponentName = data[g].players[p].name;
        finalData.loseCount += 1;
      }
    }
  }
  finalData.loseRate = Math.floor((finalData.loseCount / finalData.playedCount) * 10000) / 100;
  finalData.winRate = Math.floor((100 - finalData.loseRate) * 100) / 100;
  renderHTML(finalData, data, p1id, p2id);
}
