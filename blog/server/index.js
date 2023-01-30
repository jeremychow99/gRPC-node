const fs = require('fs')
const grpc = require('@grpc/grpc-js')
const serviceImpl = require('./service_impl')
const { BlogServiceService } = require('../proto/blog_grpc_pb')
const { MongoClient } = require('mongodb');


const addr = '0.0.0.0:50051'
const uri = 'mongodb://root:root@localhost:27017/'
const mongoClient = new MongoClient(uri)

global.collection = undefined;

async function cleanup(server) {
    console.log('Cleanup');

    if (server) {
        // mongoClient.close() returns a promise, so need to await
        await mongoClient.close();
        server.forceShutdown()
    }

}

async function main() {
    const server = new grpc.Server();
    const tls = true;
    let creds;

    if (tls) {
        const rootCert = fs.readFileSync('./ssl/ca.crt')
        const certChain = fs.readFileSync('./ssl/server.crt')
        const privateKey = fs.readFileSync('./ssl/server.pem')

        creds = grpc.ServerCredentials.createSsl(rootCert, [{
            cert_chain: certChain,
            private_key: privateKey,
        }]);
    }
    else {
        creds = grpc.ServerCredentials.createInsecure();
    }

    process.on('SIGINT', () => {
        console.log('Caught interrupt signal');
        cleanup(server)
    })

    await mongoClient.connect();
    
    const database = mongoClient.db('blogdb');
    collection = database.collection('blog');

    // serviceImpl is Map of method names to method implementation for the provided service.
    // in this case, serviceImpl = { greet: [Function (anonymous)] }
    // console.log(serviceImpl);
    server.addService(BlogServiceService, serviceImpl)
    server.bindAsync(addr, creds, (err, _) => {
        if (err) {
            return cleanup(server)
        }

        server.start()
    })
    console.log(`Listening on ${addr}`)
}

main().catch(cleanup);