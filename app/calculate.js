const civNames = require('../aoe2.json');
const axios = require('axios');

async function getGames() {
  const url =
    'https://aoe2.net/api/player/matches?game=aoe2de&steam_id=76561198070386645&count=10';
  let response = await axios.get(url);
  let data = response.data;
  calcWinRate(data);
}

function calcWinRate(data) {
  let playedGames = [];
  let playedCivs = [];
  let finalCivs = [];

  for (let i = 0; i < data.length; i++) {
    const playerList = data[i].players.filter(
      (player) => player.steam_id == '76561198070386645'
    );
    playedGames.push(playerList);
    playedCivs.push(playerList[0].civ);
  }

  playedCivs = [...new Set(playedCivs)];

  for (let c = 0; c < playedCivs.length; c++) {
    finalCivs.push(civNames.civ[playedCivs[c]]);
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
  console.log(finalCivs);
  return finalCivs;
}
getGames();
// module.exports = getGames;
