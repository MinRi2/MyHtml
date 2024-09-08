import fs from "fs";
import JSON5 from "json5";

import express from 'express';
import expressWs from 'express-ws';

import hotboardRouter from "./hotboard.mjs";

const app = express();
const port = 3000;

expressWs(app);

const sokets = [];
const configFile = "../assets/config.json";

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    next();
});

app.ws("/config", function (ws, req) {
    const config = readConfig();
    if (config) {
        ws.send(JSON.stringify(config));
    }

    sokets.push(ws);
    ws.on("close", () => {
        const index = sokets.indexOf(ws);
        sokets.splice(index, 1);
    });
});

app.use("/hotboard", hotboardRouter);

app.use("/static", express.static('../public'));

app.listen(port, () => {
    console.log(`Ready http://localhost:${port}`)
});

fs.watch(configFile, debounce((event, fileName) => {
    sendConfig();
}, 300));

function readConfig() {
    const configJson = fs.readFileSync(configFile, {
        encoding: "utf-8"
    });

    var configObj = null;
    try {
        configObj = JSON5.parse(configJson);
    } finally {
        return configObj;
    }
}

function sendConfig() {
    const config = readConfig();
    if (config) {
        sokets.forEach(ws => {
            ws.send(JSON.stringify(config));
        })
    }
}

function debounce(fn, delay) {
    var intervalId = null;
    return function () {
        if (intervalId) {
            clearTimeout(intervalId);
            intervalId = null;
        }

        intervalId = setTimeout(() => {
            fn.apply(null, arguments);
        }, delay);
    }
}