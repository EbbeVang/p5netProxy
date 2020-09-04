/**
 *  Script to test p5 net proxy
 *  Generate a valid json object
 *  connect to websocket and send json object
 * 
 */

const WebSocket = require('ws');
const url = 'ws://localhost:9000';
const connection = new WebSocket(url);
const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay))
var obj = {
    'ip': '192.168.1.6',
    'port': 9000,
    'protocol': 'udp',
    'data': "takeoff"
 }
async function sendObjects()
{
    while (true)
    {

        obj.port =  6000 + Math.floor(Math.random() * 1000);   
        var commands = ["takeoff","turn left","turn right", "up 100"];
        var random=Math.floor((Math.random() * commands.length));
        obj.data=commands[random];

        await sleep(3000);
        connection.send(JSON.stringify(obj));

    }
}


connection.onopen = () => {
    sendObjects();
}
 
connection.onerror = (error) => {
  console.log(`WebSocket error: ${error}`)
}
 
connection.onmessage = (e) => {
  console.log(e.data)
}

