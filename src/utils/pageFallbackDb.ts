import fs from 'fs';
import path from 'path';

const DB_FILE = path.join(process.cwd(), 'data', 'pages.json');

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

export const pageFallbackDb = {
    getAll: () => {
        ensureDbExists();
        try {
            const data = fs.readFileSync(DB_FILE, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error('Error reading page fallback db:', error);
            return [];
        }
    },
    
    getById: (id: string) => {
        const pages = pageFallbackDb.getAll();
        return pages.find((n: any) => n._id === id || n.id === id);
    },

    getBySlug: (slug: string) => {
        const pages = pageFallbackDb.getAll();
        return pages.find((n: any) => n.slug === slug);
    },

    create: (pageData: any) => {
        const pagesList = pageFallbackDb.getAll();
        const newEntry = {
            _id: `page_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            ...pageData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        pagesList.push(newEntry);
        fs.writeFileSync(DB_FILE, JSON.stringify(pagesList, null, 2), 'utf8');
        return newEntry;
    },

    update: (id: string, updateData: any) => {
        const pagesList = pageFallbackDb.getAll();
        const index = pagesList.findIndex((n: any) => n._id === id || n.id === id);
        if (index !== -1) {
            pagesList[index] = {
                ...pagesList[index],
                ...updateData,
                updatedAt: new Date().toISOString()
            };
            fs.writeFileSync(DB_FILE, JSON.stringify(pagesList, null, 2), 'utf8');
            return pagesList[index];
        }
        return null;
    },

    delete: (id: string) => {
        let pagesList = pageFallbackDb.getAll();
        const initialLength = pagesList.length;
        pagesList = pagesList.filter((n: any) => n._id !== id && n.id !== id);
        if (pagesList.length !== initialLength) {
            fs.writeFileSync(DB_FILE, JSON.stringify(pagesList, null, 2), 'utf8');
            return true;
        }
        return false;
    }
};
