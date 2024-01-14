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
        this.#sortArray();
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
            console.error(`${this.dayName} don't have a course whose headName is: ${headName}`);
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
        this.#sortArray();
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
    #sortArray() {
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

        this.#sortArray();
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

        limitRow();
        rebuildRow();

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

    function limitRow() {
        const headRowChildren = Array.from(headRow.children),
            courseRowChildren = Array.from(courseRow.children);

        const headLength = headRowChildren.length,
            courseLength = courseRowChildren.length;

        if (headLength != courseLength) {
            throw new Error(`The one-to-one relation between headRow and courseRow is broken. More infomation:
            headRow's length: ${headLength}
            courseRow's length: ${courseLength}`);
        }

        const { courseArray } = daySchedule;
        const limitLength = courseArray.length;

        const childrenLength = headLength;
        if (childrenLength == limitLength) {
            return;
        }

        let start, end;
        let handler;

        if (childrenLength < limitLength) {
            start = childrenLength;
            end = limitLength;
            handler = () => {
                const th = document.createElement("th");
                headRow.appendChild(th);

                const td = document.createElement("td");
                courseRow.appendChild(td);
            }
        } else {
            start = limitLength;
            end = childrenLength;
            handler = (headChild, courseChild) => {
                headRow.removeChild(headChild);
                courseRow.removeChild(courseChild);
            }
        }

        for (let i = start; i < end; i++) {
            const headChild = headRowChildren[i],
                courseChild = courseRowChildren[i];
            handler(headChild, courseChild);
        }
    }

    function rebuildRow() {
        const headRowChildren = Array.from(headRow.children),
            courseRowChildren = Array.from(courseRow.children);

        const { courseArray } = daySchedule;
        for (let i = 0; i < courseArray.length; i++) {
            const { headName, courseName } = courseArray[i];
            const headChild = headRowChildren[i],
                courseChild = courseRowChildren[i];

            //#region 重构课头行
            headChild.textContent = headName;
            //#endregion

            //#region 重构课程行
            let textColor = "#a2a2a2",
                shadowColor = null;
            if (!isSelfStudy(courseName)) {
                textColor = "white";
                shadowColor = coursesColorMap[courseName[0]];
            } else if (courseName.includes("*")) {
                courseName = courseName.replace("*", "");
            }

            animations.textChange(courseChild, () => false, () => {
                courseChild.textContent = courseName;
                courseChild.style.color = textColor;
                courseChild.style.textShadow = shadowColor ?
                    "0px 0px 10px " + shadowColor + "," +
                    "3px 3px 3px " + shadowColor : "";
            }, {}, {
                duration: 500,
                delay: i * 100,
            });
            //#endregion
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