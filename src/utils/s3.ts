import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

const REGION = 'ap-southeast-3' 
const BUCKET = 'alpha-development-storage'
export const S3BucketUrl = `https://${BUCKET}.s3.${REGION}.amazonaws.com/`;
export const AttachmentFolderName = 'document-attachments/'
export const SignatureFolderName = 'signatures/'
const accessKeyId = import.meta.env.VITE_ACCESS_KEY_ID_S3 || ''
const secretAccessKey = import.meta.env.VITE_SECRET_ACCESS_KEY_S3 || ''

const s3 = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
   requestChecksumCalculation: "WHEN_REQUIRED",
})

export async function uploadS3File(file: File, key: string) {
  const params = {
    Bucket: BUCKET,
    Key: key,
    Body: file,
    ContentType: file.type,
  }
  return s3.send(new PutObjectCommand(params))
}

export async function deleteS3File(key: string) {
  const params = {
    Bucket: BUCKET,
    Key: key,
  }
  return s3.send(new DeleteObjectCommand(params))
}
