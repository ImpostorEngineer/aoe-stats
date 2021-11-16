const form = document.querySelector('form');
// const p1IDinput = document.getElementById('p1id');
// const p2IDinput = document.getElementById('p2id');
form.addEventListener('submit', formSubmitted);
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
let p1id = urlParams.get('p1id');
let p2id = urlParams.get('p2id');

window.onload = async function onPageLoad() {
  if (!queryString) {
    p1id = '199325';
    p2id = '506898';
  }
  let data = await getPlayers(p1id, p2id);
  calculateWinRate(data, p1id, p2id);
};

async function formSubmitted(event) {
  // event.preventDefault();
  document.getElementById('results').style.display = 'none';
  document.getElementById('loading').style.display = 'inline-block';
  let data = await getPlayers(p1id, p2id);
  calculateWinRate(data, p1id, p2id);
}

async function getPlayers(p1id, p2id) {
  const dataURL = './api/vs/' + p1id + '/' + p2id;
  const playerData = await fetch(dataURL, { mode: 'same-origin' }).then((response) => response.json());
  return playerData;
}
