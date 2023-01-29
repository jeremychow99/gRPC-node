const grpc = require('@grpc/grpc-js')
const {CalculatorServiceClient} = require('../proto/calculator_grpc_pb')
const {SumRequest} = require('../proto/sum_pb')
const {PrimeRequest} = require('../proto/calculator_pb')
const {AvgRequest} = require('../proto/avg_pb')
const {SqrtRequest} = require('../proto/sqrt_pb')

function doSum(client){
    console.log("doSum was invoked")
    const req = new SumRequest()
    .setFirstNumber(12)
    .setSecondNumber(1)

    client.sum(req, (err, res) => {
        if (err){
            return console.log(err)
        }
        console.log(`Sum: ${res.getResult()}`);
})
    
}

function doPrime(client){
    console.log("doPrime was invoked");
    const req = new PrimeRequest()
        .setNum(120)
    console.log(req)
    const call = client.primes(req)
    call.on('data', (res)=> {
        console.log(`Prime: ${res.getResult()}`);
    })

}

function doAvg(client) {
    console.log('doAvg was invoked')

    // create an array from 1 to 10
    const numbers = [...Array(11).keys()].slice(1)

    // call RPC endpoint, it will give a stream
    const call = client.avg((err, res) => {
        if (err) {
            return console.log(err);
        }
        console.log(`Avg: ${res.getResult()}`)

    })

    numbers.map((number) => {
        return new AvgRequest().setNumber(number)
    }).forEach((req) => call.write(req))

    call.end()
}

function doSqrt(client, n){
    console.log('doSqrt was invoked')

    const req = new SqrtRequest()
    req.setNumber(n)
    
    client.sqrt(req, (err, res) => {
        if (err) {
            return console.log(err);
        }

        console.log(`Sqrt: ${res.getResult()}`);
    })

}

function main() {
    const creds = grpc.ChannelCredentials.createInsecure()
    const client = new CalculatorServiceClient('0.0.0.0:50051', creds)

    // doSum(client);
    // doPrime(client)
    // doAvg(client)
    // doSqrt(client, 25)
    doSqrt(client, -1)
    client.close()
}

main()