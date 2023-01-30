const fs = require('fs')
const grpc = require('@grpc/grpc-js')
const { GreetServiceClient } = require('../proto/greet_grpc_pb')
const { GreetRequest } = require('../proto/greet_pb')

function doGreet(client) {
    console.log("doGreet was invoked")
    const req = new GreetRequest()
    req.setFirstName('John')
    req.setLastName('Doe')

    // parse in the req and the callback function, which is invoked on server side
    // the res parameter comes from the service_impl, server side
    client.greet(req, (err, res) => {
        if (err) {
            return console.log(err);
        }
        console.log(`Greet: ${res.getResult()}`);
    })
}

function doGreetManyTimes(client) {
    console.log('doGreetManyTimes was invoked')

    const req = new GreetRequest()
    req.setFirstName('jack')
    req.setLastName('tan')
    const call = client.greetManyTimes(req)

    call.on('data', (res) => {
        console.log(`GreetManyTimes: ${res.getResult()}`);
    })
}

function doLongGreet(client) {
    console.log('doLongGreet was invoked')

    const names = ['Test', 'abc', 'hello']
    const call = client.longGreet((err, res) => {
        if (err) {
            console.log(err);
        }

        console.log(`LongGreet: ${res.getResult()}`);
    })

    names.map((name) => {
        return new GreetRequest().setFirstName(name)
    }).forEach((req) => call.write(req))

    call.end()
}

function doGreetEveryone(client) {
    console.log('doGreetEveryone was invoked')
    const names = ['John', 'Jack', 'Jill']
    const call = client.greetEveryone()

    call.on('data', (res) => {
        console.log(`GreetEveryone: ${res.getResult()}`);
    })

    names.map((name) => {
        return new GreetRequest().setFirstName(name)
    }).forEach((req) => call.write(req))

    call.end()
}

function doGreetWithDeadline(client, ms) {
    console.log('doGreetWithDeadline was invoked');
    const req = new GreetRequest()
    req.setFirstName('Jeremy')

    // call RPC endpoint, set deadline object in calloptions object
    // in our server code, we set it to 3 seconds to send a response,
    // so if our input deadline is < 3000ms, the req will fail (exceeded deadline we input)
    client.greetWithDeadline(req,
        // we set the deadline option in the grpc CallOptions object
        { deadline: new Date(Date.now() + ms) },
        (err, res) => {
            if (err) {
                return console.log(err);
            }

            console.log(`GreetWithDeadline: ${res.getResult()}`);
        })
}


function main() {
    const tls = true;
    let creds;

    if (tls) {
        const rootCert = fs.readFileSync('./ssl/ca.crt');

        creds = grpc.ChannelCredentials.createSsl(rootCert);
    } else {
        creds = grpc.ChannelCredentials.createInsecure();
    }



    const client = new GreetServiceClient('localhost:50051', creds)

    doGreet(client);
    // doGreetManyTimes(client)
    // doLongGreet(client)
    // doGreetEveryone(client)
    // doGreetWithDeadline(client, 3090);

    client.close()
}

main()