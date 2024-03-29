// const form = document.querySelector('form');
// const p1IDinput = document.getElementById('p1id');
// form.addEventListener('submit', formSubmitted);
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const p1id = urlParams.get('p1id');
let games = urlParams.get('games');

async function getPlayerHistory(p1id) {
  if (!games) {
    games = 1000;
  }
  const dataURL = './api/all/' + p1id + '/' + games;
  const playerData = await fetch(dataURL, { mode: 'same-origin' }).then((response) => response.json());
  return playerData;
}

async function makeChart(data) {
  document.getElementById('loading').style.display = 'inline-block';

  let historydata = await data;
  let gamesPlayedData = [];

  for (let i = 0; i < historydata.length; i++) {
    gamesPlayedData.push({
      x: historydata[i].string,
      y: historydata[i].count,
      z: Math.round((historydata[i].won / historydata[i].count) * 100) + '%',
      goals: [
        { name: 'Games Won', value: historydata[i].won, strokeHeight: 4, strokeWidth: 8, strokeColor: '#775DD0' },
      ],
    });
  }
  var options = {
    series: [
      {
        name: 'Games Played',
        data: gamesPlayedData,
      },
    ],
    chart: {
      fontFamily: 'Roboto, Arial, sans-serif',
      height: 350,
      type: 'bar',
    },

    plotOptions: {
      bar: {
        columnWidth: '60%',
      },
    },
    colors: ['#00E396'],
    dataLabels: {
      enabled: false,
    },
    legend: {
      show: true,
      showForSingleSeries: true,
      customLegendItems: ['Games Played', 'Games Won'],
      markers: {
        fillColors: ['#00E396', '#775DD0'],
      },
    },
  };

  var chart = new ApexCharts(document.querySelector('#chart'), options);
  document.getElementById('loading').style.display = 'none';
  chart.render();
}

async function onPageLoad() {
  if (!queryString) {
    p1id = '247224';
  }
  if (!p1id || !Number.isInteger(+p1id)) {
    console.log('hello! error here');
    window.alert('Need to enter Player ID from aoe2.net');
  } else {
    const { playerName, playedCivs } = await getPlayerHistory(p1id);
    document.getElementById('playername').insertAdjacentHTML('afterbegin', playerName + ': ');
    makeChart(playedCivs);
    let gameCount = 0;
    for (let i = 0; i < playedCivs.length; i++) {
      gameCount += playedCivs[i].count;
    }
    document.getElementById('games').innerHTML = gameCount;
  }
}
onPageLoad();
