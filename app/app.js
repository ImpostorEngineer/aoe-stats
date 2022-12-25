const express = require('express');
const router = express.Router();
const axios = require('axios');
const civNames = require('../public/js/civs.json')['civ'];

function idTypeNumber(number) {
  idType = 'profile_id';
  gamerID = 'profile_id=' + number;
  return { idType, gamerID };
}

async function getAllGames(ID, gameCount) {
  const url = 'https://aoe2.net/api/player/matches?game=aoe2de&profile_id' + ID + '&count=' + gameCount;
  let response = await axios.get(url);
  let data = response.data;
  return data;
}

async function getOpponentGames(p1ID, p2ID, gameCount) {
  let data = await getAllGames(p1ID, gameCount);
  const playedGamesList = data.filter((g) => {
    for (let p = 0; p < g.players.length; p++) {
      if (g.players[p]['profile_id'] == p2ID && g.players.length == 2) {
        return true;
      }
    }
  });
  return playedGamesList;
}

async function getCurrentOpponentID(p1ID) {
  const playerURL = 'https://aoe2.net/api/player/matches?game=aoe2de&count=1&profile_id=' + p1ID;
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
  const profileURL = `https://aoe2.net/api/player/ratinghistory?game=aoe2de&leaderboard_id=3&profile_id=${ID}&count=1`;
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

async function getGames(data, id) {
  const playedGamesList = data.map((game) => game.players.filter((player) => player['profile_id'] == id)[0]);
  const playerName = playedGamesList[0].name;

  const playedCivsObj = playedGamesList.reduce(function (obj, game) {
    const civName = civNames.filter((civ) => civ.id == game.civ)[0].string;
    if (!obj[civName]) {
      if (game['won'] == true) {
        obj[civName] = { id: game.civ, count: 1, won: 1, lost: 0 };
      } else {
        obj[civName] = { id: game.civ, count: 1, won: 0, lost: 1 };
      }
    } else {
      if (game['won'] == true) {
        obj[civName].count += 1;
        obj[civName].won += 1;
      } else {
        obj[civName].count += 1;
        obj[civName].lost += 1;
      }
    }
    return obj;
  }, {});

  let playedCivs = [];
  for (civ in playedCivsObj) {
    let civObj = {
      id: playedCivsObj[civ].id,
      string: civ,
      count: playedCivsObj[civ].count,
      won: playedCivsObj[civ].won,
      lost: playedCivsObj[civ].lost,
    };
    playedCivs.push(civObj);
  }
  playedCivs.sort((a, b) => b.count - a.count);
  return { playedCivs, playerName };
}

router.get('/strings', async (req, res, next) => {
  const url = 'https://aoe2.net/api/strings?game=aoe2de&language=en';
  const response = await axios.get(url);
  const data = response.data;
  res.json(data);
});

router.get('/rating/:id', async (req, res, next) => {
  const id = req.params.id;
  let data = await getPlayerRating(id);
  res.json(data);
});

router.get('/count/:id/:count', async (req, res, next) => {
  const gameCount = req.params.count;
  const id = req.params.id;
  let data = await getAllGames(id, gameCount);
  res.json(data);
});

router.get('/all/:id/:count', async (req, res, next) => {
  const gameCount = req.params.count;
  const id = req.params.id;
  const data = await getAllGames(id, gameCount);
  const { playedCivs, playerName } = await getGames(data, id);
  res.json({ playerName, playedCivs });
});

router.get('/vs1/:id/:count', async (req, res, next) => {
  const gameCount = req.params.count;
  const id = req.params.id;
  const data = await getAllGames(id, gameCount);
  const finalData = data.filter((games) => games.num_players == 2);
  const { playedCivs, playerName } = await getGames(finalData, id);
  res.json({ playerName, playedCivs });
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
