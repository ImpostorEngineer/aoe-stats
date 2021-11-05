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

async function getAllGames(p1ID, p2ID) {
  const playerGamerID = idTypeNumber(p1ID);
  const opponentGamerID = idTypeNumber(p2ID);

  const url = 'https://aoe2.net/api/player/matches?game=aoe2de&' + playerGamerID.gamerID + '&count=1000';

  let response = await axios.get(url);
  let data = response.data;

  const playedGamesList = data.filter((g) => {
    for (let p = 0; p < g.players.length; p++) {
      if (g.players[p][opponentGamerID.idType] == p2ID && g.players.length == 2) {
        return true;
      }
    }
  });
  return playedGamesList;
}

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

router.get('/vs/:id/:opponent', (req, res, next) => {
  const p2ID = req.params.opponent;
  const p1ID = req.params.id;
  getAllGames(p1ID, p2ID).then((response) => res.json(response));
});

// router.get('/current/:id/:count', (req, res, next) => {
//   const p1ID = req.params.id;
//   const gameCount = req.params.count;

//     const gameHistoryURL = 'https://aoe2.net/api/player/matches?game=aoe2de&' + gamerID + '&count=' + gameCount;

//     let response = await axios.get(gameHistoryURL);
//     let data = response.data;

//   //   for (let i = 0; i < data.length; i++) {
//   //     const playerList = data[i].players.filter((player) => player[idType] == opponent.id);
//   //     if (playerList != '' && data[i].game_type == 0) {
//   //       playedGames.push(playerList);
//   //     }
//   //   }

//   //   for (let t = 0; t < playedGames.length; t++) {
//   //     if (playedGames[t][0].won == true) {
//   //       count += 1;
//   //     }
//   //   }
//   //   winrate.playerName = currentPlayers.name;
//   //   winrate.playerID = id;
//   //   winrate.opponentName = opponent.name;
//   //   winrate.opponentRating = opponent.rating;
//   //   winrate.opponentID = opponent.id;
//   //   winrate.lost = count;
//   //   winrate.played = playedGames.length;
//   //   let opponentWinrate = Math.floor((count / playedGames.length) * 10000) / 100;
//   //   winrate.loserate = opponentWinrate + '%';
//   //   winrate.winrate = Math.floor((100 - opponentWinrate) * 100) / 100 + '%';

//   //   return winrate;
//   // }

//   getAllGames(p1ID, p2ID).then((response) => res.json(response));
// });

module.exports = router;
