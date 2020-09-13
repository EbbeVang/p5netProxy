delay = new p5.Delay();

// Create WebSocket connection.
const socket = new WebSocket('ws://localhost:9000');

var obj = {
  'ip': '192.168.1.6',
  'port': 9000,
  'protocol': 'udp',
  'data': "takeoff"
}

// Connection opened
socket.addEventListener('open', function(event) {
  console.log("open");
  setInterval(sendMessage, 2000);
});

function sendMessage() {
  socket.send(JSON.stringify(obj));
}

// Listen for messages
socket.addEventListener('message', function(event) {
  console.log('Message from server ', event.data);
});

function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(220);
}