const form = document.querySelector('form');
const p1IDinput = document.getElementById('p1id');
const p2IDinput = document.getElementById('p2id');
form.addEventListener('submit', formSubmitted);

window.onload = async function onPageLoad() {
  const p1id = '199325';
  const p2id = '196240';
  let data = await getAllGames(p1id, p2id);
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
}

async function getAllGames(p1id, p2id) {
  let idType = 'profile_id';
  if (p1id.length > 7) {
    idType = 'steam_id';
  }
  const url = 'https://aoe2.net/api/player/matches?game=aoe2de&' + idType + '=' + p1id + '&count=1000';

  let data = await fetch(url, { mode: 'cors' }).then((response) => response.json());

  const playedGamesList = data.filter((g) => {
    for (let p = 0; p < g.players.length; p++) {
      if (g.players[p][idType] == p2id && g.players.length == 2) {
        return true;
      }
    }
  });
  return playedGamesList;
}

// async function getPlayers(p1id, p2id) {
//   const dataURL = './api/vs/' + p1id + '/' + p2id;
//   const playerData = await fetch(dataURL, { mode: 'same-origin' }).then((response) => response.json());
//   return playerData;
// }

async function getPlayerNames(ID) {
  let idType = 'profile_id';
  if (ID.length > 7) {
    idType = 'steam_id';
  }
  const profileURL = 'https://aoe2.net/api/player/lastmatch?game=aoe2de&' + idType + '=' + ID;
  let data = await fetch(profileURL, { mode: 'cors' }).then((response) => response.json());
  let playerName = data.name;
  return playerName;
}

async function getPlayerRating(ID) {
  let idType = 'profile_id';
  if (ID.length > 7) {
    idType = 'steam_id';
  }
  const profileURL =
    'https://aoe2.net/api/player/ratinghistory?game=aoe2de&leaderboard_id=3&count=1&' + idType + '=' + ID;
  let data = await fetch(profileURL, { mode: 'cors' }).then((response) => response.json());
  let playerRating = 0;
  if (data[0] == undefined) {
    playerRating = 0;
  } else {
    playerRating = data[0].rating;
  }
  return playerRating;
}

async function renderHTML(playerData, idType, data, p1id, p2id) {
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
  const p1rating = document.getElementById('p1rating');
  const p2rating = document.getElementById('p2rating');
  p1Civs.innerHTML = '';
  p2Civs.innerHTML = '';

  let p1NameData = await getPlayerNames(p1id);
  let p2NameData = await getPlayerNames(p2id);
  let p1RatingData = await getPlayerRating(p1id);
  let p2RatingData = await getPlayerRating(p2id);

  p1name.innerHTML = p1NameData;
  p2name.innerHTML = p2NameData;
  p1rating.innerHTML = '(' + p1RatingData + ')';
  p2rating.innerHTML = '(' + p2RatingData + ')';
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
  document.getElementById('loading').style.display = 'none';
}

function calculateWinRate(data, p1id, p2id) {
  let idType = 'profile_id';
  if (p1id.length > 7) {
    idType = 'steam_id';
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
  if (finalData.playedCount == 0) {
    finalData.winRate = 0;
    finalData.loseRate = 0;
  } else {
    finalData.loseRate = Math.floor((finalData.loseCount / finalData.playedCount) * 10000) / 100;
    finalData.winRate = Math.floor((100 - finalData.loseRate) * 100) / 100;
  }
  renderHTML(finalData, idType, data, p1id, p2id);
}
