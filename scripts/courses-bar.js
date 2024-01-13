class BarSchedule extends TimeSchedule {
    name;
    color;

    /**
     * 
     * @param {String} name 课条名称
     * @param {String} startTime 起始时间 
     * @param {String} endTime 结束时间
     * @param {String} color 颜色 留白会随机生成ss
     */
    constructor(name, startTime, endTime, color = "") {
        super(startTime, endTime);

        this.name = name;

        if (color == "") color = chroma.random();
        this.color = color;
    }

    /**
     * 将Array转为BarSchedule
     * Array: [name, timeSchedule(String), color(*"white")]
     * @param {Array} array 
     * @returns {BarSchedule}
     */
    static arrayToBarSchedule(array) {
        let [name, timeSchedule, color] = array;

        if (!color || color == "") color = chroma.random();
        timeSchedule = TimeSchedule.toTimeSchedule(timeSchedule);

        return new BarSchedule(name, timeSchedule.startTime, timeSchedule.endTime, color);
    }
}

const barSchedules = [];

/**
 * 添加BarSchedule
 * @param {Array<BarSchedule>} barScheduleArray 
 */
function addBarSchedules(barScheduleArray) {
    check();

    function check() {
        const nowDate = getSchoolDate();

        barScheduleArray = barScheduleArray.filter(b => b.getEndDate() - nowDate > 0);

        barSchedules.push(...barScheduleArray);
        barSchedules.sort((b1, b2) => {
            const d1 = b1.getStartDate(),
                d2 = b2.getStartDate();
            return d1 - d2;
        });
    }
}

function initCoursesBar() {
    const container = document.querySelector(".container_courses_bar"),
        barNameElem = document.querySelector(".bar #bar_name"),
        cutboxElem = document.querySelector(".bar_cutbox"),
        barScheduleElem = document.querySelector(".bar #time");
    const refreshTime = 3 * 1000;

    const cutboxMaxRadius = parseInt(getComputedStyle(container).width.replace("px", "")) * 2;

    var lastColor = chroma.random();
    var currentSchedule = null;

    refreshBar();
    setInterval(refreshBar, refreshTime);

    function refreshBar() {
        const nowDate = getSchoolDate();

        if (barSchedules.length == 0) {
            currentSchedule = null;
            setElemStyle("", "white", "", "");
        } else if (currentSchedule == null) {
            setCurrent(barSchedules[0]);
        } else {
            updateCutbox();

            const endDate = currentSchedule.getEndDate();

            if (endDate - nowDate < 0) {
                barSchedules.splice(0, 1);
                lastColor = currentSchedule.color;
                currentSchedule = null;
            }
        }

        function updateCutbox() {
            const startDate = currentSchedule.getStartDate(),
                endDate = currentSchedule.getEndDate();

            if (nowDate - startDate > 0) {
                const fract = (nowDate - startDate) / (endDate - startDate);
                cutboxElem.style.width = `${fract * cutboxMaxRadius}px`;
            }

            if (nowDate - startDate < 0 || endDate - nowDate < 0) {
                cutboxElem.style.width = "0px";
            }
        }

        function setCurrent(newSchedule) {
            currentSchedule = newSchedule;

            const { name, startTime, endTime, color } = currentSchedule;
            setElemStyle(name, color, startTime, endTime);
        }

        function setElemStyle(name, color, startTime, endTime) {
            const customTextChangeFrames = {
                filter: ["", "blur(8px) contrast(300%)"],
                transform: ["", ""],
            };

            const scheduleText = `${startTime}-${endTime}`;
            animations.textChange(barNameElem,
                () => barNameElem.innerHTML == name,
                () => {
                    barNameElem.style.setProperty("--text-shadow-color", color);
                    barNameElem.innerHTML = name
                }, customTextChangeFrames, {
                duration: 1000,
            });

            animations.textChange(barScheduleElem,
                () => barScheduleElem.innerHTML == scheduleText,
                () => barScheduleElem.innerHTML = scheduleText, customTextChangeFrames, {
                duration: 1000,
            });

            const colors = chroma.scale([lastColor, color]).mode("lab").colors(8);
            const colorsText = colors.join(",");
            cutboxElem.style.backgroundImage = `linear-gradient(to right, ${colorsText})`;
        }
    }
}