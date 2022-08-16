// const form = document.querySelector('form');
// const p1IDinput = document.getElementById('p1id');
// form.addEventListener('submit', formSubmitted);
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const p1id = urlParams.get('p1id');
const civID = urlParams.get('civid');
let games = urlParams.get('games');

async function getPlayerHistory(p1id) {
  if (!games) {
    games = 1000;
  }
  const dataURL = './api/' + p1id + '/' + games;
  const playerData = await fetch(dataURL, { mode: 'same-origin' }).then((response) => response.json());
  return playerData;
}

async function onPageLoad() {
  let civData = await fetch('https://aoe2.net/api/strings?game=aoe2de&language=en').then((response) => response.json());
  let civName = '';
  for (let c = 0; c < civData.civ.length; c++) {
    if (civData.civ[c]['id'] == civID) {
      civName = civData.civ[c]['string'];
    }
  }

  if (!queryString) {
    p1id = '247224';
  }
  let civHistoryData = [];
  if (!p1id || !Number.isInteger(+p1id)) {
    console.log('hello! error here');
    window.alert('Need to enter Player ID from aoe2.net');
  } else {
    let data = await getPlayerHistory(p1id);
    let finalData = [];
    for (let i = 0; i < data.length; i++) {
      if (data[i].num_players == 2) {
        for (let p = 0; p < data[i].players.length; p++) {
          if ((data[i].players[p].profile_id == p1id) & (data[i].players[p].civ == civID)) {
            finalData.push(data[i]);
          }
        }
      }
    }
    document.getElementById('games').innerHTML = finalData.length;
    console.log(finalData);
    for (let m = 0; m < finalData.length; m++) {
      document.getElementById('list').innerHTML += finalData[m].match_id + '<br>';
    }
  }
  const playerName = await getPlayerNames(p1id);
  document.getElementById('playername').insertAdjacentHTML('afterbegin', playerName + ': ');
  document.getElementById('civname').insertAdjacentHTML('afterbegin', civName + ' ');
}
onPageLoad();
