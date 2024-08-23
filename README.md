# Repository to reproduce performance degradation using AWS-SDK V3 client-s3

## The benchmark
The code compares performance of an operation (op), making 10 parallel invocations of headObject using S3 client against Localstack at `localhost`
* sdk v2 - AWS-SDK v2.1662.0
* sdk v3 http2 - AWS-SDK v3.635.0, using NodeHttp2Handler
* sdk v3 - AWS-SDK v3.635.0, using NodeHttpHandler

## Results
```
sdk v2 x 77.69 ops/sec ±3.54% (75 runs sampled)
sdk v3 http2 x 18.03 ops/sec ±4.84% (46 runs sampled)
sdk v3 x 62.72 ops/sec ±3.88% (76 runs sampled)
Fastest is sdk v2
- sdk v3 http2 is 4.31x slower
- sdk v3 is 1.24x slower
```

## NodeJS (v20.14.0)
```shell
nvm install && nvm use
```

## Setup (NPM install + localstack container with S3)
```shell
npm run setup
```

## Start (script to clean up localstack bucket and run main.js)
```shell
npm run headObjectBenchmark
```

## Clean (remove localstack container)
```shell
npm run clean
```