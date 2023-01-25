const { SumResponse } = require('../proto/sum_pb')
const { PrimeResponse } = require('../proto/calculator_pb')

exports.sum = (call, callback) => {
    console.log('Sum was invoked');
    const res = new SumResponse()
        .setResult(
            call.request.getFirstNumber() + call.request.getSecondNumber()
        )

    callback(null, res)
}

exports.primes = (call, _) => {
    console.log('Prime was invoked')
    const res = new PrimeResponse()
    let k = 2
    let num = call.request.getNum()
    while (num > 1) {
        if (num % k == 0) {
            res.setResult(k)
            num /= k
            call.write(res)
        }
        else {
            ++k
        }

    }
    call.end()
}