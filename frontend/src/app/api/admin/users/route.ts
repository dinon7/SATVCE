import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/firebase-admin'
import { getFirestore } from 'firebase-admin/firestore'

const firestore = getFirestore()

export async function GET(request: NextRequest) {
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

    const usersSnapshot = await firestore.collection('users').get()
    const users = usersSnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }))

    return NextResponse.json(users)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
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
    const { uid, ...data } = body

    await firestore.collection('users').doc(uid).update(data)
    const updatedUserDoc = await firestore.collection('users').doc(uid).get()

    return NextResponse.json({ uid: updatedUserDoc.id, ...updatedUserDoc.data() })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
} 