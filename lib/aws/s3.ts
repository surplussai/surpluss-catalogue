import { S3Client } from '@aws-sdk/client-s3'

export const s3 = new S3Client({
  region: process.env.S3_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

export const IMAGES_BUCKET = process.env.S3_IMAGES_BUCKET || 'surpluss-catalogue-images'
export const IMAGES_BASE_URL = `https://${IMAGES_BUCKET}.s3.ap-south-1.amazonaws.com`
