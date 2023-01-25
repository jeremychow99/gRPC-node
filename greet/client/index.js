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

function doGreetManyTimes(client){
    console.log('doGreetManyTimes was invoked')

    const req = new GreetRequest()
    req.setFirstName('jack')
    req.setLastName('tan')
    const call = client.greetManyTimes(req)

    call.on('data', (res)=>{
        console.log(`GreetManyTimes: ${res.getResult()}`);
    })
}

function main() {
    const creds = grpc.ChannelCredentials.createInsecure()
    const client = new GreetServiceClient('0.0.0.0:50051', creds)

    // doGreet(client);
    doGreetManyTimes(client)

    client.close()
}

main()