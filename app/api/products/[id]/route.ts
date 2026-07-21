import { NextResponse } from 'next/server'
import { UpdateCommand } from '@aws-sdk/lib-dynamodb'
import { db, PRODUCTS_TABLE } from '@/lib/aws/dynamodb'

type Params = { params: Promise<{ id: string }> }

export async function PATCH(req: Request, { params }: Params) {
  const { id } = await params
  const body = await req.json()
  const { catalogueId, ...updates } = body

  if (!catalogueId) {
    return NextResponse.json({ error: 'catalogueId required' }, { status: 400 })
  }

  const allowed = [
    'name', 'brand', 'description', 'mrp', 'offerPrice',
    'moq', 'quantity', 'stockLocation', 'expiryDate', 'condition',
    'imageUrl1', 'imageUrl2', 'imageUrl3', 'imageUrl4', 'imageUrl5',
    'isActive', 'isSoldOut', 'isAnonymous',
  ]

  const expressions: string[] = []
  const names: Record<string, string> = {}
  const values: Record<string, unknown> = {}

  Object.entries(updates).forEach(([key, val]) => {
    if (!allowed.includes(key)) return
    expressions.push(`#${key} = :${key}`)
    names[`#${key}`] = key
    values[`:${key}`] = val
  })

  if (!expressions.length) {
    return NextResponse.json({ error: 'No valid fields' }, { status: 400 })
  }

  expressions.push('#updatedAt = :updatedAt')
  names['#updatedAt'] = 'updatedAt'
  values[':updatedAt'] = new Date().toISOString()

  try {
    await db.send(new UpdateCommand({
      TableName: PRODUCTS_TABLE,
      Key: { catalogueId, productId: id },
      UpdateExpression: `SET ${expressions.join(', ')}`,
      ExpressionAttributeNames: names,
      ExpressionAttributeValues: values,
    }))
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Update product error:', err)
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
  }
}
