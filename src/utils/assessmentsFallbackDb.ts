import fs from 'fs';
import path from 'path';

const DB_FILE = path.join(process.cwd(), 'data', 'classroom-assessments.json');

const ensureDbExists = () => {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
        const defaultAssessments = [
            {
                _id: "task1",
                batchId: "batch1",
                title: "Sloka Memorization - Sri Isopanishad (Avahana, Mantra 1)",
                description: "Each video shall consist of two Shlokas offered without interruption. For each verse, the student is to state the Verse Number, the Shloka, and its Translation. Eyes must remain closed in inward focus for the duration of the recording to honor the spiritual nature of the verses. αª¬αºìαª░αªñαª┐αªƒαª┐ αª¡αª┐αªíαª┐αªô...",
                dueDate: "2026-06-29T23:59:59.000Z",
                points: 100,
                isPinned: true,
                status: "Published",
                category: "Sloka Memorization",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                _id: "task2",
                batchId: "batch1",
                title: "Sloka Memorization - Sri Isopanishad (Mantra 9, Mantra 15)",
                description: "Each video shall consist of two Shlokas offered without interruption. For each verse, the student is to state the Verse Number, the Shloka, and its Translation. Eyes must remain closed in inward focus for the duration of the recording to honor the spiritual nature of the verses. αª¬αºìαª░αªñαª┐αªƒαª┐ αª¡αª┐αªíαª┐αªô...",
                dueDate: "2026-06-29T23:59:59.000Z",
                points: 100,
                isPinned: true,
                status: "Published",
                category: "Sloka Memorization",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                _id: "task3",
                batchId: "batch1",
                title: "Today's listening to Srila Prabhupada - 137 (27.06.26)",
                description: "Listen to the audio and write down your reflection or daily realization. Record your reflection using your microphone if desired.",
                youtubeUrl: "https://www.youtube.com/watch?v=igYTZO49JS8",
                dueDate: "2026-06-27T23:59:59.000Z",
                points: 100,
                isPinned: false,
                status: "Published",
                category: "Daily Listening",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                _id: "task4",
                batchId: "batch1",
                title: "Today's listening to Srila Prabhupada - 136 (26.06.26)",
                description: "Listen to the audio and write down your reflection or daily realization.",
                youtubeUrl: "https://www.youtube.com/watch?v=46_GzvqGc7I",
                dueDate: "2026-06-26T23:59:59.000Z",
                points: 100,
                isPinned: false,
                status: "Closed",
                category: "Daily Listening",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                _id: "task5",
                batchId: "batch1",
                title: "Today's listening to Srila Prabhupada - 135 (25.06.26)",
                description: "Listen to the audio and write down your reflection or daily realization.",
                youtubeUrl: "https://www.youtube.com/watch?v=Ut4UXlg7mWQ",
                dueDate: "2026-06-25T23:59:59.000Z",
                points: 100,
                isPinned: false,
                status: "Closed",
                category: "Daily Listening",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        ];
        fs.writeFileSync(DB_FILE, JSON.stringify(defaultAssessments, null, 2), 'utf8');
    }
};

export const assessmentsFallbackDb = {
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

    getByBatchId: (batchId: string) => {
        const assessments = assessmentsFallbackDb.getAll();
        return assessments.filter((a: any) => a.batchId === batchId);
    },

    getById: (id: string) => {
        const assessments = assessmentsFallbackDb.getAll();
        return assessments.find((a: any) => a._id === id || a.id === id);
    },

    create: (assessmentData: any) => {
        const assessments = assessmentsFallbackDb.getAll();
        const newAssessment = {
            _id: Date.now().toString(),
            ...assessmentData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        assessments.push(newAssessment);
        fs.writeFileSync(DB_FILE, JSON.stringify(assessments, null, 2), 'utf8');
        return newAssessment;
    }
};
