// import { S3Client, ListBucketsCommand } from "@aws-sdk/client-s3";

// export const s3 = new S3Client({
//   region: process.env.AWS_REGION!,
//   credentials: {
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
//   },
// });

// (async () => {
//   try {
//     const data = await s3.send(new ListBucketsCommand({}));
//     console.log("Buckets:", data.Buckets);
//   } catch (err) {
//     console.error("S3 ListBuckets error:", err);
//   }
// })();
