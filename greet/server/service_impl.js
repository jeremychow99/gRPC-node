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

    for (let i = 0; i <10; i++){
        res.setResult(`Hello ${call.request.getFirstName()} ${call.request.getLastName()} - number ${i}`)
        //call.write is another way to respond to the client
        call.write(res)
    }

    call.end();
}