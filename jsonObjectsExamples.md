# json objects examples

## create udp connection
{
	"protocol": "udp",
	"command": "create",
	"parameters": {
		"localPort": 8889,
		"subscribe": true
	}
}

## send a udp message
{
   "protocol":"udp",
   "command":"send",
   "parameters":{
      "localPort":8889,
      "remotePort":8889,
      "remoteIp": "192.168.0.2",
      "data":"takeoff"
   }
}

## json to websocket
{
	"protocol": "udp",
	"command": "receive",
	"parameters": {
		"remoteIp": "192.168.0.2",
		"localport": 8889,
		"remoteport": 8889,
		"data": "ok"
	}
}

