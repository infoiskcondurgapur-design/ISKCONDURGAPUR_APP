import fs from 'fs';
import path from 'path';

const DB_FILE = path.join(process.cwd(), 'data', 'quotes.json');
const FALLBACK_FILE = path.join(process.cwd(), 'src', 'data', 'quotes_fallback.json');

const ensureDbExists = () => {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
        if (fs.existsSync(FALLBACK_FILE)) {
            fs.copyFileSync(FALLBACK_FILE, DB_FILE);
        } else {
            fs.writeFileSync(DB_FILE, JSON.stringify([], null, 2), 'utf8');
        }
    }
};

export const quoteFallbackDb = {
    getAll: () => {
        ensureDbExists();
        try {
            const data = fs.readFileSync(DB_FILE, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error('Error reading quote fallback DB:', error);
            return [];
        }
    },

    getById: (id: string) => {
        const quotes = quoteFallbackDb.getAll();
        return quotes.find((q: any) => q._id === id || q.id === id);
    },

    create: (quoteData: any) => {
        const quotes = quoteFallbackDb.getAll();
        const newQuote = {
            _id: Date.now().toString(),
            ...quoteData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        quotes.push(newQuote);
        fs.writeFileSync(DB_FILE, JSON.stringify(quotes, null, 2), 'utf8');
        return newQuote;
    },

    update: (id: string, updateData: any) => {
        const quotes = quoteFallbackDb.getAll();
        const index = quotes.findIndex((q: any) => q._id === id || q.id === id);
        if (index !== -1) {
            quotes[index] = {
                ...quotes[index],
                ...updateData,
                updatedAt: new Date().toISOString()
            };
            fs.writeFileSync(DB_FILE, JSON.stringify(quotes, null, 2), 'utf8');
            return quotes[index];
        }
        return null;
    },

    delete: (id: string) => {
        let quotes = quoteFallbackDb.getAll();
        const initialLength = quotes.length;
        quotes = quotes.filter((q: any) => q._id !== id && q.id !== id);
        if (quotes.length !== initialLength) {
            fs.writeFileSync(DB_FILE, JSON.stringify(quotes, null, 2), 'utf8');
            return true;
        }
        return false;
    }
};
