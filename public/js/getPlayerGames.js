async function getPlayerNames(ID) {
  const profileURL = `./api/all/${ID}/1`;
  const { playerName, data } = await fetch(profileURL, {
    mode: 'same-origin',
  }).then((response) => response.json());
  return playerName;
}

async function getPlayerRating(ID) {
  const profileURL = `./api/rating/${ID}`;
  let data = await fetch(profileURL, { mode: 'same-origin' }).then((response) => response.json());
  let playerRating = 0;
  if (!data) {
    playerRating = 0;
  } else {
    playerRating = data;
  }
  return playerRating;
}

async function getCivName(civID) {
  const civNameData = await fetch('./js/civs.json').then((res) => res.json());
  const civName = civNameData['civ'].filter((civ) => civ.id == civID)[0].string;
  return civName;
}

async function renderHTML(playerData, idType, data, p1id, p2id) {
  const map_url = './api/strings';
  const mapData = await fetch(map_url, { mode: 'cors' }).then((response) => response.json());
  const shortData = data.slice(0, 5);

  const p1name = document.getElementById('p1name');
  const p2name = document.getElementById('p2name');
  const p1rate = document.getElementById('p1rate');
  const p2rate = document.getElementById('p2rate');
  const p1content = document.getElementById('p1content');
  const p2content = document.getElementById('p2content');
  const civList = document.getElementById('civList');
  const p1rating = document.getElementById('p1rating');
  const p2rating = document.getElementById('p2rating');
  const pageTitle = document.getElementById('title');
  civList.innerHTML = '';

  let p1NameData = await getPlayerNames(p1id);
  let p2NameData = await getPlayerNames(p2id);
  let p1RatingData = await getPlayerRating(p1id);
  let p2RatingData = await getPlayerRating(p2id);
  pageTitle.insertAdjacentHTML('beforeend', p1NameData + ' vs ' + p2NameData);

  const playerURL = 'https://aoe2.net/#profile-';
  p1name.innerHTML =
    '<a class="text-decoration-none text-white" href="' + playerURL + p1id + '" target="_blank">' + p1NameData + '</a>';
  p2name.innerHTML =
    '<a class="text-decoration-none text-white" href="' + playerURL + p2id + '" target="_blank">' + p2NameData + '</a>';
  p1rating.innerHTML = '(' + p1RatingData + ')';
  p2rating.innerHTML = '(' + p2RatingData + ')';
  p1rate.innerHTML = playerData.winRate + '%';
  p2rate.innerHTML = playerData.loseRate + '%';
  p1content.innerHTML = playerData.winCount;
  p2content.innerHTML = playerData.loseCount;

  for (let g = 0; g < shortData.length; g++) {
    let p1txtColor = '';
    let p1civ = '';
    let p1civName = '';
    let p1Won = '';
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
      if (shortData[g].players[p][idType] == p1id) {
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
      if (shortData[g].players[p][idType] == p2id) {
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

    p1civName = await getCivName(p1civ);
    p2civName = await getCivName(p2civ);

    for (let m = 0; m < mapData.map_type.length; m++) {
      if (mapData.map_type[m].id == mapID) {
        mapName = mapData.map_type[m].string;
      }
    }

    civList.innerHTML +=
      '<div class="row m-auto"><div class="col-4 civname text-start ' +
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
      '</div><div class="col-4 mapname text-center"><a class="text-decoration-none text-white" href="' +
      matchURL +
      matchID +
      '" target="_blank">' +
      mapName +
      '</a></div><div class="col-4 civname text-end ' +
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
  document.getElementById('results').style.display = 'initial';
  document.getElementById('loading').style.display = 'none';
}

function calculateWinRate(data, p1id, p2id) {
  let idType = 'profile_id';

  let finalData = {};
  finalData.loseCount = 0;
  finalData.winCount = 0;
  finalData.playedCount = data.length;

  for (let g = 0; g < data.length; g++) {
    if (data[g].finished == null) {
      finalData.playedCount -= 1;
    }
    for (let p = 0; p < data[g].players.length; p++) {
      if (data[g].players[p][idType] == p1id && data[g].players[p].won == true) {
        finalData.winCount += 1;
      }
      if (data[g].players[p][idType] == p2id && data[g].players[p].won == true) {
        finalData.loseCount += 1;
      }
    }
  }
  if (finalData.playedCount == 0) {
    finalData.winRate = 0;
    finalData.loseRate = 0;
  } else {
    finalData.loseRate = Math.floor((finalData.loseCount / finalData.playedCount) * 10000) / 100;
    finalData.winRate = Math.floor((finalData.winCount / finalData.playedCount) * 10000) / 100;
  }
  renderHTML(finalData, idType, data, p1id, p2id);
}
