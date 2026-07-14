import { NextResponse } from 'next/server'
import { GetCommand, UpdateCommand, QueryCommand } from '@aws-sdk/lib-dynamodb'
import { db, CATALOGUES_TABLE, PRODUCTS_TABLE } from '@/lib/aws/dynamodb'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params
  try {
    const [catResult, prodResult] = await Promise.all([
      db.send(new GetCommand({ TableName: CATALOGUES_TABLE, Key: { catalogueId: id } })),
      db.send(new QueryCommand({
        TableName: PRODUCTS_TABLE,
        KeyConditionExpression: 'catalogueId = :id',
        ExpressionAttributeValues: { ':id': id },
      })),
    ])

    if (!catResult.Item) {
      return NextResponse.json({ error: 'Catalogue not found' }, { status: 404 })
    }

    const products = (prodResult.Items || []).sort((a, b) => a.displayOrder - b.displayOrder)

    return NextResponse.json({ catalogue: catResult.Item, products })
  } catch (err) {
    console.error('Get catalogue error:', err)
    return NextResponse.json({ error: 'Failed to fetch catalogue' }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: Params) {
  const { id } = await params
  const updates = await req.json()

  const allowed = ['name', 'description', 'category', 'dealExpiry', 'whatsappNumber', 'isActive', 'isArchived']
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
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
  }

  expressions.push('#updatedAt = :updatedAt')
  names['#updatedAt'] = 'updatedAt'
  values[':updatedAt'] = new Date().toISOString()

  try {
    await db.send(new UpdateCommand({
      TableName: CATALOGUES_TABLE,
      Key: { catalogueId: id },
      UpdateExpression: `SET ${expressions.join(', ')}`,
      ExpressionAttributeNames: names,
      ExpressionAttributeValues: values,
    }))
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Update catalogue error:', err)
    return NextResponse.json({ error: 'Failed to update catalogue' }, { status: 500 })
  }
}
