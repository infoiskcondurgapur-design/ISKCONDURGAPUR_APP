import fs from 'fs';
import path from 'path';

const DB_FILE = path.join(process.cwd(), 'data', 'classroom-submissions.json');

const ensureDbExists = () => {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
        // Pre-seed some submissions to match the screenshot where tasks 1 & 2 are submitted
        const defaultSubmissions = [
            {
                _id: "sub1",
                assessmentId: "task1",
                studentId: "000000000000000000000001",
                textSubmission: "I have recorded and completed the first Sloka memorization task. Please find my review.",
                status: "Submitted",
                submittedAt: "2026-06-26T10:00:00.000Z",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                _id: "sub2",
                assessmentId: "task2",
                studentId: "000000000000000000000001",
                textSubmission: "Submitted. Eyes closed memorization video of Sri Isopanishad Mantra 9 & 15 is uploaded.",
                status: "Submitted",
                submittedAt: "2026-06-26T11:00:00.000Z",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                _id: "sub4",
                assessmentId: "task4",
                studentId: "000000000000000000000001",
                textSubmission: "Great lecture by Srila Prabhupada about devotional service and the nature of the soul.",
                status: "Submitted",
                submittedAt: "2026-06-26T12:00:00.000Z",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        ];
        fs.writeFileSync(DB_FILE, JSON.stringify(defaultSubmissions, null, 2), 'utf8');
    }
};

export const classroomSubmissionsFallbackDb = {
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

    getByStudentAndAssessment: (studentId: string, assessmentId: string) => {
        const submissions = classroomSubmissionsFallbackDb.getAll();
        return submissions.find((s: any) => 
            s.assessmentId === assessmentId && 
            (s.studentId === studentId || studentId === 'guest' || s.studentId === '000000000000000000000001')
        );
    },

    submit: (submissionData: any) => {
        const submissions = classroomSubmissionsFallbackDb.getAll();
        const index = submissions.findIndex((s: any) => 
            s.assessmentId === submissionData.assessmentId && 
            s.studentId === submissionData.studentId
        );

        const newSubmission = {
            _id: index !== -1 ? submissions[index]._id : Date.now().toString(),
            assessmentId: submissionData.assessmentId,
            studentId: submissionData.studentId,
            textSubmission: submissionData.textSubmission || '',
            audioUrl: submissionData.audioUrl || '',
            fileUrl: submissionData.fileUrl || '',
            fileName: submissionData.fileName || '',
            status: 'Submitted',
            submittedAt: new Date().toISOString(),
            createdAt: index !== -1 ? submissions[index].createdAt : new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        if (index !== -1) {
            submissions[index] = newSubmission;
        } else {
            submissions.push(newSubmission);
        }

        fs.writeFileSync(DB_FILE, JSON.stringify(submissions, null, 2), 'utf8');
        return newSubmission;
    }
};
