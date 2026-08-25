import fs from 'fs';
import path from 'path';

const DB_FILE = path.join(process.cwd(), 'data', 'gallery.json');

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

export const galleryFallbackDb = {
    getAll: () => {
        ensureDbExists();
        try {
            const data = fs.readFileSync(DB_FILE, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error('Error reading gallery fallback db:', error);
            return [];
        }
    },
    
    getById: (id: string) => {
        const galleries = galleryFallbackDb.getAll();
        return galleries.find((g: any) => g._id === id || g.id === id);
    },

    create: (galleryData: any) => {
        const galleries = galleryFallbackDb.getAll();
        const newGallery = {
            _id: `gallery_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            ...galleryData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        galleries.push(newGallery);
        fs.writeFileSync(DB_FILE, JSON.stringify(galleries, null, 2), 'utf8');
        return newGallery;
    },

    update: (id: string, updateData: any) => {
        const galleries = galleryFallbackDb.getAll();
        const index = galleries.findIndex((g: any) => g._id === id || g.id === id);
        if (index !== -1) {
            galleries[index] = {
                ...galleries[index],
                ...updateData,
                updatedAt: new Date().toISOString()
            };
            fs.writeFileSync(DB_FILE, JSON.stringify(galleries, null, 2), 'utf8');
            return galleries[index];
        }
        return null;
    },

    delete: (id: string) => {
        let galleries = galleryFallbackDb.getAll();
        const initialLength = galleries.length;
        galleries = galleries.filter((g: any) => g._id !== id && g.id !== id);
        if (galleries.length !== initialLength) {
            fs.writeFileSync(DB_FILE, JSON.stringify(galleries, null, 2), 'utf8');
            return true;
        }
        return false;
    }
};
