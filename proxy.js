const WebSocket = require('ws');
const net = require('net');
const dgram = require('dgram');
var websocketserver;
var tcpConnections = [];
var udpConnections = [];
var wsconnected = false;
var wsConnection;
var udpSender;
var uspSenderPort;
start();

function start(){
    openWebsocket($('#ws_port').val());
    udpSender = dgram.createSocket("udp4");
    setupUDPsenderPort($('#udpPortNumber').val());
}
function openWebsocket(n){
    websocketserver = new WebSocket.Server({ port: n });
    websocketserver.on('connection', function connection(ws) {
        wsConnection = ws;
        ws.on('message', function incoming(message) {
            console.log('received: %s', message);
            //ws.send('something');
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
function setupUDPsenderPort(port){
    udpSender = dgram.createSocket("udp4");
    udpSender.bind(port);
    console.log("change udpsender port to:" + port);

}

function newConnection(protocol, ip, port){
    //alert(protocol + ":" + ip + ":" + port);
    if (protocol.toLowerCase()==="udp")
    {
        var s = dgram.createSocket('udp4');
        s.on('message', function(msg, rinfo) {
            console.log(msg + JSON.stringify(rinfo));
            if (wsconnected)
            {
                handleIncomingUDPMessages(msg.toString(), rinfo);
            }
            insertIntoLogTable("websocket", "UDP:"+rinfo.address+":"+rinfo.port, msg);
        });
        s.bind(port); 
        udpConnections.push(s);
        insertIntoConnectionTable(protocol, ip, port);
    }
    else if(protocol==="TCP")
    {
        alert("we dont support tcp yet!");
    }   
}
function handleIncomingWebsocketMessage(message){
    var obj;
    try {
        obj = JSON.parse(message)   
    } catch(error) {
        insertIntoConnectionTable("", "wesocket", "invalid JSON object");    
        return;
    }
    console.log(obj.protocol);
    if (obj.hasOwnProperty('subscribe')) { 
        if (obj.subscribe === true && portNotSubscribed(obj.port))
        {
            console.log("subscribe = true");
            newConnection(obj.protocol.toUpperCase(), obj.ip, obj.port)
        }
    }
    if (obj.protocol.toLowerCase() === "udp")
    {
        console.log("try sending udp message: "+JSON.stringify(obj));
        var data = new Buffer(obj.data);
        udpSender.send(data, 0, message.length, obj.port, obj.ip)
    }
}
function portNotSubscribed(portnumber)
{
    // does onbly check UDP!
    for (var connection in udpConnections)
    {
        if (connection.address().port === portnumber)
        {
            return false
        }
        
    }
    return true;
}

function handleIncomingUDPMessages(message, rinfo){
    obj = {
        'ip': rinfo.address,
        'port': rinfo.port,
        'protocol': 'UDP',
        'data': message
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



