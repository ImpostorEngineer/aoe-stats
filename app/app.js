const express = require('express');
const router = express.Router();
const axios = require('axios');

router.get('/:id/:count', (req, res, next) => {
  const count = req.params.count;
  const id = req.params.id;
  if (id.length > 7) {
    idType = 'steam_id';
    gamerID = 'steam_id=' + id;
  } else {
    idType = 'profile_id';
    gamerID = 'profile_id=' + id;
  }

  async function getGames() {
    let civData = await axios.get('https://aoe2.net/api/strings?game=aoe2de&language=en');
    const civNames = civData.data;

    const url = 'https://aoe2.net/api/player/matches?game=aoe2de&' + gamerID + '&count=' + count;

    let response = await axios.get(url);
    let data = response.data;

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
    for (let c = 0; c < playedCivs.length; c++) {
      finalCivs.push(civNames.civ[playedCivs[c] - 1]);
      finalCivs[c].count = 0;
      finalCivs[c].won = 0;
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
    return finalCivs;
  }
  getGames().then((response) => res.json(response));
});

router.get('/vs/:id/:opponent', (req, res, next) => {
  const opponent = req.params.opponent;
  const id = req.params.id;
  if (id.length > 7) {
    idType = 'steam_id';
    gamerID = 'steam_id=' + id;
  } else {
    idType = 'profile_id';
    gamerID = 'profile_id=' + id;
  }

  async function getAllGames() {
    const url = 'https://aoe2.net/api/player/matches?game=aoe2de&' + gamerID + '&count=1000';

    let response = await axios.get(url);
    let data = response.data;

    let playedGames = [];
    let winrate = {};
    let count = 0;

    for (let i = 0; i < data.length; i++) {
      const playerList = data[i].players.filter((player) => player[idType] == opponent);
      if (playerList != '') {
        playedGames.push(playerList);
      }
    }

    for (let t = 0; t < playedGames.length; t++) {
      if (playedGames[t][0].won == true) {
        count += 1;
      }
    }

    winrate.lost = count;
    winrate.played = playedGames.length;
    let opponentWinrate = Math.floor((count / playedGames.length) * 10000) / 100;
    winrate.loserate = opponentWinrate + '%';
    winrate.winrate = 100 - opponentWinrate + '%';

    return winrate;
  }
  getAllGames().then((response) => res.json(response));
});

router.get('/current/:id/:count', (req, res, next) => {
  const id = req.params.id;
  const gameCount = req.params.count;
  if (id.length > 7) {
    idType = 'steam_id';
    gamerID = 'steam_id=' + id;
  } else {
    idType = 'profile_id';
    gamerID = 'profile_id=' + id;
  }
  const playerURL = 'https://aoe2.net/api/player/lastmatch?game=aoe2de&' + gamerID;

  async function getCurrentGame() {
    let currentGame = await axios.get(playerURL);

    const currentPlayers = currentGame.data;
    let opponent = {};

    for (let p = 0; p < currentPlayers.last_match.players.length; p++) {
      if (currentPlayers.last_match.players[p].profile_id != id) {
        opponent.id = currentPlayers.last_match.players[p].profile_id;
      }
    }

    const gameHistoryURL = 'https://aoe2.net/api/player/matches?game=aoe2de&' + gamerID + '&count=' + gameCount;

    let response = await axios.get(gameHistoryURL);
    let data = response.data;

    let playedGames = [];
    let playedCivs = [];
    let winrate = {};
    let count = 0;
    for (let i = 0; i < data.length; i++) {
      const playerList = data[i].players.filter((player) => player[idType] == opponent.id);
      if (playerList != '') {
        playedGames.push(playerList);
      }
    }

    for (let t = 0; t < playedGames.length; t++) {
      if (playedGames[t][0].won == true) {
        count += 1;
      }
    }
    winrate.lost = count;
    winrate.played = playedGames.length;
    let opponentWinrate = Math.floor((count / playedGames.length) * 10000) / 100;
    winrate.loserate = opponentWinrate + '%';
    winrate.winrate = 100 - opponentWinrate + '%';

    return winrate;
  }
  getCurrentGame().then((response) => res.json(response));
});

https: module.exports = router;
