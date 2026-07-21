import { NextResponse } from 'next/server'
import { PutCommand } from '@aws-sdk/lib-dynamodb'
import { db } from '@/lib/aws/dynamodb'
import { v4 as uuid } from 'uuid'

const INQUIRIES_TABLE = process.env.DYNAMODB_INQUIRIES_TABLE ?? 'surpluss-inquiries'
const WA_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '917058807731'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { catalogueId, productId, productName, catalogueName, name, company, phone, email, quantity, message } = body

    if (!name?.trim() || !phone?.trim()) {
      return NextResponse.json({ error: 'Name and phone required' }, { status: 400 })
    }

    const inquiryId = uuid()
    const now = new Date().toISOString()

    // Save to DynamoDB
    try {
      await db.send(new PutCommand({
        TableName: INQUIRIES_TABLE,
        Item: {
          inquiryId,
          catalogueId: catalogueId || '',
          productId: productId || '',
          productName: productName || '',
          catalogueName: catalogueName || '',
          name: name.trim(),
          company: (company || '').trim(),
          phone: phone.trim(),
          email: (email || '').trim(),
          quantity: quantity || '',
          message: (message || '').trim(),
          createdAt: now,
          status: 'new',
        },
      }))
    } catch (dbErr) {
      // Log but don't fail if table doesn't exist yet
      console.error('DynamoDB inquiry save error:', dbErr)
    }

    const waMsg = [
      `🔔 *New Inquiry* — ${productName || catalogueName}`,
      ``,
      `*Name:* ${name.trim()}${company ? ` (${company})` : ''}`,
      `*Phone:* ${phone.trim()}`,
      email ? `*Email:* ${email}` : null,
      quantity ? `*Qty needed:* ${quantity}` : null,
      message ? `*Message:* ${message}` : null,
      ``,
      `_Ref: ${inquiryId.slice(0, 8)}_`,
    ].filter(Boolean).join('\n')

    console.log(`[INQUIRY] WA notification for ${WA_NUMBER}:\n${waMsg}`)

    return NextResponse.json({ ok: true, inquiryId })
  } catch (err) {
    console.error('Inquiry error:', err)
    return NextResponse.json({ error: 'Failed to save inquiry' }, { status: 500 })
  }
}
