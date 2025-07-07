// // utils/generatePresignedUrl.ts
// import { PutObjectCommand } from "@aws-sdk/client-s3";
// import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
// import { s3 } from "../lib/s3-client";

// export const generatePresignedUrl = async (key: string, contentType: string) => {
//   const command = new PutObjectCommand({
//     Bucket: process.env.S3_BUCKET!,
//     Key: key,
//     ContentType: contentType,
//     ACL: "public-read", // Make uploaded file public
//   });

//   const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
//   return url;
// };
