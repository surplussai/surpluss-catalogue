import { NextResponse } from 'next/server'
import { PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb'
import { db, CATALOGUES_TABLE, PRODUCTS_TABLE } from '@/lib/aws/dynamodb'
import { v4 as uuid } from 'uuid'

export async function POST(req: Request) {
  try {
    const { catalogue, products } = await req.json()

    if (!catalogue?.name || !catalogue?.slug) {
      return NextResponse.json({ error: 'Name and slug required' }, { status: 400 })
    }
    if (!products?.length) {
      return NextResponse.json({ error: 'No products to publish' }, { status: 400 })
    }

    // Check slug uniqueness
    const { Items } = await db.send(new QueryCommand({
      TableName: CATALOGUES_TABLE,
      KeyConditionExpression: 'catalogueId = :id',
      ExpressionAttributeValues: { ':id': catalogue.slug },
    }))

    let finalSlug = catalogue.slug
    if (Items && Items.length > 0) {
      finalSlug = `${catalogue.slug}-${Date.now()}`
    }

    const now = new Date().toISOString()

    // Save catalogue
    await db.send(new PutCommand({
      TableName: CATALOGUES_TABLE,
      Item: {
        catalogueId: finalSlug,
        name: catalogue.name,
        description: catalogue.description || '',
        category: catalogue.category || '',
        dealExpiry: catalogue.dealExpiry || '',
        whatsappNumber: catalogue.whatsappNumber || '',
        isActive: true,
        isArchived: false,
        productCount: products.length,
        createdAt: now,
        updatedAt: now,
      },
    }))

    // Save all products
    await Promise.all(products.map((p: Record<string, unknown>, i: number) =>
      db.send(new PutCommand({
        TableName: PRODUCTS_TABLE,
        Item: {
          catalogueId: finalSlug,
          productId: uuid(),
          name: p.name || '',
          brand: p.brand || '',
          category: p.category || '',
          description: p.description || '',
          mrp: p.mrp ?? null,
          offerPrice: p.offerPrice ?? null,
          moq: p.moq ?? 1,
          quantity: p.quantity ?? 0,
          stockLocation: p.stockLocation || '',
          expiryDate: p.expiryDate || '',
          imageUrl1: p.imageUrl1 || '',
          imageUrl2: p.imageUrl2 || '',
          imageUrl3: p.imageUrl3 || '',
          isActive: true,
          isSoldOut: (p.quantity as number) === 0,
          isAnonymous: !p.brand,
          displayOrder: i,
          updatedAt: now,
        },
      }))
    ))

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://catalogue.surpluss.co'

    return NextResponse.json({
      catalogueId: finalSlug,
      productCount: products.length,
      url: `${appUrl}/deals/${finalSlug}`,
    })

  } catch (err) {
    console.error('Publish error:', err)
    return NextResponse.json({ error: 'Failed to publish' }, { status: 500 })
  }
}
