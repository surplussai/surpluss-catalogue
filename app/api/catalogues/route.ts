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

    let finalSlug = catalogue.slug
    try {
      const { Items } = await db.send(new QueryCommand({
        TableName: CATALOGUES_TABLE,
        KeyConditionExpression: 'catalogueId = :id',
        ExpressionAttributeValues: { ':id': catalogue.slug },
      }))
      if (Items && Items.length > 0) {
        finalSlug = `${catalogue.slug}-${Date.now()}`
      }
    } catch (slugErr) {
      console.error('Slug check error:', slugErr)
    }

    const now = new Date().toISOString()

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

    await Promise.all(products.map((p: Record<string, unknown>, i: number) => {
      const qty = Number(p.quantity) || 0
      return db.send(new PutCommand({
        TableName: PRODUCTS_TABLE,
        Item: {
          catalogueId: finalSlug,
          productId: uuid(),
          name: p.name || '',
          brand: p.brand || '',
          category: p.category || '',
          description: p.description || '',
          mrp: p.mrp != null ? Number(p.mrp) : null,
          offerPrice: p.offerPrice != null ? Number(p.offerPrice) : null,
          moq: Number(p.moq) || 1,
          quantity: qty,
          stockLocation: p.stockLocation || '',
          expiryDate: p.expiryDate || '',
          imageUrl1: p.imageUrl1 || '',
          imageUrl2: p.imageUrl2 || '',
          imageUrl3: p.imageUrl3 || '',
          imageUrl4: p.imageUrl4 || '',
          imageUrl5: p.imageUrl5 || '',
          isActive: true,
          isSoldOut: false,
          isAnonymous: !p.brand,
          displayOrder: i,
          updatedAt: now,
        },
      }))
    }))

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://catalogue.surpluss.co'

    return NextResponse.json({
      catalogueId: finalSlug,
      productCount: products.length,
      url: `${appUrl}/deals/${finalSlug}`,
    })

  } catch (err) {
    console.error('Publish error:', err)
    const message = err instanceof Error ? err.message : 'Failed to publish'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const { catalogueId, product } = await req.json()
    if (!catalogueId || !product?.name) {
      return NextResponse.json({ error: 'Missing catalogueId or product name' }, { status: 400 })
    }
    const { v4: uuid } = await import('uuid')
    const now = new Date().toISOString()
    const newProduct = {
      catalogueId,
      productId: uuid(),
      name: product.name || '',
      brand: product.brand || '',
      category: product.category || '',
      description: product.description || '',
      mrp: product.mrp ?? null,
      offerPrice: product.offerPrice ?? null,
      moq: Number(product.moq) || 1,
      quantity: Number(product.quantity) || 0,
      stockLocation: product.stockLocation || '',
      expiryDate: product.expiryDate || '',
      condition: product.condition || 'Excess stock',
      imageUrl1: '', imageUrl2: '', imageUrl3: '', imageUrl4: '', imageUrl5: '',
      isActive: true,
      isSoldOut: product.isSoldOut ?? false,
      isAnonymous: !product.brand,
      displayOrder: 999,
      updatedAt: now,
    }
    await db.send(new PutCommand({ TableName: PRODUCTS_TABLE, Item: newProduct }))
    return NextResponse.json({ product: newProduct })
  } catch (err) {
    console.error('Add product error:', err)
    return NextResponse.json({ error: 'Failed to add product' }, { status: 500 })
  }
}
