// const form = document.querySelector('form');
// const p1IDinput = document.getElementById('p1id');
// form.addEventListener('submit', formSubmitted);
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const p1id = urlParams.get('p1id');
let games = urlParams.get('games');

async function getSingleHistory(p1id) {
  if (!games) {
    games = 1000;
  }
  const dataURL = './api/vs1/' + p1id + '/' + games;
  const playerData = await fetch(dataURL, { mode: 'same-origin' }).then((response) => response.json());
  return playerData;
}

async function makeChart(data, p1id) {
  document.getElementById('loading').style.display = 'inline-block';

  let historydata = await data;
  let gamesPlayedData = [];

  for (let i = 0; i < historydata.length; i++) {
    gamesPlayedData.push({
      x: historydata[i].string,
      y: historydata[i].count,
      z: Math.round((historydata[i].won / historydata[i].count) * 100) + '%',
      link: '/civhistory.html?civid=' + historydata[i].id + '&p1id=' + p1id,
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
      events: {
        dataPointSelection: function (event, chartContext, obj) {
          return (document.location.href = obj.w.config.series[obj.seriesIndex].data[obj.dataPointIndex].link);
        },
      },
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
    const data = await getSingleHistory(p1id);
    makeChart(data, p1id);
    let sortedData = [];

    for (let g = 0; g < data.length; g++) {
      sortedData.push({
        name: data[g].string,
        played: data[g].count,
        won: data[g].won,
        rate: Math.round((data[g].won / data[g].count) * 100),
      });
    }
    sortedData = sortedData.sort((a, b) => b.rate - a.rate);
    const statsTable = document.getElementById('stats-table');
    for (let g = 0; g < sortedData.length; g++) {
      const stat =
        '<div class="row"><div class="civname">' +
        sortedData[g].name +
        '</div><div class="played">' +
        sortedData[g].played +
        '</div><div class="won">' +
        sortedData[g].won +
        '</div><div class="rate">' +
        sortedData[g].rate +
        '%</div></div>';
      statsTable.insertAdjacentHTML('beforeend', stat);
    }

    let gameCount = 0;
    for (let i = 0; i < data.length; i++) {
      gameCount += data[i].count;
    }
    document.getElementById('games').innerHTML = ' ' + gameCount;
  }
  const playerName = await getPlayerNames(p1id);
  document.getElementById('playername').insertAdjacentHTML('afterbegin', playerName + ': ');
}
onPageLoad();
