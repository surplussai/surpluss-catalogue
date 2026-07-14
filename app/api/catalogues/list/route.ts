import { NextResponse } from 'next/server'
import { ScanCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb'
import { db, CATALOGUES_TABLE } from '@/lib/aws/dynamodb'

// GET /api/catalogues/list — all catalogues for admin history
export async function GET() {
  try {
    const { Items } = await db.send(new ScanCommand({
      TableName: CATALOGUES_TABLE,
    }))

    const sorted = (Items || []).sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    return NextResponse.json({ catalogues: sorted })
  } catch (err) {
    console.error('List error:', err)
    return NextResponse.json({ error: 'Failed to list catalogues' }, { status: 500 })
  }
}
