function initWeatherBoard() {
    const maxShow = 3;
    const textSize = 45, iconSize = textSize;

    const weatherBoard = document.querySelector('.container_weather_board')
    const lastUpdateElem = document.querySelector('#weather_last_updated');
    const showTypeElem = document.querySelector('#weather_show_type');

    const temperatureChart = echarts.init(document.querySelector('.weather_chart'));

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

    class WeatherType {
        static cityAdCode = 101301101;
        static hefengWeatherApi = 'https://devapi.qweather.com';

        name;
        data;

        constructor(name) {
            this.name = name;
        }

        async refreshData() {
            const { hefengWeatherApi, cityAdCode } = WeatherType;

            const response = await fetch(`${hefengWeatherApi}/v7/weather/${this.name}?key=${hefengKey}&location=${cityAdCode}`);

            this.data = await response.json();

            return this.data;
        }

        getOption() {
            return {};
        }

        _checkData() {
            if (this.data == undefined || this.data == null) {
                throw new Error(`The data of Weather ${this.name} isn't valid.`)
            }
        }
    }

    class DayWeather extends WeatherType {
        constructor() {
            super('24h');
        }

        getOption() {
            super._checkData();

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
                            formatter: (value) => {
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
                            formatter: (value) => {
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

    class WeekWeather extends WeatherType {
        constructor() {
            super('7d');
        }

        getOption() {
            super._checkData();

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
                            formatter: (value) => {
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
                            formatter: (value) => {
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

    const weatherType = {
        HOUR: new DayWeather(),
        WEEK: new WeekWeather(),
    }

    let showDataType = weatherType.HOUR;

    const option = {
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

                color: '#ca1f00',

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

                color: '#00809b',

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

                color: 'blue',
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

    temperatureChart.setOption(option);

    showTypeElem.textContent = showDataType;

    const hideAnimation = weatherBoard.animate({
        offset: [0, 1.0],
        transform: ['', 'translate(0, 110%)']
    }, {
        duration: 1000,
        fill: 'both',
        easing: 'ease-in-out',
    });
    hideAnimation.pause();

    globalThis.Weather = {
        shown: true,
        hide: function () {
            if (!this.shown) {
                return;
            }

            this.shown = false;

            hideAnimation.playbackRate = 1;
            hideAnimation.play();
        },
        show: async function () {
            if (this.shown) {
                return;
            }

            this.shown = true;

            hideAnimation.playbackRate = -1;
            hideAnimation.play();

            refreshChart();
        },
        toggle: function () {
            if (this.shown) {
                this.hide();
            } else {
                this.show();
            }
        },
        showHour: function () {
            changeDataType(weatherType.HOUR);
        },
        showWeek: function () {
            changeDataType(weatherType.WEEK);
        },
    }

    setInterval(() => {
        if (!globalThis.Weather.shown) {
            return;
        }

        moveChart();
    }, 10000);

    window.onresize = temperatureChart.resize;

    function changeDataType(newType) {
        showDataType = newType;

        showTypeElem.textContent = showDataType.name;

        refreshChart();
    }

    let lastEndValue = -1;
    function moveChart() {
        const { dataZoom } = temperatureChart.getOption();

        let { startValue, endValue } = dataZoom[0];

        if (lastEndValue == endValue) {
            startValue = 0;
            endValue = maxShow;
        } else {
            lastEndValue = endValue;

            startValue++;
            endValue++;
        }

        temperatureChart.setOption({
            dataZoom: [
                {
                    startValue: startValue,
                    endValue: endValue,
                }
            ]
        });
    }

    function refreshChart() {
        temperatureChart.showLoading();

        const type = showDataType;

        type.refreshData().then(() => {
            // 异步间存在修改 不做表格修改
            if (showDataType != type) return;

            temperatureChart.setOption(type.getOption());

            temperatureChart.hideLoading();
            lastUpdateElem.textContent = getSchoolDate().toLocaleString();
        });
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
    function collectData(originalData, dimensions) {
        if (!(originalData instanceof Array)) {
            originalData = [originalData];
        }

        const result = [];

        result.push(dimensions);

        originalData.forEach(data => {
            const item = [];

            dimensions.forEach(dimension => {
                item.push(data[dimension]);
            });

            result.push(item);
        })

        return result;
    }

    /**
     * 获取纵向二维数据集某一维度项目
     * @param {Array<Arrary>} dataest 
     * @param {String} dimension 
     */
    function getItems(dataest, dimension) {
        const dimensions = dataest[0];
        const itemIndex = dimensions.indexOf(dimension);

        const result = [];

        dataest.forEach((items, index) => {
            if (index == 0) {
                return;
            }

            result.push(items[itemIndex]);
        })

        return result;
    }
    /**
     * 把图标id数组转换为Echarts文本样式
     * @param {Array} iconIdArray 图标id
     */
    function createWeatherIconRich(iconIdArray, consumer) {
        const rich = {};

        iconIdArray.forEach(id => {
            const textStyle = {
                backgroundColor: {
                    image: `${iconPath}/${id}.svg`
                },
            }

            if (typeof consumer == 'function') {
                consumer(textStyle, id);
            }

            rich[id] = textStyle;
        });

        return rich;
    }

    async function getWeatherData(dataType) {
        let result = {};

        await fetch(`${hefengWeatherApi}/v7/weather/${dataType}?key=${hefengKey}&location=${cityAdCode}`).then(response => {
            result = response.json();
        });

        return result;
    }
}