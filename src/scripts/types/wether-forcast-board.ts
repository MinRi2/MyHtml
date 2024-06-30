import { getSchoolDate, dayStringMap, dateToString } from "../utils/dateUtils";
import { stringObj } from "../utils/typeUtils";
import * as echarts from 'echarts';

type WeatherData = stringObj;
type WeatherTypeName = '24h' | '7d';

const cityAdCode = 101301101;
const hefengWeatherApi = 'https://devapi.qweather.com';

const maxShow = 3;
const textSize = 25, iconSize = textSize * 2;
const iconPath = "./images/weather"
const weatherIconIds = [
    100, 101, 102, 103, 104, 150, 151, 152, 153,
    300, 301, 302, 303, 304, 305, 306, 307, 308, 309, 310, 311, 312, 313, 314, 315, 316, 317, 318, 350, 351, 399,
    400, 401, 402, 403, 404, 405, 406, 407, 408, 409, 410, 456, 457, 499,
    500, 501, 502, 503, 504, 507, 508, 509, 510, 511, 512, 513, 514, 515,
    900, 901, 999,
];

const weatherIconRich = createWeatherIconRich(weatherIconIds, (style, id) => {
    style.height = iconSize;
});

const option: echarts.EChartOption = {
    legend: {
        data: [{ name: '最高气温' }, { name: '最低气温' }, { name: '相对湿度' }],
    },
    tooltip: {
        show: true,
        trigger: 'axis',
    },
    textStyle: {
        color: '#330033'
    },
    color: ['#ca1f00', '#00809b', 'blue'],
    grid: {
        show: true,
        top: 55 + iconSize + textSize * 3.5,
    },
    dataZoom: [
        {
            type: 'inside',
            xAxisIndex: [0, 1, 2, 3, 4, 5, 6, 7],
            startValue: 0,
            endValue: maxShow,
        },
    ],
    xAxis: [
        {
            /** 时间1 */
            position: 'top',
            offset: 55 + iconSize + textSize * 1.5,

            type: 'category',
            boundaryGap: false,
            axisLine: {
                show: false,
                onZero: true,
            },
            axisTick: { show: false },

            axisLabel: {
                interval: 0,
                fontSize: textSize,
            },
        },
        {
            /** 时间2 */
            position: 'top',
            offset: 40 + iconSize + textSize * 0.7,

            type: 'category',
            boundaryGap: false,
            axisLine: {
                show: false,
                onZero: true,
            },
            axisTick: { show: false },

            axisLabel: {
                interval: 0,
                fontSize: textSize * 0.9,
            },
        },
        {
            /** 白天天气图标 */
            position: 'top',
            offset: 40 + textSize * 0.7,

            type: 'category',
            boundaryGap: false,
            axisLine: {
                show: false,
                onZero: true,
            },
            axisTick: { show: false },
            axisLabel: {
                interval: 0,
                formatter: '{{value}|}',
                rich: weatherIconRich,
            },
        },
        {
            /** 白天风向 */
            position: 'top',
            offset: 35,

            type: 'category',
            boundaryGap: false,
            axisLine: {
                show: false,
                onZero: true,
            },
            axisTick: { show: false },
            axisLabel: {
                interval: 0,
                fontSize: textSize * 0.7,
            },
        },
        {
            /** 晚上天气图标 */
            position: 'bottom',
            offset: 5,

            type: 'category',
            boundaryGap: false,
            axisLine: {
                show: false,
                onZero: true,
            },
            axisTick: { show: false },
            axisLabel: {
                interval: 0,
                formatter: '{{value}|}',
                rich: weatherIconRich,
            },
        },
        {
            /** 晚上风向 */
            position: 'bottom',
            offset: 15 + iconSize,

            type: 'category',
            boundaryGap: false,
            axisLine: {
                show: false,
                onZero: true,
            },
            axisTick: { show: false },
            axisLabel: {
                interval: 0,
                fontSize: textSize * 0.7,
            },
        },
    ],
    yAxis: [
        {
            type: 'value',
            name: '气温',

            show: false,

            min: function (value) {
                return value.min - 3;
            },
            max: function (value) {
                return value.max + 3;
            },
        },
        {
            type: 'value',
            name: '相对湿度',

            show: false,

            min: 0,
            max: 100,
        }
    ],
    series: [
        {
            type: 'line',
            name: '最高气温',

            smooth: true,

            symbolSize: 10,
            label: {
                show: true,
                position: 'bottom',
                fontSize: textSize,
                color: '#ffab36',
                textBorderColor: 'black',
                textBorderWidth: 4,
            },
            areaStyle: {
                color: {
                    type: 'linear',
                    global: false,
                    x: 0,
                    y: 0,
                    x2: 0,
                    y2: 1,
                    colorStops: [{
                        offset: 0, color: '#ffab36'
                    }, {
                        offset: 1, color: '#330033'
                    }],
                },
            },

            encode: {
                x: 'fxDate',
                y: 'tempMax',
                tooltip: ['tempMax'],
            }
        },
        {
            type: 'line',
            name: '最低气温',

            smooth: true,

            symbolSize: 10,
            label: {
                show: true,
                position: 'bottom',
                fontSize: textSize,
                color: '#61e2ff',
                textBorderColor: 'black',
                textBorderWidth: 4,
            },
            areaStyle: {
                color: {
                    type: 'linear',
                    global: false,
                    x: 0,
                    y: 0,
                    x2: 0,
                    y2: 1,
                    colorStops: [{
                        offset: 0, color: '#61e2ff' // 0% 处的颜色
                    }, {
                        offset: 1, color: '#330033' // 100% 处的颜色
                    }],
                },
            },

            encode: {
                x: 'fxDate',
                y: 'tempMin',
                tooltip: ['tempMin'],
            }
        },
        {
            type: 'line',
            name: '相对湿度',

            smooth: true,
            symbolSize: 10,
            label: {
                show: true,
                position: 'top',
                fontSize: textSize * 0.5,
            },

            yAxisIndex: 1,

            encode: {
                x: 'fxDate',
                y: 'humidity',
                tooltip: ['humidity'],
            }
        }
    ],
};

class WeatherChartType<DataType extends object> {
    data: DataType;

    constructor(public name: WeatherTypeName) {
        this.name = name;
    }

    async refreshData(hefengKey: string) {
        console.log(`${hefengWeatherApi}/v7/weather/${this.name}?key=${hefengKey}&location=${cityAdCode}`)
        const response = await fetch(`${hefengWeatherApi}/v7/weather/${this.name}?key=${hefengKey}&location=${cityAdCode}`);

        this.data = await response.json();

        return this.data;
    }

    getOption(): echarts.EChartOption {
        return {};
    }

    protected checkData() {
        if (this.data == undefined || this.data == null) {
            throw new Error(`The data of Weather ${this.name} isn't valid.`)
        }
    }
}

class DayWeather extends WeatherChartType<{ hourly: WeatherData[] }> {
    constructor() {
        super('24h');
    }

    getOption() {
        super.checkData();

        const dataset = collectData(this.data.hourly, [
            'fxTime', 'temp', 'humidity',
            'icon', 'windDir', 'windScale',
        ]);

        return {
            grid: {
                bottom: 0,
            },
            dataset: {
                source: dataset
            },
            xAxis: [
                {
                    /** 星期 */
                    data: getItems(dataset, 'fxTime'),
                    axisLabel: {
                        formatter: (value: string | number | Date) => {
                            // cache?
                            const nowDate = getSchoolDate();
                            const date = new Date(value);

                            const weekText = dayStringMap[date.getDay()];

                            if (date.getMonth() == nowDate.getMonth() && date.getDate() == nowDate.getDate()) {
                                return `{today|${weekText}}`
                            }

                            return weekText;
                        },

                        rich: {
                            today: {
                                color: '#CC3333',
                                fontSize: textSize,
                            },
                        },
                    },
                },
                {
                    /** 时间 */
                    data: getItems(dataset, 'fxTime'),
                    axisLabel: {
                        formatter: (value: string | number | Date) => {
                            const date = new Date(value);

                            return dateToString(date, {
                                year: false,
                                month: false,
                                day: false,
                            });
                        },
                    },
                },
                {
                    /** 白天天气图标 */
                    data: getItems(dataset, 'icon'),
                },
                {
                    /** 白天风向 */
                    data: getItems(dataset, 'windDir'),
                },
                {
                    /** 晚上天气图标 */
                    show: false,
                },
                {
                    /** 晚上风向 */
                    show: false,
                },
            ]
        }
    }
}

class WeekWeather extends WeatherChartType<{ daily: WeatherData[] }> {
    constructor() {
        super('7d');
    }

    getOption() {
        super.checkData();

        const dataset = collectData(this.data.daily, [
            'fxDate', 'tempMax', 'tempMin', 'humidity',
            'iconDay', 'windDirDay', 'windScaleDay',
            'iconNight', 'windDirNight', 'windScaleNight',
        ]);

        return {
            grid: {
                bottom: 25 + iconSize + textSize * 0.7,
            },
            dataset: {
                source: dataset
            },
            xAxis: [
                {
                    /** 日期 */
                    data: getItems(dataset, 'fxDate'),
                    axisLabel: {
                        formatter: (value: string | number | Date) => {
                            // cache?
                            const nowDate = getSchoolDate();
                            const date = new Date(value);
                            if (date.getMonth() == nowDate.getMonth() && date.getDate() == nowDate.getDate()) {
                                return '{today|今天}'
                            }
                            return `${date.getMonth() + 1}月${date.getDate()}日`
                        },

                        rich: {
                            today: {
                                color: '#CC3333',
                                fontSize: textSize,
                            },
                        },
                    },
                },
                {
                    /** 星期 */
                    data: getItems(dataset, 'fxDate'),
                    axisLabel: {
                        formatter: (value: string | number | Date) => {
                            const date = new Date(value);
                            return dayStringMap[date.getDay()];
                        },
                    },
                },
                {
                    /** 白天天气图标 */
                    data: getItems(dataset, 'iconDay'),
                },
                {
                    /** 白天风向 */
                    data: getItems(dataset, 'windDirDay'),
                },
                {
                    /** 晚上天气图标 */
                    show: true,
                    data: getItems(dataset, 'iconNight'),
                },
                {
                    /** 晚上风向 */
                    show: true,
                    data: getItems(dataset, 'windDirNight'),
                },
            ]
        }
    }
}

class WeatherChart {
    private chart: echarts.ECharts;
    private lastEndValue = -1;

    public hefengKey: string;
    public showDataType: WeatherChartType<any> = weatherChartType['24h'];

    public mount(element: HTMLDivElement) {
        this.chart = echarts.init(element);
        this.chart.setOption(option);

        window.addEventListener("resize", () => {
            this.chart.resize();
        });
    }

    public moveChart() {
        const { dataZoom } = this.chart.getOption();

        let zoom = dataZoom![0];

        let startValue: number = zoom.startValue as number;
        let endValue: number = zoom.endValue as number;

        if (this.lastEndValue == endValue) {
            startValue = 0;
            endValue = maxShow;
        } else {
            this.lastEndValue = endValue as number;

            startValue++;
            endValue++;
        }

        this.chart.setOption({
            dataZoom: [
                {
                    startValue: startValue,
                    endValue: endValue,
                }
            ]
        });
    }

    public async refreshChart() {
        if (!this.hefengKey) {
            return;
        }

        this.chart.showLoading();

        const type = this.showDataType;

        await type.refreshData(this.hefengKey);

        // 异步间存在修改 不做表格修改
        if (this.showDataType != type) return;

        this.chart.setOption(type.getOption());

        this.chart.hideLoading();
    }

    public async changeChartType(newType: WeatherChartType<any>) {
        this.showDataType = newType;

        return this.refreshChart();
    }
}

const weatherChartType: {
    [K in WeatherTypeName]: WeatherChartType<any>
} = {
    '24h': new DayWeather(),
    '7d': new WeekWeather(),
}

/**
 * 给定数据、维度将数据转换为纵向二维数据集
 * 例如:
 * collectData([{
 *  "Name": "LiHua"
 *  "Age": 17,
 *  "Job": "student", 
 * }, {
 *  "Name": "ZhangSan"
 *  "Age": 23,
 *  "Job": "programmer"
 * }], ["Name", "Age", "Job"])
 * 将返回
 * [
 *  ["Name", "Age", "Job"],
 *  ["LiHua", 17, "student"],
 *  ["ZhangSan", 23, "programmer"]
 * ]
 * @param {Array, Object} originalData 原始数据
 * @param {Array} dimensions 数据处理维度
 * @returns {Array} 处理后的纵向二维数据集
 */
function collectData(
    originalData: stringObj[],
    dimensions: string[]
) {
    const result: any[][] = [];

    result.push(dimensions);

    originalData.forEach(data => {
        const items: any[] = [];

        dimensions.forEach(dimension => {
            const item = data[dimension];
            items.push(item);
        });

        result.push(items);
    })

    return result;
}

/**
 * 获取纵向二维数据集某一维度项目
 * @param {Array<Arrary>} dataest 
 * @param {String} dimension 
 */
function getItems(dataest: any[], dimension: string) {
    const dimensions = dataest[0];
    const itemIndex = dimensions.indexOf(dimension);

    const result: any[] = [];

    dataest.forEach((items, index) => {
        if (index == 0) {
            return;
        }

        const item = items[itemIndex];

        result.push(item);
    })

    return result;
}

/**
 * 把图标id数组转换为Echarts文本样式
 * @param {Array} iconIdArray 图标id
 */
function createWeatherIconRich(
    iconIdArray: number[],
    consumer: (style: echarts.EChartOption.TextStyle, id: number) => void = null,
) {
    const rich: echarts.EChartOption.RichStyle = {};

    iconIdArray.forEach(id => {
        const textStyle: echarts.EChartOption.TextStyle = {
            backgroundColor: {
                image: `${iconPath}/${id}.svg`
            },
        }

        if (consumer != null) {
            consumer(textStyle, id);
        }

        rich["" + id] = textStyle;
    });

    return rich;
}

export { weatherChartType };
export { WeatherTypeName, WeatherChart };