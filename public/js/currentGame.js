const form = document.querySelector('form');
const p1IDinput = document.getElementById('p1id');
const p2IDinput = document.getElementById('p2id');
form.addEventListener('submit', formSubmitted);

window.onload = async function onPageLoad() {
  const p1id = '199325';
  let data = await getPlayers(p1id);
  calculateWinRate(data, p1id, p2id);
};

async function formSubmitted(event) {
  event.preventDefault();
  const p1id = p1IDinput.value;
  const p2id = p2IDinput.value;
  document.getElementById('loading').style.display = 'inline-block';
  let data = await getPlayers(p1id, p2id);
  calculateWinRate(data, p1id, p2id);
}

async function getPlayers(p1id) {
  const dataURL = './api/current/' + p1id + '/1000';
  const playerData = await fetch(dataURL, { mode: 'same-origin' }).then((response) => response.json());
  return playerData;
}
