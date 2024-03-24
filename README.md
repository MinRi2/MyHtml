# 动态壁纸
* ### <img width=20 src=/assets/icons/FluentClass20Filled.png>为课堂设计的动态壁纸
* ### <img width=20 src=/assets/icons/vue.png> 响应式的配置修改 
* ### <img width=20 src=/assets/icons/SimpleIconsFastapi.png> 快速上手

# 特色功能
 * ## 课程表
    显示每天的课程
    响应式切换

    <img width=400 src=/assets/icons/courses.png>

* ## 课程进度条
    显示下节课的时间安排
    显示当前课程的进度条

    <img width=400 src=/assets/icons/timeBar.png>

* ## 时间
    显示当前时间
    按需求进行时间偏移
    <img width=400 src=/assets/icons/clock.png>

* ## 事件倒计时
    倒计时
    <img width=400 src=/assets/icons/eventTimer.png>

* ## 热搜榜
    显示实时的热搜榜单
    <img width=400 src=/assets/icons/hotboard.png>

* ## <img width=20 src=/assets/icons/unsplash.png> 动态壁纸 
    使用 **[Unsplash]** 动态切换壁纸
    <img width=400 src=/assets/icons/pictureBackground.png>

# 如何使用

#### 1. 启动本机服务器
* ##### 安装NodeJs <img width=60 src=/assets/icons/nodejs.svg>
    前往 [NodeJsDownload] 官方网站下载并安装

* ##### 安装依赖
    在 [local-server] 目录下 打开命令行 `cmd`
    执行指令 ```node install```

* ##### 手动启动
    在 [local-server] 目录下 打开命令行 `cmd`
    执行指令 ```node app.mjs``` 

* ##### 设置自启动
    在 [local-server] 目录下 双击运行[setupService.bat]

    > [!NOTE]
    > 自启动会注册一个 `dynmaticpaperlocalserver.exe` 的windows服务，用以实现自启动
    > 如果需要删除服务 以管理员身份运行命令行`cmd`
    > 执行指令 ```sc delete dynmaticpaperlocalserver.exe``` 即可

#### 2. 使用**动态壁纸软件**(或者其他支持HTML壁纸的软件)
* <img width=30 src=/assets/icons/wallpaper_engine_logo.png> `WallpaperEngine` 需要在Steam上购买

* <img width=30 src=/assets/icons/livelyPaper.png> [`LivelyPaper`](https://github.com/rocksdanister/lively) 免费开源

#### 3. 添加自定义壁纸 -> 将index.html导入

<img width=30 src=/assets/icons/livelyPaper.png> [LivelyPaper](https://github.com/rocksdanister/lively) 为例

<img width=400 src=/assets/use/import.jpg>


# 配置文件
// TODO
# 关于代码
* 在遵守 **[GPL-3.0]协议** 下，你随意可以**修改**、**使用**此仓库的代码

[Unsplash]: https://unsplash.com/
[GPL-3.0]: ./LICENSE
[local-server]: ./local-server/
[setupService.bat]: ./local-server/setupService.bat
[NodeJsDownload]: https://nodejs.cn/download/