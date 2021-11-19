// const form = document.querySelector('form');
// const p1IDinput = document.getElementById('p1id');
// form.addEventListener('submit', formSubmitted);
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
let p1id = urlParams.get('p1id');

window.onload = async function onPageLoad() {
  if (!queryString) {
    p1id = '247224';
  }
  if (!p1id || !Number.isInteger(+p1id)) {
    console.log('hello! error here');
    window.alert('Need to enter Player ID from aoe2.net');
  } else {
    const data = await getPlayerHistory(p1id);
    fetchData(data);
  }
  const playerName = await getPlayerNames(p1id);
  document.getElementById('playername').insertAdjacentHTML('afterbegin', playerName + ': ');
};

async function getPlayerHistory(p1id) {
  const dataURL = './api/' + p1id + '/' + '1000';
  const playerData = await fetch(dataURL, { mode: 'same-origin' }).then((response) => response.json());
  return playerData;
}

async function fetchData(data) {
  document.getElementById('loading').style.display = 'inline-block';

  let historydata = await data;
  let gamesPlayedData = [];

  for (let i = 0; i < historydata.length; i++) {
    gamesPlayedData.push({
      x: historydata[i].string,
      y: historydata[i].count,
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
