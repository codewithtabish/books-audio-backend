// import multer from "multer";
// import multerS3 from "multer-s3";
// import { s3 } from "../lib/s3-client";

// let upload: multer.Multer;

// try {
//   const rawBucket = process.env.S3_BUCKET;
//   const bucket = rawBucket?.trim();

//   if (!bucket) throw new Error("❌ S3_BUCKET env variable is missing or empty.");

//   console.log("✅ Setting up multer-s3 with bucket:", bucket);

//   upload = multer({
//     storage: multerS3({
//       s3,
//       bucket,
//       contentType: multerS3.AUTO_CONTENT_TYPE,
//       acl: "public-read",
//       key: (req, file, cb) => {
//         try {
//           const fileName = `${Date.now()}-${file.originalname}`;
//           console.log("🗂 Uploading file:", fileName);
//           cb(null, fileName);
//         } catch (keyErr) {
//           console.error("❌ Error in key generation:", keyErr);
//           cb(keyErr as Error, "");
//         }
//       },
//     }),
//   });

//   console.log("✅ Multer S3 middleware is ready.");
// } catch (err) {
//   console.error("❌ Multer S3 setup failed:", err);
//   throw err;
// }

// export default upload;
