import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { 
  Volume2, VolumeX, Check, X, RotateCcw, Star, ChevronLeft, ChevronRight, Clock, Award, Bookmark, BookOpen, Layers, RefreshCw, Settings, HelpCircle, Play, Pause, Search, Filter, ThumbsUp, ThumbsDown, Zap, TrendingUp, CalendarDays, Target, Edit, Trash2, Copy, Share2, Flame, BookMarked, Brain, BarChartHorizontalBig
} from 'lucide-react';

// --- Types ---
interface Flashcard {
  id: string;
  deckId: string;
  front: {
    term: string;
    termKhmer?: string;
    image?: string; // URL to image
    audioEn?: string; // URL to English audio
    audioKh?: string; // URL to Khmer audio
    hint?: string;
    hintKhmer?: string;
  };
  back: {
    definition: string;
    definitionKhmer?: string;
    exampleSentenceEn: string;
    exampleSentenceKhmer?: string;
    culturalContext?: string; // Specific Cambodian cultural notes
    culturalContextKhmer?: string;
    relatedTerms?: string[]; // IDs of related flashcards
  };
  category: string; // e.g., Greetings, Dining, Concierge, Complaints
  difficulty: 1 | 2 | 3 | 4 | 5; // 1 (easiest) to 5 (hardest)
  tags: string[]; // For filtering
  lastReviewed?: Date;
  nextReviewDate: Date;
  reviewInterval: number; // in days
  easeFactor: number; // for SM-2 algorithm
  consecutiveCorrectAnswers: number;
  knowledgeLevel: number; // 0-100% mastery, derived from review history
}

interface FlashcardDeck {
  id: string;
  name: string;
  nameKhmer?: string;
  description: string;
  descriptionKhmer?: string;
  category: string; // e.g., Front Desk, Food & Beverage, Housekeeping
  image?: string; // URL to deck cover image
  cardIds: string[]; // Array of flashcard IDs in this deck
  colorAccent?: string; // Tailwind color class, e.g., 'bg-primary', 'bg-accent-coral'
}

interface ProgressStats {
  totalCards: number;
  cardsLearned: number; // Cards with knowledgeLevel > 80%
  cardsDueForReview: number;
  overallMastery: number; // Average knowledgeLevel of all cards
  currentStreak: number; // Consecutive days of study
  longestStreak: number;
  lastStudied?: Date;
}

interface SessionStats {
  deckId: string;
  cardsReviewed: number;
  correctAnswers: number;
  incorrectAnswers: number;
  sessionDuration: number; // in seconds
  averageTimePerCard: number; // in seconds
  initialMastery?: number; // Mastery of reviewed cards at start of session
  finalMastery?: number; // Mastery of reviewed cards at end of session
}

interface FlashcardSystemProps {
  language: 'en' | 'km';
  darkMode?: boolean;
  onSessionComplete?: (stats: SessionStats) => void; // Callback for when a study session ends
}

// --- Mock Data ---
const initialDecks: FlashcardDeck[] = [
  { id: 'deck-fd', name: 'Front Desk Essentials', nameKhmer: 'មូលដ្ឋានគ្រឹះផ្នែកទទួលភ្ញៀវ', description: 'Key terms for check-in, check-out, and guest inquiries.', descriptionKhmer: 'ពាក្យគន្លឹះសម្រាប់ការចុះឈ្មោះចូល ចេញ និងការសាកសួររបស់ភ្ញៀវ។', category: 'Front Desk', image: '/assets/decks/front-desk.jpg', cardIds: ['fd001', 'fd002', 'fd003', 'fd004', 'fd005'], colorAccent: 'bg-primary' },
  { id: 'deck-fb', name: 'Food & Beverage Service', nameKhmer: 'សេវាកម្មម្ហូបអាហារ និងភេសជ្ជៈ', description: 'Vocabulary for restaurant service, menu items, and dining etiquette.', descriptionKhmer: 'វាក្យសព្ទសម្រាប់សេវាកម្មភោជនីយដ្ឋាន មុខម្ហូប និង آدابการรับประทานอาหาร។', category: 'Food & Beverage', image: '/assets/decks/food-beverage.jpg', cardIds: ['fb001', 'fb002'], colorAccent: 'bg-accent-orange' },
  { id: 'deck-hk', name: 'Housekeeping & Rooms', nameKhmer: 'ការថែរក្សាបន្ទប់', description: 'Terms related to room amenities, cleaning, and guest requests.', descriptionKhmer: 'ពាក្យទាក់ទងនឹងសម្ភារៈក្នុងបន្ទប់ ការសម្អាត និងសំណើរបស់ភ្ញៀវ។', category: 'Housekeeping', image: '/assets/decks/housekeeping.jpg', cardIds: [], colorAccent: 'bg-accent-blue' },
  { id: 'deck-cc', name: 'Cultural Courtesy (Cambodia)', nameKhmer: 'សុជីវធម៌វប្បធម៌ (កម្ពុជា)', description: 'Understanding Cambodian customs and etiquette for hospitality.', descriptionKhmer: 'ការយល់ដឹងពីទំនៀមទម្លាប់ និងសុជីវធម៌កម្ពុជាសម្រាប់បដិសណ្ឋារកិច្ច។', category: 'Cultural Skills', image: '/assets/decks/culture.jpg', cardIds: [], colorAccent: 'bg-accent-coral' },
];

const initialFlashcards: Flashcard[] = [
  { id: 'fd001', deckId: 'deck-fd', front: { term: 'Reservation', termKhmer: 'ការកក់ទុក', image: '/assets/flashcards/reservation.jpg', audioEn: '/assets/audio/en/reservation.mp3', audioKh: '/assets/audio/km/kar_kak_tuk.mp3', hint: 'Booking a room in advance' }, back: { definition: 'An arrangement to have a room held for you at a hotel.', definitionKhmer: 'ការរៀបចំទុកបន្ទប់សម្រាប់អ្នកនៅសណ្ឋាគារ។', exampleSentenceEn: 'Do you have a reservation with us?', exampleSentenceKhmer: 'តើលោក/អ្នកស្រីមានការកក់ទុកជាមួយយើងខ្ញុំដែរឬទេ?', culturalContext: 'In Cambodia, always confirm reservation details clearly, possibly via phone or email if online systems are unclear.', culturalContextKhmer: 'នៅកម្ពុជា ត្រូវបញ្ជាក់ព័ត៌មានលម្អិតនៃការកក់ឱ្យបានច្បាស់លាស់ អាចតាមរយៈទូរស័ព្ទឬអ៊ីមែល ប្រសិនបើប្រព័ន្ធអនឡាញមិនច្បាស់។' }, category: 'Check-in', difficulty: 1, tags: ['booking', 'front-desk'], nextReviewDate: new Date(), reviewInterval: 1, easeFactor: 2.5, consecutiveCorrectAnswers: 0, knowledgeLevel: 10 },
  { id: 'fd002', deckId: 'deck-fd', front: { term: 'Concierge', termKhmer: 'អ្នកទទួលបន្ទុកព័ត៌មាន', image: '/assets/flashcards/concierge.jpg', audioEn: '/assets/audio/en/concierge.mp3', audioKh: '/assets/audio/km/kon_siech.mp3', hint: 'Hotel staff member who helps with special requests' }, back: { definition: 'A hotel employee whose job is to assist guests by arranging tours, making theater and restaurant reservations, etc.', definitionKhmer: 'បុគ្គលិកសណ្ឋាគារដែលមានតួនាទីជួយភ្ញៀវដោយរៀបចំដំណើរកម្សាន្ត កក់សំបុត្រមហោស្រពនិងភោជនីយដ្ឋាន។ល។', exampleSentenceEn: 'The concierge can help you book a tour to Angkor Wat.', exampleSentenceKhmer: 'អ្នកទទួលបន្ទុកព័ត៌មានអាចជួយលោក/អ្នកស្រីកក់ដំណើរកម្សាន្តទៅអង្គរវត្តបាន។', culturalContext: 'Cambodian concierges are often very knowledgeable about local history and hidden gems.' }, category: 'Guest Services', difficulty: 2, tags: ['services', 'assistance'], nextReviewDate: new Date(), reviewInterval: 1, easeFactor: 2.5, consecutiveCorrectAnswers: 0, knowledgeLevel: 5 },
  { id: 'fd003', deckId: 'deck-fd', front: { term: 'Amenities', termKhmer: 'គ្រឿងបរិក្ខារ', image: '/assets/flashcards/amenities.jpg', audioEn: '/assets/audio/en/amenities.mp3', audioKh: '/assets/audio/km/kroeung_borikha.mp3', hint: 'Extra services or facilities' }, back: { definition: 'Desirable or useful features or facilities of a building or place.', definitionKhmer: 'លក្ខណៈពិសេសឬគ្រឿងបរិក្ខារដែលចង់បានឬមានប្រយោជន៍នៃអគារឬទីកន្លែង។', exampleSentenceEn: 'Our hotel offers a wide range of amenities, including a pool and gym.', exampleSentenceKhmer: 'សណ្ឋាគាររបស់យើងផ្តល់ជូនគ្រឿងបរិក្ខារជាច្រើន រួមទាំងអាងហែលទឹកនិងកន្លែងហាត់ប្រាណ។' }, category: 'Hotel Information', difficulty: 2, tags: ['facilities', 'services'], nextReviewDate: new Date(), reviewInterval: 1, easeFactor: 2.5, consecutiveCorrectAnswers: 0, knowledgeLevel: 15 },
  { id: 'fd004', deckId: 'deck-fd', front: { term: 'Invoice', termKhmer: 'វិក្កយបត្រ', image: '/assets/flashcards/invoice.jpg', audioEn: '/assets/audio/en/invoice.mp3', audioKh: '/assets/audio/km/vikayabat.mp3', hint: 'Bill for services' }, back: { definition: 'A list of goods sent or services provided, with a statement of the sum due for these; a bill.', definitionKhmer: 'បញ្ជីទំនិញដែលបានផ្ញើឬសេវាកម្មដែលបានផ្តល់ ជាមួយនឹងការបញ្ជាក់ពីចំនួនទឹកប្រាក់ដែលត្រូវបង់សម្រាប់ទំនិញឬសេវាកម្មទាំងនេះ; វិក្កយបត្រ។', exampleSentenceEn: 'Please review your invoice before checking out.', exampleSentenceKhmer: 'សូមពិនិត្យមើលវិក្កយបត្ររបស់លោក/អ្នកស្រីមុនពេលចុះឈ្មោះចេញ។' }, category: 'Check-out', difficulty: 1, tags: ['billing', 'payment'], nextReviewDate: new Date(), reviewInterval: 1, easeFactor: 2.5, consecutiveCorrectAnswers: 0, knowledgeLevel: 8 },
  { id: 'fd005', deckId: 'deck-fd', front: { term: 'Wake-up call', termKhmer: 'ការហៅដាស់', image: '/assets/flashcards/wakeupcall.jpg', audioEn: '/assets/audio/en/wakeup_call.mp3', audioKh: '/assets/audio/km/kar_hao_das.mp3', hint: 'Phone call to wake a guest' }, back: { definition: 'A telephone call made to a hotel guest at a requested time to wake them up.', definitionKhmer: 'ការហៅទូរស័ព្ទទៅកាន់ភ្ញៀវសណ្ឋាគារតាមពេលវេលាដែលបានស្នើសុំដើម្បីដាស់ពួកគេ។', exampleSentenceEn: 'I would like to request a wake-up call for 6 AM tomorrow.', exampleSentenceKhmer: 'ខ្ញុំចង់ស្នើសុំការហៅដាស់នៅម៉ោង ៦ ព្រឹកថ្ងៃស្អែក។' }, category: 'Guest Services', difficulty: 1, tags: ['requests', 'morning'], nextReviewDate: new Date(), reviewInterval: 1, easeFactor: 2.5, consecutiveCorrectAnswers: 0, knowledgeLevel: 12 },
  { id: 'fb001', deckId: 'deck-fb', front: { term: 'Table d\'hôte', termKhmer: 'ម៉ឺនុយชุด', image: '/assets/flashcards/tabledhote.jpg', audioEn: '/assets/audio/en/table_dhote.mp3', hint: 'Fixed price menu' }, back: { definition: 'A multi-course meal charged at a fixed price.', definitionKhmer: 'អាហារច្រើនមុខដែលគិតថ្លៃក្នុងតម្លៃកំណត់។', exampleSentenceEn: 'Our restaurant offers a daily table d\'hôte menu for $25.', exampleSentenceKhmer: 'ភោជនីយដ្ឋានរបស់យើងមានម៉ឺនុយชุดប្រចាំថ្ងៃតម្លៃ ២៥ ដុល្លារ។', culturalContext: 'Set menus are common in Cambodian tourist restaurants, often featuring popular local dishes.' }, category: 'Dining', difficulty: 3, tags: ['menu', 'pricing'], nextReviewDate: new Date(), reviewInterval: 1, easeFactor: 2.5, consecutiveCorrectAnswers: 0, knowledgeLevel: 2 },
  { id: 'fb002', deckId: 'deck-fb', front: { term: 'Sommelier', termKhmer: 'អ្នកជំនាញស្រា', image: '/assets/flashcards/sommelier.jpg', audioEn: '/assets/audio/en/sommelier.mp3', hint: 'Wine expert' }, back: { definition: 'A wine steward, typically in a fine dining restaurant.', definitionKhmer: 'អ្នកបម្រើស្រា ជាធម្មតានៅក្នុងភោជនីយដ្ឋានប្រណីត។', exampleSentenceEn: 'Our sommelier can recommend the perfect wine to accompany your meal.', exampleSentenceKhmer: 'អ្នកជំនាញស្រារបស់យើងអាចណែនាំស្រាដែលស័ក្តិសមបំផុតជាមួយអាហាររបស់អ្នក។' }, category: 'Fine Dining', difficulty: 4, tags: ['wine', 'staff'], nextReviewDate: new Date(), reviewInterval: 1, easeFactor: 2.5, consecutiveCorrectAnswers: 0, knowledgeLevel: 1 },
];

// --- Spaced Repetition (SM-2 variant) ---
const reviewCard = (card: Flashcard, quality: 0 | 1 | 2 | 3 | 4 | 5): Flashcard => {
  // Quality: 0 (no idea) to 5 (perfect recall)
  let newInterval: number;
  let newEaseFactor = card.easeFactor;
  let newConsecutiveCorrect = card.consecutiveCorrectAnswers;

  if (quality < 3) { // Incorrect or difficult recall
    newInterval = 1; // Reset interval
    newConsecutiveCorrect = 0;
    newEaseFactor = Math.max(1.3, card.easeFactor - 0.2); // Decrease ease factor
  } else { // Correct recall
    newConsecutiveCorrect += 1;
    if (newConsecutiveCorrect === 1) {
      newInterval = 1;
    } else if (newConsecutiveCorrect === 2) {
      newInterval = 6;
    } else {
      newInterval = Math.round(card.reviewInterval * newEaseFactor);
    }
    newEaseFactor = card.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    if (newEaseFactor < 1.3) newEaseFactor = 1.3;
  }

  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + newInterval);
  
  const newKnowledgeLevel = Math.min(100, Math.max(0, card.knowledgeLevel + (quality - 2.5) * 10));


  return { 
    ...card, 
    reviewInterval: newInterval, 
    easeFactor: newEaseFactor,
    nextReviewDate: nextReview,
    lastReviewed: new Date(),
    consecutiveCorrectAnswers: newConsecutiveCorrect,
    knowledgeLevel: newKnowledgeLevel
  };
};

const FlashcardSystem: React.FC<FlashcardSystemProps> = ({ language, darkMode = false, onSessionComplete }) => {
  const [allFlashcards, setAllFlashcards] = useState<Flashcard[]>(initialFlashcards);
  const [availableDecks, setAvailableDecks] = useState<FlashcardDeck[]>(initialDecks);
  
  const [selectedDeck, setSelectedDeck] = useState<FlashcardDeck | null>(null);
  const [currentSessionCards, setCurrentSessionCards] = useState<Flashcard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  
  const [showDeckSelector, setShowDeckSelector] = useState(true);
  const [studySessionActive, setStudySessionActive] = useState(false);
  const [sessionStats, setSessionStats] = useState<SessionStats | null>(null);
  
  const [progress, setProgress] = useState<ProgressStats>({ totalCards: allFlashcards.length, cardsLearned: 0, cardsDueForReview: 0, overallMastery: 0, currentStreak: 3, longestStreak: 10 });

  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("All"); // "All" or specific deck category

  const audioRefEn = useRef<HTMLAudioElement>(null);
  const audioRefKh = useRef<HTMLAudioElement>(null);

  // Card swipe animation values
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 0, 200], [-25, 0, 25]);
  const cardOpacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);
  const swipeFeedbackOpacity = useTransform(x, [-100, -50, 0, 50, 100], [1, 0, 0, 0, 1]);
  const swipeKnownOpacity = useTransform(x, [0, 50, 100], [0,0,1]);
  const swipeUnknownOpacity = useTransform(x, [-100, -50, 0], [1,0,0]);


  useEffect(() => {
    // Calculate initial progress stats
    let learned = 0;
    let due = 0;
    let totalKnowledge = 0;
    const today = new Date();
    today.setHours(0,0,0,0);

    allFlashcards.forEach(card => {
      if (card.knowledgeLevel >= 80) learned++;
      if (card.nextReviewDate <= today) due++;
      totalKnowledge += card.knowledgeLevel;
    });
    setProgress(prev => ({
      ...prev,
      totalCards: allFlashcards.length,
      cardsLearned: learned,
      cardsDueForReview: due,
      overallMastery: allFlashcards.length > 0 ? Math.round(totalKnowledge / allFlashcards.length) : 0,
    }));
  }, [allFlashcards]);


  const startStudySession = (deck: FlashcardDeck) => {
    setSelectedDeck(deck);
    // Filter cards for the selected deck and sort by nextReviewDate (soonest first)
    const deckCards = allFlashcards
      .filter(card => card.deckId === deck.id)
      .sort((a, b) => a.nextReviewDate.getTime() - b.nextReviewDate.getTime());
    
    setCurrentSessionCards(deckCards.slice(0, 20)); // Limit session to 20 cards for demo
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setShowDeckSelector(false);
    setStudySessionActive(true);
    setSessionStats({
      deckId: deck.id,
      cardsReviewed: 0,
      correctAnswers: 0,
      incorrectAnswers: 0,
      sessionDuration: 0,
      averageTimePerCard: 0,
      initialMastery: deckCards.length > 0 ? Math.round(deckCards.reduce((sum, card) => sum + card.knowledgeLevel, 0) / deckCards.length) : 0,
    });
    // TODO: Start session timer
  };

  const handleCardResponse = (quality: 0 | 1 | 2 | 3 | 4 | 5) => {
    if (currentSessionCards.length === 0) return;
    const cardToUpdate = currentSessionCards[currentCardIndex];
    const updatedCard = reviewCard(cardToUpdate, quality);

    // Update in allFlashcards state
    setAllFlashcards(prevAll => prevAll.map(c => c.id === updatedCard.id ? updatedCard : c));
    
    // Update session stats
    setSessionStats(prev => prev ? ({
      ...prev,
      cardsReviewed: prev.cardsReviewed + 1,
      correctAnswers: quality >=3 ? prev.correctAnswers + 1 : prev.correctAnswers,
      incorrectAnswers: quality < 3 ? prev.incorrectAnswers + 1 : prev.incorrectAnswers,
    }) : null);

    // Move to next card or end session
    if (currentCardIndex < currentSessionCards.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
      setIsFlipped(false);
      x.set(0); // Reset swipe animation
    } else {
      endStudySession();
    }
  };
  
  const endStudySession = () => {
    setStudySessionActive(false);
    // Calculate final session stats, call onSessionComplete
    if (sessionStats && currentSessionCards.length > 0) {
        const finalMastery = Math.round(currentSessionCards.reduce((sum, card) => {
            const updatedCard = allFlashcards.find(c => c.id === card.id) || card;
            return sum + updatedCard.knowledgeLevel;
        },0) / currentSessionCards.length);

        const finalSessionStats: SessionStats = {
            ...sessionStats,
            finalMastery,
            averageTimePerCard: sessionStats.cardsReviewed > 0 ? Math.round(sessionStats.sessionDuration / sessionStats.cardsReviewed) : 0,
        };
        setSessionStats(finalSessionStats);
        if(onSessionComplete) onSessionComplete(finalSessionStats);
    }
  };

  const playAudio = (type: 'en' | 'kh') => {
    const card = currentSessionCards[currentCardIndex];
    if (!card) return;
    const audioSrc = type === 'en' ? card.front.audioEn : card.front.audioKh;
    const audioEl = type === 'en' ? audioRefEn.current : audioRefKh.current;
    if (audioEl && audioSrc) {
      audioEl.src = audioSrc; // Set src dynamically
      audioEl.play().catch(e => console.error("Error playing audio:", e));
    }
  };

  const filteredDecks = availableDecks.filter(deck => {
    const nameMatch = language === 'en' 
      ? deck.name.toLowerCase().includes(searchTerm.toLowerCase()) 
      : (deck.nameKhmer || deck.name).toLowerCase().includes(searchTerm.toLowerCase());
    const categoryMatch = filterCategory === "All" || deck.category === filterCategory;
    return nameMatch && categoryMatch;
  });
  
  const deckCategories = ["All", ...Array.from(new Set(initialDecks.map(d => d.category)))];

  // UI rendering for different states
  if (showDeckSelector) {
    return (
      <div className={`p-4 md:p-6 rounded-lg h-full flex flex-col ${darkMode ? 'bg-navy text-white-pure' : 'bg-gray-50 text-navy-dark'}`}>
        <h2 className="text-2xl font-bold mb-4">{language === 'en' ? 'Flashcard Decks' : 'សំណុំកាតរំលឹក'}</h2>
        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <div className="relative flex-grow">
            <input 
              type="text"
              placeholder={language === 'en' ? 'Search decks...' : 'ស្វែងរកសំណុំ...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full p-2 pl-8 border rounded-md text-sm ${darkMode ? 'bg-navy-light border-navy-dark placeholder-gray-400' : 'bg-white border-gray-300 placeholder-gray-500'}`}
            />
            <Search size={16} className={`absolute left-2.5 top-1/2 -translate-y-1/2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
          </div>
          <select 
            value={filterCategory} 
            onChange={(e) => setFilterCategory(e.target.value)}
            className={`p-2 border rounded-md text-sm ${darkMode ? 'bg-navy-light border-navy-dark' : 'bg-white border-gray-300'}`}
          >
            {deckCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
        <div className="flex-grow overflow-y-auto scrollbar-luxury grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDecks.map(deck => {
            const deckCards = allFlashcards.filter(c => c.deckId === deck.id);
            const deckMastery = deckCards.length > 0 ? Math.round(deckCards.reduce((sum, card) => sum + card.knowledgeLevel, 0) / deckCards.length) : 0;
            return (
              <motion.div 
                key={deck.id}
                onClick={() => startStudySession(deck)}
                className={`p-4 rounded-lg shadow-md cursor-pointer transition-all hover:shadow-xl relative overflow-hidden ${deck.colorAccent || (darkMode ? 'bg-navy-light' : 'bg-white')}`}
                whileHover={{ y: -5 }}
              >
                {deck.image && <img src={deck.image} alt={deck.name} className="w-full h-32 object-cover rounded-md mb-2 opacity-50" />}
                <div className={`absolute inset-0 ${deck.colorAccent ? 'opacity-30' : 'opacity-10'} ${deck.colorAccent || 'bg-primary'}`}></div>
                <div className="relative z-10">
                    <h3 className={`font-bold text-lg ${deck.colorAccent ? 'text-white' : ''}`}>{language === 'en' ? deck.name : (deck.nameKhmer || deck.name)}</h3>
                    <p className={`text-xs mb-2 ${deck.colorAccent ? 'text-white/80' : 'opacity-70'}`}>{language === 'en' ? deck.description : (deck.descriptionKhmer || deck.description)}</p>
                    <div className="flex justify-between items-center text-xs">
                        <span className={`${deck.colorAccent ? 'text-white/90' : 'opacity-60'}`}><BookOpen size={14} className="inline mr-1" />{deckCards.length} {language === 'en' ? 'cards' : 'កាត'}</span>
                        <div className="relative w-8 h-8">
                            <svg className="w-full h-full" viewBox="0 0 36 36">
                                <path className={`stroke-current ${deck.colorAccent ? 'text-white/30' : 'text-gray-300/50 dark:text-gray-600/50'}`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeWidth="3"></path>
                                <path className={`stroke-current ${deck.colorAccent ? 'text-white' : 'text-primary'}`} strokeDasharray={`${deckMastery}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeWidth="3" strokeLinecap="round"></path>
                            </svg>
                            <div className={`absolute inset-0 flex items-center justify-center text-xs font-semibold ${deck.colorAccent ? 'text-white' : ''}`}>{deckMastery}%</div>
                        </div>
                    </div>
                </div>
              </motion.div>
            )
          })}
          {filteredDecks.length === 0 && <p className="col-span-full text-center opacity-70 py-8">{language === 'en' ? 'No decks match your search.' : 'មិនមានសំណុំត្រូវនឹងការស្វែងរករបស់អ្នកទេ។'}</p>}
        </div>
      </div>
    );
  }

  if (!studySessionActive || currentSessionCards.length === 0) {
    return (
      <div className={`p-6 rounded-lg h-full flex flex-col items-center justify-center ${darkMode ? 'bg-navy text-white-pure' : 'bg-gray-50 text-navy-dark'}`}>
        <h3 className="text-xl font-semibold mb-2">{selectedDeck ? (language === 'en' ? 'Session Ended' : 'វគ្គសិក្សាបានបញ្ចប់') : (language === 'en' ? 'No Deck Selected' : 'មិនមានសំណុំត្រូវបានជ្រើសរើស')}</h3>
        {sessionStats && (
            <div className={`p-4 rounded-md text-center w-full max-w-sm ${darkMode ? 'bg-navy-light' : 'bg-white shadow-md'}`}>
                <p>{language === 'en' ? 'Cards Reviewed:' : 'កាតបានរំលឹក៖'} {sessionStats.cardsReviewed}</p>
                <p>{language === 'en' ? 'Correct:' : 'ត្រឹមត្រូវ៖'} <span className="text-success">{sessionStats.correctAnswers}</span></p>
                <p>{language === 'en' ? 'Incorrect:' : 'មិនត្រឹមត្រូវ៖'} <span className="text-accent-coral">{sessionStats.incorrectAnswers}</span></p>
                <p>{language === 'en' ? 'Mastery Change:' : 'ការផ្លាស់ប្តូរជំនាញ៖'} {sessionStats.initialMastery || 0}% → {sessionStats.finalMastery || 0}%</p>
            </div>
        )}
        <button onClick={() => setShowDeckSelector(true)} className="btn btn-primary mt-4">
          {language === 'en' ? 'Back to Decks' : 'ត្រឡប់ទៅសំណុំ'}
        </button>
      </div>
    );
  }

  const currentCard = currentSessionCards[currentCardIndex];
  const difficultyColors = ["border-green-500", "border-blue-500", "border-yellow-500", "border-orange-500", "border-red-500"];
  const currentDifficultyColor = difficultyColors[currentCard.difficulty - 1];

  return (
    <div className={`p-4 md:p-6 rounded-lg h-full flex flex-col justify-between items-center ${darkMode ? 'bg-navy text-white-pure' : 'bg-gray-50 text-navy-dark'}`}>
      <audio ref={audioRefEn} className="hidden" />
      <audio ref={audioRefKh} className="hidden" />

      {/* Header: Progress, Card Count */}
      <div className="w-full flex justify-between items-center mb-2 md:mb-4">
        <button onClick={() => endStudySession()} className="text-sm flex items-center opacity-70 hover:opacity-100">
          <ChevronLeft size={18} className="mr-1" /> {language === 'en' ? 'End Session' : 'បញ្ចប់វគ្គ'}
        </button>
        <span className="text-sm font-medium">{currentCardIndex + 1} / {currentSessionCards.length}</span>
      </div>
      <div className={`w-full h-1.5 rounded-full mb-4 ${darkMode ? 'bg-navy-light' : 'bg-gray-200'}`}>
        <motion.div 
          className="h-full bg-primary rounded-full"
          initial={{ width: '0%'}}
          animate={{ width: `${((currentCardIndex + 1) / currentSessionCards.length) * 100}%` }}
        />
      </div>

      {/* Flashcard Area */}
      <div className="flex-grow w-full flex items-center justify-center perspective-1000px relative mb-4">
        {/* Swipe Feedback Overlays */}
        <motion.div style={{ opacity: swipeUnknownOpacity }} className="absolute z-10 left-8 top-8 border-2 border-accent-coral text-accent-coral px-4 py-2 rounded-lg font-bold text-2xl transform -rotate-12">
            {language === 'en' ? 'Unknown' : 'មិនស្គាល់'}
        </motion.div>
        <motion.div style={{ opacity: swipeKnownOpacity }} className="absolute z-10 right-8 top-8 border-2 border-success text-success px-4 py-2 rounded-lg font-bold text-2xl transform rotate-12">
            {language === 'en' ? 'Known' : 'ស្គាល់'}
        </motion.div>

        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }} // Allow drag but snap back unless threshold met
          onDragEnd={(_e, info) => {
            if (info.offset.x > 100) handleCardResponse(5); // Swipe right = Known (quality 5)
            else if (info.offset.x < -100) handleCardResponse(1); // Swipe left = Unknown (quality 1)
            else x.set(0); // Snap back
          }}
          style={{ x, rotate, opacity: cardOpacity }}
          className={`w-full max-w-md h-[350px] md:h-[400px] cursor-grab active:cursor-grabbing relative ${currentDifficultyColor} border-4 rounded-xl shadow-2xl`}
        >
          <motion.div
            className="w-full h-full relative"
            style={{ transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
            transition={{ duration: 0.6 }}
            onClick={() => { if(x.get() === 0) setIsFlipped(!isFlipped); }} // Only flip if not dragging
          >
            {/* Card Front */}
            <div className={`absolute w-full h-full backface-hidden p-4 md:p-6 flex flex-col justify-center items-center text-center rounded-lg ${darkMode ? 'bg-navy-light' : 'bg-white'}`}>
              {currentCard.front.image && <img src={currentCard.front.image} alt={currentCard.front.term} className="max-h-24 md:max-h-32 object-contain mb-3 rounded" />}
              <h3 className="text-2xl md:text-3xl font-bold mb-1">{currentCard.front.term}</h3>
              {currentCard.front.termKhmer && <p className="text-xl md:text-2xl khmer mb-2 opacity-80">{currentCard.front.termKhmer}</p>}
              {(currentCard.front.audioEn || currentCard.front.audioKh) && (
                <div className="flex space-x-2 mt-2">
                    {currentCard.front.audioEn && <button onClick={(e) => {e.stopPropagation(); playAudio('en')}} className={`p-2 rounded-full ${darkMode ? 'hover:bg-white/10' : 'hover:bg-gray-200'}`}><Volume2 size={18}/> EN</button>}
                    {currentCard.front.audioKh && <button onClick={(e) => {e.stopPropagation(); playAudio('kh')}} className={`p-2 rounded-full ${darkMode ? 'hover:bg-white/10' : 'hover:bg-gray-200'}`}><Volume2 size={18}/> KH</button>}
                </div>
              )}
              {currentCard.front.hint && <p className="text-sm italic opacity-60 mt-3">{language === 'en' ? currentCard.front.hint : (currentCard.front.hintKhmer || currentCard.front.hint)}</p>}
            </div>

            {/* Card Back */}
            <div className={`absolute w-full h-full backface-hidden p-4 md:p-6 flex flex-col justify-start items-start overflow-y-auto scrollbar-luxury rounded-lg ${darkMode ? 'bg-navy-light' : 'bg-white'}`} style={{ transform: 'rotateY(180deg)' }}>
              <h4 className="text-lg font-semibold mb-1">{language === 'en' ? 'Definition:' : 'និយមន័យ៖'}</h4>
              <p className="text-sm mb-2">{language === 'en' ? currentCard.back.definition : (currentCard.back.definitionKhmer || currentCard.back.definition)}</p>
              <h4 className="text-lg font-semibold mb-1">{language === 'en' ? 'Example:' : 'ឧទាហរណ៍៖'}</h4>
              <p className="text-sm italic mb-2">{language === 'en' ? currentCard.back.exampleSentenceEn : (currentCard.back.exampleSentenceKhmer || currentCard.back.exampleSentenceEn)}</p>
              {currentCard.back.culturalContext && (
                <>
                  <h4 className="text-lg font-semibold mb-1">{language === 'en' ? 'Cultural Note:' : 'កំណត់ត្រាវប្បធម៌៖'}</h4>
                  <p className="text-sm opacity-80">{language === 'en' ? currentCard.back.culturalContext : (currentCard.back.culturalContextKhmer || currentCard.back.culturalContext)}</p>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      </div>
      
      {/* Knowledge Level & Review Info */}
      <div className="w-full max-w-md text-center text-xs opacity-70 mb-2">
        <p>{language === 'en' ? 'Knowledge:' : 'កម្រិតចំណេះដឹង៖'} {currentCard.knowledgeLevel}% | {language === 'en' ? 'Next Review:' : 'រំលឹកលើកក្រោយ៖'} {currentCard.nextReviewDate.toLocaleDateString()}</p>
      </div>

      {/* Action Buttons */}
      <div className="w-full max-w-md grid grid-cols-3 gap-2 md:gap-4">
        <motion.button 
          onClick={() => handleCardResponse(1)} // Quality 1 for "Forgot"
          className={`py-3 rounded-lg font-semibold flex flex-col items-center justify-center transition-colors ${darkMode ? 'bg-red-700/20 hover:bg-red-700/40 text-red-400' : 'bg-red-100 hover:bg-red-200 text-red-600'}`}
          whileTap={{ scale: 0.95 }}
        >
          <ThumbsDown size={20} className="mb-1"/>
          {language === 'en' ? 'Forgot' : 'ភ្លេច'}
        </motion.button>
        <motion.button 
          onClick={() => handleCardResponse(3)} // Quality 3 for "Hard"
          className={`py-3 rounded-lg font-semibold flex flex-col items-center justify-center transition-colors ${darkMode ? 'bg-yellow-600/20 hover:bg-yellow-600/40 text-yellow-400' : 'bg-yellow-100 hover:bg-yellow-200 text-yellow-600'}`}
          whileTap={{ scale: 0.95 }}
        >
          <Zap size={20} className="mb-1"/>
          {language === 'en' ? 'Hard' : 'ពិបាក'}
        </motion.button>
        <motion.button 
          onClick={() => handleCardResponse(5)} // Quality 5 for "Easy"
          className={`py-3 rounded-lg font-semibold flex flex-col items-center justify-center transition-colors ${darkMode ? 'bg-green-600/20 hover:bg-green-600/40 text-green-400' : 'bg-green-100 hover:bg-green-200 text-green-600'}`}
          whileTap={{ scale: 0.95 }}
        >
          <ThumbsUp size={20} className="mb-1"/>
          {language === 'en' ? 'Easy' : 'ងាយ'}
        </motion.button>
      </div>
    </div>
  );
};

export default FlashcardSystem;
