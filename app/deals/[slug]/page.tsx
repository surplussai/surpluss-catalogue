import { GetCommand, QueryCommand } from '@aws-sdk/lib-dynamodb'
import { db, CATALOGUES_TABLE, PRODUCTS_TABLE } from '@/lib/aws/dynamodb'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import CatalogueClient from './CatalogueClient'
import type { Catalogue, Product } from '@/types'

// No cache — always reads fresh from DynamoDB
// This is what makes live updates work instantly
export const dynamic = 'force-dynamic'
export const revalidate = 0

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  try {
    const { Item } = await db.send(new GetCommand({ TableName: CATALOGUES_TABLE, Key: { catalogueId: slug } }))
    if (!Item) return { title: 'Surpluss Deals' }
    return {
      title: `${Item.name} | Surpluss`,
      description: Item.description || 'Premium surplus inventory at wholesale prices.',
      openGraph: { title: Item.name, description: Item.description, type: 'website' },
    }
  } catch { return { title: 'Surpluss Deals' } }
}

export default async function DealPage({ params }: Props) {
  const { slug } = await params

  try {
    const [catResult, prodResult] = await Promise.all([
      db.send(new GetCommand({ TableName: CATALOGUES_TABLE, Key: { catalogueId: slug } })),
      db.send(new QueryCommand({
        TableName: PRODUCTS_TABLE,
        KeyConditionExpression: 'catalogueId = :id',
        ExpressionAttributeValues: { ':id': slug },
      })),
    ])

    if (!catResult.Item || !catResult.Item.isActive) notFound()

    const catalogue = catResult.Item as Catalogue
    const products = ((prodResult.Items || []) as Product[])
      .filter(p => p.isActive)
      .sort((a, b) => a.displayOrder - b.displayOrder)

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://catalogue.surpluss.co'
    const shareUrl = `${appUrl}/deals/${slug}`
    const waNumber = catalogue.whatsappNumber || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919999999999'

    return <CatalogueClient catalogue={catalogue} products={products} shareUrl={shareUrl} waNumber={waNumber} />
  } catch {
    notFound()
  }
}
