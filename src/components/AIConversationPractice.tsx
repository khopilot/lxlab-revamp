import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic, MicOff, Send, ChevronDown, X, Info, User, Users, MessageSquare, Star, BarChart2, Settings, Maximize2, Minimize2, Volume2, VolumeX, RefreshCw, AlertTriangle, CheckCircle, Eye, EyeOff
} from 'lucide-react';

// --- Types ---
interface Guest {
  id: string;
  name: string;
  nameKhmer: string;
  avatarImage: string; // Path to a high-quality 2D image representing the avatar
  persona: 'Business' | 'Tourist' | 'Family' | 'VIP';
  personalityTraits: string[];
  personalityTraitsKhmer: string[];
  culturalBackground: string;
  culturalBackgroundKhmer: string;
  dialogueStyle: string; // e.g., "formal", "casual", "demanding"
}

interface Scenario {
  id: string;
  title: string;
  titleKhmer: string;
  description: string;
  descriptionKhmer: string;
  difficulty: 1 | 2 | 3; // 1: Easy, 2: Medium, 3: Hard
  settingImage: string; // Background image for the scenario
  initialPrompt: string;
  initialPromptKhmer: string;
  culturalNotes: string[];
  culturalNotesKhmer: string[];
  keywords: string[]; // Keywords to focus on
  keywordsKhmer: string[];
}

interface Message {
  id: string;
  sender: 'user' | 'guest' | 'system';
  text: string;
  timestamp: Date;
  audioUrl?: string; // For playback of user/guest speech
  pronunciationScore?: number; // 0-100
  wordScores?: { word: string, score: number }[]; // Score for each word
}

interface PronunciationFeedback {
  overallScore: number;
  feedbackText: string;
  feedbackTextKhmer: string;
  areasForImprovement: string[];
  areasForImprovementKhmer: string[];
  wordBreakdown: { word: string, score: number, phonemes?: {ipa: string, user: string, correct: boolean}[] }[];
}

interface AIConversationPracticeProps {
  language: 'en' | 'km';
  darkMode?: boolean;
}

// --- Mock Data ---
const mockGuests: Guest[] = [
  { id: 'g1', name: 'Mr. David Lee', nameKhmer: 'លោក ដេវីដ លី', avatarImage: '/assets/avatars/business-male.png', persona: 'Business', personalityTraits: ['Formal', 'Efficient', 'Expects Professionalism'], personalityTraitsKhmer: ['ផ្លូវការ', 'មានប្រសិទ្ធភាព', 'រំពឹងវិជ្ជាជីវៈ'], culturalBackground: 'American', culturalBackgroundKhmer: 'អាមេរិក', dialogueStyle: 'formal' },
  { id: 'g2', name: 'Ms. Sophia Müller', nameKhmer: 'កញ្ញា សូហ្វីយ៉ា មូល័រ', avatarImage: '/assets/avatars/tourist-female.png', persona: 'Tourist', personalityTraits: ['Curious', 'Friendly', 'Seeks Local Experiences'], personalityTraitsKhmer: ['ចង់ដឹងចង់ឃើញ', 'រួសរាយ', 'ស្វែងរកបទពិសោធន៍ក្នុងស្រុក'], culturalBackground: 'German', culturalBackgroundKhmer: 'អាល្លឺម៉ង់', dialogueStyle: 'casual' },
  { id: 'g3', name: 'The Chen Family', nameKhmer: 'គ្រួសារ ចិន', avatarImage: '/assets/avatars/family.png', persona: 'Family', personalityTraits: ['Value-conscious', 'Needs Child-friendly Options', 'Slightly Impatient'], personalityTraitsKhmer: ['គិតគូរពីតម្លៃ', 'ត្រូវការជម្រើសសម្រាប់កុមារ', 'មិនសូវអត់ធ្មត់'], culturalBackground: 'Chinese', culturalBackgroundKhmer: 'ចិន', dialogueStyle: 'direct' },
  { id: 'g4', name: 'Sheikha Fatima Al Maktoum', nameKhmer: 'លោកស្រី ហ្វាទីម៉ា អាល់ មaktoum', avatarImage: '/assets/avatars/vip-female.png', persona: 'VIP', personalityTraits: ['Expects Discretion', 'High Standards', 'Appreciates Personalization'], personalityTraitsKhmer: ['រំពឹងការសម្ងាត់', 'ស្តង់ដារខ្ពស់', 'ពេញចិត្តការរៀបចំផ្ទាល់ខ្លួន'], culturalBackground: 'Emirati', culturalBackgroundKhmer: 'អេមីរ៉ាត', dialogueStyle: 'formal' },
];

const mockScenarios: Scenario[] = [
  { id: 's1', title: 'Handling a Check-in Rush', titleKhmer: 'ដោះស្រាយការចុះឈ្មោះចូលដ៏មមាញឹក', description: 'Manage multiple guest check-ins efficiently during a peak period.', descriptionKhmer: 'គ្រប់គ្រងការចុះឈ្មោះចូលរបស់ភ្ញៀវច្រើននាក់ប្រកបដោយប្រសិទ្ធភាពក្នុងអំឡុងពេលមមាញឹក។', difficulty: 2, settingImage: '/assets/settings/lobby-busy.jpg', initialPrompt: "Good evening! We have a reservation under Smith, party of four.", initialPromptKhmer: "សួស្តី! យើងមានការកក់ទុកក្រោមឈ្មោះ ស្មីត សម្រាប់មនុស្សបួននាក់។", culturalNotes: ["Maintain composure under pressure.", "Prioritize clearly and communicate wait times if necessary."], culturalNotesKhmer: ["រក្សាភាពស្ងប់ស្ងាត់ក្រោមសម្ពាធ។", "កំណត់អាទិភាពឱ្យច្បាស់លាស់ និងជូនដំណឹងពីពេលវេលារង់ចាំបើចាំបាច់។"], keywords: ["reservation", "check-in", "efficiency", "patience"], keywordsKhmer: ["ការកក់", "ចុះឈ្មោះចូល", "ប្រសិទ្ធភាព", "ការអត់ធ្មត់"] },
  { id: 's2', title: 'Resolving a Room Complaint (VIP)', titleKhmer: 'ដោះស្រាយបណ្តឹងបន្ទប់ (ភ្ញៀវ VIP)', description: 'Address a VIP guest complaint about room amenities and view.', descriptionKhmer: 'ដោះស្រាយបណ្តឹងរបស់ភ្ញៀវ VIP អំពីសម្ភារៈក្នុងបន្ទប់ និងទេសភាព។', difficulty: 3, settingImage: '/assets/settings/luxury-suite.jpg', initialPrompt: "This room is simply unacceptable. The view is not what I was promised, and the coffee machine is broken!", initialPromptKhmer: "បន្ទប់នេះពិតជាមិនអាចទទួលយកបានទេ។ ទេសភាពមិនដូចអ្វីដែលបានសន្យា ហើយម៉ាស៊ីនឆុងកាហ្វេខូច!", culturalNotes: ["Offer sincere apologies and immediate solutions.", "Empower staff to make decisions for VIP satisfaction."], culturalNotesKhmer: ["សុំទោសដោយស្មោះ និងផ្តល់ដំណោះស្រាយភ្លាមៗ។", "ផ្តល់អំណាចដល់បុគ្គលិកក្នុងការសម្រេចចិត្តដើម្បីភាពពេញចិត្តរបស់ភ្ញៀវ VIP ។"], keywords: ["apology", "solution", "compensation", "discretion"], keywordsKhmer: ["ការសុំទោស", "ដំណោះស្រាយ", "សំណង", "ការសម្ងាត់"] },
  { id: 's3', title: 'Restaurant Recommendation for Family', titleKhmer: 'ការណែនាំភោជនីយដ្ឋានសម្រាប់គ្រួសារ', description: 'Help a family find a suitable child-friendly restaurant with local cuisine options.', descriptionKhmer: 'ជួយគ្រួសារមួយរកភោជនីយដ្ឋានដែលសមរម្យសម្រាប់កុមារ និងមានជម្រើសម្ហូបក្នុងស្រុក។', difficulty: 1, settingImage: '/assets/settings/concierge-desk.jpg', initialPrompt: "We're looking for a place to eat dinner. We have two young children and would love to try some authentic Khmer food.", initialPromptKhmer: "ពួកយើងកំពុងរកកន្លែងញ៉ាំអាហារពេលល្ងាច។ យើងមានកូនតូចពីរនាក់ ហើយចង់សាកម្ហូបខ្មែរពិតៗ។", culturalNotes: ["Be mindful of spice levels for children.", "Highlight restaurants with a welcoming atmosphere for families."], culturalNotesKhmer: ["ប្រយ័ត្នកម្រិតគ្រឿងទេសសម្រាប់កុមារ។", "ណែនាំភោជនីយដ្ឋានដែលមានបរិយាកាសស្វាគមន៍សម្រាប់គ្រួសារ។"], keywords: ["family-friendly", "Khmer cuisine", "ambiance", "options"], keywordsKhmer: ["សម្រាប់គ្រួសារ", "ម្ហូបខ្មែរ", "បរិយាកាស", "ជម្រើស"] },
];

// --- Helper Functions ---
const formatTimestamp = (date: Date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
const getPronunciationColor = (score?: number) => {
  if (score === undefined) return 'text-gray-400';
  if (score >= 85) return 'text-success';
  if (score >= 60) return 'text-accent-orange';
  return 'text-accent-coral';
};

const AIConversationPractice: React.FC<AIConversationPracticeProps> = ({ language, darkMode = false }) => {
  const [currentGuest, setCurrentGuest] = useState<Guest>(mockGuests[0]);
  const [currentScenario, setCurrentScenario] = useState<Scenario>(mockScenarios[0]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isGuestTyping, setIsGuestTyping] = useState(false);
  const [showScenarioSelector, setShowScenarioSelector] = useState(true); // Start with selector
  const [showGuestSelector, setShowGuestSelector] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState<PronunciationFeedback | null>(null);
  const [conversationScore, setConversationScore] = useState(0); // Overall skill score for this convo
  const [noiseLevel, setNoiseLevel] = useState(0.1); // 0 to 1
  const [waveformPoints, setWaveformPoints] = useState<number[]>(Array(50).fill(0));
  const [isFullScreen, setIsFullScreen] = useState(false);

  const chatAreaRef = useRef<HTMLDivElement>(null);
  const waveformIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);


  const startConversation = useCallback(() => {
    setMessages([
      { id: 'sys-start', sender: 'system', text: `${language === 'en' ? 'Scenario' : 'សេណារីយ៉ូ'}: ${language === 'en' ? currentScenario.title : currentScenario.titleKhmer}`, timestamp: new Date() },
      { id: 'guest-intro', sender: 'guest', text: language === 'en' ? currentScenario.initialPrompt : currentScenario.initialPromptKhmer, timestamp: new Date() }
    ]);
    setShowScenarioSelector(false);
    setShowGuestSelector(false);
    setConversationScore(0); // Reset score
  }, [currentGuest, currentScenario, language]);

  useEffect(() => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  }, [messages, isGuestTyping]);

  useEffect(() => {
    if (isRecording) {
      waveformIntervalRef.current = setInterval(() => {
        setWaveformPoints(Array(50).fill(0).map(() => Math.random() * 0.8 + 0.1));
        setNoiseLevel(Math.random() * 0.4 + 0.05); // Simulate noise
      }, 100);
    } else {
      if (waveformIntervalRef.current) clearInterval(waveformIntervalRef.current);
      setWaveformPoints(Array(50).fill(0));
      setNoiseLevel(0.1);
    }
    return () => { if (waveformIntervalRef.current) clearInterval(waveformIntervalRef.current); };
  }, [isRecording]);

  const handleSendMessage = (text: string) => {
    if (text.trim() === '') return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: text,
      timestamp: new Date(),
      pronunciationScore: Math.floor(Math.random() * 50) + 50, // Mock score
      wordScores: text.split(" ").map(word => ({ word, score: Math.floor(Math.random() * 50) + 50 }))
    };
    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setConversationScore(prev => prev + (userMessage.pronunciationScore || 0) / 10); // Simple score update

    // Simulate guest response
    setIsGuestTyping(true);
    setTimeout(() => {
      const guestResponses = [
        "I see. And what about the Wi-Fi password?",
        "That's helpful, thank you. Can you also tell me about local transport?",
        "Okay, understood. Is breakfast included with my room type?",
        "Thank you for clarifying. I appreciate your assistance."
      ];
      const guestResponsesKhmer = [
        "ខ្ញុំយល់ហើយ។ ចុះលេខសម្ងាត់ Wi-Fi វិញ?",
        "នោះមានប្រយោជន៍ណាស់ អរគុណ។ តើអ្នកអាចប្រាប់ខ្ញុំអំពីការដឹកជញ្ជូនក្នុងតំបន់បានទេ?",
        "យល់ព្រម។ តើអាហារពេលព្រឹករួមបញ្ចូលជាមួយប្រភេទបន្ទប់របស់ខ្ញុំទេ?",
        "អរគុណសម្រាប់ការបញ្ជាក់។ ខ្ញុំពេញចិត្តជំនួយរបស់អ្នក។"
      ];
      const randomResponse = language === 'en' ? guestResponses[Math.floor(Math.random() * guestResponses.length)] : guestResponsesKhmer[Math.floor(Math.random() * guestResponsesKhmer.length)];
      
      const guestMessage: Message = {
        id: `guest-${Date.now()}`,
        sender: 'guest',
        text: randomResponse,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, guestMessage]);
      setIsGuestTyping(false);
    }, 1500 + Math.random() * 1000);

    // Simulate showing pronunciation feedback
    setTimeout(() => {
        const mockFeedback: PronunciationFeedback = {
            overallScore: userMessage.pronunciationScore!,
            feedbackText: "Good effort! Focus on the 'th' sound in 'thank'. Your intonation was a bit flat on the question.",
            feedbackTextKhmer: "ការខិតខំល្អ! ផ្តោតលើសំឡេង 'th' ក្នុងពាក្យ 'thank'។ សំនៀងរបស់អ្នករាបស្មើបន្តិចពេលសួរសំណួរ។",
            areasForImprovement: ["'th' sound", "intonation for questions"],
            areasForImprovementKhmer: ["សំឡេង 'th'", "សំនៀងសម្រាប់សំណួរ"],
            wordBreakdown: userMessage.wordScores!.map(ws => ({
                word: ws.word,
                score: ws.score,
                phonemes: [{ipa: "/θ/", user: "/t/", correct: false}, {ipa: "/æ/", user: "/æ/", correct: true}, {ipa: "/ŋk/", user: "/ŋk/", correct: true}] // Mock phonemes
            }))
        };
        setShowFeedbackModal(mockFeedback);
    }, 2500);
  };

  const toggleRecording = () => {
    if (isRecording) {
      // Simulate processing and sending recorded message
      handleSendMessage(language === 'en' ? "This is my spoken response." : "នេះគឺជាការឆ្លើយតបដោយនិយាយរបស់ខ្ញុំ។");
    }
    setIsRecording(!isRecording);
  };
  
  const toggleFullScreen = useCallback(() => {
    const container = playerContainerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
    } else {
      document.exitFullscreen();
    }
  }, []);
  
  useEffect(() => {
    const handleFullscreenChange = () => setIsFullScreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);


  // --- UI Styles ---
  const bgColor = darkMode ? 'bg-navy-dark' : 'bg-gray-100';
  const textColor = darkMode ? 'text-white-pure' : 'text-navy';
  const cardBg = darkMode ? 'bg-navy-light shadow-glass-dark' : 'bg-white shadow-xl';
  const inputBg = darkMode ? 'bg-navy border-navy-light' : 'bg-white border-gray-300';
  const buttonPrimaryClasses = `btn btn-primary`;
  const buttonSecondaryClasses = `btn ${darkMode ? 'bg-navy-light hover:bg-navy text-white-pure' : 'bg-gray-200 hover:bg-gray-300 text-navy'}`;

  // --- Render ---
  if (showScenarioSelector || showGuestSelector) {
    return (
      <div ref={playerContainerRef} className={`w-full h-full p-4 md:p-8 flex flex-col items-center justify-center ${bgColor} ${textColor}`}>
        <AnimatePresence>
          {showScenarioSelector && (
            <motion.div
              key="scenarioSelector"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`p-6 rounded-xl w-full max-w-2xl ${cardBg}`}
            >
              <h2 className="text-2xl font-bold mb-6 text-center">{language === 'en' ? 'Choose a Scenario' : 'ជ្រើសរើសសេណារីយ៉ូ'}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto scrollbar-luxury">
                {mockScenarios.map(scenario => (
                  <motion.button
                    key={scenario.id}
                    onClick={() => { setCurrentScenario(scenario); setShowScenarioSelector(false); setShowGuestSelector(true); }}
                    className={`p-4 rounded-lg text-left transition-all duration-200 ${darkMode ? 'bg-navy hover:bg-primary/20' : 'bg-gray-50 hover:bg-primary/10'} border ${darkMode ? 'border-navy-light' : 'border-gray-200'}`}
                    whileHover={{ y: -3 }}
                  >
                    <div className="h-32 rounded bg-cover bg-center mb-2" style={{backgroundImage: `url(${scenario.settingImage})`}}></div>
                    <h3 className="font-semibold">{language === 'en' ? scenario.title : scenario.titleKhmer}</h3>
                    <p className={`text-xs opacity-70 ${language === 'km' ? 'khmer' : ''}`}>{language === 'en' ? scenario.description : scenario.descriptionKhmer}</p>
                    <div className="mt-1">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <Star key={i} size={12} className={`inline-block ${i < scenario.difficulty ? 'text-accent-orange fill-accent-orange' : (darkMode ? 'text-gray-600' : 'text-gray-300')}`} />
                      ))}
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
          {showGuestSelector && !showScenarioSelector && (
             <motion.div
                key="guestSelector"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`p-6 rounded-xl w-full max-w-2xl ${cardBg}`}
            >
                <h2 className="text-2xl font-bold mb-6 text-center">{language === 'en' ? 'Select Guest Persona' : 'ជ្រើសរើសបុគ្គលិកលក្ខណៈភ្ញៀវ'}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto scrollbar-luxury">
                    {mockGuests.map(guest => (
                        <motion.button
                            key={guest.id}
                            onClick={() => { setCurrentGuest(guest); startConversation(); }}
                            className={`p-4 rounded-lg text-left transition-all duration-200 ${darkMode ? 'bg-navy hover:bg-primary/20' : 'bg-gray-50 hover:bg-primary/10'} border ${darkMode ? 'border-navy-light' : 'border-gray-200'}`}
                            whileHover={{ y: -3 }}
                        >
                            <img src={guest.avatarImage} alt={guest.name} className="w-20 h-20 rounded-full mx-auto mb-2 object-cover border-2 border-primary" />
                            <h3 className="font-semibold text-center">{language === 'en' ? guest.name : guest.nameKhmer}</h3>
                            <p className="text-xs opacity-70 text-center">({guest.persona})</p>
                            <p className={`text-xs mt-1 ${language === 'km' ? 'khmer' : ''}`}>
                                {language === 'en' ? guest.personalityTraits.join(', ') : guest.personalityTraitsKhmer.join(', ')}
                            </p>
                        </motion.button>
                    ))}
                </div>
                <button onClick={() => {setShowGuestSelector(false); setShowScenarioSelector(true);}} className={`mt-6 text-sm ${buttonSecondaryClasses} w-full`}>
                  {language === 'en' ? 'Back to Scenarios' : 'ត្រឡប់ទៅសេណារីយ៉ូ'}
                </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // --- Main Conversation UI ---
  return (
    <div ref={playerContainerRef} className={`w-full h-full flex flex-col ${bgColor} ${textColor} ${isFullScreen ? 'fixed inset-0 z-50' : 'relative rounded-lg shadow-xl overflow-hidden'}`}>
      {/* Header */}
      <header className={`p-3 flex items-center justify-between border-b ${darkMode ? 'border-navy-light bg-navy' : 'border-gray-200 bg-gray-50'}`}>
        <div>
          <h2 className="font-bold text-lg">{language === 'en' ? currentScenario.title : currentScenario.titleKhmer}</h2>
          <p className="text-xs opacity-70">{language === 'en' ? currentGuest.name : currentGuest.nameKhmer} ({currentGuest.persona})</p>
        </div>
        <div className="flex items-center space-x-2">
            <button onClick={() => {setShowScenarioSelector(true); setShowGuestSelector(false); setMessages([]);}} className={`p-2 rounded-full ${darkMode ? 'hover:bg-white/10' : 'hover:bg-gray-200'}`} title={language === 'en' ? 'Change Scenario' : 'ផ្លាស់ប្តូរសេណារីយ៉ូ'}>
                <RefreshCw size={18} />
            </button>
            <button onClick={toggleFullScreen} className={`p-2 rounded-full ${darkMode ? 'hover:bg-white/10' : 'hover:bg-gray-200'}`} title={language === 'en' ? 'Fullscreen' : 'អេក្រង់ពេញ'}>
                {isFullScreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>
        </div>
      </header>

      {/* Main Content Area (Avatar + Chat) */}
      <div className="flex-grow flex flex-col md:flex-row overflow-hidden">
        {/* Avatar & Info Panel */}
        <aside className={`w-full md:w-1/3 lg:w-1/4 p-4 border-b md:border-b-0 md:border-r ${darkMode ? 'border-navy-light bg-navy/50' : 'border-gray-200 bg-gray-50/50'} flex flex-col items-center space-y-3`}>
          <div className="relative w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48">
            {/* Placeholder for 3D Avatar - using a styled image */}
            <img src={currentGuest.avatarImage} alt={currentGuest.name} className="w-full h-full rounded-full object-cover shadow-lg border-4 border-primary animate-pulse-slow" />
            <div className={`absolute bottom-0 right-0 px-2 py-0.5 rounded-full text-xs font-semibold ${darkMode ? 'bg-navy-light text-white-pure' : 'bg-white text-navy'} shadow-md`}>
              {currentGuest.persona}
            </div>
          </div>
          <h3 className="text-lg font-semibold text-center">{language === 'en' ? currentGuest.name : currentGuest.nameKhmer}</h3>
          <div className="text-xs text-center opacity-80 space-y-1">
            <p><strong className="font-medium">{language === 'en' ? 'Personality:' : 'បុគ្គលិកលក្ខណៈ៖'}</strong> {language === 'en' ? currentGuest.personalityTraits.join(', ') : currentGuest.personalityTraitsKhmer.join(', ')}</p>
            <p><strong className="font-medium">{language === 'en' ? 'Background:' : 'ប្រវត្តិ៖'}</strong> {language === 'en' ? currentGuest.culturalBackground : currentGuest.culturalBackgroundKhmer}</p>
          </div>
          <div className={`p-2 rounded-md text-xs w-full ${darkMode ? 'bg-navy-light/50' : 'bg-primary/5'}`}>
            <p className="font-semibold mb-1">{language === 'en' ? 'Cultural Tip:' : 'គន្លឹះវប្បធម៌៖'}</p>
            <p className="opacity-90">{language === 'en' ? currentScenario.culturalNotes[0] : currentScenario.culturalNotesKhmer[0]}</p>
          </div>
          <div className={`p-2 rounded-md text-xs w-full ${darkMode ? 'bg-navy-light/50' : 'bg-primary/5'}`}>
            <p className="font-semibold mb-1">{language === 'en' ? 'Keywords:' : 'ពាក្យគន្លឹះ៖'}</p>
            <p className="opacity-90">{language === 'en' ? currentScenario.keywords.join(', ') : currentScenario.keywordsKhmer.join(', ')}</p>
          </div>
        </aside>

        {/* Chat & Input Panel */}
        <main className="flex-grow flex flex-col bg-transparent"> {/* Chat background is from main bgColor */}
          {/* Chat Messages */}
          <div ref={chatAreaRef} className="flex-grow p-4 space-y-3 overflow-y-auto scrollbar-luxury">
            {messages.map(msg => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[75%] p-3 rounded-xl shadow ${
                  msg.sender === 'user' ? `bg-primary text-white-pure rounded-br-none` :
                  msg.sender === 'guest' ? `${darkMode ? 'bg-navy-light' : 'bg-gray-200'} rounded-bl-none` :
                  `bg-transparent text-center w-full text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} italic py-1`
                }`}>
                  {msg.sender !== 'system' && (
                    <p className="font-medium text-sm mb-0.5">
                      {msg.sender === 'user' ? (language === 'en' ? 'You' : 'អ្នក') : (language === 'en' ? currentGuest.name : currentGuest.nameKhmer)}
                    </p>
                  )}
                  <p className={`text-sm ${language === 'km' && msg.sender !== 'system' ? 'khmer' : ''}`}>{msg.text}</p>
                  {msg.sender === 'user' && msg.pronunciationScore !== undefined && (
                    <button 
                        onClick={() => setShowFeedbackModal({
                            overallScore: msg.pronunciationScore!,
                            feedbackText: "Detailed feedback would appear here.",
                            feedbackTextKhmer: "មតិកែលម្អលម្អិតនឹងបង្ហាញនៅទីនេះ។",
                            areasForImprovement: ["Clarity on 'r' sounds"],
                            areasForImprovementKhmer: ["ភាពច្បាស់លាស់លើសំឡេង 'រ'"],
                            wordBreakdown: msg.wordScores?.map(ws => ({word: ws.word, score: ws.score})) || []
                        })}
                        className={`mt-1 text-xs flex items-center ${getPronunciationColor(msg.pronunciationScore)} hover:underline`}
                    >
                      {language === 'en' ? 'Pronunciation:' : 'ការបញ្ចេញសំឡេង៖'} {msg.pronunciationScore}% <Info size={12} className="ml-1" />
                    </button>
                  )}
                  {msg.sender !== 'system' && <p className="text-xs opacity-60 mt-1 text-right">{formatTimestamp(msg.timestamp)}</p>}
                </div>
              </motion.div>
            ))}
            {isGuestTyping && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                <div className={`p-3 rounded-xl rounded-bl-none shadow ${darkMode ? 'bg-navy-light' : 'bg-gray-200'}`}>
                  <div className="flex space-x-1 items-center h-5">
                    <motion.div className={`w-1.5 h-1.5 rounded-full ${darkMode ? 'bg-gray-400' : 'bg-gray-500'}`} animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0 }} />
                    <motion.div className={`w-1.5 h-1.5 rounded-full ${darkMode ? 'bg-gray-400' : 'bg-gray-500'}`} animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.15 }} />
                    <motion.div className={`w-1.5 h-1.5 rounded-full ${darkMode ? 'bg-gray-400' : 'bg-gray-500'}`} animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.3 }} />
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Recording Studio / Input Area */}
          <div className={`p-3 border-t ${darkMode ? 'border-navy-light bg-navy/70' : 'border-gray-200 bg-gray-100/70'} backdrop-blur-sm`}>
            {isRecording && (
              <div className="mb-2">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span>{language === 'en' ? 'Recording...' : 'កំពុងថត...'}</span>
                  <div className="flex items-center">
                    <span className="mr-1">{language === 'en' ? 'Noise:' : 'សំឡេងរំខាន៖'}</span>
                    <div className="w-16 h-1.5 bg-gray-300/50 rounded-full overflow-hidden">
                      <div className={`h-full ${noiseLevel > 0.3 ? 'bg-accent-coral' : 'bg-success'}`} style={{ width: `${noiseLevel * 100}%` }}></div>
                    </div>
                  </div>
                </div>
                <div className="h-12 flex items-center space-x-px bg-black/10 dark:bg-white/5 p-1 rounded">
                  {waveformPoints.map((point, i) => (
                    <motion.div
                      key={i}
                      className="flex-1 bg-primary"
                      initial={{ height: '2%' }}
                      animate={{ height: `${point * 90 + 10}%` }}
                      transition={{ duration: 0.05 }}
                    />
                  ))}
                </div>
              </div>
            )}
            <div className="flex items-center space-x-2">
              <button onClick={toggleRecording} className={`p-3 rounded-full transition-colors ${isRecording ? 'bg-accent-coral text-white' : buttonSecondaryClasses}`}>
                {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
              </button>
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(userInput)}
                placeholder={language === 'en' ? 'Type your response or use microphone...' : 'វាយបញ្ចូលចម្លើយរបស់អ្នក ឬប្រើមីក្រូហ្វូន...'}
                className={`flex-grow p-3 rounded-lg text-sm ${inputBg} focus:ring-2 focus:ring-primary outline-none`}
                disabled={isRecording}
              />
              <button onClick={() => handleSendMessage(userInput)} className={`${buttonPrimaryClasses} p-3`} disabled={!userInput.trim() || isRecording}>
                <Send size={20} />
              </button>
            </div>
          </div>
        </main>
      </div>
      
      {/* Pronunciation Feedback Modal */}
      <AnimatePresence>
        {showFeedbackModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-40 p-4"
            onClick={() => setShowFeedbackModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-lg p-5 rounded-xl shadow-2xl ${cardBg} max-h-[80vh] flex flex-col`}
            >
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xl font-bold">{language === 'en' ? 'Pronunciation Feedback' : 'មតិកែលម្អការបញ្ចេញសំឡេង'}</h3>
                <button onClick={() => setShowFeedbackModal(null)} className={`p-1.5 rounded-full ${darkMode ? 'hover:bg-white/10' : 'hover:bg-gray-200'}`}><X size={20} /></button>
              </div>
              <div className="overflow-y-auto scrollbar-luxury pr-2">
                <div className="flex items-center mb-3">
                  <span className="font-semibold mr-2">{language === 'en' ? 'Overall Score:' : 'ពិន្ទុសរុប៖'}</span>
                  <span className={`text-2xl font-bold ${getPronunciationColor(showFeedbackModal.overallScore)}`}>{showFeedbackModal.overallScore}%</span>
                  {showFeedbackModal.overallScore >= 85 && <CheckCircle size={24} className="ml-2 text-success" />}
                  {showFeedbackModal.overallScore < 60 && <AlertTriangle size={24} className="ml-2 text-accent-coral" />}
                </div>
                <p className="text-sm mb-2">{language === 'en' ? showFeedbackModal.feedbackText : showFeedbackModal.feedbackTextKhmer}</p>
                
                <h4 className="font-semibold mt-3 mb-1">{language === 'en' ? 'Areas for Improvement:' : 'ចំណុចត្រូវកែលម្អ៖'}</h4>
                <ul className="list-disc list-inside text-sm space-y-0.5">
                  {(language === 'en' ? showFeedbackModal.areasForImprovement : showFeedbackModal.areasForImprovementKhmer).map((area, i) => <li key={i}>{area}</li>)}
                </ul>

                <h4 className="font-semibold mt-3 mb-1">{language === 'en' ? 'Word Breakdown:' : 'ការបំបែកពាក្យ៖'}</h4>
                <div className="space-y-1 text-xs">
                  {showFeedbackModal.wordBreakdown.map((wb, i) => (
                    <div key={i} className={`p-1.5 rounded ${darkMode ? 'bg-navy/50' : 'bg-gray-100'} flex justify-between items-center`}>
                      <span>{wb.word}</span>
                      <span className={`font-semibold ${getPronunciationColor(wb.score)}`}>{wb.score}%</span>
                    </div>
                  ))}
                </div>
              </div>
               <button onClick={() => setShowFeedbackModal(null)} className={`mt-4 ${buttonPrimaryClasses} w-full text-sm`}>
                {language === 'en' ? 'Got it!' : 'យល់ព្រម!'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AIConversationPractice;
