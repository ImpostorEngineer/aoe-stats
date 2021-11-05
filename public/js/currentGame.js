const form = document.querySelector('form');
const p1IDinput = document.getElementById('p1id');
form.addEventListener('submit', formSubmitted);

function idTypeNumber(number) {
  if (number.length > 7) {
    idType = 'steam_id';
    gamerID = 'steam_id=' + number;
  } else {
    idType = 'profile_id';
    gamerID = 'profile_id=' + number;
  }
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
  const p1id = '247224';
  const p2idData = await getCurrentOpponentID(p1id);
  const p2id = await p2idData.p2ID;
  const data = await getPlayers(p1id, p2id);
  calculateWinRate(data, p1id, p2id);
};

async function formSubmitted(event) {
  event.preventDefault();
  const p1id = p1IDinput.value;
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
