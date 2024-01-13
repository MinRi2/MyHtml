class DaySchedule {
    courseArray = [];

    /**
     * @param {string} dayName
     */
    constructor(dayName) {
        this.dayName = dayName;
    }

    /**
     * 设置课程名称
     * @param {String} headName 课头名称
     * @param {String} newCourseName 新课程名称
     */
    setCourseName(headName, newCourseName) {
        const course = this.getCourse(headName);
        course.courseName = newCourseName;
    }

    /**
     * 设置课程优先级
     * @param {String} headName 课头名称 
     * @param {Number} order 顺序 越小优先级越大
     */
    setOrder(headName, order) {
        const course = this.getCourse(headName);
        course.order = order;
        this.sortArray();
    }

    /**
     * 根据课头获取课程的名称
     * @param {String} headName 课头名称
     * @returns {String}
     */
    getCourseName(headName) {
        return this.getCourse(headName).courseName;
    }

    /**
     * 根据课头直接获取课程时间安排
     * @param {String} headName 课头名称
     * @returns {TimeSchedule}
     */
    getSchedule(headName) {
        return this.getCourse(headName).schedule;
    }

    /**
     * 根据课头获取课程
     * @param {String} headName 课头名称
     * @returns {Course}
     */
    getCourse(headName) {
        const course = this.courseArray.find(c => c.headName == headName);

        if (course == null) {
            console.error(`Cannot find course by headName: ${headName}`);
            return null;
        }

        return course;
    }

    /**
     * 添加课程
     * @param {String} headName 课头名称
     * @param {String} courseName 课程名称
     * @param {String, TimeSchedule} schedule 时间安排 
     */
    addCourse(headName, courseName, schedule) {
        const course = new Course(headName, courseName, schedule);

        this.courseArray.push(course);
        this.sortArray();
    }

    /**
     * 根据课头删除课程
     * @param  {...String} headNameArray 课头名称数组
     */
    deleteCourses(...headNameArray) {
        for (let i = 0, len = headNameArray.length; i < len; i++) {
            const headName = headNameArray[i];

            const index = this.courseArray.findIndex(c => c.headName == headName);
            this.courseArray.splice(index, 1);
        }
    }

    /**
     * (Private) 排序
     */
    sortArray() {
        this.courseArray.sort((c1, c2) => {
            if (c1.order == c2.order) {
                const d1 = c1.schedule.getStartDate(),
                    d2 = c2.schedule.getStartDate();
                return d1 - d2;
            } else {
                return c1.order - c2.order;
            }
        });
    }

    /**
     * 
     * @param {Array<String>, Array<String>, Array<String, TimeSchedule>} param0 
     */
    setSchedule({ headArray, courseArray, scheduleArray }) {
        const length = headArray.length;

        if (length != courseArray.length || length != scheduleArray.length) {
            throw new Error(`
            The length of arrays is not the same! Check your array's length. More infomation: 
            headArray's length: ${headArray.length}
            scheduleArray's length:${scheduleArray.length}
            `);
        }

        for (let i = 0; i < length; i++) {
            const headName = headArray[i],
                courseName = courseArray[i],
                schedule = scheduleArray[i];

            const course = new Course(headName, courseName, schedule);

            this.courseArray.push(course);
        }

        this.sortArray();
    }
}

class Course {
    order = 0;

    /**
     * 
     * @param {String} headName 课头名称 
     * @param {String} courseName 课程名称
     * @param {String, TimeSchedule} schedule 时间安排
     */
    constructor(headName, courseName, schedule) {
        this.headName = headName;
        this.courseName = courseName;
        this.schedule = TimeSchedule.toTimeSchedule(schedule);
    }

    /**
     * 可传递数组或参数
     * @returns {Course}
     */
    static toCourse() {
        let array = arguments[0];
        if (!array instanceof Array) {
            if (arguments.length != 3) {
                throw new Error("The number of arguments is wrong. Check your input arguments!(3 args are needed)");
            }

            array = arguments;
        }

        const [headName, courseName, schedule] = array;
        return new Course(headName, courseName, schedule);
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

        let weekText = "第" + "<br><span>" + getSchoolWeek(offsetDay) + "</span><br>" + "周";
        animations.textChange(weekElem,
            () => weekElem.innerHTML == weekText,
            () => weekElem.innerHTML = weekText, {
            duration: 1000,
        });
    }

    function refreshHead() {
        const children = headRow.children;

        const nowDate = getSchoolDate();

        const { courseArray } = daySchedule;

        for (let i = 0, len = courseArray.length; i < len; i++) {
            const child = children[i];

            const { schedule } = courseArray[i];

            let color = "white";
            if (offsetDay < 0) {
                color = "#a2a2a2";
            } else if (offsetDay == 0) {
                const startDate = schedule.getStartDate(),
                    endDate = schedule.getEndDate();

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
        const { courseArray } = daySchedule;

        limmitChildren(headRow, courseArray.length, (e, i) => {
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

        const { courseArray } = daySchedule;
        for (let i = 0; i < courseArray.length; i++) {
            const { headName } = courseArray[i];
            const e = children[i];

            e.textContent = headName;
        }
    }

    function rebuildCourseRow() {
        const children = courseRow.children;

        const { courseArray } = daySchedule;
        for (let i = 0; i < courseArray.length; i++) {
            const e = children[i];

            let { courseName } = courseArray[i],
                textColor = "#a2a2a2",
                shadowColor = null;
            if (!isSelfStudy(courseName)) {
                textColor = "white";
                shadowColor = coursesColorMap[courseName[0]];
            } else if (courseName.includes("*")) {
                courseName = courseName.replace("*", "");
            }

            animations.textChange(e, () => false, () => {
                e.textContent = courseName;
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
    }
}