const express = require('express');
const router = express.Router();
const axios = require('axios');

function idTypeNumber(number) {
  idType = 'profile_id';
  gamerID = 'profile_id=' + number;
  return { idType, gamerID };
}

async function getAllGames(ID, gameCount) {
  const playerGamerID = idTypeNumber(ID);
  const url = 'https://aoe2.net/api/player/matches?game=aoe2de&' + playerGamerID.gamerID + '&count=' + gameCount;
  let response = await axios.get(url);
  let data = response.data;
  return data;
}

async function getOpponentGames(p1ID, p2ID, gameCount) {
  let data = getAllGames(p1ID, gameCount);
  const playedGamesList = data.filter((g) => {
    for (let p = 0; p < g.players.length; p++) {
      if (g.players[p][opponentGamerID.idType] == p2ID && g.players.length == 2) {
        return true;
      }
    }
  });
  return playedGamesList;
}

async function getCurrentOpponentID(p1ID) {
  const playerGamerID = idTypeNumber(p1ID);
  const playerURL = 'https://aoe2.net/api/player/lastmatch?game=aoe2de&' + playerGamerID.gamerID;
  let response = await axios.get(playerURL);
  let currentGame = response.data;
  let opponentID = {};
  for (let p = 0; p < currentGame.last_match.players.length; p++) {
    if (currentGame.last_match.players[p][idType] != p1ID) {
      opponentID.p2ID = currentGame.last_match.players[p][idType];
    }
  }
  return opponentID;
}

async function getPlayerNames(ID) {
  let idType = 'profile_id';
  const profileURL = 'https://aoe2.net/api/player/lastmatch?game=aoe2de&' + idType + '=' + ID;
  let data = await axios.get(profileURL);
  let playerName = data.data.name;
  return playerName;
}

async function getPlayerRating(ID) {
  let idType = 'profile_id';

  const profileURL =
    'https://aoe2.net/api/player/ratinghistory?game=aoe2de&leaderboard_id=3&count=1&' + idType + '=' + ID;
  let data = await axios.get(profileURL);
  let playerRating = 0;
  if (data.data[0] == undefined) {
    playerRating = 0;
  } else {
    playerRating = data.data[0].rating;
  }
  return playerRating;
}

async function calculateWinRate(data, p1id, p2id) {
  let idType = 'profile_id';
  let finalData = {};

  finalData.loseCount = 0;
  finalData.winCount = 0;
  finalData.playedCount = data.length;
  finalData.playerName = await getPlayerNames(p1id);
  finalData.playerRating = await getPlayerRating(p1id);
  finalData.opponentName = await getPlayerNames(p2id);
  finalData.opponentRating = await getPlayerRating(p2id);

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
  return finalData;
}

async function getGames(data) {
  let civData = await axios.get('https://aoe2.net/api/strings?game=aoe2de&language=en');
  const civNames = civData.data;

  let playedGames = [];
  let playedCivs = [];
  let finalCivs = [];

  for (let i = 0; i < data.length; i++) {
    const playerList = data[i].players.filter((player) => player[idType] == id);
    playedGames.push(playerList);
    playedCivs.push(playerList[0].civ);
  }
  playedCivs = [...new Set(playedCivs)];
  playedCivs.sort((a, b) => a - b);

  for (let c = 0; c < civNames.civ.length; c++) {
    for (let k = 0; k < playedCivs.length; k++)
      if (civNames.civ[c].id == playedCivs[k] && playedCivs[k] != null) {
        finalCivs.push({ ...civNames.civ[c], count: 0, won: 0 });
      }
  }

  for (let t = 0; t < playedGames.length; t++) {
    for (let p = 0; p < finalCivs.length; p++) {
      if (playedGames[t][0].civ == finalCivs[p].id) {
        finalCivs[p].count += 1;
        if (playedGames[t][0].won == true) {
          finalCivs[p].won += 1;
        }
      }
    }
  }
  finalCivs.sort((a, b) => b.count - a.count);
  return finalCivs;
}

router.get('/:id/:count', (req, res, next) => {
  const gameCount = req.params.count;
  const id = req.params.id;
  let data = getAllGames(id, gameCount);
  getGames(data).then((response) => res.json(response));
});

router.get('/vs1/:id/:count', (req, res, next) => {
  const gameCount = req.params.count;
  const id = req.params.id;
  let data = getAllGames(id, gameCount);
  data = data.filter((games) => games.num_players == 2);
  getGames(data).then((response) => res.json(response));
});

router.get('/vs/:id/:opponent', (req, res, next) => {
  const p2ID = req.params.opponent;
  const p1ID = req.params.id;
  getOpponentGames(p1ID, p2ID, 1000).then((response) => res.json(response));
});

router.get('/current/:count/:id', (req, res, next) => {
  const p1ID = req.params.id;
  const count = req.params.count;
  async function getCurrentGame(p1ID) {
    const opponentID = await getCurrentOpponentID(p1ID);
    let data = await getOpponentGames(p1ID, opponentID.p2ID);
    let finalData = await calculateWinRate(data, p1ID, opponentID.p2ID);
    return finalData;
  }
  getCurrentGame(p1ID, count).then((response) => res.json(response));
});

module.exports = router;
