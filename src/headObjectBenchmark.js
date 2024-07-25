const AWS = require('aws-sdk');
const { S3 } = require('@aws-sdk/client-s3');
const Benchmark = require('benchmark');
const {NodeHttpHandler, NodeHttp2Handler} = require("@smithy/node-http-handler");

const NUM_ITERATIONS = 10;

const options = {
    onStart() {
        console.log(this.name ?? 'Running benchmark');
    },
    onError(event) {
        console.log(event.target.error);
    },
    onCycle(event) {
        console.log(String(event.target));
    },
    onComplete() {
        const fastestResult =
            this.filter('fastest')[0];

        console.log(`Fastest is ${fastestResult.name}`);

        this.forEach((result) => {
            if (result.name !== fastestResult.name) {
                const multipleSlower = (fastestResult.hz / result.hz).toFixed(2);

                console.log(`- ${result.name} is ${multipleSlower}x slower`);
            }
        });
    },
};

const s3v2Client = new AWS.S3({
    region: "eu-central-1",
    endpoint: "http://localhost:4566/",
    credentials: {
        accessKeyId: "__fake__",
        secretAccessKey: "__fake__",
    },
    s3ForcePathStyle: true,
    httpOptions: {
        agent: new (require('http').Agent)({
            keepAlive: true,
            maxSockets: 200
        }),
        connectTimeout: 1000,
        timeout: 10000
    }
});
const s3 = new S3({
    region: "eu-central-1",
    endpoint: "http://localhost:4566/",
    credentials: {
        accessKeyId: "__fake__",
        secretAccessKey: "__fake__",
    },
    forcePathStyle: true,
    requestHandler: new NodeHttpHandler({
        connectionTimeout: 1000,
        requestTimeout: 10000,
        httpAgent: new (require('http').Agent)({
            keepAlive: true,
            maxSockets: 200
        }),
        httpsAgent: new (require('https').Agent)({
            keepAlive: true,
            maxSockets: 200
        }),
    }),
});

const s3h2 = new S3({
    region: "eu-central-1",
    endpoint: "http://localhost:4566/",
    credentials: {
        accessKeyId: "__fake__",
        secretAccessKey: "__fake__",
    },
    forcePathStyle: true,
    requestHandler: new NodeHttp2Handler({
        sessionTimeout: 10000,
        requestTimeout: 10000,
        disableConcurrentStreams: false,
        maxConcurrentStreams: 1000
    }),
});

new Benchmark.Suite(`Calling ${NUM_ITERATIONS} headObject requests in parallel`, options)
    .add(`sdk v2`, {
        defer: true,
        async: true,
        fn(deferred) {
            const promises = [];
            for (let i = 0; i < NUM_ITERATIONS; i++) {
                promises.push(s3v2Client.headObject({
                    Bucket: "test-bucket",
                    Key: `test${i}.txt`,
                }).promise());
            }
            Promise.all(promises).then(() => {
                deferred.resolve();
            });
        },
    })
    .add(`sdk v3 http2`, {
        defer: true,
        async: true,
        fn(deferred) {
            const promises = [];
            for (let i = 0; i < NUM_ITERATIONS; i++) {
                promises.push(s3h2.headObject({
                    Bucket: "test-bucket",
                    Key: `test${i}.txt`,
                }));
            }
            Promise.all(promises).then(() => {
                deferred.resolve();
            });
        },
    })
    .add(`sdk v3`, {
        defer: true,
        async: true,
        fn(deferred) {
            const promises = [];
            for (let i = 0; i < NUM_ITERATIONS; i++) {
                promises.push(s3.headObject({
                    Bucket: "test-bucket",
                    Key: `test${i}.txt`,
                }));
            }
            Promise.all(promises).then(() => {
                deferred.resolve();
            });
        },
    })
    .run({ async: true });
