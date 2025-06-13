import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/firebase-admin'
import { getFirestore } from 'firebase-admin/firestore'

const firestore = getFirestore()

export async function GET(request: NextRequest, { params }: { params: { uid: string } }) {
  try {
    const token = request.headers.get('Authorization')?.split('Bearer ')[1]
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decodedToken = await auth.verifyIdToken(token)
    const userDoc = await firestore.collection('users').doc(decodedToken.uid).get()
    const userData = userDoc.data()

    if (!userData?.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const targetUserDoc = await firestore.collection('users').doc(params.uid).get()
    if (!targetUserDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ uid: targetUserDoc.id, ...targetUserDoc.data() })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { uid: string } }) {
  try {
    const token = request.headers.get('Authorization')?.split('Bearer ')[1]
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decodedToken = await auth.verifyIdToken(token)
    const userDoc = await firestore.collection('users').doc(decodedToken.uid).get()
    const userData = userDoc.data()

    if (!userData?.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    await firestore.collection('users').doc(params.uid).update(body)
    const updatedUserDoc = await firestore.collection('users').doc(params.uid).get()

    return NextResponse.json({ uid: updatedUserDoc.id, ...updatedUserDoc.data() })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
} 