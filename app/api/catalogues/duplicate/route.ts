import { NextResponse } from 'next/server'
import { GetCommand, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb'
import { db, CATALOGUES_TABLE, PRODUCTS_TABLE } from '@/lib/aws/dynamodb'
import { v4 as uuid } from 'uuid'

export async function POST(req: Request) {
  const { catalogueId, newSlug, newName } = await req.json()

  try {
    const [catResult, prodResult] = await Promise.all([
      db.send(new GetCommand({ TableName: CATALOGUES_TABLE, Key: { catalogueId } })),
      db.send(new QueryCommand({
        TableName: PRODUCTS_TABLE,
        KeyConditionExpression: 'catalogueId = :id',
        ExpressionAttributeValues: { ':id': catalogueId },
      })),
    ])

    if (!catResult.Item) {
      return NextResponse.json({ error: 'Source catalogue not found' }, { status: 404 })
    }

    const now = new Date().toISOString()

    // Create new catalogue
    await db.send(new PutCommand({
      TableName: CATALOGUES_TABLE,
      Item: {
        ...catResult.Item,
        catalogueId: newSlug,
        name: newName || `${catResult.Item.name} (Copy)`,
        isActive: false,
        isArchived: false,
        createdAt: now,
        updatedAt: now,
      },
    }))

    // Copy all products to new catalogue
    const products = prodResult.Items || []
    await Promise.all(products.map(p =>
      db.send(new PutCommand({
        TableName: PRODUCTS_TABLE,
        Item: { ...p, catalogueId: newSlug, productId: uuid(), updatedAt: now },
      }))
    ))

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://catalogue.surpluss.co'

    return NextResponse.json({
      catalogueId: newSlug,
      url: `${appUrl}/deals/${newSlug}`,
    })
  } catch (err) {
    console.error('Duplicate error:', err)
    return NextResponse.json({ error: 'Failed to duplicate' }, { status: 500 })
  }
}
