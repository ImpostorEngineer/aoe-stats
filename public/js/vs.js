const form = document.querySelector('form');
const p1IDinput = document.getElementById('p1id');
const p2IDinput = document.getElementById('p2id');
form.addEventListener('submit', formSubmitted);

window.onload = async function onPageLoad() {
  const p1id = '199325';
  const p2id = '196240';
  let data = await getPlayers(p1id, p2id);
  renderHTML(data);
  document.getElementById('loading').style.display = 'none';
};

async function formSubmitted(event) {
  event.preventDefault();
  const p1id = p1IDinput.value;
  const p2id = p2IDinput.value;
  document.getElementById('loading').style.display = 'inline-block';
  let data = await getPlayers(p1id, p2id);
  renderHTML(data);
  document.getElementById('loading').style.display = 'none';
}

async function getPlayers(p1id, p2id) {
  const dataURL = 'http://aoestats.herokuapp.com/api/vs/' + p1id + '/' + p2id;
  const playerData = await fetch(dataURL).then((response) => response.json());
  return playerData;
}

function renderHTML(playerData) {
  const p1name = document.getElementById('p1name');
  const p2name = document.getElementById('p2name');
  const p1rate = document.getElementById('p1rate');
  const p2rate = document.getElementById('p2rate');
  const p1content = document.getElementById('p1content');
  const p2content = document.getElementById('p2content');

  p1name.innerHTML = playerData.playerName;
  p2name.innerHTML = playerData.opponentName;
  p1rate.innerHTML = playerData.winrate;
  p2rate.innerHTML = playerData.loserate;
  p1content.innerHTML = playerData.played - playerData.playerLost;
  p2content.innerHTML = playerData.playerLost;
}
