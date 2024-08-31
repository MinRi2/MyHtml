import express, { raw } from "express";
import fetch from "node-fetch";

const router = express.Router();

const cctvNewsApis = {
    world: {
        url: "https://news.cctv.com/2019/07/gaiban/cmsdatainterface/page/world_1.jsonp",

        async handleResponse(res) {
            const text = await res.text();
            const newsData = eval(`
                function world(data){ return data; }
                ${text}
            `);

            return {
                updateTime: newsData.data.list[0].focus_date,
                result: newsData.data.list.map(data => {
                    const { title, brief: description, image, focus_date: dateTime } = data;
                    return {
                        title,
                        description,
                        image,
                        dateTime,
                    }
                }),
            }
        }
    },

    military: {
        url: "https://military.cctv.com/data/index.json",

        async handleResponse(res) {
            const newsData = await res.json();

            return {
                updateTime: newsData.updateTime,
                result: newsData.rollData.map(data => {
                    const { title, description, image, dateTime } = data;
                    return {
                        title,
                        description,
                        image,
                        dateTime,
                    }
                }),
            }
        },
    },
}

router.get("/baidu", async function (req, res) {
    const response = await fetch("https://top.baidu.com/api/board?platform=wise&tab=realtime");
    const { data } = await response.json();

    const updateTime = parseInt(data.cards[0].updateTime) * 1000;
    res.send({
        updateTime: new Date(updateTime).toLocaleString(),
        result: data.cards[0].content.map(data => {
            const { img: image, word: title } = data;
            return {
                title,
                image,
            }
        }),
    })
});

router.get("/cctv/:newsType", async function (req, res) {
    const newsType = req.params.newsType;

    if (newsType == undefined || cctvNewsApis[newsType] == undefined) {
        res.send({
            "result": [],
        });
        return;
    }

    const api = cctvNewsApis[newsType];

    const response = await fetch(api.url);
    const result = await api.handleResponse(response);

    if (result == null) {
        res.send({
            "result": [],
        });
        return;
    }

    res.send(result);
});

export default router;