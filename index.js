const express = require("express");
const { Server } = require("ws");
const runCode = require("./puppeteer.js");
const app = express();

const socketServer = new Server({ port: 3030 });
const running = new Set();

socketServer.on('connection', (socketClient) => {
    console.log('Connected to client');
    socketClient.send("send_code");
    socketClient.on('message', async(message) => {
        console.log("Received code from client");
        if (!running.has(socketClient)) {
            running.add(socketClient);
            socketClient.send("received");
            const result = await runCode(message);
            running.delete(socketClient);
            socketClient.send(JSON.stringify({ result }));
            socketClient.close();
        } else socketClient.send("running");
    });
});

app.use(express.static("public"));

const server = app.listen(process.env.PORT || 3000, async () => {
    const info = server.address();
    const port = info.port;
    console.log('North Central listening at port %s', port);
});
