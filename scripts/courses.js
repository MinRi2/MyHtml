const nextDayTime = "21:15:00"; // 课表刷新时间
const weekStartDate = new Date(2023, 7, 28); // 开学第一周第一天的时间

// 课程阴影颜色
const colorMap = {
    语: "#ff0000",
    数: "#00c2ff",
    英: "#ff9900",

    物: "#c10ce9",
    化: "#00c2ff",
    生: "#8fde5d",
    政: "#cd5c5c",

    听: "#cd5c5c",

    体: "#ff9999",
    心: "#ff9999",
    信: "#ff9999",
    通: "#ff9999",
    劳: "#ff9999",

    班: "#f2a65e",
    跑: "#f2a65e",
    自: "#c10ce9",

    欢: "red",
    迎: "orange",
    各: "yellow",
    位: "green",
    家: "skyblue",
    长: "purple",

    测: "#996699",
};

const coursesFullName = {
    语: "语文",
    数: "数学",
    英: "英语",

    物: "物理",
    化: "化学",
    生: "生物",
    政: "政治",

    听: "听力",

    体: "体育",
    心: "心理",
    信: "信息与技术",
    通: "通用技术",
    劳: "劳动",

    班: "班会",
    跑: "跑操",
    自: "自习",

    测: "周测",
}

class DaySchedule {
    headArray;
    headSchedule;
    courseArray;

    /**
     * @param {string} dayName
     */
    constructor(dayName) {
        this.dayName = dayName;
    }
}

const daySchedules = [
    new DaySchedule("周日"),
    new DaySchedule("周一"),
    new DaySchedule("周二"),
    new DaySchedule("周三"),
    new DaySchedule("周四"),
    new DaySchedule("周五"),
    new DaySchedule("周六")
];

function initCourses() {
    const dayElem = document.querySelector("#day"),
        weekElem = document.querySelector("#week");
    const headRow = document.querySelector("#head-row"),
        courseRow = document.querySelector("#course-row");

    let today = 0;
    let courceDay = 0;
    let offsetDay = 0;

    let daySchedule = null;

    init();

    function init() {
        today = courceDay = getSchoolDate().getDay();

        dayElem.addEventListener("mousedown", event => {
            if (event.button == 0) {
                if (event.altKey) {
                    setCourseDay(today);
                } else if (event.ctrlKey) {
                    shiftCourseDay(-1);
                } else {
                    shiftCourseDay(1);
                }
            }
        });

        refresh();
        initUpdater();

        setInterval(refreshHead, 1000);
    }

    function initUpdater() {
        let endDate = toDate(nextDayTime);
        checkIntervalOrOver(endDate, nextDay, nextDay);

        // 新的一天
        setInterval(() => {
            let nowDate = getSchoolDate();
            if (today != nowDate.getDay()) {
                today = nowDate.getDay();
                setCourseDay(today);
            }
        }, 1000);

        function nextDay() {
            if (offsetDay != 0) return;
            shiftCourseDay(1);
        }
    }

    function refresh() {
        daySchedule = daySchedules[courceDay];

        rebuildTable();
        rebuildHeadRow();
        rebuildCourseRow();

        let dayText = daySchedule.dayName;
        animations.textChange(dayElem,
            () => dayElem.textContent == dayText,
            () => dayElem.textContent = dayText, {
            duration: 200,
        });

        let weekText = "第" + "<br><span>" + getCourseWeek() + "</span><br>" + "周";
        animations.textChange(weekElem,
            () => weekElem.innerHTML == weekText,
            () => weekElem.innerHTML = weekText, {
            duration: 1000,
        });
    }

    function refreshHead() {
        const children = headRow.children;

        const nowDate = getSchoolDate();

        const { headArray, headSchedule } = daySchedule;
        for (let i = 0, len = headArray.length; i < len; i++) {
            const child = children[i];
            const obj = headSchedule[i];

            let color = "white";
            if (offsetDay < 0) {
                color = "#a2a2a2";
            } else if (offsetDay == 0) {
                const startDate = obj.getStartDate(),
                    endDate = obj.getEndDate();

                if (nowDate > endDate) {
                    color = "#a2a2a2";
                } else if (nowDate > startDate) {
                    color = "#f7dC6f";
                }
            }

            child.style.color = color;
        }
    }

    function rebuildTable() {
        const { headArray, courseArray } = daySchedule;

        limmitChildren(headRow, headArray.length, (e, i) => {
            const th = document.createElement("th");
            e.appendChild(th);
        }, (e, i, child) => {
            e.removeChild(child);
        });

        limmitChildren(courseRow, courseArray.length, (e, i) => {
            const td = document.createElement("td");
            e.appendChild(td);
        }, (e, i, child) => {
            e.removeChild(child);
        });

        function limmitChildren(element, limmitLength, supplyHandler, overHandler) {
            const children = Array.from(element.children);
            const childrenLength = children.length;

            if (childrenLength == limmitLength) {
                return;
            }

            let start, end;
            let handler;

            if (childrenLength < limmitLength) {
                start = childrenLength;
                end = limmitLength;
                handler = supplyHandler;
            } else {
                start = limmitLength;
                end = childrenLength;
                handler = (element, i) => {
                    const child = children[i];
                    overHandler(element, i, child);
                };
            }

            for (let i = start; i < end; i++) {
                handler(element, i);
            }
        }
    }

    function rebuildHeadRow() {
        const children = headRow.children;

        const { headArray } = daySchedule;
        for (let i = 0; i < headArray.length; i++) {
            const head = headArray[i];
            const e = children[i];

            e.textContent = head;
        }
    }

    function rebuildCourseRow() {
        const children = courseRow.children;

        const { courseArray } = daySchedule;
        for (let i = 0; i < courseArray.length; i++) {
            const e = children[i];
            const oldCourse = e.textContent;

            let course = courseArray[i],
                textColor = "#a2a2a2",
                shadowColor = null;

            if (!isSelfStudy(course)) {
                textColor = "white";
                shadowColor = colorMap[course[0]];
            } else if (course.includes("*")) {
                course = course.replace("*", "");
            }

            animations.textChange(e, () => oldCourse == course, () => {
                e.textContent = course;
                e.style.color = textColor;
                e.style.textShadow = shadowColor ?
                    "0px 0px 10px " + shadowColor + "," +
                    "3px 3px 3px " + shadowColor : "";
            }, {}, {
                duration: 500,
                delay: i * 100,
            });
        }
    }

    function shiftCourseDay(n) {
        setCourseDay(courceDay + n);
    }

    function setCourseDay(newDay) {
        const max = daySchedules.length;

        courceDay = newDay;
        courceDay = courceDay < 0 ? (max - 1) : (courceDay >= max ? 0 : courceDay);

        offsetDay = (courceDay == 0 ? max + 1 : courceDay) - today;
        offsetDay = offsetDay > 7 ? 0 : offsetDay;

        refresh();
    }

    function isSelfStudy(cource) {
        if (cource[0] == "*") {
            return true;
        }

        if (getCourseWeek() % 2 == 0) { // 双周
            return cource == "心";
        }
    }

    function getCourseWeek() {
        const nowDate = getSchoolDate();
        const day = (nowDate - weekStartDate) / 1000 / 60 / 60 / 24;
        return Math.floor((day + offsetDay) / 7) + 1;
    }
}