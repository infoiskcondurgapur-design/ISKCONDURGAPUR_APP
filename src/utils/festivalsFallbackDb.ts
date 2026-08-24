import fs from 'fs';
import path from 'path';

const DB_FILE = path.join(process.cwd(), 'data', 'festivals.json');

// Ensure data directory and file exist
const ensureDbExists = () => {
    const dir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
        fs.writeFileSync(DB_FILE, '[]', 'utf8');
    }
};

export const festivalsFallbackDb = {
    getAll: () => {
        ensureDbExists();
        try {
            const data = fs.readFileSync(DB_FILE, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error('Error reading festivals fallback db:', error);
            return [];
        }
    },
    
    getById: (id: string) => {
        const list = festivalsFallbackDb.getAll();
        return list.find((item: any) => item._id === id || item.id === id);
    },

    create: (festivalData: any) => {
        const list = festivalsFallbackDb.getAll();
        const newEntry = {
            _id: `festival_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            ...festivalData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        list.push(newEntry);
        fs.writeFileSync(DB_FILE, JSON.stringify(list, null, 2), 'utf8');
        return newEntry;
    },

    update: (id: string, updateData: any) => {
        const list = festivalsFallbackDb.getAll();
        const index = list.findIndex((item: any) => item._id === id || item.id === id);
        if (index !== -1) {
            list[index] = {
                ...list[index],
                ...updateData,
                updatedAt: new Date().toISOString()
            };
            fs.writeFileSync(DB_FILE, JSON.stringify(list, null, 2), 'utf8');
            return list[index];
        }
        return null;
    },

    delete: (id: string) => {
        let list = festivalsFallbackDb.getAll();
        const initialLength = list.length;
        list = list.filter((item: any) => item._id !== id && item.id !== id);
        if (list.length !== initialLength) {
            fs.writeFileSync(DB_FILE, JSON.stringify(list, null, 2), 'utf8');
            return true;
        }
        return false;
    }
};
