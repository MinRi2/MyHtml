/** 控制示例
* 这里是控制示例 
* 由于隐私问题 我把我的控制文件删除了 这里只是作为一个范例
* 你需要把此文件的 -example 后缀删除才能生效
*/

/** 默认课头
* 这里是默认课头设置
* 课头也就是课程头上的东西 比如"早""一""二"
* "默认"就代表 每天的课头都可以单独设置
* 单独设置在下面
*/
const defaultHeadArray = [
    "早",
    "一", "二", "三", "四", "五",
    "午",
    "六", "七", "八",
    "晚一", "晚二", "晚三",
];

/** 默认课头时间安排
* 这里是默认课头时间安排设置
* 设置时间安排后 课头会根据现在的时间变色 更直观的看出目前课头的状况 比如课程上完了变成灰色 课程正在上变成黄色
* 单独设置在下面
*/
const defaultHeadSch = [
    "00:00-3:00", // 早读
    "7:00-8:00", // 一
    "8:00-9:00", // 二
    "9:00-10:00", // 三
    "10:00-10:00", // 四
    "11:00-11:00", // 五
    "14:00-14:00", // 午
    "14:00-15:00", // 六
    "15:00-16:00", // 七
    "16:00-17:00", // 八
    "19:00-20:00", // 晚一
    "20:00-21:00", // 晚二
    "21:00-22:00", // 晚三
    "18:00-19:00", // 周测
];

/** 课程表
* 这里是课程表设置
* 课程与课头一一对应 如果没有课可以填空的字符串
* 课程阴影颜色可以到"courses.js"去改
* 如果课程前有* 可以表示这节课是自习 课程会变成灰色 比如 *语 *物
* 有一些课程按周安排 比如心理课单周上一次，双周自习 这样就得到 "courses.js"里去给isSelfStudy()函数添加对应逻辑
*/
const dayCoursesArray = [
    [
        "英", // 早读
        "语", "数", "英", "物", "化", // 上午
        "生", // 午读
        "政", "史", "地", // 下午
        "语", "数", "英",// 晚自习
        "英", // 周测
    ], // 周日
    [
        "语",
        "语", "语", "语", "语", "语",
        "语",
        "语", "语", "班",
        "语", "语", "语",
        "语"
    ], // 周一
    [
        "数",
        "数", "数", "数", "数", "数",
        "听",
        "数", "数", "数",
        "数", "数", "数",
        "数"
    ], // 周二
    [
        "英",
        "英", "英", "英", "英", "英",
        "英",
        "英", "英", "英",
        "英", "英", "英",
        "英"
    ], // 周三
    [
        "物",
        "物", "物", "物", "物", "物",
        "物",
        "物", "物", "物",
        "物", "物", "物",
        "物"
    ], // 周四
    [
        "化",
        "化", "化", "化", "化", "化",
        "化",
        "化", "化", "化",
        "化", "化", "化",
        "化"
    ], // 周五
    [
        "生",
        "生", "生", "生", "生", "生",
        "生",
        "生", "生", "生",
        "生", "生", "生",
        "生"
    ] // 周六
];

/** 特殊课头时间安排
* 这里是特殊课堂时间安排的配置
*/
function specialHeadSchedule() {
    // 周一没有大课间
    const mondayHeadSchedule = daySchedules[1].headSchedule;
    mondayHeadSchedule[0].setTime("7:15", "7:40");
    mondayHeadSchedule[1].setTime("7:40", "8:25");
    mondayHeadSchedule[2].setTime("8:55", "9:15");

    // 周日课时安排特殊
    const sundayHeadSchedule = daySchedules[0].headSchedule;
    sundayHeadSchedule[3].setTime("9:00", "9:50");
    sundayHeadSchedule[4].setTime("10:40", "10:50");
    sundayHeadSchedule[5].setTime("10:10", "11:30");
}

/** 事件倒计时
* 这里是时间倒计时的配置
* 像下面那样可以给倒计时添加事件
* TimerEvent:
*   0: 表示事件的优先级 数字越小优先级越高
*   "示范""国庆": 表示事件的名字 会显示在倒计时上
*   "12:00"，null: 表示事件的开始时间 null表示没有开始时间
*   "14:00"，"10/01 12:00": 表示事件的结束时间
*/
function setEvents() {
    addEvents(
        new TimerEvent(0, "示范", "12:00", "14:00"),
        new TimerEvent(0, "国庆", null, "10/01 12:00"),
    );
}

/** 考试模式
* 这里是考试模式的配置
* 本质上就是把课头当成考试时间 把课程当成考试科目
*/
function exam() {
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

// 到时间就切换考试模式
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