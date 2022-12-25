const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const p1id = urlParams.get('p1id');
let games = urlParams.get('games');

function convertData(data) {
  let sortedData = [];
  for (let g = 0; g < data.length; g++) {
    sortedData.push({
      id: data[g].id,
      name: data[g].string,
      played: data[g].count,
      won: data[g].won,
      lost: data[g].lost,
      rate: Math.round((data[g].won / data[g].count) * 100),
    });
  }
  return sortedData;
}

async function getSingleHistory(p1id) {
  if (!games) {
    games = 1000;
  }
  const dataURL = './api/vs1/' + p1id + '/' + games;
  const { playerName, playedCivs } = await fetch(dataURL, { mode: 'same-origin' }).then((response) => response.json());
  const data = convertData(playedCivs);
  return { playerName, data };
}

async function makeChart(data, p1id) {
  document.getElementById('loading').style.display = 'inline-block';

  let historydata = await data;
  let gamesPlayedData = [];

  for (let i = 0; i < historydata.length; i++) {
    gamesPlayedData.push({
      x: historydata[i].name,
      y: historydata[i].played,
      z: historydata[i].rate + '%',
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
  document.getElementById('chart').innerHTML = '';
  var chart = new ApexCharts(document.querySelector('#chart'), options);
  document.getElementById('loading').style.display = 'none';
  chart.render();
}

function sortList(data, sortItem) {
  if (sortItem == 'name') {
    return data.sort((a, b) => a.name.localeCompare(b.name));
  }
  return data.sort((a, b) => b[sortItem] - a[sortItem]);
}

function renderHTML(data) {
  const statsTable = document.getElementById('stats-table');
  const headerRow =
    '<div class="row heading"><div class="civname"><a href="#" onclick="sortTable(\'name\')">Civilization</a></div><div class="played"><a href="#" onclick="sortTable(\'played\')">Played</a></div><div class="won"><a href="#" onclick="sortTable(\'won\')">Won</a></div><div class="rate"><a href="#" onclick="sortTable(\'rate\')">%</a></div></div>';
  statsTable.innerHTML = headerRow;

  for (let g = 0; g < data.length; g++) {
    const stat =
      '<div class="row"><div class="civname"><a href="/civhistory.html?civid=' +
      data[g].id +
      '&p1id=' +
      p1id +
      '">' +
      data[g].name +
      '</a></div><div class="played">' +
      data[g].played +
      '</div><div class="won">' +
      data[g].won +
      '</div><div class="rate">' +
      data[g].rate +
      '%</div></div>';
    statsTable.insertAdjacentHTML('beforeend', stat);
  }
}

async function onPageLoad() {
  if (!queryString) {
    p1id = '247224';
  }
  if (!p1id || !Number.isInteger(+p1id)) {
    console.log('hello! error here');
    window.alert('Need to enter Player ID from aoe2.net');
  } else {
    const { playerName, data } = await getSingleHistory(p1id);
    document.getElementById('playername').insertAdjacentHTML('afterbegin', playerName + ': ');
    const sortedData = sortList(data, 'played');
    makeChart(sortedData, p1id);
    renderHTML(sortedData);
    let gameCount = 0;
    for (let i = 0; i < data.length; i++) {
      gameCount += data[i].played;
    }
    document.getElementById('games').innerHTML = ' ' + gameCount;
  }
}

async function sortTable(sortItem) {
  const { playerName, data } = await getSingleHistory(p1id);
  let sortedData = sortList(data, sortItem);
  makeChart(sortedData, p1id);
  renderHTML(sortedData);
}

onPageLoad();
