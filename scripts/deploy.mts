import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import mime from "mime";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const { REGION, ACCESS_KEY_ID, ACCESS_KEY_SECRET, BUCKET } = process.env;

const client = new S3Client({
  region: REGION!,
  credentials: {
    accessKeyId: ACCESS_KEY_ID!,
    secretAccessKey: ACCESS_KEY_SECRET!,
  },
  bucketEndpoint: false,
  endpoint: `https://oss-${REGION}.aliyuncs.com`,
  requestChecksumCalculation: "WHEN_REQUIRED",
  responseChecksumValidation: "WHEN_REQUIRED",
});

async function upload(key: string, filePath: string) {
  const fileStream = fs.createReadStream(filePath);
  const contentType = mime.getType(filePath) || "application/octet-stream";
  const resp = await client.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: fileStream,
      ContentType: contentType,
    }),
  );
  console.log(
    "uploaded",
    key,
    filePath,
    JSON.stringify(resp.$metadata, null, 2),
  );
}
// list all files under dist and upload
const directoryPath = path.join(__dirname, "../dist");

function walkSync(dir: string, fileList: string[] = []) {
  for (const file of fs.readdirSync(dir)) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      walkSync(filePath, fileList);
    } else {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const files = walkSync(directoryPath);
console.log(files);
for (const file of files) {
  const key = path.relative(directoryPath, file);
  await upload(key, file);
}
