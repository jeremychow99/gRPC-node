const { SumResponse } = require('../proto/sum_pb')
const { PrimeResponse } = require('../proto/calculator_pb')
const { AvgResponse } = require('../proto/avg_pb.js')


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

exports.avg = (call, callback) => {
    console.log('Avg was invoked')
    let count = 0.0
    let total = 0.0

    call.on('data', (req) => {
        total += req.getNumber()
        ++count;
    })

    call.on('end', () => {
        const res = new AvgResponse()
        .setResult(total / count)

        callback(null, res)
    })

}