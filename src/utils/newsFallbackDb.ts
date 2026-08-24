import fs from 'fs';
import path from 'path';

const DB_FILE = path.join(process.cwd(), 'data', 'news.json');

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

export const newsFallbackDb = {
    getAll: () => {
        ensureDbExists();
        try {
            const data = fs.readFileSync(DB_FILE, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error('Error reading news fallback db:', error);
            return [];
        }
    },
    
    getById: (id: string) => {
        const news = newsFallbackDb.getAll();
        return news.find((n: any) => n._id === id || n.id === id);
    },

    create: (newsData: any) => {
        const newsList = newsFallbackDb.getAll();
        const newEntry = {
            _id: `news_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            ...newsData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        newsList.push(newEntry);
        fs.writeFileSync(DB_FILE, JSON.stringify(newsList, null, 2), 'utf8');
        return newEntry;
    },

    update: (id: string, updateData: any) => {
        const newsList = newsFallbackDb.getAll();
        const index = newsList.findIndex((n: any) => n._id === id || n.id === id);
        if (index !== -1) {
            newsList[index] = {
                ...newsList[index],
                ...updateData,
                updatedAt: new Date().toISOString()
            };
            fs.writeFileSync(DB_FILE, JSON.stringify(newsList, null, 2), 'utf8');
            return newsList[index];
        }
        return null;
    },

    delete: (id: string) => {
        let newsList = newsFallbackDb.getAll();
        const initialLength = newsList.length;
        newsList = newsList.filter((n: any) => n._id !== id && n.id !== id);
        if (newsList.length !== initialLength) {
            fs.writeFileSync(DB_FILE, JSON.stringify(newsList, null, 2), 'utf8');
            return true;
        }
        return false;
    }
};
