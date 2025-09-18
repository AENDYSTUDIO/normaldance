import { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'
import { uploadWithReplication } from '@/lib/ipfs-enhanced'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key'

function getUser(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) return null
  
  try {
    const token = authHeader.split(' ')[1]
    return jwt.verify(token, JWT_SECRET) as any
  } catch {
    return null
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getUser(req)
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File
    const metadata = JSON.parse(formData.get('metadata') as string)

    if (!file) {
      return Response.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/flac', 'audio/ogg']
    if (!allowedTypes.includes(file.type)) {
      return Response.json({ error: 'Invalid file type' }, { status: 400 })
    }

    // Validate file size (100MB max)
    const maxSize = 100 * 1024 * 1024
    if (file.size > maxSize) {
      return Response.json({ error: 'File too large (max 100MB)' }, { status: 400 })
    }

    // Upload to IPFS
    const result = await uploadWithReplication(file, {
      title: metadata.title || file.name,
      artist: metadata.artist || 'Unknown',
      genre: metadata.genre || 'other',
      duration: metadata.duration || 0,
      releaseDate: new Date().toISOString(),
      isExplicit: metadata.isExplicit || false,
      fileSize: file.size,
      mimeType: file.type
    })

    return Response.json({
      success: true,
      ipfsHash: result.cid,
      size: result.size,
      gateways: result.gateways
    })

  } catch (error) {
    console.error('Upload error:', error)
    return Response.json({ error: 'Upload failed' }, { status: 500 })
  }
}