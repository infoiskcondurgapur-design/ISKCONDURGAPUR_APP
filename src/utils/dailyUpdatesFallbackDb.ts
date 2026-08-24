import fs from 'fs';
import path from 'path';

const DB_FILE = path.join(process.cwd(), 'data', 'daily-updates.json');

const ensureDbExists = () => {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
        fs.writeFileSync(DB_FILE, JSON.stringify([], null, 2), 'utf8');
    }
};

export const dailyUpdatesFallbackDb = {
    getAll: () => {
        ensureDbExists();
        try {
            const data = fs.readFileSync(DB_FILE, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error('Error reading daily updates fallback DB:', error);
            return [];
        }
    },

    getById: (id: string) => {
        const updates = dailyUpdatesFallbackDb.getAll();
        return updates.find((up: any) => up._id === id || up.id === id);
    },

    getByDate: (date: string) => {
        const updates = dailyUpdatesFallbackDb.getAll();
        return updates.find((up: any) => up.date === date);
    },

    create: (updateData: any) => {
        const updates = dailyUpdatesFallbackDb.getAll();
        
        const newUpdate = {
            _id: Date.now().toString(),
            ...updateData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        // Remove existing update with same date if any to mimic unique constraint
        const filteredUpdates = updates.filter((up: any) => up.date !== updateData.date);
        filteredUpdates.push(newUpdate);
        
        fs.writeFileSync(DB_FILE, JSON.stringify(filteredUpdates, null, 2), 'utf8');
        return newUpdate;
    },

    update: (id: string, updateData: any) => {
        const updates = dailyUpdatesFallbackDb.getAll();
        const index = updates.findIndex((up: any) => up._id === id || up.id === id);
        if (index !== -1) {
            updates[index] = {
                ...updates[index],
                ...updateData,
                updatedAt: new Date().toISOString()
            };
            fs.writeFileSync(DB_FILE, JSON.stringify(updates, null, 2), 'utf8');
            return updates[index];
        }
        return null;
    },

    delete: (id: string) => {
        let updates = dailyUpdatesFallbackDb.getAll();
        const initialLength = updates.length;
        updates = updates.filter((up: any) => up._id !== id && up.id !== id);
        if (updates.length !== initialLength) {
            fs.writeFileSync(DB_FILE, JSON.stringify(updates, null, 2), 'utf8');
            return true;
        }
        return false;
    }
};
