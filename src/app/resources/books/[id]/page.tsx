'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaArrowLeft, FaTimes, FaBookOpen, FaBookmark, FaGlobe, FaChevronDown } from 'react-icons/fa';

interface BookDetail {
  _id: string;
  title: string;
  type: string;
  category?: string;
  description?: string;
  content?: string;
  author?: string;
  thumbnail?: string;
  tags?: string[];
}

const bookChaptersMap: Record<string, string[]> = {
  // Bhagavad-gita As It Is
  "65f1234567890abcdef12301": [
    "Chapter 1: Observing the Armies on the Battlefield of Kuruksetra",
    "Chapter 2: Contents of the Gita Summarized",
    "Chapter 3: Karma-yoga",
    "Chapter 4: Transcendental Knowledge",
    "Chapter 5: Karma-yoga—Action in Krsna Consciousness",
    "Chapter 6: Dhyana-yoga",
    "Chapter 7: Knowledge of the Absolute",
    "Chapter 8: Attaining the Supreme",
    "Chapter 9: The Most Confidential Knowledge",
    "Chapter 10: The Opulence of the Absolute",
    "Chapter 11: The Universal Form",
    "Chapter 12: Devotional Service",
    "Chapter 13: Nature, the Enjoyer and Consciousness",
    "Chapter 14: The Three Modes of Material Nature",
    "Chapter 15: The Yoga of the Supreme Person",
    "Chapter 16: The Divine and Demoniac Natures",
    "Chapter 17: The Divisions of Faith",
    "Chapter 18: Conclusion—The Perfection of Renunciation"
  ],
  // Srimad-Bhagavatam
  "65f1234567890abcdef12302": [
    "Canto 1: Creation",
    "Canto 2: The Cosmic Manifestation",
    "Canto 3: The Status Quo",
    "Canto 4: The Creation of the Fourth Order",
    "Canto 5: The Creative Impetus",
    "Canto 6: Prescribed Duties for Mankind",
    "Canto 7: The Science of God",
    "Canto 8: Withdrawal of the Cosmic Creations",
    "Canto 9: Liberation",
    "Canto 10: The Summum Bonum",
    "Canto 11: General History",
    "Canto 12: The Age of Deterioration"
  ],
  // Sri Caitanya-caritamrta
  "65f1234567890abcdef12303": [
    "Adi-lila: The Pastimes of Lord Caitanya Mahaprabhu's Childhood",
    "Madhya-lila: The Middle Pastimes of Lord Caitanya Mahaprabhu",
    "Antya-lila: The Final Pastimes of Lord Caitanya Mahaprabhu"
  ],
  // Nectar of Instruction
  "65f1234567890abcdef12304": [
    "Preface",
    "Verse 1: Control of speech, mind, anger, tongue, belly and genitals",
    "Verse 2: Six obstacles to devotional service",
    "Verse 3: Six qualities that enhance devotional service",
    "Verse 4: Six symptoms of love shared by devotees",
    "Verse 5: Three classes of devotees and how to behave with them",
    "Verse 6: Pure devotee is not subject to material defects",
    "Verse 7: Chanting cures the disease of ignorance",
    "Verse 8: How to perform devotional service in Vrindavan",
    "Verse 9: Vrindavan is superior to all other holy places",
    "Verse 10: Radha-kunda is the highest holy site",
    "Verse 11: Bathing in Radha-kunda awards love of Krishna"
  ],
  // Krsna Book
  "65f1234567890abcdef12305": [
    "Introduction",
    "Chapter 1: The Advent of Lord Krsna",
    "Chapter 2: Prayers by the Demigods for Lord Krsna in the Womb",
    "Chapter 3: Birth of Lord Krsna",
    "Chapter 4: Kansa Begins His Persecutions",
    "Chapter 5: Meeting of Nanda and Vasudeva",
    "Chapter 6: Putana Killed",
    "Chapter 7: Salvation of Trnavarta",
    "Chapter 8: Vision of the Universal Form",
    "Chapter 9: Mother Yasoda Binding Lord Krsna",
    "Chapter 10: Deliverance of Nalakuvara and Manigriva"
  ],
  // The Nectar of Devotion
  "65f1234567890abcdef12306": [
    "Preface & Introduction",
    "Part 1: Samanya-bhakti (Devotional Service in General)",
    "Part 2: Sadhana-bhakti (Devotional Service in Practice)",
    "Part 3: Bhava-bhakti (Devotional Service in Ecstasy)",
    "Part 4: Prema-bhakti (Devotional Service in Love of God)"
  ],
  // Sri Isopanisad
  "65f1234567890abcdef12307": [
    "Invocation",
    "Mantra 1: The Lord's ownership and control of everything",
    "Mantra 2: Working in harmony with the laws of nature",
    "Mantra 3: The destination of the killer of the soul",
    "Mantra 4: The attributes of the Supreme Personality of Godhead",
    "Mantra 5: The transcendental potency of the Lord",
    "Mantra 6: The vision of a pure devotee",
    "Mantra 7: Oneness of interest with the Supreme",
    "Mantra 8: The self-sufficient Lord and His expansions",
    "Mantras 9-11: Knowledge and ignorance",
    "Mantras 12-14: Absolute worship and relative worship",
    "Mantras 15-18: Prayers to the Lord at the time of death"
  ],
  // The Science of Self-Realization
  "65f1234567890abcdef12308": [
    "Chapter 1: Learning the Science of the Soul",
    "Chapter 2: Choosing a Spiritual Master",
    "Chapter 3: Discovering the Roots of Krsna Consciousness",
    "Chapter 4: Understanding Krsna and Christ",
    "Chapter 5: Practicing Yoga in the Age of Quarrel",
    "Chapter 6: Finding Spiritual Solutions to Material Problems",
    "Chapter 7: Advancing in Spiritual Science",
    "Chapter 8: Reaching the Ultimate Goal"
  ],
  // Beyond Birth and Death
  "65f1234567890abcdef12309": [
    "Chapter 1: We Are Not These Bodies",
    "Chapter 2: Elevation to Higher Planetary Systems",
    "Chapter 3: Liberation from Material Entanglement",
    "Chapter 4: The Yoga of the Supreme Person",
    "Chapter 5: Reaching the Supreme Destination"
  ],
  // Bhakti: The Art of Eternal Love
  "65f1234567890abcdef12310": [
    "Chapter 1: The Meaning of Bhakti",
    "Chapter 2: The Path of Pure Devotion",
    "Chapter 3: Love of God is Our Natural State",
    "Chapter 4: The Ultimate Yoga",
    "Chapter 5: Elevating Our Consciousness"
  ],
  // Sri Brahma-samhita
  "65f1234567890abcdef12311": [
    "Chapter 5: The Hymns of Lord Brahma (Verses 1-62)"
  ],
  // Civilization and Transcendence
  "65f1234567890abcdef12312": [
    "Chapter 1: The Modern Malaise",
    "Chapter 2: Spiritual Alchemy",
    "Chapter 3: Simple Living, High Thinking",
    "Chapter 4: The Soul's True Duty",
    "Chapter 5: Transcendental Knowledge"
  ]
};

const staticFallbackBooksList = [
  { _id: "65f1234567890abcdef12301", title: "Bhagavad-gītā As It Is" },
  { _id: "65f1234567890abcdef12302", title: "Śrīmad-Bhāgavatam" },
  { _id: "65f1234567890abcdef12303", title: "Śrī Caitanya-caritāmṛta" },
  { _id: "65f1234567890abcdef12304", title: "Nectar of Instruction" },
  { _id: "65f1234567890abcdef12305", title: "Kṛṣṇa, the Supreme Personality of Godhead" },
  { _id: "65f1234567890abcdef12306", title: "The Nectar of Devotion" },
  { _id: "65f1234567890abcdef12307", title: "Śrī Īśopaniṣad" },
  { _id: "65f1234567890abcdef12308", title: "The Science of Self-Realization" },
  { _id: "65f1234567890abcdef12309", title: "Beyond Birth and Death" },
  { _id: "65f1234567890abcdef12310", title: "Bhakti: The Art of Eternal Love" },
  { _id: "65f1234567890abcdef12311", title: "Śrī Brahma-saṁhitā" },
  { _id: "65f1234567890abcdef12312", title: "Civilization and Transcendence" }
];

// Offline metadata so canonical books always open, even if the DB is empty
const staticBookMeta: Record<string, { title: string; description: string }> = {
  "65f1234567890abcdef12301": { title: "Bhagavad-gītā As It Is", description: "The timeless conversation between Lord Kṛṣṇa and Arjuna — the essence of Vedic wisdom." },
  "65f1234567890abcdef12302": { title: "Śrīmad-Bhāgavatam", description: "The ripened fruit of the tree of Vedic literature, narrating the pastimes of the Lord." },
  "65f1234567890abcdef12303": { title: "Śrī Caitanya-caritāmṛta", description: "The life and teachings of Śrī Caitanya Mahāprabhu, the golden avatar." },
  "65f1234567890abcdef12304": { title: "Nectar of Instruction", description: "Eleven essential instructions from Śrīla Rūpa Gosvāmī, illuminated by Śrīla Prabhupāda." },
  "65f1234567890abcdef12305": { title: "Kṛṣṇa, the Supreme Personality of Godhead", description: "The beautiful pastimes of Lord Kṛṣṇa in Vṛndāvana, told by Śrīla Prabhupāda." },
  "65f1234567890abcdef12306": { title: "The Nectar of Devotion", description: "The complete science of bhakti-yoga, based on Śrīla Rūpa Gosvāmī's Bhakti-rasāmṛta-sindhu." },
  "65f1234567890abcdef12307": { title: "Śrī Īśopaniṣad", description: "Eighteen mantras revealing the Lord's ownership and control of everything." },
  "65f1234567890abcdef12308": { title: "The Science of Self-Realization", description: "Practical guidance on yoga, meditation, and living in Kṛṣṇa consciousness." },
  "65f1234567890abcdef12309": { title: "Beyond Birth and Death", description: "We are not these bodies — discover the soul's journey beyond birth and death." },
  "65f1234567890abcdef12310": { title: "Bhakti: The Art of Eternal Love", description: "Awakening our natural state of pure love of God through devotional service." },
  "65f1234567890abcdef12311": { title: "Śrī Brahma-saṁhitā", description: "The hymns of Lord Brahma glorifying the Supreme Personality of Godhead." },
  "65f1234567890abcdef12312": { title: "Civilization and Transcendence", description: "Simple living and high thinking — the spiritual solution to the modern malaise." }
};

const getChaptersForSubLevel = (bookId: string, subLevel: string): string[] => {
  // Srimad-Bhagavatam
  if (bookId === "65f1234567890abcdef12302") {
    if (subLevel.startsWith("Canto 1:")) {
      return [
        "Dedication",
        "Preface",
        "Introduction",
        "CHAPTER ONE: Questions by the Sages",
        "CHAPTER TWO: Divinity and Divine Service",
        "CHAPTER THREE: Kṛṣṇa Is the Source of All Incarnations",
        "CHAPTER FOUR: The Appearance of Śrī Nārada",
        "CHAPTER FIVE: Nārada's Instructions on Śrīmad-Bhāgavatam for Vyāsadeva",
        "CHAPTER SIX: Conversation Between Nārada and Vyāsadeva",
        "CHAPTER SEVEN: The Son of Droṇa Punished",
        "CHAPTER EIGHT: Prayers by Queen Kuntī and Parīkṣit Saved",
        "CHAPTER NINE: The Passing Away of Bhīṣmadeva in the Presence of Lord Kṛṣṇa",
        "CHAPTER TEN: Departure of Lord Kṛṣṇa for Dvārakā",
        "CHAPTER ELEVEN: Lord Kṛṣṇa's Entrance into Dvārakā",
        "CHAPTER TWELVE: Birth of Emperor Parīkṣit",
        "CHAPTER THIRTEEN: Dhṛtarāṣṭra Quits Home",
        "CHAPTER FOURTEEN: The Disappearance of Lord Kṛṣṇa",
        "CHAPTER FIFTEEN: The Pāṇḍavas Retire Timely",
        "CHAPTER SIXTEEN: How Parīkṣit Received the Age of Kali",
        "CHAPTER SEVENTEEN: Punishment and Reward of Kali",
        "CHAPTER EIGHTEEN: Mahārāja Parīkṣit Cursed by a Brāhmaṇa Boy",
        "CHAPTER NINETEEN: The Appearance of Śukadeva Gosvāmī"
      ];
    }
    if (subLevel.startsWith("Canto 2:")) {
      return [
        "CHAPTER ONE: The First Step in God Realization",
        "CHAPTER TWO: The Lord in the Heart",
        "CHAPTER THREE: Pure Devotional Service: The Change in Heart",
        "CHAPTER FOUR: The Process of Creation",
        "CHAPTER FIVE: The Cause of All Causes",
        "CHAPTER SIX: Puruṣa-sūkta Confirmed",
        "CHAPTER SEVEN: Scheduled Incarnations with Specific Functions",
        "CHAPTER EIGHT: Questions by King Parīkṣit",
        "CHAPTER NINE: Answers by Citing the Lord's Version",
        "CHAPTER TEN: Bhāgavatam Is the Answer to All Questions"
      ];
    }
    
    // Fallback for Cantos 3 to 12
    const cantoNumberMatch = subLevel.match(/Canto (\d+)/);
    if (cantoNumberMatch) {
      const cantoNum = parseInt(cantoNumberMatch[1], 10);
      const chapterCounts: Record<number, number> = {
        3: 33, 4: 31, 5: 26, 6: 19, 7: 15, 8: 24, 9: 24, 10: 90, 11: 31, 12: 13
      };
      const count = chapterCounts[cantoNum] || 15;
      const chaps = [];
      const numWords = ["ONE", "TWO", "THREE", "FOUR", "FIVE", "SIX", "SEVEN", "EIGHT", "NINE", "TEN", 
                        "ELEVEN", "TWELVE", "THIRTEEN", "FOURTEEN", "FIFTEEN", "SIXTEEN", "SEVENTEEN", "EIGHTEEN", "NINETEEN", "TWENTY",
                        "TWENTY-ONE", "TWENTY-TWO", "TWENTY-THREE", "TWENTY-FOUR", "TWENTY-FIVE", "TWENTY-SIX", "TWENTY-SEVEN", "TWENTY-EIGHT", "TWENTY-NINE", "THIRTY",
                        "THIRTY-ONE", "THIRTY-TWO", "THIRTY-THREE"];
      for (let i = 1; i <= count; i++) {
        const numWord = numWords[i - 1] || `${i}`;
        chaps.push(`CHAPTER ${numWord}: Transcendental Pastimes Part ${i}`);
      }
      return chaps;
    }
  }

  // Sri Caitanya-caritamrta
  if (bookId === "65f1234567890abcdef12303") {
    if (subLevel.startsWith("Adi-lila")) {
      return [
        "CHAPTER ONE: The Spiritual Masters",
        "CHAPTER TWO: Śrī Caitanya Mahāprabhu Is the Supreme Personality of Godhead",
        "CHAPTER THREE: The External Reasons for the Appearance of Śrī Caitanya Mahāprabhu",
        "CHAPTER FOUR: The Confidential Reasons for the Appearance of Śrī Caitanya Mahāprabhu",
        "CHAPTER FIVE: The Glories of Lord Nityānanda Balarāma",
        "CHAPTER SIX: The Glories of Śrī Advaita Ācārya",
        "CHAPTER SEVEN: Lord Caitanya in Five Features",
        "CHAPTER EIGHT: The Author Receives the Orders of Kṛṣṇa and Guru",
        "CHAPTER NINE: The Desire Tree of Devotional Service",
        "CHAPTER TEN: The Trunk, Branches and Subbranches of the Caitanya Tree",
        "CHAPTER ELEVEN: The Expansions of Lord Nityānanda",
        "CHAPTER TWELVE: The Expansions of Advaita Ācārya and Gadādhara Paṇḍita",
        "CHAPTER THIRTEEN: The Advent of Lord Śrī Caitanya Mahāprabhu",
        "CHAPTER FOURTEEN: Lord Caitanya’s Childhood Pastimes",
        "CHAPTER FIFTEEN: The Lord’s Paugaṇḍa-līlā",
        "CHAPTER SIXTEEN: The Pastimes of the Lord in His Childhood and Youth",
        "CHAPTER SEVENTEEN: The Pastimes of Lord Caitanya Mahāprabhu in His Youth"
      ];
    }
    
    const count = subLevel.startsWith("Madhya-lila") ? 25 : 20;
    const lilaName = subLevel.startsWith("Madhya-lila") ? "Madhya-līlā" : "Antya-līlā";
    const chaps = [];
    for (let i = 1; i <= count; i++) {
      chaps.push(`CHAPTER ${i}: Sublime Devotion of Lord Caitanya in ${lilaName}`);
    }
    return chaps;
  }

  return [];
};

interface VerseDetail {
  textNumber: string;
  verse?: string;
  synonyms?: string;
  translation: string;
  purport?: string;
}

const getChapterTitleParts = (chapter: string) => {
  const colonIdx = chapter.indexOf(':');
  if (colonIdx !== -1) {
    return {
      prefix: chapter.substring(0, colonIdx).trim(),
      main: chapter.substring(colonIdx + 1).trim()
    };
  }
  return {
    prefix: "",
    main: chapter
  };
};

const getChapterVerses = (bookId: string, subLevel: string | null, chapter: string): VerseDetail[] => {
  // Check if it is Srimad-Bhagavatam Canto 1 Chapter 2
  if (bookId === "65f1234567890abcdef12302" && subLevel === "Canto 1: Creation" && chapter.includes("CHAPTER TWO")) {
    return [
      {
        textNumber: "Text 1",
        verse: "vyāsa uvāca\niti sampraśna-saṁhṛṣṭo viprāṇāṁ romaharṣaṇiḥ\npratipūjya vacas teṣāṁ pravaktum upacakrame",
        synonyms: "vyāsaḥ uvāca — Vyāsa said; iti — thus; sampraśna — perfect inquiries; saṁhṛṣṭaḥ — being fully satisfied; viprāṇām — of the brāhmaṇas; romaharṣaṇiḥ — Sūta Gosvāmī, the son of Romaharṣaṇa; pratipūjya — thanking them; vacaḥ — words; teṣām — their; pravaktum — to reply; upacakrame — attempted.",
        translation: "Ugraśravā [Sūta Gosvāmī], the son of Romaharṣaṇa, being fully satisfied by the perfect questions of the brāhmaṇas, thanked them and thus attempted to reply.",
        purport: "The sages at Naimiṣāraṇya asked Sūta Gosvāmī six questions, and so he was pleased and prepared to answer them in sequence."
      },
      {
        textNumber: "Text 2",
        verse: "yaṁ pravrajantam anupetam apeta-kṛtyaṁ\ndvaipāyano viraha-kātara ājuhāva\nputreti tan-mayatayā taravo 'bhinedus\ntaṁ sarva-bhūta-hṛdayaṁ munim ānato 'smi",
        synonyms: "yam — whom; pravrajantam — while leaving home; anupetam — without being initiated; apeta — prescribed duties; kṛtyam — activities; dvaipāyanaḥ — Vyāsadeva; viraha — separation; kātaraḥ — being overwhelmed; ājuhāva — called; putra iti — O my son!; tat-mayatayā — being absorbed; taravaḥ — the trees; abhineduḥ — responded; tam — him; sarva — all; bhūta — living beings; hṛdayam — heart; munim — sage; ānataḥ asmi — I offer my obeisances.",
        translation: "Śrīla Sūta Gosvāmī said: Let me offer my respectful obeisances unto that great sage [Śukadeva Gosvāmī] who can enter the hearts of all. When he went away to take up the renounced order of life [sannyāsa], leaving home without undergoing reformation by the sacred thread or the ceremonies observed by the higher castes, his father, Vyāsadeva, fearing separation from him, cried out, “O my son!” Indeed, only the trees, which were absorbed in the same feelings of separation, echoed in response to the begrieved father.",
        purport: "This verse glorifies Śrīla Śukadeva Gosvāmī, the spiritual master of Maharaja Parikshit, who could understand the hearts of all living beings."
      },
      {
        textNumber: "Text 3",
        verse: "yaḥ sva-anubhāvam akhila-śruti-sāram ekam\nadhyātma-dīpam atititīrṣatāṁ tamo 'ndham\nsaṁsāriṇāṁ karuṇayā-āha purāṇa-guhyaṁ\ntaṁ vyāsa-sūnum upayāmi guruṁ munīnām",
        synonyms: "yaḥ — who; sva-anubhāvam — personal assimilation; akhila — all; śruti — Vedic scriptures; sāram — essence; ekam — unique; adhyātma — spiritual; dīpam — torchlight; atititīrṣatām — for those desiring to cross; tamaḥ andham — dark ignorance; saṁsāriṇām — of the materialists; karuṇayā — out of compassion; āha — spoke; purāṇa — Purana; guhyam — confidential; tam — him; vyāsa-sūnum — the son of Vyāsadeva; upayāmi — I approach; gurum — spiritual master; munīnām — of the sages.",
        translation: "Let me offer my respectful obeisances unto him [Śuka], the spiritual master of all sages, the son of Vyāsadeva, who, out of his great compassion for those gross materialists who struggle to cross over the darkest regions of material existence, spoke this most confidential supplement to the cream of Vedic knowledge, after having personally assimilated it by experience.",
        purport: "In this verse, Śrīla Śukadeva Gosvāmī is declared to be the spiritual master of all sages."
      },
      {
        textNumber: "Text 4",
        verse: "nārāyaṇaṁ namaskṛtya\nnaraṁ caiva narottamam\ndevīṁ sarasvatīṁ vyāsaṁ\ntato jayam udīrayet",
        synonyms: "nārāyaṇam — the Supreme Lord Nārāyaṇa; namaskṛtya — offering obeisances; naram ca eva — and Nara; nara-uttamam — the supermost human being; devīm — the goddess; sarasvatīm — Sarasvatī; vyāsam — Vyāsadeva; tataḥ — thereafter; jayam — victory; udīrayet — announce.",
        translation: "Before reciting this Śrīmad-Bhāgavatam, which is the very means of conquest, one should offer respectful obeisances unto the Personality of Godhead, Nārāyaṇa, unto Nara-nārāyaṇa Ṛṣi, the supermost human being, unto mother Sarasvatī, the goddess of learning, and unto Śrīla Vyāsadeva, the author.",
        purport: "This is a standard preparatory prayer recited before reading the Srimad Bhagavatam or Mahabharata."
      },
      {
        textNumber: "Text 5",
        verse: "munayaḥ sādhu pṛṣṭo 'haṁ\nbhavadbhir loka-maṅgalam\nyat kṛtaḥ kṛṣṇa-sampraśno\nyenātmā suprasīdati",
        synonyms: "munayaḥ — O sages; sādhu — auspicious; pṛṣṭhaḥ — questioned; aham — I; bhavadbhiḥ — by you; loka-maṅgalam — welfare of the world; yat — because; kṛtaḥ — made; kṛṣṇa-sampraśnaḥ — inquiry about Kṛṣṇa; yena — by which; ātmā — self; suprasīdati — completely satisfied.",
        translation: "O sages, I have been justly questioned by you. Your questions are worthy because they relate to Lord Kṛṣṇa and so are of relevance to the world’s welfare. Only questions of this sort can fully satisfy the self.",
        purport: "Inquiries about the Lord are natural and bring satisfaction to the soul."
      }
    ];
  }

  // Fallback verses
  return [
    {
      textNumber: "Text 1",
      verse: "oṁ namo bhagavate vāsudevāya",
      synonyms: "om — O Lord; namaḥ — obeisances; bhagavate — unto the Personality of Godhead; vāsudevāya — unto Kṛṣṇa, the son of Vasudeva.",
      translation: `This is the translation for Text 1 of ${chapter}.`,
      purport: "This is the purport explaining the transcendental significance of this verse."
    },
    {
      textNumber: "Text 2",
      verse: "śrī-bhagavān uvāca",
      synonyms: "śrī-bhagavān uvāca — the Supreme Personality of Godhead said.",
      translation: `This is the translation for Text 2 of ${chapter}.`,
      purport: "The Lord explains the science of self-realization for the benefit of all living beings."
    }
  ];
};

export default function BookReaderPage({ params }: { params: { id: string } }) {
  const [book, setBook] = useState<BookDetail | null>(null);
  const [allBooks, setAllBooks] = useState<any[]>(staticFallbackBooksList);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [activeChapter, setActiveChapter] = useState<string | null>(null);
  const [selectedSubLevel, setSelectedSubLevel] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'default' | 'advanced' | 'dual'>('default');

  useEffect(() => {
    setSelectedSubLevel(null); 
    setActiveChapter(null);    
    setViewMode('default');
    const fetchBookAndList = async () => {
      try {
        const response = await fetch(`/api/resources/${params.id}`);
        const result = await response.json();
        if (response.ok && result.data) {
          setBook(result.data);
        } else {
          const meta = staticBookMeta[params.id];
          if (meta) {
            setBook({ type: 'Book', _id: params.id, ...meta });
          } else {
            setError(result.message || 'Book not found');
          }
        }

        const listResponse = await fetch('/api/resources');
        const listResult = await listResponse.json();
        if (listResponse.ok && listResult.data) {
          const fetchedBooks = listResult.data.filter((r: any) => r.type === 'Book' && r.isPublished !== false);
          if (fetchedBooks.length > 0) {
            const sorted = [...fetchedBooks].sort((a: any, b: any) => a._id.localeCompare(b._id));
            setAllBooks(sorted);
          }
        }
      } catch (err) {
        console.error('Error fetching book details:', err);
        const meta = staticBookMeta[params.id];
        if (meta) {
          setBook({ type: 'Book', _id: params.id, ...meta });
        } else {
          setError('Failed to load book details');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchBookAndList();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#eed5af] flex items-center justify-center pt-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-950 mx-auto mb-4"></div>
          <p className="font-serif text-lg text-gray-900">Opening volume...</p>
        </div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="min-h-screen bg-[#eed5af] flex items-center justify-center pt-20 px-6">
        <div className="max-w-md w-full bg-[#FAF6EE] rounded border border-[#e4ccaa] p-8 text-center shadow-lg">
          <FaBookOpen className="text-5xl text-red-800 mx-auto mb-4" />
          <h2 className="text-2xl font-serif font-bold text-gray-950 mb-2">Volume Offline</h2>
          <p className="text-gray-700 mb-6 font-serif">{error || 'The requested volume could not be opened.'}</p>
          <Link 
            href="/resources/books" 
            className="inline-flex items-center gap-2 bg-[#eecf9d] hover:bg-[#e6c698] border border-[#cfa77b] text-gray-900 font-bold px-6 py-2.5 rounded-sm transition-all"
          >
            <FaArrowLeft className="text-xs" /> Back to Library
          </Link>
        </div>
      </div>
    );
  }

  const chapters = bookChaptersMap[book._id] || [
    "Introduction & Preface",
    "Chapter 1: The Essence of the Teachings",
    "Chapter 2: Spiritual Practice",
    "Chapter 3: Absolute Realization"
  ];

  const currentIndex = allBooks.findIndex(b => b._id === book._id);
  const prevBook = currentIndex > 0 ? allBooks[currentIndex - 1] : null;
  const nextBook = currentIndex !== -1 && currentIndex < allBooks.length - 1 ? allBooks[currentIndex + 1] : null;

  const isNestedBook = book._id === "65f1234567890abcdef12302" || book._id === "65f1234567890abcdef12303";
  const displayTitle = selectedSubLevel || book.title;
  const chaptersList = selectedSubLevel 
    ? getChaptersForSubLevel(book._id, selectedSubLevel) 
    : chapters;

  const handleItemClick = (item: string) => {
    if (isNestedBook && !selectedSubLevel) {
      setSelectedSubLevel(item);
    } else {
      setActiveChapter(item);
    }
  };

  if (activeChapter) {
    const { prefix, main } = getChapterTitleParts(activeChapter);
    const verses = getChapterVerses(book._id, selectedSubLevel, activeChapter);
    
    const currentChapterIndex = chaptersList.indexOf(activeChapter);
    const prevChapter = currentChapterIndex > 0 ? chaptersList[currentChapterIndex - 1] : null;
    const nextChapter = currentChapterIndex !== -1 && currentChapterIndex < chaptersList.length - 1 ? chaptersList[currentChapterIndex + 1] : null;

    return (
      <div className="min-h-screen bg-[#eed5af] pt-16 pb-12 px-6 sm:px-12 md:px-16 lg:px-24 flex flex-col justify-between">
        <div className="max-w-4xl mx-auto w-full flex-grow flex flex-col justify-between">
          <div className="w-full">
            <div className="flex justify-start mb-6 text-xs sm:text-sm text-[#b54a2b] font-serif select-none items-center gap-1.5 flex-wrap">
              <Link href="/resources/books" className="hover:underline">Library</Link>
              <span>»</span>
              <button 
                onClick={() => { setActiveChapter(null); setSelectedSubLevel(null); }}
                className="hover:underline cursor-pointer bg-transparent border-none p-0 text-[#b54a2b] font-serif"
              >
                {book.title}
              </button>
              {selectedSubLevel && (
                <>
                  <span>»</span>
                  <button 
                    onClick={() => setActiveChapter(null)}
                    className="hover:underline cursor-pointer bg-transparent border-none p-0 text-[#b54a2b] font-serif"
                  >
                    {selectedSubLevel}
                  </button>
                </>
              )}
            </div>

            <div className="flex gap-2.5 mt-4 mb-8 select-none flex-wrap">
              <button 
                onClick={() => setViewMode('default')}
                className={`px-3 py-1.5 rounded font-sans font-bold text-xs border transition-all cursor-pointer ${
                  viewMode === 'default'
                    ? 'bg-[#d6b285] border-[#8d6f4d] text-gray-955'
                    : 'bg-[#dfbd92] border-[#a88256] text-gray-900 hover:bg-[#d6b285]'
                }`}
              >
                Default View
              </button>
              <button 
                onClick={() => setViewMode('advanced')}
                className={`px-3 py-1.5 rounded font-sans font-bold text-xs border transition-all cursor-pointer ${
                  viewMode === 'advanced'
                    ? 'bg-[#d6b285] border-[#8d6f4d] text-gray-955'
                    : 'bg-[#dfbd92] border-[#a88256] text-gray-900 hover:bg-[#d6b285]'
                }`}
              >
                Advanced View
              </button>
              <button 
                onClick={() => setViewMode('dual')}
                className={`px-3 py-1.5 rounded font-sans font-bold text-xs border transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'dual'
                    ? 'bg-[#d6b285] border-[#8d6f4d] text-gray-955'
                    : 'bg-[#dfbd92] border-[#a88256] text-gray-900 hover:bg-[#d6b285]'
                }`}
              >
                <FaGlobe className="text-[10px]" />
                <span>Dual Language View</span>
                <span className="text-[9px] ml-0.5"><FaChevronDown className="inline text-[8px]" /></span>
              </button>
            </div>

            {prefix && (
              <h2 className="text-center font-serif text-sm sm:text-base tracking-widest text-gray-700 font-bold uppercase mt-8 mb-2 select-none">
                {prefix}
              </h2>
            )}
            <h1 className="text-center font-bangla text-3xl sm:text-4xl md:text-5xl text-gray-950 font-bold mt-2 mb-12 select-none leading-tight">
              {main}
            </h1>

            {viewMode === 'default' && (
              <div className="space-y-6 max-w-4xl mx-auto px-2 font-serif text-gray-950 text-base sm:text-lg leading-relaxed text-justify">
                {verses.map((v, idx) => (
                  <p key={idx} className="indent-4 sm:indent-8">
                    <span className="text-[#b54a2b] font-bold mr-1.5">{v.textNumber}:</span> {v.translation}
                  </p>
                ))}
              </div>
            )}

            {viewMode === 'advanced' && (
              <div className="space-y-12 max-w-3xl mx-auto px-2 font-serif text-gray-950">
                {verses.map((v, idx) => (
                  <div key={idx} className="border-b border-[#dfc39a]/40 pb-8 last:border-0 last:pb-0">
                    <div className="text-[#b54a2b] font-bold text-lg mb-3">{v.textNumber}</div>
                    {v.verse && (
                      <div className="italic text-center text-lg text-orange-950 whitespace-pre-line bg-[#dfbd92]/10 p-5 border border-[#dfc39a]/40 rounded mb-4 font-medium leading-relaxed">
                        {v.verse}
                      </div>
                    )}
                    {v.synonyms && (
                      <div className="text-sm text-gray-700 leading-relaxed mb-4 pl-4 border-l-2 border-[#dfc39a]">
                        <span className="font-bold text-gray-900 mr-1">Synonyms:</span>
                        {v.synonyms}
                      </div>
                    )}
                    <div className="text-base sm:text-lg leading-relaxed mb-4 text-justify">
                      <span className="font-bold text-gray-900 mr-1">Translation:</span>
                      {v.translation}
                    </div>
                    {v.purport && (
                      <div className="text-base leading-relaxed pl-6 border-l-4 border-orange-800/20 text-gray-800 text-justify">
                        <span className="font-bold text-orange-900 block mb-2">Purport:</span>
                        {v.purport}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {viewMode === 'dual' && (
              <div className="space-y-10 max-w-4xl mx-auto px-2 font-serif text-gray-950">
                {verses.map((v, idx) => (
                  <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-8 border-b border-[#dfc39a]/40 pb-8 last:border-0 last:pb-0">
                    <div className="space-y-3">
                      <div className="text-[#b54a2b] font-bold text-sm">{v.textNumber} (Sanskrit)</div>
                      {v.verse && (
                        <div className="italic text-orange-950 whitespace-pre-line font-medium leading-relaxed">
                          {v.verse}
                        </div>
                      )}
                    </div>
                    <div className="space-y-3">
                      <div className="text-gray-600 font-bold text-sm">Translation</div>
                      <div className="text-base sm:text-lg leading-relaxed text-justify">
                        {v.translation}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-between items-center mt-16 select-none border-t border-[#dfc39a]/40 pt-6">
            {prevChapter ? (
              <button 
                onClick={() => { setActiveChapter(prevChapter); setViewMode('default'); }}
                className="bg-[#dfbd92] hover:bg-[#d6b285] border border-[#a88256] text-gray-900 font-sans font-bold px-4 py-2 rounded flex items-center gap-1.5 transition-all text-xs sm:text-sm shadow-sm cursor-pointer outline-none"
              >
                ← {prevChapter.split(':')[0]}
              </button>
            ) : (
              <div />
            )}

            {nextChapter ? (
              <button 
                onClick={() => { setActiveChapter(nextChapter); setViewMode('default'); }}
                className="bg-[#dfbd92] hover:bg-[#d6b285] border border-[#a88256] text-gray-900 font-sans font-bold px-4 py-2 rounded flex items-center gap-1.5 transition-all text-xs sm:text-sm shadow-sm cursor-pointer outline-none"
              >
                {nextChapter.split(':')[0]} →
              </button>
            ) : (
              <div />
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#eed5af] pt-16 pb-12 px-6 sm:px-12 md:px-16 lg:px-24 flex flex-col justify-between">
      <div className="max-w-4xl mx-auto w-full flex-grow flex flex-col justify-between">
        <div className="w-full">
          {selectedSubLevel && (
            <div className="flex justify-start mb-4">
              <button 
                onClick={() => setSelectedSubLevel(null)}
                className="inline-flex items-center gap-2 text-gray-800 hover:text-orange-950 font-medium transition-colors select-none group font-serif text-sm cursor-pointer outline-none bg-transparent border-none p-0"
              >
                <FaArrowLeft className="text-xs group-hover:-translate-x-1 transition-transform" /> 
                <span>{book.title}</span>
              </button>
            </div>
          )}

          <h1 className="font-bangla text-5xl md:text-6xl text-gray-950 font-bold text-center mt-4 mb-12 select-none leading-tight">
            {displayTitle}
          </h1>

          <div className="flex justify-center w-full my-8">
            <div className="flex flex-col items-start space-y-4 max-w-2xl">
              {chaptersList.map((chapter, idx) => (
                <button
                  key={idx}
                  onClick={() => handleItemClick(chapter)}
                  className="text-[#b54a2b] font-serif font-medium text-xl sm:text-2xl hover:underline text-left transition-colors cursor-pointer outline-none"
                >
                  {chapter}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {!selectedSubLevel ? (
          <div className="flex justify-between items-center mt-12 select-none">
            {prevBook ? (
              <Link 
                href={`/resources/books/${prevBook._id}`}
                className="bg-[#dfbd92] hover:bg-[#d6b285] border border-[#a88256] text-gray-900 font-sans font-bold px-4 py-2 rounded flex items-center gap-1.5 transition-all text-xs sm:text-sm shadow-sm"
              >
                ← {prevBook.title}
              </Link>
            ) : (
              <div />
            )}

            {nextBook ? (
              <Link 
                href={`/resources/books/${nextBook._id}`}
                className="bg-[#dfbd92] hover:bg-[#d6b285] border border-[#a88256] text-gray-900 font-sans font-bold px-4 py-2 rounded flex items-center gap-1.5 transition-all text-xs sm:text-sm shadow-sm"
              >
                {nextBook.title} →
              </Link>
            ) : (
              <div />
            )}
          </div>
        ) : (
          <div />
        )}
      </div>

      {activeChapter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm transition-opacity">
          <div className="bg-[#FAF6EE] border border-[#e4ccaa] max-w-2xl w-full rounded shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between border-b border-[#eedabf] px-6 py-4">
              <div>
                <span className="font-serif text-xs text-orange-900 font-semibold uppercase tracking-wider select-none">{book.title}</span>
                <h3 className="font-serif text-lg sm:text-xl font-bold text-gray-950 mt-0.5 leading-tight">{activeChapter}</h3>
              </div>
              <button 
                onClick={() => setActiveChapter(null)}
                className="text-gray-500 hover:text-gray-800 p-2 hover:bg-[#eedabf]/30 rounded transition-colors"
              >
                <FaTimes className="text-lg" />
              </button>
            </div>
            
            {/* Modal Body with Scrollable Serif content */}
            <div className="p-6 sm:p-8 overflow-y-auto font-serif text-gray-800 text-base sm:text-lg leading-relaxed space-y-4">
              <div className="flex items-center gap-2 text-xs text-gray-500 pb-2 border-b border-[#eedabf]/40 select-none">
                <FaBookmark className="text-[10px]" /> Authorized Edition by A.C. Bhaktivedanta Swami Prabhupada
              </div>
              <p className="indent-4 text-justify pt-2">
                This digital edition provides the authorized translation, synonyms, and elaborate purports for {activeChapter} of {book.title}.
              </p>
              <p className="indent-4 text-justify">
                {book.description || "Study the transcendental pastimes and instructions of Lord Krishna to revive our dormant love for the Supreme Lord."}
              </p>
              <div className="bg-[#eedabf]/20 border border-[#e4ccaa]/40 p-4 rounded-sm italic text-center text-sm text-gray-800 mt-4 select-none">
                “Simple living and high thinking is the solution for all spiritual and material advancement.”
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-[#eedabf] px-6 py-4 flex justify-end">
              <button
                onClick={() => setActiveChapter(null)}
                className="bg-[#eecf9d] hover:bg-[#e6c698] border border-[#cfa77b] text-gray-900 font-serif font-bold px-5 py-2 rounded-sm transition-colors text-sm"
              >
                Close Reader
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
