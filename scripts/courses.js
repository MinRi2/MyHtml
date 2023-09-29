const nextDayTime = "21:15:00"; // 课表刷新时间
const weekStartDate = new Date(2023, 7, 28); // 开学第一周第一天的时间
const fontSize = 70, borderRadius = fontSize / 4;

// 课程阴影颜色
const colorMap = {
    语: "#ff0000",
    数: "#00c2ff",
    英: "#ffb570",

    物: "#c10ce9",
    化: "#00c2ff",
    生: "#8fde5d",
    政: "#cd5c5c",
    
    听: "#cd5c5c",
    
    体: "#f7dc6f",
    心: "#f7dc6f",
    信: "#f7dc6f",
    通: "#f7dc6f",
    劳: "#f7dc6f",

    班: "#f2a65e",
    跑: "#f2a65e",
    自: "#c10ce9",
};

const headStyle = {
    color: "white",
    fontSize: fontSize + "px",

    backgroundColor: "#566573",
    borderTopLeftRadius: borderRadius + "px",
    borderTopRightRadius: borderRadius + "px",
    transition: "all 1s ease-out",
}

const courseStyle = {
    color: "white",
    fontSize: fontSize * 0.9 + "px",
    backgroundColor: "#566573",
    borderBottomLeftRadius: borderRadius + "px",
    borderBottomRightRadius: borderRadius + "px",
    transition: "all 1s ease-out",
}

const dayElemStyle = {
    color: "white",
    fontSize: fontSize + "px",
    width: fontSize + "px",
    transition: "all 1s ease-out",
}

const weekElemStyle = {
    color: "white",
    fontSize: fontSize * 0.7 + "px",
    padding: fontSize / 8 + "px",
    transition: "all 1s ease-out",
}

class DaySchedule{
    headArray;
    headSchedule;
    courseArray;

    constructor(dayName){
        this.dayName = dayName;
    }
}

class TimeSchedule{
    constructor(startTime, endTime){
        this.startTime = startTime;
        this.endTime = endTime;
    }

    getStartDate(){
        return stringToDate(this.startTime);
    }

    getEndDate(){
        return stringToDate(this.endTime);
    }

    setTime(newStartTIme, newEndTime){
        this.startTime = newStartTIme;
        this.endTime = newEndTime;
    }

    static timeArrayToTimeScheduleArray(array, timeSplit = "-"){
        let result = [];

        for(let i = 0; i < array.length; i++){
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

function initCourses(){
    const headRow = document.getElementById("headRow"),
        courseRow = document.getElementById("courseRow");
    const dayElem = document.createElement("td"),
        weekElem = document.createElement("td");

    var today = 0;
    var courceDay = 0;
    var offsetDay = 0;

    var daySchedule = null;

    init();

    function init(){
        today = courceDay = new Date().getDay();

        dayElem.rowSpan = "2";
        weekElem.rowSpan = "2";

        dayElem.addEventListener("mousedown", event => {
            if(event.button == 0){
                if(event.altKey){
                    setCourseDay(today);
                }else if(event.ctrlKey){
                    shiftCourseDay(-1);
                }else{
                    shiftCourseDay(1);
                }
            }
        });

        Object.assign(dayElem.style, dayElemStyle);

        Object.assign(weekElem.style, weekElemStyle);

        refresh();
        initUpdater();

        setInterval(refreshHead, 1000);
    }

    function initUpdater(){
        let endDate = stringToDate(nextDayTime);
        checkIntervalOrOver(endDate, nextDay, nextDay);

        // 新的一天
        setInterval(() => {
            let nowDate = new Date();
            if(today != nowDate.getDay()){
                today = nowDate.getDay();
                setCourseDay(today);
            }
        }, 1000);

        function nextDay(){
            if(offsetDay != 0) return;
            shiftCourseDay(1);
        }
    }

    function refresh(){
        daySchedule = daySchedules[courceDay];

        rebuildHeadRow();
        rebuildCourseRow();

        dayElem.textContent = daySchedule.dayName;
        weekElem.innerHTML = "第" + "<br>" + getCourseWeek() + "<br>" + "周";
    }

    function rebuildHeadRow(){
        clearChildren(headRow);

        headRow.appendChild(dayElem);
        
        let {headArray} = daySchedule;
        for(let i = 0; i < headArray.length; i++){
            let e = document.createElement("th");
            e.textContent = headArray[i];

            Object.assign(e.style, headStyle);
            
            headRow.appendChild(e);
        }

        headRow.appendChild(weekElem);
    }

    function refreshHead(){
        let children = headRow.getElementsByTagName("th");

        let nowDate = new Date();

        let {headArray, headSchedule} = daySchedule;
        for(let i = 0, len = headArray.length; i < len; i++){
            let child = children[i];
            let obj = headSchedule[i];

            let color = "white";
            if(offsetDay < 0){
                color = "#a2a2a2";
            }else if(offsetDay == 0){
                let startDate = obj.getStartDate(),
                    endDate = obj.getEndDate();

                if(nowDate > endDate){
                    color = "#a2a2a2"
                }else if(nowDate > startDate){
                    color = "#f7dC6f";
                }
            }

            child.style.color = color;
        }
    }

    function rebuildCourseRow(){
        clearChildren(courseRow);

        let {courseArray} = daySchedule;

        for(let i = 0; i < courseArray.length; i++){
            let course = courseArray[i];
            let e = document.createElement("td");

            Object.assign(e.style, courseStyle);

            if(isSelfStudy(course)){
                e.style.color = "#a2a2a2";

                if(course[0] == "*"){
                    course = course.replace("*", "");
                }
            }else{
                e.style.color = "white";
            }
            
            let color = colorMap[course[0]];

            e.textContent = course;

            if(color){
                e.style.textShadow = "0px 0px 10px " + color;
            }
            
            courseRow.appendChild(e);
        }
    }

    function shiftCourseDay(n){
        setCourseDay(courceDay + n);
    }

    function setCourseDay(newDay){
        const max = daySchedules.length;

        courceDay = newDay;
        courceDay = courceDay < 0 ? (max - 1) : (courceDay >= max ? 0 : courceDay);
        
        offsetDay = (courceDay == 0 ? max + 1 : courceDay) - today;
        offsetDay = offsetDay > 7 ? 0 : offsetDay;
        refresh();
    }

    function isSelfStudy(cource){
        if(cource[0] == "*"){
            return true;
        }

        if(getCourseWeek() % 2 == 0){ // 双周
            return cource == "心";
        }
    }

    function getCourseWeek(){
        let nowDate = new Date();
        let day = (nowDate - weekStartDate) / 1000 / 60 / 60 / 24;
        return Math.floor((day + offsetDay) / 7) + 1;
    }

    function clearChildren(parent){
        while(parent.hasChildNodes()){
            parent.removeChild(parent.firstChild);
        }
    }
}