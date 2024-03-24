# 动态壁纸
* 一个实用、易用的动态壁纸
---
# 特色功能
## 1. 课程表
* 课程表会自动更新到第二天的课表  
    更新时间的修改见 [vars.js] 的 `nextDayTime` 变量

* 课程表可以显示开学周数  
    起始时间见 [vars.js] 的 `weekStartDate` 变量

* 课程的添、删、改、查都在 `daySchedules` 里提供，例如
    * 基本的设置
    ```javascript
    // 获取周二的安排
    const tueSchedule = daySchedules[2];

    // headArray, courseArray, schedule 必须一一对应
    tueSchedule.setSchedule({
        headArray: [
            "一", "二", "三", "测"
        ],
        courseArray: [
            "语", "数", "英", "物"
        ],
        scheduleArray: [
            "7:30-8:10", // 一
            "8:20-9:00", // 二
            "9:30-10:10", // 三
            "19:30-20:05" // 测
        ]
    })
    ```
    * 增  
        增加的课程会自动按照时间先后排序  
        某些课程特殊的可以调整优先级
    ```javascript
    tueSchedule.addCourse("15:00-17:00", "数学测试", "15:00-17:00");

    // 添加后会自动按时间先后排序
    ```
    * 删
    ```javascript
    tueSchedule.deleteCourses("一", "二");
    ```
    * 改
    ```javascript
    // 修改课程优先级
    tueSchedule.setOrder("测", Infinity);

    // 修改课程
    tueSchedule.setCourseName("一", "化");

    // 修改时间
    tueSchedule.getSchedule("测").setTime("18:30-19:10");
    ```
    * 查
    ```javascript
    const course = tueSchedule.getCourse("一");
    // 后续操作...

    // 获取课程名称
    tueSchedule.getCourseName("测");
    ```
* 在 [control.js] 中操作`daySchedules` 详见 [control.js]

## 2. 课程进度条
* 添加课程进度安排  
    只需向 `barSchedulesArray` 添加 `BarSchedule` 对象

```javascript
/** BarSchedule
 * 
 * @param {String} name 课条名称
 * @param {String} startTime 起始时间 
 * @param {String} endTime 结束时间
 * @param {String} color 颜色 留白会随机生成
 */
barSchedulesArray.push(new BarSchedule(
    "大课间做操",
    "9:00", "9:20",
    "",
));
```
* 在 [control.js] 中操作`barSchedulesArray` 详见 [control.js]

## 3. 当前时间
* 时间偏移量见 [vars.js]

## 4. 事件倒计时
* 添加事件  
    调用 `addEvents` 函数  
```javascript
/** TimerEvent
    * 
    * @param {Number} order 事件顺序 越小越优先
    * @param {String} name 事件名称
    * @param {String, Date} startTime 开始日期
    * @param {String, Date} endTime 结束日期
    * @param {String} discription 事件描述
    * @param {String} shadowColor 事件名称阴影颜色
    */
addEvents(
    new TimerEvent(0, "化学期末模拟", "19:45", "21:00", "", "#00c2ff"),
    new TimerEvent(0, "语文期末模拟", "19:30", "22:00", "", "#ff0000"),
);
```

## 5. 热搜榜
* 可定时关闭 见 [vars.js] 的 `disableBoardDates` 变量
* 可添加一些笑话 会随机选取一个并把最后一个热搜替换掉

## 6. 动态壁纸
* [Unsplash]的API有限流 须使用提供自己账号的 unsplash `key` 并在 [vars.js] 修改
* 注册自己的 `key` 见 [UnsplashDevelpers]
---
# 如何应用
* 使用一些动态壁纸引擎（像 `WallPaper` ）来安装
---
# 如何使用
* 大部分可供修改的配置（如课程表）放在了 [control.js] 文件当中，你可以通过 `文本编辑器` 进行修改
* 一些相关的变量（如第一周的时间）放在了 [vars.js] 文件当中
---
# 关于代码
* 在遵守 [GPL-3.0] 协议下，你随意可以修改、使用此仓库的代码

[control.js]: ./scripts/control.js
[vars.js]: ./scripts/vars.js
[Unsplash]: https://unsplash.com/
[UnsplashDevelpers]: https://unsplash.com/developersz
[GPL-3.0]: ./LICENSE