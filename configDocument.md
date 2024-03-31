# 配置项文档


# picturePaper 壁纸
<img width=300 src=/assets/icons/pictureBackground.png>

壁纸使用 ``UnsplashApi`` 来获取随机壁纸
默认的壁纸可以覆盖文件[default.jpg]

* <h3>unsplashKey <img width=20 src=/assets/icons/unsplash.png></h3> 

    ``string`` 默认 ``空``
    [Unsplash] 的密钥
    
    **关于Unsplash密钥的注册**
    1. 前往官网[Unsplash]注册账号
    2. 前往[UnsplashDev]创建自己的App
    3. 在新建的App页面往下翻，找到 ``Access Key`` 即为密钥

* <h3>enableUnsplash</h3>

    ``boolean``  默认 ``false``
    是否启用 [Unsplash]
    如果启用必须填写好密钥

* <h3>fetchCount</h3>

    ``number`` 默认 ``60``
    总计获取多少壁纸，在获取足够的壁纸后将不再获取

* <h3>fetchInterval</h3>

    ``number`` 单位：``min`` 默认：``5``
    获取壁纸的间隔
    UnsplashApi是有流量限制的，添加间隔可以防止流量受限

* <h3>nextPageInterval</h3>

    ``number`` 单位：``min`` 默认：``5``
    轮播壁纸间隔

# timeBar 课程进度条
<img width=300 src=/assets/icons/timeBar.png>

<h4>课条可以用来提示</h4>

1. 当前课程的进度
2. 下一节课的时间安排

<h4>课条</h4>
一个课条有三个配置项

1. ``name`` 这个课条的名称
2. ``schedule`` 课条的时间安排
3. ``color`` 课条背景颜色 **(可选, 默认为随机颜色)**

```javascript
{
    name: "测试",
    schedule: "16:40-18:00",
    color: "green",
}
```

* <h3>defaultBar</h3>

    ``课条[]``
    每天都有的课条

* <h3>extraBar</h3>

    ``课条[]``
    每天各自的课条

    **可以用来处理以下情形**
    1. 特殊的课条：升旗仪式，课间操，跑操
    2. 课条需要特殊的时间安排：大课间（可能星期一没有）
    3. 课条需要额外的信息提示：大课间，大课间（可能星期二要做操）

# eventTimer 事件倒计时
<img width=300 src=/assets/icons/eventTimer.png>

<h4>倒计时事件</h4>

倒计时事件有八个配置项

1. ``order`` 事件的优先级，越小优先级越大 **(可选 默认``0``)**
2. ``name`` 事件的名称
3. ``startDate``: 事件的起始日期
    **起始日期是选填的**
    有一些事件没有明确的起始事件
    只是一个时间点
    比如：清明节
4. ``endDate`` 事件结束日期
5. ``discription`` 事件的描述 **会显示在结束时间旁边**
6. ``color`` 事件名称的阴影颜色 **(可选, 默认为随机颜色)**
7. ``showOn`` 事件显示的星期
    **可以用来处理以下情形**
    1. 只有周一、周四有数学测试需要倒计时
8. ``scheduleHead`` 事件倒计时的课头
    **可以为课程添加倒计时**
    有的课程需要添加倒计时
    可以配合 ``showOn`` 使用
    **可以用来处理以下情形**
    1. 给周一、周四的数学测试添加倒计时

[Unsplash]: https://unsplash.com/
[UnsplashDev]: https://unsplash.com/developers
[default.jpg]: ./dist/default.jpg