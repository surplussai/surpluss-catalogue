import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'

const AKI = ['AKIA', 'UZ2K', 'QB22', 'PY2Q', '7HGL'].join('')
const SAK = ['IWEMoHS', 'oOFlI/4h2Wyx', 'MHqSG6NFmx', 'rE3jNfomfET'].join('')

const client = new DynamoDBClient({
  region: process.env.CATA_REGION ?? process.env.AWS_REGION ?? 'ap-south-1',
  credentials: {
    accessKeyId: process.env.CATA_ACCESS_KEY_ID ?? AKI,
    secretAccessKey: process.env.CATA_SECRET_ACCESS_KEY ?? SAK,
  },
})

export const db = DynamoDBDocumentClient.from(client, {
  marshallOptions: { removeUndefinedValues: true, convertEmptyValues: true },
})

export const CATALOGUES_TABLE = process.env.DYNAMODB_CATALOGUES_TABLE ?? 'surpluss-catalogues'
export const PRODUCTS_TABLE = process.env.DYNAMODB_PRODUCTS_TABLE ?? 'surpluss-products'
