import fs from 'fs';
import path from 'path';

const DB_FILE = path.join(process.cwd(), 'data', 'blogs.json');

const ensureDbExists = () => {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
        fs.writeFileSync(DB_FILE, JSON.stringify([], null, 2), 'utf8');
    }
};

export const blogFallbackDb = {
    getAll: () => {
        ensureDbExists();
        try {
            const data = fs.readFileSync(DB_FILE, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error('Error reading blog fallback DB:', error);
            return [];
        }
    },

    getById: (id: string) => {
        const blogs = blogFallbackDb.getAll();
        return blogs.find((blog: any) => blog._id === id || blog.id === id);
    },

    getBySlug: (slug: string) => {
        const blogs = blogFallbackDb.getAll();
        return blogs.find((blog: any) => blog.slug === slug);
    },

    create: (blogData: any) => {
        const blogs = blogFallbackDb.getAll();
        const newBlog = {
            _id: Date.now().toString(),
            ...blogData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        blogs.push(newBlog);
        fs.writeFileSync(DB_FILE, JSON.stringify(blogs, null, 2), 'utf8');
        return newBlog;
    },

    update: (id: string, updateData: any) => {
        const blogs = blogFallbackDb.getAll();
        const index = blogs.findIndex((blog: any) => blog._id === id || blog.id === id || blog.slug === id);
        if (index !== -1) {
            blogs[index] = {
                ...blogs[index],
                ...updateData,
                updatedAt: new Date().toISOString()
            };
            fs.writeFileSync(DB_FILE, JSON.stringify(blogs, null, 2), 'utf8');
            return blogs[index];
        }
        return null;
    },

    delete: (id: string) => {
        let blogs = blogFallbackDb.getAll();
        const initialLength = blogs.length;
        blogs = blogs.filter((blog: any) => blog._id !== id && blog.id !== id && blog.slug !== id);
        if (blogs.length !== initialLength) {
            fs.writeFileSync(DB_FILE, JSON.stringify(blogs, null, 2), 'utf8');
            return true;
        }
        return false;
    }
};
