const pb = require('../proto/greet_pb')

exports.greet = (call, callback) => {
    console.log("Greet was invoked");
    const res = new pb.GreetResponse()
    res.setResult(`Hello ${call.request.getFirstName()} ${call.request.getLastName()}`)
    callback(null, res)
}