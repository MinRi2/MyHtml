/** 默认课头
* 这里是默认课头设置
* 课头也就是课程头上的东西 比如"早""一""二"
*/
const defaultHeadArray = [
    "早",
    "一", "二", "三", "四", "五",
    "午",
    "六", "七", "八",
    "课服",
    "晚一", "晚二", "晚三",
    "测"
];

/** $ 默认课头时间安排
* 这里是默认课头时间安排设置
* 设置时间安排后 课头会根据现在的时间变色 更直观的看出目前课头的状况 比如课程上完了变成灰色 课程正在上变成黄色
*/
const defaultHeadSchedule = [
    "7:05-7:25", // 早读
    "7:30-8:10", // 一
    "8:20-9:00", // 二
    "9:30-10:10", // 三
    "10:20-11:00", // 四
    "11:10-11:50", // 五
    "14:30-14:45", // 午
    "14:50-15:30", // 六
    "15:40-16:20", // 七
    "16:30-17:10", // 八
    "18:30-19:10", // 课服
    "19:30-20:10", // 晚一
    "20:20-21:05", // 晚二
    "21:15-22:00", // 晚三
    "19:30-20:10", // 测 (晚一周测)
];

/** $ 课程表
* 这里是课程表设置
* 课程与课头一一对应 如果没有课可以填空的字符串
* 如果课程前有* 可以表示这节课是自习 课程会变成灰色 比如 *语 *物
* 有一些课程按周安排 比如心理课单周上一次，双周自习 这样就需要到 "courses.js"里去给isSelfStudy()函数添加对应逻辑
*/
const dayCoursesArray = [
    [
        "", // 早读
        "", "数", "数", "自", "自", // 上午
        "", // 午读
        "", "", "", // 下午
        "", // 课服
        "化", "物", "物",// 晚自习
        "" // 周测
    ], // 周日
    [
        "英",
        "英", "数", "数", "体", "生",
        "听",
        "语", "化", "班",
        "英", // 2024/01/01
        "英", "英", "生",
        "英"
    ], // 周一
    [
        "语",
        "语", "语", "数", "物", "英",
        "听",
        "", "", "",
        "语",
        "数", "数", "语",
        "",
    ], // 周二
    [
        "英",
        "生", "自", "体", "英", "英",
        "英",
        "物", "化", "语",
        "物",
        "化", "化", "物",
        "物"
    ], // 周三
    [
        "语",
        "生", "化", "物", "语", "语",
        "听",
        "数", "数", "跑!",
        "数",
        "语", "语", "数",
        "数"
    ], // 周四
    [
        "英",
        "英", "英", "化", "数", "通",
        "英",
        "物", "生", "劳",
        "英",
        "英", "生", "英",
        "英"
    ], // 周五
    [
        "语",
        "数", "数", "生", "化", "物",
        "自",
        "测", "语", "语",
        "",
        "", "", "",
        "物"
    ] // 周六
];

// $ 每天的课条
const defaultCoursesBar = [
    ["晨练、早餐", "06:20-07:00", ""],
    ["晚间新闻", "19:15-19:30", ""],
    ["午餐", "11:50-12:30", "#EE7214"],
    ["体育活动、晚餐", "17:10-18:10", "#7BD3EA"],
    ["晚自习第四节", "22:10-22:40", "#7BD3EA"],
];
// $ 每天额外的课条
const extraCoursesBar = [
    [], // 周日
    [
        ["升旗仪式", "07:05-07:25", ""],
    ], // 周一
    [
        ["大课间", "09:00-09:30", ""],
    ], // 周二
    [
        ["大课间（课操）", "09:00-09:30", ""],
    ], // 周三
    [
        ["大课间", "09:00-09:30", ""],
    ], // 周四
    [
        ["大课间（课操）", "09:00-09:30", ""],
    ], // 周五
    [
        ["大课间", "09:00-09:30", ""],
    ] // 周六
];

initDynamicPaper();

function initDynamicPaper() {
    setDefaultSchedule();

    specialDay();

    // 等待一体机更新日期! 一体机可能时间的更新较迟 需要延迟初始化
    setTimeout(() => {
        setEvents();
        setBarSchedules();
    }, 0 * 1000);

    examSpecial();

    initCourses();
    initCoursesBar();
    initTimer();
}

function setDefaultSchedule() {
    for (let i = 0, len = daySchedules.length; i < len; i++) {
        const schedule = daySchedules[i];

        schedule.setSchedule({
            headArray: [...defaultHeadArray],
            courseArray: [...dayCoursesArray[i]],
            scheduleArray: [...defaultHeadSchedule],
        });

        // 周测在最后
        schedule.setOrder("测", Infinity);
    }
}

/** 特殊安排
* 一些课程需要特殊安排
*/
function specialDay() {
    const [
        sunSchedule,
        monSchedule,
        tueSchedule,
        wedSchedule,
        thuSchedule,
        friSchedule,
        satSchedule,
    ] = daySchedules;

    specialHeadSchedule();

    // $
    satSchedule.deleteCourses("课服");
    sunSchedule.deleteCourses("课服", "测");

    tueSchedule.deleteCourses("六", "七", "八", "测");
    tueSchedule.addCourse("15:00-17:00", "数学测试", "15:00-17:00");

    /** $ 特殊课头时间安排
    * 这里是特殊课堂时间安排的配置
    */
    function specialHeadSchedule() {
        // 周一没有大课间
        monSchedule.getSchedule("早").setTime("7:30", "7:45");
        monSchedule.getSchedule("一").setTime("7:50", "8:30");
        monSchedule.getSchedule("二").setTime("8:40", "9:20");

        satSchedule.getSchedule("测").setTime("14:50", "15:30"); // 周六 第六节是周测时间

        // 周日高三课时安排
        sunSchedule.getSchedule("三").setTime("9:10", "9:50");
        sunSchedule.getSchedule("四").setTime("10:00", "10:40");
        sunSchedule.getSchedule("五").setTime("10:50", "11:30");
        sunSchedule.getSchedule("测").setTime("00:00", "00:00"); // 周日没有周测
    }
}

/** $ 事件倒计时
* 这里是时间倒计时的配置
* 像下面那样可以给倒计时添加事件
* TimerEvent:
*   0: 表示事件的优先级 数字越小优先级越高
*   "示范""国庆": 表示事件的名字 会显示在倒计时上
*   "12:00"，null: 表示事件的开始时间 null表示没有开始时间
*   "14:00"，"10/01 12:00": 表示事件的结束时间
*/
function setEvents() {
    const today = getSchoolDate().getDay();
    const todaySchedule = daySchedules[today];

    const isWeekExam = true; // 12.20

    if (today == 2) {
        const { startTime, endTime } = todaySchedule.getCourse("15:00-17:00").schedule;

        addEvents(new TimerEvent(0, "数学测试", startTime, endTime));
    }

    const weekExamCourse = todaySchedule.getCourse("测");
    if (isWeekExam && weekExamCourse != null) {
        const examSubject = weekExamCourse.courseName[0];
        const { startTime, endTime } = weekExamCourse.schedule;

        addEvents(new TimerEvent(0, coursesFullNameMap[examSubject] + "周测", startTime, endTime, "", coursesColorMap[examSubject]));
    }

    addEvents(new TimerEvent(10, "期末考试", null, "2024/1/24 09:00", "", chroma.random()));
    // addEvents(new TimerEvent(0, "玛凯率", "8:14", "8:20", "描述", "green"));
}

function setBarSchedules() {
    const barSchedulesArray = [];

    const today = getSchoolDate().getDay();

    defaultCoursesBar.forEach(array => {
        barSchedulesArray.push(BarSchedule.arrayToBarSchedule(array));
    });

    extraCoursesBar[today].forEach(array => {
        barSchedulesArray.push(BarSchedule.arrayToBarSchedule(array));
    });

    const { courseArray } = daySchedules[today];
    for (let j = 0, len = courseArray.length; j < len; j++) {
        const { headName, courseName, schedule } = courseArray[j];

        if (courseName == "") {
            continue;
        }

        const subject = courseName[0];
        const { startTime, endTime } = schedule;

        let headFullName = headFullNameMap[headName],
            courseFullName = coursesFullNameMap[subject],
            courseColor = coursesColorMap[subject];

        headFullName = headFullName ? headFullName : headName;
        courseFullName = courseFullName ? courseFullName : subject;
        courseColor = courseColor ? courseColor : "white";

        barSchedulesArray.push(new BarSchedule(
            `${headFullName}: ${courseFullName}`,
            startTime, endTime,
            courseColor,
        ));
    }

    addBarSchedules(barSchedulesArray);
}

/** $ 考试模式
* 这里是考试模式的配置
* 本质上就是把课头当成考试时间 把课程当成考试科目
*/
function examSpecial() {
    const [
        sunSchedule,
        monSchedule,
        tueSchedule,
        wedSchedule,
        thuSchedule,
        friSchedule,
        satSchedule,
    ] = daySchedules;

    if (withinTime("2024/1/9", "2024/1/15 24:00")) {
        sunSchedule.deleteCourses("晚一", "晚二");
        sunSchedule.addCourse("19:45-21:00", "物理期模", "19:45-21:00");

        monSchedule.deleteCourses("晚一", "晚二", "晚三", "测");
        monSchedule.addCourse("20:00-22:00", "英语期模", "20:00-22:00");

        tueSchedule.getCourse("15:00-17:00").courseName = "数学期模";

        wedSchedule.deleteCourses("晚一", "晚二", "测");
        wedSchedule.addCourse("19:45-21:00", "化学期模", "19:45-21:00");

        thuSchedule.deleteCourses("晚一", "晚二", "晚三", "测");
        thuSchedule.addCourse("19:30-22:00", "语文期模", "19:45-22:00");

        friSchedule.deleteCourses("晚一", "晚二", "测");
        friSchedule.addCourse("19:45-21:00", "生物期模", "19:45-21:00");

        satSchedule.deleteCourses("测");
        satSchedule.setCourseName("六", "物");

        addEvents(
            new TimerEvent(0, "化学期末模拟", "1/10 19:45", "1/10 21:00", "", "#00c2ff"),
            new TimerEvent(0, "语文期末模拟", "1/11 19:30", "1/11 22:00", "", "#ff0000"),
            new TimerEvent(0, "生物期末模拟", "1/12 19:45", "1/12 21:00", "", "#8fde5d"),
            new TimerEvent(0, "物理期末模拟", "1/14 19:45", "1/14 21:00", "", "#c10ce9"),
            new TimerEvent(0, "英语期末模拟", "1/15 20:00", "1/15 22:00", "", "#ff9900"),
        );
    }
}