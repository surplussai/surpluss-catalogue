import { NextRequest, NextResponse } from 'next/server'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { s3, IMAGES_BUCKET, IMAGES_BASE_URL } from '@/lib/aws/s3'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const productId = formData.get('productId') as string | null
    const slot = (formData.get('slot') as string) || '1'

    if (!file || !productId) {
      return NextResponse.json({ error: 'Missing file or productId' }, { status: 400 })
    }

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Only JPG, PNG, WEBP allowed' }, { status: 400 })
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 5MB)' }, { status: 400 })
    }

    const ext = file.type.split('/')[1].replace('jpeg', 'jpg')
    const key = `products/${productId}/img${slot}-${Date.now()}.${ext}`
    const buffer = Buffer.from(await file.arrayBuffer())

    await s3.send(new PutObjectCommand({
      Bucket: IMAGES_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: file.type,
      CacheControl: 'public, max-age=31536000',
    }))

    const url = `${IMAGES_BASE_URL}/${key}`
    return NextResponse.json({ url })
  } catch (err) {
    console.error('Image upload error:', err)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
