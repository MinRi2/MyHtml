// 默认课头
const defaultHeadArray = [
    "早",
    "一", "二", "三", "四", "五",
    "午",
    "六", "七", "八",
    "晚一", "晚二", "晚三",
    "测"
];

// 默认课头开始时间表
const defaultHeadSch = [
    "7:10-7:25", // 早读
    "7:30-8:10", // 一
    "8:20-9:00", // 二
    "9:25-10:05", // 三
    "10:15-10:55", // 四
    "11:05-11:45", // 五
    "14:30-14:45", // 午
    "14:50-15:30", // 六
    "15:40-16:20", // 七
    "16:30-17:10", // 八
    "19:15-20:05", // 晚一
    "20:15-21:00", // 晚二
    "21:15-22:00", // 晚三
    "18:30-19:15", // 测
];

// 每日课表 没有课填空字符串
const dayCoursesArray = [
    [
        "", // 早读
        "", "物", "物", "语", "语", // 上午
        "", // 午读
        "", "", "", // 下午
        "化", "化", "物",// 晚自习
        "" // 周测
    ], // 周日
    [
        "英",
        "化", "生", "体", "英", "英",
        "听",
        "语", "数", "班",
        "英", "英", "生",
        "英"
    ], // 周一
    [
        "语",
        "物", "生", "信", "语", "语",
        "听",
        "英", "数", "数",
        "数", "数", "语",
        "数"
    ], // 周二
    [
        "英",
        "英", "英", "政", "体", "物",
        "英",
        "生", "语", "化",
        "化", "化", "物",
        "化"
    ], // 周三
    [
        "语",
        "语", "语", "物", "心", "数",
        "听",
        "通", "自", "化",
        "语", "语", "数",
        "语"
    ], // 周四
    [
        "英",
        "英", "物", "政", "数", "数",
        "英",
        "化", "生", "劳",
        "英", "生", "英",
        "生"
    ], // 周五
    [
        "英",
        "英", "英", "化", "物", "生",
        "政",
        "测", "数", "数",
        "", "", "",
        "物"
    ] // 周六
];

// 在这里修改课头结束时间
function specialHeadSchedule() {
    // 周一没有大课间
    const mondayHeadSchedule = daySchedules[1].headSchedule;
    mondayHeadSchedule[0].setTime("7:25", "7:40");
    mondayHeadSchedule[1].setTime("7:45", "8:25");
    mondayHeadSchedule[2].setTime("8:35", "9:15");

    const saturdayHeadSchedule = daySchedules[6].headSchedule;
    saturdayHeadSchedule[13].setTime("14:50", "15:30"); // 周六 第六节是周测时间

    // 周日高三课时安排
    const sundayHeadSchedule = daySchedules[0].headSchedule;
    sundayHeadSchedule[3].setTime("9:10", "9:50");
    sundayHeadSchedule[4].setTime("10:00", "10:40");
    sundayHeadSchedule[5].setTime("10:50", "11:30");
    sundayHeadSchedule[13].setTime("00:00", "00:00"); // 周日没有周测
}

function setEvents() {
    const today = new Date().getDay();
    const todaySchedule = daySchedules[today].headSchedule;
    const weekExamSchedule = todaySchedule[13];

    addEvents(
        new TimerEvent(1, "周测", weekExamSchedule.startTime, weekExamSchedule.endTime),
        new TimerEvent(0, "回校", null, "10/06 12:00"),
    );
}

// 调整成考试模式
function exam() {
    // 十月联考
    const mondaySchedule = daySchedules[1];
    mondaySchedule.headArray = [
        "8:00-10:30",
        "10:45-12:00",
        "15:00-17:00"
    ];

    mondaySchedule.headSchedule = TimeSchedule.timeArrayToTimeScheduleArray([
        "8:00-10:30",
        "10:45-12:00",
        "15:00-17:00"
    ]);

    mondaySchedule.courseArray = [
        "语",
        "物",
        "数"
    ];

    addEvents(
        new TimerEvent(0, "语文", "10/9 8:00", "10/9 10:30"),
        new TimerEvent(0, "物理", "10/9 10:45", "10/9 12:00"),
        new TimerEvent(0, "数学", "10/9 15:00", "10/9 17:00"),
    );

    const tuesdaySchedule = daySchedules[2];
    tuesdaySchedule.headArray = [
        "9:15-10:30",
        "10:45-12:00",
        "15:00-17:00"
    ];

    tuesdaySchedule.headSchedule = TimeSchedule.timeArrayToTimeScheduleArray([
        "9:15-10:30",
        "10:45-12:00",
        "15:00-17:00"
    ]);

    tuesdaySchedule.courseArray = [
        "化",
        "生",
        "英"
    ];

    addEvents(
        new TimerEvent(0, "化", "10/10 9:15", "10/10 10:30"),
        new TimerEvent(0, "生", "10/10 10:45", "10/10 12:00"),
        new TimerEvent(0, "英", "10/10 15:00", "10/10 17:00"),
    );

}

setCourses();
specialHeadSchedule();
setEvents();

if(withinTime("10/08", "10/11")){
    exam();
}

initCourses();
initTimer();

function setCourses() {
    for (let i = 0, len = daySchedules.length; i < len; i++) {
        const schedule = daySchedules[i];
        schedule.headArray = defaultHeadArray;
        schedule.headSchedule = TimeSchedule.timeArrayToTimeScheduleArray(defaultHeadSch);
        schedule.courseArray = dayCoursesArray[i];
    }
}