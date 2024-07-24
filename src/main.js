const {S3} = require("@aws-sdk/client-s3");
const {NodeHttpHandler} = require("@smithy/node-http-handler");

const s3 = new S3({
    region: "eu-central-1",
    endpoint: "http://127.0.0.1:4566/",
    credentials: {
        accessKeyId: "__fake__",
        secretAccessKey: "__fake__",
    },
    forcePathStyle: true,
    requestHandler: new NodeHttpHandler({
        connectionTimeout: 1000,
        requestTimeout: 10000,
        //httpAgent: require("http").globalAgent,
        //httpsAgent: require("https").globalAgent,
    })
});

(async () => {
    const bucketName = process.argv[2];
    const totalItems = parseInt(process.argv[3]);
    if (!bucketName || !Number.isFinite(totalItems)) {
        console.warn(`Please provide bucket name and number of items`);
        return;
    }

    console.log(`Creating bucket...`);
    await s3.createBucket({Bucket: bucketName});
    console.log(`Creating ${totalItems} items...`);
    for (let i = 0; i < totalItems; ++i) {
        const key = `${i}`;
        await s3.putObject({
            Bucket: bucketName,
            Key: key,
            Body: `Item${i}`
        });
    }
    for (let i = 50; i < totalItems; i += 50) {
        console.log(`Getting first ${i} items...`);
        const firstObjectst = await s3.listObjectsV2({Bucket: bucketName, MaxKeys: i});
        console.log(`IsTruncated: ${firstObjectst.IsTruncated}, got ${firstObjectst.Contents.length} items`);
    }
    console.log(`Getting all items...`);
    const objects = await s3.listObjectsV2({Bucket: bucketName});
    const keys = (objects.Contents ?? []).map((obj) => obj.Key);
    console.log(`Items: ${keys.length}`);
})()
    .then(() => {
        console.log("DONE");
        setImmediate(() => {
            process.exit(0);
        });
    })
    .catch((err) => {
        console.error(err);
        setImmediate(() => {
            process.exit(1);
        });
    });

//to keep process from stopping
setInterval(() => {
}, 1000);