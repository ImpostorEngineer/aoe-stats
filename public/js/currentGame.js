const form = document.querySelector('form');
// const p1IDinput = document.getElementById('p1id');
form.addEventListener('submit', formSubmitted);
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
let p1id = urlParams.get('p1id');
let p2id = urlParams.get('p2id');

function idTypeNumber(number) {
  idType = 'profile_id';
  gamerID = 'profile_id=' + number;
  return { idType, gamerID };
}

async function getCurrentOpponentID(p1ID) {
  const playerGamerID = idTypeNumber(p1ID);
  const playerURL = 'https://aoe2.net/api/player/lastmatch?game=aoe2de&' + playerGamerID.gamerID;
  let currentGame = await fetch(playerURL, { mode: 'cors' }).then((response) => response.json());
  let opponentID = {};
  for (let p = 0; p < currentGame.last_match.players.length; p++) {
    if (currentGame.last_match.players[p][idType] != p1ID) {
      opponentID.p2ID = currentGame.last_match.players[p][idType];
    }
  }
  return opponentID;
}

window.onload = async function onPageLoad() {
  if (!queryString) {
    p1id = '247224';
  }
  if (!p1id || !Number.isInteger(+p1id)) {
    console.log('hello! error here');
    window.alert('Need to enter Player ID from aoe2.net');
  } else {
    const p2idData = await getCurrentOpponentID(p1id);
    const p2id = await p2idData.p2ID;
    const data = await getPlayers(p1id, p2id);
    calculateWinRate(data, p1id, p2id);
  }
};

async function formSubmitted(event) {
  // event.preventDefault();
  document.getElementById('results').style.display = 'none';
  const p2idData = await getCurrentOpponentID(p1id);
  const p2id = p2idData.p2ID;
  document.getElementById('loading').style.display = 'inline-block';
  const data = await getPlayers(p1id, p2id);
  calculateWinRate(data, p1id, p2id);
}

async function getPlayers(p1id, p2id) {
  const dataURL = './api/vs/' + p1id + '/' + p2id;
  const playerData = await fetch(dataURL, { mode: 'same-origin' }).then((response) => response.json());
  return playerData;
}
