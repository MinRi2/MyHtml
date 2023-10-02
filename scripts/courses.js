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
    
    测: "#996699",
};

class DaySchedule {
    headArray;
    headSchedule;
    courseArray;

    constructor(dayName) {
        this.dayName = dayName;
    }
}

class TimeSchedule {
    constructor(startTime, endTime) {
        this.startTime = startTime;
        this.endTime = endTime;
    }

    getStartDate() {
        return stringToDate(this.startTime);
    }

    getEndDate() {
        return stringToDate(this.endTime);
    }

    setTime(newStartTIme, newEndTime) {
        this.startTime = newStartTIme;
        this.endTime = newEndTime;
    }

    static timeArrayToTimeScheduleArray(array, timeSplit = "-") {
        let result = [];

        for (let i = 0; i < array.length; i++) {
            let time = array[i];

            let splitArray = time.split(timeSplit);
            let startTime = splitArray[0],
                endTime = splitArray[1];

            result.push(new TimeSchedule(startTime, endTime));
        }

        return result;
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
    const headRow = document.querySelector("#headRow"),
        courseRow = document.querySelector("#courseRow");
    const dayElem = document.createElement("td"),
        weekElem = document.createElement("td");

    dayElem.id = "day";
    weekElem.id = "week";

    var today = 0;
    var courceDay = 0;
    var offsetDay = 0;

    var daySchedule = null;

    init();

    function init() {
        today = courceDay = new Date().getDay();

        dayElem.rowSpan = "2";
        weekElem.rowSpan = "2";

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
        let endDate = stringToDate(nextDayTime);
        checkIntervalOrOver(endDate, nextDay, nextDay);

        // 新的一天
        setInterval(() => {
            let nowDate = new Date();
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

        rebuildHeadRow();
        rebuildCourseRow();

        let dayText = daySchedule.dayName;
        textChangeAnimation.change(
            dayElem,
            () => dayElem.textContent == dayText,
            () => dayElem.textContent = dayText,
        );
        
        let weekText = "第" + "<br><span>" + getCourseWeek() + "</span><br>" + "周";        
        textChangeAnimation.change(
            weekElem,
            () => weekElem.innerHTML == weekText,
            () => weekElem.innerHTML = weekText,
        );
    }

    function rebuildHeadRow() {        
        clearChildren(headRow);

        headRow.appendChild(dayElem);

        let { headArray } = daySchedule;
        for (let i = 0; i < headArray.length; i++) {
            let e = document.createElement("th");
            
            let head = headArray[i];
            
            e.textContent = head;

            headRow.appendChild(e);
        }

        headRow.appendChild(weekElem);
    }

    function refreshHead() {
        let children = headRow.getElementsByTagName("th");

        let nowDate = new Date();

        let { headArray, headSchedule } = daySchedule;
        for (let i = 0, len = headArray.length; i < len; i++) {
            let child = children[i];
            let obj = headSchedule[i];

            let color = "white";
            if (offsetDay < 0) {
                color = "#a2a2a2";
            } else if (offsetDay == 0) {
                let startDate = obj.getStartDate(),
                    endDate = obj.getEndDate();

                if (nowDate > endDate) {
                    color = "#a2a2a2"
                } else if (nowDate > startDate) {
                    color = "#f7dC6f";
                }
            }

            child.style.color = color;
        }
    }

    function rebuildCourseRow() {
        let oldChildren = [...courseRow.children];
        
        clearChildren(courseRow);

        const { courseArray } = daySchedule;

        for (let i = 0; i < courseArray.length; i++) {
            const e = document.createElement("td");
            
            courseRow.appendChild(e);
            
            let course = courseArray[i],
                textColor = "#a2a2a2",
                shadowColor = null;
            const oldCourse = i < oldChildren.length ? oldChildren[i].textContent : "";
            
            e.textContent = oldCourse;
            
            if (!isSelfStudy(course)) {
                if (course.includes("*")) {
                    course = course.replace("*", "");
                }
    
                textColor = "white";
                shadowColor = colorMap[course[0]];
            }
            
            textChangeAnimation.change(e, () => oldCourse == course, () => {
                e.textContent = course;
                e.style.color = textColor;
                
                if (shadowColor) {
                    e.style.textShadow = 
                        "0px 0px 10px " + shadowColor + "," + 
                        "3px 3px 3px " + shadowColor;
                }
            }, {
                duration: 500,
                delay: 100 * i,
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
        let nowDate = new Date();
        let day = (nowDate - weekStartDate) / 1000 / 60 / 60 / 24;
        return Math.floor((day + offsetDay) / 7) + 1;
    }

    function clearChildren(parent) {
        while (parent.hasChildNodes()) {
            parent.removeChild(parent.firstChild);
        }
    }
}