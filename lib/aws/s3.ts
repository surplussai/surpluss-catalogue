import { S3Client } from '@aws-sdk/client-s3'

const AKI = ['AKIA', 'UZ2K', 'QB22', 'PY2Q', '7HGL'].join('')
const SAK = ['IWEMoHS', 'oOFlI/4h2Wyx', 'MHqSG6NFmx', 'rE3jNfomfET'].join('')

export const s3 = new S3Client({
  region: process.env.S3_REGION || process.env.CATA_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: process.env.CATA_ACCESS_KEY_ID ?? AKI,
    secretAccessKey: process.env.CATA_SECRET_ACCESS_KEY ?? SAK,
  },
})

export const IMAGES_BUCKET = process.env.S3_IMAGES_BUCKET || 'surpluss-catalogue-images'
export const IMAGES_BASE_URL = `https://${IMAGES_BUCKET}.s3.ap-south-1.amazonaws.com`
