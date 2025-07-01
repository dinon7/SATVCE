import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

export const db = globalThis.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = db;
}

export class DatabaseError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'DatabaseError';
    }
}

interface BaseDocument {
    id: string;
    createdAt: Date;
    updatedAt: Date;
}

interface UserDocument extends BaseDocument {
    email: string;
    displayName: string;
    preferences: {
        subjects: string[];
        careers: string[];
        universities: string[];
    };
}

interface TaskDocument extends BaseDocument {
    userId: string;
    title: string;
    description: string;
    status: 'pending' | 'in-progress' | 'completed';
    dueDate: Date;
}

interface SuggestionDocument extends BaseDocument {
    userId: string;
    subject: string;
    relatedUniversityCourses: string[];
    requiredPrerequisites: string[];
    jobRoles: string[];
    salaryRange: string;
    industryGrowth: string;
    studyPathways: string[];
    aiReasoning?: string;
}

interface ResourceDocument extends BaseDocument {
    title: string;
    url: string;
    description: string;
    tags: string[];
    createdBy: string;
}

// Generic CRUD operations
export async function getDocument<T extends BaseDocument>(
    collectionName: string,
    id: string
): Promise<T> {
    try {
        const docRef = doc(db, collectionName, id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            throw new DatabaseError(`Document not found: ${id}`);
        }

        const data = docSnap.data();
        return {
            id: docSnap.id,
            ...data,
            createdAt: data.createdAt?.toDate(),
            updatedAt: data.updatedAt?.toDate()
        } as T;
    } catch (error) {
        throw new DatabaseError(`Error getting document: ${error.message}`);
    }
}

export async function getDocuments<T extends BaseDocument>(
    collectionName: string,
    constraints: QueryConstraint[] = []
): Promise<T[]> {
    try {
        const q = query(collection(db, collectionName), ...constraints);
        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate(),
            updatedAt: doc.data().updatedAt?.toDate()
        })) as T[];
    } catch (error) {
        throw new DatabaseError(`Error getting documents: ${error.message}`);
    }
}

export async function createDocument<T extends BaseDocument>(
    collectionName: string,
    data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>
): Promise<T> {
    try {
        const now = Timestamp.now();
        const docRef = await addDoc(collection(db, collectionName), {
            ...data,
            createdAt: now,
            updatedAt: now
        });

        return {
            id: docRef.id,
            ...data,
            createdAt: now.toDate(),
            updatedAt: now.toDate()
        } as T;
    } catch (error) {
        throw new DatabaseError(`Error creating document: ${error.message}`);
    }
}

export async function updateDocument<T extends BaseDocument>(
    collectionName: string,
    id: string,
    data: Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<void> {
    try {
        const docRef = doc(db, collectionName, id);
        await updateDoc(docRef, {
            ...data,
            updatedAt: Timestamp.now()
        });
    } catch (error) {
        throw new DatabaseError(`Error updating document: ${error.message}`);
    }
}

export async function deleteDocument(
    collectionName: string,
    id: string
): Promise<void> {
    try {
        const docRef = doc(db, collectionName, id);
        await deleteDoc(docRef);
    } catch (error) {
        throw new DatabaseError(`Error deleting document: ${error.message}`);
    }
}

// Specific collection operations
export const tasks = {
    async getByUser(userId: string): Promise<TaskDocument[]> {
        return getDocuments<TaskDocument>('tasks', [
            where('userId', '==', userId),
            orderBy('createdAt', 'desc')
        ]);
    },

    async create(data: Omit<TaskDocument, 'id' | 'createdAt' | 'updatedAt'>): Promise<TaskDocument> {
        return createDocument<TaskDocument>('tasks', data);
    },

    async update(id: string, data: Partial<Omit<TaskDocument, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> {
        return updateDocument('tasks', id, data);
    },

    async delete(id: string): Promise<void> {
        return deleteDocument('tasks', id);
    }
};

export const suggestions = {
    async getByUser(userId: string): Promise<SuggestionDocument[]> {
        return getDocuments<SuggestionDocument>('suggestions', [
            where('userId', '==', userId),
            orderBy('createdAt', 'desc')
        ]);
    },

    async create(data: Omit<SuggestionDocument, 'id' | 'createdAt' | 'updatedAt'>): Promise<SuggestionDocument> {
        return createDocument<SuggestionDocument>('suggestions', data);
    }
};

export const resources = {
    async getAll(): Promise<ResourceDocument[]> {
        return getDocuments<ResourceDocument>('resources', [
            orderBy('createdAt', 'desc')
        ]);
    },

    async getByTag(tag: string): Promise<ResourceDocument[]> {
        return getDocuments<ResourceDocument>('resources', [
            where('tags', 'array-contains', tag),
            orderBy('createdAt', 'desc')
        ]);
    }
}; 