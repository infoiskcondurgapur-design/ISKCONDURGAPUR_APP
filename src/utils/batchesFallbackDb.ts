import fs from 'fs';
import path from 'path';

const DB_FILE = path.join(process.cwd(), 'data', 'batches.json');

const ensureDbExists = () => {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
        // Initialize with default batch matching the screenshot: BS #5 - 2026
        const defaultBatches = [
            {
                _id: "batch1",
                name: "BS #5 - 2026",
                code: "BS5-2026",
                description: "Spiritual learning batch 2026",
                isActive: true,
                enrolledStudents: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        ];
        fs.writeFileSync(DB_FILE, JSON.stringify(defaultBatches, null, 2), 'utf8');
    }
};

export const batchesFallbackDb = {
    getAll: () => {
        ensureDbExists();
        try {
            const data = fs.readFileSync(DB_FILE, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error('Error reading fallback DB:', error);
            return [];
        }
    },

    getById: (id: string) => {
        const batches = batchesFallbackDb.getAll();
        return batches.find((b: any) => b._id === id || b.id === id);
    },

    getByCode: (code: string) => {
        const batches = batchesFallbackDb.getAll();
        return batches.find((b: any) => b.code.toLowerCase() === code.toLowerCase());
    },

    create: (batchData: any) => {
        const batches = batchesFallbackDb.getAll();
        const newBatch = {
            _id: Date.now().toString(),
            name: batchData.name,
            code: batchData.code || Math.random().toString(36).substring(2, 8).toUpperCase(),
            description: batchData.description || '',
            isActive: batchData.isActive !== undefined ? batchData.isActive : true,
            enrolledStudents: batchData.enrolledStudents || [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        batches.push(newBatch);
        fs.writeFileSync(DB_FILE, JSON.stringify(batches, null, 2), 'utf8');
        return newBatch;
    },

    update: (id: string, updateData: any) => {
        const batches = batchesFallbackDb.getAll();
        const index = batches.findIndex((b: any) => b._id === id || b.id === id);
        if (index !== -1) {
            batches[index] = {
                ...batches[index],
                ...updateData,
                updatedAt: new Date().toISOString()
            };
            fs.writeFileSync(DB_FILE, JSON.stringify(batches, null, 2), 'utf8');
            return batches[index];
        }
        return null;
    },

    enrollStudent: (batchId: string, studentId: string) => {
        const batch = batchesFallbackDb.getById(batchId);
        if (!batch) return null;
        if (!batch.enrolledStudents) batch.enrolledStudents = [];
        if (!batch.enrolledStudents.includes(studentId)) {
            batch.enrolledStudents.push(studentId);
            return batchesFallbackDb.update(batchId, { enrolledStudents: batch.enrolledStudents });
        }
        return batch;
    }
};
