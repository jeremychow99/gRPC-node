const pb = require('../proto/greet_pb')

exports.greet = (call, callback) => {
    console.log("Greet was invoked");
    // prepare the response
    const res = new pb.GreetResponse()
    // get data from the client, set the result of our response
    res.setResult(`Hello ${call.request.getFirstName()} ${call.request.getLastName()}`)

    // executing the callback function that was given to us from the client
    callback(null, res)

}

exports.greetManyTimes = (call, _) => {
    console.log('GreetManyTimes was invoked')
    const res = new pb.GreetResponse()

    for (let i = 0; i < 10; i++) {
        res.setResult(`Hello ${call.request.getFirstName()} ${call.request.getLastName()} - number ${i}`)
        //call.write is another way to respond to the client
        call.write(res)
    }

    call.end();
}

exports.longGreet = (call, callback) => {
    console.log('LongGreet was invoked');
    let greet = '';

    call.on('data', (req) => {
        greet += `${req.getFirstName()}\n`;
    })

    call.on('end', () => {
        const res = new pb.GreetResponse()
        res.setResult(greet);

        callback(null, res)
    })
}

exports.greetEveryone = (call, _) => {
    console.log('GreetEveryone was invoked')

    call.on('data', (req) => {
        console.log(`received request ${req}`)
        const res = new pb.GreetResponse()
        res.setResult(`Hello ${req.getFirstName()}`)

        console.log(`Sending response ${res}`);
        call.write(res)
    })

    call.on('end', () => call.end())
}


const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

exports.greetWithDeadline = async (call, callback) => {
    console.log('GreetwithDeadline was invoked');

    for (let i = 0; i < 3; ++i) {
        if (call.cancelled) {
            return console.log('Client cancelled the request!');
        }
        await sleep(1000)
    }

    const res = new pb.GreetResponse()
    res.setResult(`Hello ${call.request.getFirstName()}`)

    callback(null, res)
}