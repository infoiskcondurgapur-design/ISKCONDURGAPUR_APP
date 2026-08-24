import fs from 'fs';
import path from 'path';

// Seed data
export const DEFAULT_SEED_PROJECTS = [
  {
    _id: "project_1",
    title: "Vedic Cultural Centre & Temple Construction",
    category: "Construction",
    description: "Support the expansion of our temple hall and the construction of a state-of-the-art Vedic Cultural Centre to serve the Durgapur community.",
    fullDescription: "Our temple expansion project aims to create a magnificent spiritual landmark in Durgapur. The new complex will feature a spacious temple hall (holding over 1,500 devotees), an exhibition gallery illustrating Vedic history and philosophy, a guest house for pilgrims, a modern seminar hall for youth education, and an expanded prasadam distribution hall.\n\nBy contributing to the construction of this temple, you are helping build a permanent sanctuary of peace, spirituality, and culture for generations to come. Every brick donated brings us closer to making this divine vision a reality.",
    image: "/images/iskcon_durgapur_temple.png",
    status: "Active",
    targetAmount: 5000000,
    raisedAmount: 3200000,
    donorsCount: 184,
    featured: true,
    tags: ["Building", "Temple", "VCC"],
    createdAt: "2026-01-10T08:00:00.000Z",
    updatedAt: "2026-06-10T12:00:00.000Z"
  },
  {
    _id: "project_2",
    title: "Food For Life (Prasadam Distribution)",
    category: "Annadanam",
    description: "Daily distribution of hot, sanctified lacto-vegetarian meals (prasadam) to underprivileged and hungry citizens in and around Durgapur.",
    fullDescription: "Food For Life is the world's largest vegetarian food distribution program. At ISKCON Durgapur, our volunteers prepare fresh, highly nutritious, sanctified meals daily and distribute them in marginalized neighborhoods, local orphanages, and outside hospitals.\n\nWe believe that no one within a ten-mile radius of our temple should go hungry. Your support helps buy cooking ingredients, maintain distribution vehicles, and reach more remote villages. A donation of just Γé╣100 can feed 5 people with hearty, sanctified meals.",
    image: "/images/prasadam-dist.jpg",
    status: "Active",
    targetAmount: 1500000,
    raisedAmount: 1120000,
    donorsCount: 420,
    featured: true,
    tags: ["Prasadam", "Charity", "Food Distribution"],
    createdAt: "2026-01-15T08:00:00.000Z",
    updatedAt: "2026-06-11T12:00:00.000Z"
  },
  {
    _id: "project_3",
    title: "Sri Sri Radha Madhava Goshala & Cow Protection",
    category: "Cow Protection",
    description: "Caring for abandoned cows, providing them with shelter, green fodder, medical treatment, and promoting organic Vedic farming practices.",
    fullDescription: "Cow protection is one of the core pillars of Vedic culture. Our Goshala project provides a loving home for retired, abandoned, or injured cows and bulls. We currently care for a herd of healthy cows who provide fresh, pure milk for the daily worship of Sri Sri Radha Madhava.\n\nFunds from this project go directly toward purchasing organic fodder, medicines, hiring veterinarians, and maintaining comfortable sheds. We also use natural cow manure to promote local organic farming, creating a sustainable ecosystem.",
    image: "/images/goshala.jpg",
    status: "Active",
    targetAmount: 800000,
    raisedAmount: 540000,
    donorsCount: 112,
    featured: false,
    tags: ["Cows", "Goshala", "Organic"],
    createdAt: "2026-02-01T08:00:00.000Z",
    updatedAt: "2026-06-08T12:00:00.000Z"
  },
  {
    _id: "project_4",
    title: "Bhagavad Gita & Spiritual Education for Youth",
    category: "Education",
    description: "Sponsoring spiritual literatures, Bhagavad Gita courses, values-based seminars, and stress-management workshops for college students.",
    fullDescription: "Today's youth face immense stress, anxiety, and peer pressure. Our ISKCON Youth Forum (IYF) organizes personality development workshops, yoga retreats, and seminars on applied Vedic wisdom for students from local universities (like NIT Durgapur) and schools.\n\nYour sponsorship helps us distribute Bhagavad Gitas and other spiritual books at highly subsidized rates, organize seminars in colleges, and support our youth hostel facilities. Help us empower the next generation with moral character and spiritual strength.",
    image: "/images/youth-education.jpg",
    status: "Active",
    targetAmount: 600000,
    raisedAmount: 380000,
    donorsCount: 98,
    featured: false,
    tags: ["Youth", "Gita", "Books"],
    createdAt: "2026-02-10T08:00:00.000Z",
    updatedAt: "2026-06-05T12:00:00.000Z"
  },
  {
    _id: "project_5",
    title: "Deity Seva & Shringar Sponsorship",
    category: "Deity Seva",
    description: "Sponsor the gorgeous outfits (poshak), flower decorations, and daily worship items for the temple deities, Sri Sri Radha Madhava.",
    fullDescription: "The daily worship of the deities is conducted with the highest standards of devotion. Sri Sri Radha Madhava and Sri Sri Jagannatha, Baladeva, Subhadra are dressed in gorgeous handmade outfits twice a day and adorned with fresh garlands.\n\nSponsoring deity seva is a wonderful way to express your devotion. This project allows devotees to sponsor outfits for special festivals (like Janmashtami or Radhastami), daily flowers, fruits, incense, and ghee for arati plates.",
    image: "/images/deities.jpg",
    status: "Active",
    targetAmount: 1200000,
    raisedAmount: 950000,
    donorsCount: 245,
    featured: true,
    tags: ["Worship", "Deities", "Flowers"],
    createdAt: "2026-01-05T08:00:00.000Z",
    updatedAt: "2026-06-12T12:00:00.000Z"
  }
];

const DATA_DIR = path.join(process.cwd(), 'src', 'data');
const DATA_FILE = path.join(DATA_DIR, 'projects_fallback.json');

function ensureInitialized(): any[] {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(DEFAULT_SEED_PROJECTS, null, 2), 'utf-8');
    return DEFAULT_SEED_PROJECTS;
  }

  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading projects fallback JSON database, resetting:', err);
    fs.writeFileSync(DATA_FILE, JSON.stringify(DEFAULT_SEED_PROJECTS, null, 2), 'utf-8');
    return DEFAULT_SEED_PROJECTS;
  }
}

export const projectsFallbackDb = {
  getAll(): any[] {
    return ensureInitialized();
  },

  getById(id: string): any | null {
    const list = ensureInitialized();
    return list.find(p => p._id === id || p.id === id) || null;
  },

  create(data: any): any {
    const list = ensureInitialized();
    const newProject = {
      ...data,
      _id: `project_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    list.push(newProject);
    fs.writeFileSync(DATA_FILE, JSON.stringify(list, null, 2), 'utf-8');
    return newProject;
  },

  update(id: string, data: any): any | null {
    const list = ensureInitialized();
    const idx = list.findIndex(p => p._id === id || p.id === id);
    if (idx === -1) return null;

    const updatedProject = {
      ...list[idx],
      ...data,
      updatedAt: new Date().toISOString()
    };
    list[idx] = updatedProject;
    fs.writeFileSync(DATA_FILE, JSON.stringify(list, null, 2), 'utf-8');
    return updatedProject;
  },

  delete(id: string): boolean {
    let list = ensureInitialized();
    const initialLen = list.length;
    list = list.filter(p => p._id !== id && p.id !== id);
    if (list.length === initialLen) return false;

    fs.writeFileSync(DATA_FILE, JSON.stringify(list, null, 2), 'utf-8');
    return true;
  }
};
