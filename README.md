# Repository to reproduce problems with AWS-SDK V3 client-s3
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
npm run start
```

## Clean (remove localstack container)
```shell
npm run clean
```