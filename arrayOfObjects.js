const dgram = require('dgram');
let connections = [];

for (var i=0; i<10; i++)
{
    let server = dgram.createSocket('udp4');
    
    server.on('error', (err) => {
        console.log(`server error:\n${err.stack}`);
        server.close();
    });
    
    server.on('message', (msg, rinfo) => {
        console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`);
    });
    
    server.on('listening', () => {
        var address = server.address();
        console.log(`server listening ${address.address}:${address.port}`);
        if (connections.length > 0)
        {
            console.log("we have a connection array");
            console.log(connections[0].address().port);
        }
    });
    
    server.bind(56000+i);
    connections.push(server);
    // Prints: server listening 0.0.0.0:41234
}

