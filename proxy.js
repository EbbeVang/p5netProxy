const WebSocket = require('ws');
const net = require('net');
const dgram = require('dgram');
let websocketserver;
let udpConnections = [];
var wsconnected = false;
var wsConnection;
start();

function start(){
    openWebsocket($('#ws_port').val());
    //udpSender = dgram.createSocket("udp4");
    //setupUDPsenderPort($('#udpPortNumber').val());
}

function openWebsocket(n){
    websocketserver = new WebSocket.Server({ port: n });
    websocketserver.on('connection', function connection(ws) {
        wsConnection = ws;
        ws.on('message', function incoming(message) {
            //console.log('received: %s', message);
            handleIncomingWebsocketMessage(message);
            insertIntoLogTable("UDP", "WebSocket", message);
        });       
    });
    wsconnected = true;
    $('#ws_open').prop('disabled', true);
    $('#ws_close').prop('disabled', false);   
}

function closeWebsocket(){
    wsconnected = false;
    websocketserver.close();
    $('#ws_close').attr("disabled", true);
    $('#ws_open').attr("disabled", false);
}
/*function setupUdpConnection(port){
    udpSender = dgram.createSocket("udp4");
    udpSender.bind(port);
    //console.log("change udpsender port to:" + port);
    udpSender.on('message', (msg, rinfo) => {
        console.log("Fucked msg: "+msg.toString() + JSON.stringify(rinfo));
    });
}*/

function createUdpConnection(jsonObj){
    if (udpPortNotCreated(jsonObj.parameters.localPort))
    {
        let s = dgram.createSocket('udp4');
        if (jsonObj.hasOwnProperty("parameters") && jsonObj.parameters.hasOwnProperty('subscribe')){
            s.on('message', function(msg, rinfo) {
                console.log(msg + JSON.stringify(rinfo));
                if (wsconnected)
                {
                    handleIncomingUDPMessages(msg.toString(), rinfo, s.address().port);
                }
                insertIntoLogTable("websocket", "UDP:"+rinfo.address+":"+rinfo.port, msg);
            });
        }
        if (jsonObj.hasOwnProperty("parameters") && jsonObj.parameters.hasOwnProperty('localPort')){
            s.on('listening', () => {
                insertIntoConnectionTable(jsonObj.protocol, "ip", s.address().port);
                udpConnections.push(s);
            });
            s.bind(jsonObj.parameters.localPort); 
        }
    }
}
function udpPortNotCreated(port)
{
    udpConnections.forEach( connection => {
        if (connection.address().port === port)
        {
            return true
        }
    });
    return false;
}

function sendUdpCommand(jsonObj)
{
    udpConnections.forEach( connection => {
    
        if (connection.address().port === jsonObj.parameters.localPort)
        {
            var msg = new Buffer(jsonObj.parameters.data);
            console.log("msg="+jsonObj.parameters.data);
            console.log("ip="+jsonObj.parameters.remoteIp);
            console.log("port="+jsonObj.parameters.remotePort);

            connection.send(msg, 0, msg.length, jsonObj.parameters.remotePort, jsonObj.parameters.remoteIp);
        }
    });
}

function handleIncomingWebsocketMessage(message){
    var obj;
    try {
        obj = JSON.parse(message)   
    } catch(error) {
        insertIntoConnectionTable("", "websocket", "invalid JSON object");    
        return;
    }
    
    if (obj.hasOwnProperty('protocol') && obj.protocol.toLowerCase() === 'udp') { 
        if (obj.command === 'send'){
            sendUdpCommand(obj)
        }
        else if (obj.command === 'create'){
            createUdpConnection(obj);
        }    
    }
    
}

function handleIncomingUDPMessages(message, rinfo, destPort){
    obj = {
        "protocol": "udp",
        "command": "receive",
        "parameters": {
            "remoteIp": rinfo.address,
            "localport": destPort,
            "remoteport": rinfo.port,
            "data": message
        }
    }
    if (wsConnection != null){
        wsConnection.send(JSON.stringify(obj));
    }    
}
function insertIntoLogTable(to, from, data){
    $('#logTable tbody').prepend('<tr><td>'+to+'</td><td>'+from+'</td><td>'+data+'</td></tr>');
}
function insertIntoConnectionTable(protocol, ip, port){
    $('#connectionTable > tbody').after('<tr><td>'+protocol+'</td><td>'+ip+'</td><td>'+port+'</td></tr>');
}
function clearLog(){
    console.log("tbody empty");
    $("#logTable tbody").empty();
    //$("#logTable > tbody").empty();
    //$('#logTable').find('tbody').empty();
}



