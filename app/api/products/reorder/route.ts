import { NextResponse } from 'next/server'
import { UpdateCommand } from '@aws-sdk/lib-dynamodb'
import { db, PRODUCTS_TABLE } from '@/lib/aws/dynamodb'

// Body: { catalogueId: string, order: string[] }  — array of productIds in new order
export async function POST(req: Request) {
  try {
    const { catalogueId, order } = await req.json()
    if (!catalogueId || !Array.isArray(order)) {
      return NextResponse.json({ error: 'catalogueId and order[] required' }, { status: 400 })
    }

    await Promise.all(
      order.map((productId: string, idx: number) =>
        db.send(new UpdateCommand({
          TableName: PRODUCTS_TABLE,
          Key: { catalogueId, productId },
          UpdateExpression: 'SET #displayOrder = :displayOrder',
          ExpressionAttributeNames: { '#displayOrder': 'displayOrder' },
          ExpressionAttributeValues: { ':displayOrder': idx },
        }))
      )
    )

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Reorder error:', err)
    return NextResponse.json({ error: 'Failed to reorder' }, { status: 500 })
  }
}
