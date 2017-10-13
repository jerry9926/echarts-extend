require('../components/chart-extend/flowLines');
const echarts = require('echarts');
const continentJson = require('../geo/world-contury.geo');

echarts.registerMap('world', continentJson);

function getData(points) {
    const data = [];
    points.map((item, index) => {
        // todo for test
        // if (index > 0) return;
        const p2 = [item[0], item[1] + 45];
        const val = Math.ceil(Math.random() * 10000);
        // console.info(p2, val);
        data.push({
            coords: [item, p2],
            value: val
        })
    });

    return data;
}

function getDataByIndex(points, idx) {
    const data = [];
    points.map((item, index) => {
        // todo for test
        if (index % 3 !== idx) return;
        const p2 = [item[0], item[1] + 45];
        const val = Math.ceil(Math.random() * 10000);
        // console.info(p2, val);
        data.push({
            coords: [item, p2],
            value: val
        })
    });

    return data;
}

const points = [
    [121.4648,31.2891],
    [149.08,-35.15],
    [16.22,48.12],
    [49.56,40.29],
    [-77.20,25.05],
    [50.30,26.10],
    [90.26,23.43],
    [-59.30,13.05],
    [27.30,53.52],
    [4.21,50.51],
    [-88.30,17.18],
    [2.42,6.23],
    [89.45,27.31],
    [18.26,43.52],
    [-64.37,18.27],
    [115.00,4.52],
    [23.20,42.45],
    [-1.30,12.15],
    [29.18,-3.16],
    [104.55,11.33],
    [11.35,3.50],
    [-75.42,45.27],
    [-81.24,19.20],
    [18.35,4.23],
    [14.59,12.10],
    [116.20,39.55],
    [-74.00,4.34],
    [43.16,-11.40],
    [15.12,-4.09],
    [-84.02,9.55],
    [-5.17,6.49],
    [15.58,45.50],
    [-82.22,23.08],
    [33.25,35.10],
    [14.22,50.05],
    [125.30,39.09],
    [15.15,-4.20],
    [12.34,55.41],
    [42.20,11.08],
    [-61.24,15.20],
    [-69.59,18.30],
    [125.34,-8.29],
    [-78.35,-0.15],
    [31.14,30.01],
    [-89.10,13.40],
    [8.50,3.45],
    [38.55,15.19],
    [24.48,59.22],
    [38.42,9.02],
    [-59.51,-51.40],
    [-6.56,62.05],
    [178.30,-18.06],
    [25.03,60.15],
    [2.20,48.50],
    [-52.18,5.05],
    [9.26,0.25],
    [-16.40,13.28],
    [44.50,41.43],
    [13.25,52.30],
    [-0.06,5.35],
    [23.46,37.58],
    [-51.35,64.10],
    [-61.44,16.00],
    [-90.22,14.40],
    [-2.33,49.26],
    [-13.49,9.29],
    [-15.45,11.45],
    [-58.12,6.50],
    [-72.20,18.40],
    [-87.14,14.05],
    [19.05,47.29],
    [-21.57,64.10],
    [77.13,28.37],
    [106.49,-6.09],
    [51.30,35.44],
    [44.30,33.20],
];

function formatLabel(params) {
    var str = params.value || '';
    return str.toString().split('').join('\n');
}

function getSeries() {
    const series = [];
    for (let i = 0; i < 3; i++) {
        series.push({
            name: "FlowLines Demo",
            type: "flowLines",
            zlevel: 1,
            effect: {
                show: true,
                period: 6,
                trailLength: 0,
                color: "#fff",
                symbol: 'flowLines.text',
                fadeOut: true,
                bubbleIn: true,
                label: {
                    show: true,
                    textStyle: {
                        color: '#fff',
                        fontSize: 14,
                        textPosition: 'indexTop'
                    },
                    formatter: formatLabel
                }
            },
            lineStyle: {
                normal: {
                    color: "#fff",
                    width: 0,
                    // width: 1,
                    curveness: 0
                }
            },
            data: getDataByIndex(points, i)
        })
    }
    series[1].effect.period = 4;
    series[1].effect.label.textStyle.fontSize = 16;
    series[2].effect.period = 8;
    series[2].effect.label.textStyle.fontSize = 12;

    // console.info('series', series);

    return series;
}

const series = getSeries();

const myChart = echarts.init(document.getElementById('canvasWrap'));


const option = {
    backgroundColor: '#121347',
    title: [{
        text: '流量分布图',
        left: 'center',
        textStyle: {
            color: '#fff',
            fontSize: 16
        }
    }],
    geo: {
        map: 'world',
        itemStyle: {
            normal: {
                areaColor: '#0D5EAE',
                borderColor: '#45A2FF'
            },
            emphasis: {
                areaColor: '#0D5EAE'
            }
        },
        label: {
            emphasis: {
                show: false
            }
        },
        roam: false
    },
    series: series
};

myChart.setOption(option);
