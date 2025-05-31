import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sun, Moon, Bell, User, Flame, Award, Clock, ChevronRight, MessageSquare, Menu, X,
  LayoutDashboard, BookOpen, Mic2, Video, BarChart3, CalendarCheck, Trophy, Settings2, LogOut, Info, Users, DownloadCloud, SlidersHorizontal, ShieldCheck, DollarSign, HelpCircle, Layers, CalendarDays, TrendingUp, Check, Globe, Coffee
} from 'lucide-react';

// Import other major components (assuming they are in ./components/)
import VideoLearningPlayer from './components/VideoLearningPlayer'; // Assuming path
import AIConversationPractice from './components/AIConversationPractice'; // Assuming path
import FlashcardSystem from './components/FlashcardSystem'; // Assuming path

// Types
interface UserProfile {
  name: string;
  role: string;
  avatarUrl?: string; // Optional: path to user's avatar image
  streak: number;
  skillsUnlocked: number;
  minutesLearnedThisWeek: number;
  overallProgress: number; // 0-100
  currentLearningPath?: string; // Name of current learning path
}

interface DailyChallenge {
  title: string;
  titleKhmer: string;
  description: string;
  descriptionKhmer: string;
  timeRemainingSeconds: number;
  xpReward: number;
  icon?: React.ElementType;
}

interface Lesson {
  id: string;
  title: string;
  titleKhmer: string;
  description?: string;
  image?: string; // URL to lesson preview image
  durationMinutes?: number;
  progress: number; // 0-100
  type: 'video' | 'practice' | 'flashcards' | 'reading';
  targetSection: string; // Section key to navigate to
}

interface SkillCategory {
  id: string;
  title: string;
  titleKhmer: string;
  icon: React.ElementType;
  color: string; // Tailwind color class e.g., 'text-primary'
  bgColor: string; // Tailwind bg color class e.g., 'bg-primary/20'
  description: string;
  descriptionKhmer: string;
  targetSection: string;
}

type NavItemKey = 'dashboard' | 'courses' | 'aiPractice' | 'flashcards' | 'videoLearning' | 'assessments' | 'analytics' | 'planner' | 'achievements' | 'community' | 'supervisor' | 'offline' | 'settings' | 'help' | 'logout';

interface NavItem {
  key: NavItemKey;
  label: string;
  labelKhmer: string;
  icon: React.ElementType;
  isBottom?: boolean; // For items like settings, logout
}

// Mock Data
const mockUserProfileData: UserProfile = {
  name: "Sokha",
  role: "Front Desk Trainee",
  avatarUrl: "/assets/avatars/sokha-avatar.png", // Replace with actual or placeholder path
  streak: 12,
  skillsUnlocked: 25,
  minutesLearnedThisWeek: 210,
  overallProgress: 68,
  currentLearningPath: "Front Desk Excellence Path",
};

const mockDailyChallengeData: DailyChallenge = {
  title: "Master Check-in Phrases",
  titleKhmer: "ស្ទាត់ជំនាញឃ្លាពេលចុះឈ្មោះចូល",
  description: "Practice 5 key phrases for guest check-in with the AI tutor.",
  descriptionKhmer: "អនុវត្តឃ្លាសំខាន់ៗចំនួន៥ សម្រាប់ការចុះឈ្មោះចូលរបស់ភ្ញៀវជាមួយគ្រូ AI។",
  timeRemainingSeconds: 10 * 60 * 60, // 10 hours
  xpReward: 200,
  icon: MessageSquare,
};

const mockCurrentLessonData: Lesson = {
  id: "lesson-fd-03",
  title: "Handling Guest Complaints",
  titleKhmer: "ការដោះស្រាយបណ្តឹងរបស់ភ្ញៀវ",
  description: "Learn the L.A.S.T. method for resolving guest issues.",
  image: "/assets/lessons/complaint-handling.jpg",
  durationMinutes: 20,
  progress: 45,
  type: 'video', // Fixed: Changed from 'videoLearning' to 'video'
  targetSection: 'videoLearning', // Navigate to video player section
};

const mockSkillCategories: SkillCategory[] = [
  { id: 'sc1', title: 'AI Conversation', titleKhmer: 'សន្ទនា AI', icon: Mic2, color: 'text-accent-coral', bgColor: 'bg-accent-coral/20', description: 'Practice real guest interactions.', descriptionKhmer: 'អនុវត្តអន្តរកម្មភ្ញៀវពិតៗ។', targetSection: 'aiPractice' },
  { id: 'sc2', title: 'Vocabulary Flashcards', titleKhmer: 'កាតពាក្យវាក្យសព្ទ', icon: Layers, color: 'text-primary', bgColor: 'bg-primary/20', description: 'Master essential hospitality terms.', descriptionKhmer: 'ស្ទាត់ជំនាញពាក្យបដិសណ្ឋារកិច្ចសំខាន់ៗ។', targetSection: 'flashcards' },
  { id: 'sc3', title: 'Video Lessons', titleKhmer: 'មេរៀនវីដេអូ', icon: Video, color: 'text-accent-blue', bgColor: 'bg-accent-blue/20', description: 'Watch expert-led training videos.', descriptionKhmer: 'មើលវីដេអូបណ្តុះបណ្តាលពីអ្នកជំនាញ។', targetSection: 'videoLearning' },
  { id: 'sc4', title: 'Cultural Insights', titleKhmer: 'ការយល់ដឹងពីវប្បធម៌', icon: Globe, color: 'text-accent-orange', bgColor: 'bg-accent-orange/20', description: 'Learn Cambodian customs & etiquette.', descriptionKhmer: 'រៀនពីទំនៀមទម្លាប់ និងសុជីវធម៌កម្ពុជា។', targetSection: 'courses' }, // Assuming courses cover this
];

const navigationItems: NavItem[] = [
  { key: 'dashboard', label: 'Dashboard', labelKhmer: 'ផ្ទាំងគ្រប់គ្រង', icon: LayoutDashboard },
  { key: 'courses', label: 'Courses', labelKhmer: 'វគ្គសិក្សា', icon: BookOpen },
  { key: 'aiPractice', label: 'AI Practice', labelKhmer: 'អនុវត្តជាមួយ AI', icon: Mic2 },
  { key: 'flashcards', label: 'Flashcards', labelKhmer: 'កាតរំលឹក', icon: Layers },
  { key: 'videoLearning', label: 'Video Lessons', labelKhmer: 'មេរៀនវីដេអូ', icon: Video },
  { key: 'assessments', label: 'Assessments', labelKhmer: 'ការវាយតម្លៃ', icon: CalendarCheck },
  { key: 'analytics', label: 'My Progress', labelKhmer: 'វឌ្ឍនភាពខ្ញុំ', icon: BarChart3 },
  { key: 'planner', label: 'Study Planner', labelKhmer: 'ផែនការសិក្សា', icon: CalendarDays },
  { key: 'achievements', label: 'Achievements', labelKhmer: 'សមិទ្ធផល', icon: Trophy },
  { key: 'community', label: 'Community', labelKhmer: 'សហគមន៍', icon: Users },
  { key: 'supervisor', label: 'Supervisor Tools', labelKhmer: 'ឧបករណ៍អ្នកគ្រប់គ្រង', icon: SlidersHorizontal, isBottom: true },
  { key: 'offline', label: 'Offline Content', labelKhmer: 'មាតិកាក្រៅបណ្ដាញ', icon: DownloadCloud, isBottom: true },
  { key: 'settings', label: 'Settings', labelKhmer: 'ការកំណត់', icon: Settings2, isBottom: true },
  { key: 'help', label: 'Help & Support', labelKhmer: 'ជំនួយ & គាំទ្រ', icon: HelpCircle, isBottom: true },
  { key: 'logout', label: 'Logout', labelKhmer: 'ចាកចេញ', icon: LogOut, isBottom: true },
];

// Placeholder Components for different sections
const PlaceholderSection: React.FC<{ title: string, titleKhmer: string, language: 'en' | 'km', icon?: React.ElementType }> = ({ title, titleKhmer, language, icon: Icon }) => (
  <div className="p-6 md:p-8 h-full flex flex-col items-center justify-center text-center">
    {Icon && <Icon size={64} className="mb-4 text-gray-400 dark:text-gray-600" />}
    <h1 className="text-3xl font-bold mb-2">{language === 'en' ? title : titleKhmer}</h1>
    <p className="text-gray-600 dark:text-gray-400">{language === 'en' ? 'This section is under development. Content coming soon!' : 'ផ្នែកនេះកំពុងត្រូវបានបង្កើត។ មាតិកានឹងមកដល់ឆាប់ៗនេះ!'}</p>
  </div>
);

const App: React.FC = () => {
  const [language, setLanguage] = useState<'en' | 'km'>('en');
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState<NavItemKey>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  
  const [showSplash, setShowSplash] = useState<boolean>(true); 
  const [loadingSplash, setLoadingSplash] = useState<boolean>(true); 
  
  const [userProfile, setUserProfileState] = useState<UserProfile>(mockUserProfileData); 
  const [dailyChallenge, setDailyChallenge] = useState<DailyChallenge>(mockDailyChallengeData);
  const [challengeTimeRemaining, setChallengeTimeRemaining] = useState('');

  const [isDesktop, setIsDesktop] = useState(typeof window !== 'undefined' ? window.innerWidth >= 768 : false);

  useEffect(() => {
    const handleResize = () => {
      const newIsDesktop = window.innerWidth >= 768;
      setIsDesktop(newIsDesktop);
      if (newIsDesktop) {
        setMobileMenuOpen(false);
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    // Prevent body scroll when mobile menu is open
    if (mobileMenuOpen && !isDesktop) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    window.addEventListener('resize', handleResize);
    document.addEventListener('keydown', handleEscapeKey);
    
    // Call handler right away so state is updated with initial window size
    handleResize();
    
    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'unset'; // Clean up on unmount
    };
  }, [mobileMenuOpen, isDesktop]);

  // Splash Screen Effect
  useEffect(() => {
    const splashContentTimer = setTimeout(() => {
      setLoadingSplash(false); 
    }, 2500); 
  
    const splashContainerTimer = setTimeout(() => {
      setShowSplash(false);   
    }, 4000); // 2500ms for loading + 1500ms for checkmark/fade
  
    return () => {
      clearTimeout(splashContentTimer);
      clearTimeout(splashContainerTimer);
    };
  }, []);

  // Dark Mode Effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Time-based Greeting
  const [greeting, setGreeting] = useState<string>('');
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting(language === 'en' ? 'Good Morning' : 'អរុណសួស្តី');
    else if (hour < 18) setGreeting(language === 'en' ? 'Good Afternoon' : 'ទិវាសួស្តី');
    else setGreeting(language === 'en' ? 'Good Evening' : 'សាយណ្ហសួស្តី');
  }, [language, activeSection]); 

  // Daily Challenge Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setDailyChallenge(prev => {
        const newTime = Math.max(0, prev.timeRemainingSeconds - 1);
        const hours = Math.floor(newTime / 3600);
        const minutes = Math.floor((newTime % 3600) / 60);
        const seconds = newTime % 60;
        setChallengeTimeRemaining(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
        return { ...prev, timeRemainingSeconds: newTime };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleLanguage = () => setLanguage(prev => prev === 'en' ? 'km' : 'en');
  const toggleDarkMode = () => setDarkMode(prev => !prev);

  const handleNavClick = (key: NavItemKey) => {
    if (key === 'logout') {
      console.log("Logout clicked");
      setActiveSection('dashboard'); 
    } else {
      setActiveSection(key);
    }
    setMobileMenuOpen(false);
  };
  
  // Sidebar Component (Desktop Only)
  const Sidebar: React.FC = () => {
    const topNavItems = navigationItems.filter(item => !item.isBottom);
    const bottomNavItems = navigationItems.filter(item => item.isBottom);

    return (
      <aside 
        className={`w-64 ${darkMode ? 'bg-navy-dark border-r border-navy-light' : 'bg-white border-r border-gray-200'} shadow-lg`}
      >
        <div className="flex flex-col h-full">
          <div className={`p-4 border-b ${darkMode ? 'border-navy-light' : 'border-gray-200'} flex items-center`}>
            <motion.div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-xl mr-2">Lx</motion.div>
            <span className={`font-bold text-xl ${darkMode ? 'text-white' : 'text-navy'}`}>LxLabs</span>
          </div>
          <nav className="flex-grow p-3 space-y-1 overflow-y-auto scrollbar-luxury">
            {topNavItems.map(item => (
              <button
                key={item.key}
                onClick={() => handleNavClick(item.key)}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors duration-200
                            ${activeSection === item.key 
                              ? (darkMode ? 'bg-primary/20 text-primary-light' : 'bg-primary/10 text-primary-dark font-medium') 
                              : (darkMode ? 'hover:bg-navy-light text-gray-300 hover:text-white' : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900')}`}
              >
                <item.icon size={20} className={`${activeSection === item.key ? (darkMode ? 'text-primary-light' : 'text-primary-dark') : ''}`} />
                <span className="text-sm">{language === 'en' ? item.label : item.labelKhmer}</span>
              </button>
            ))}
          </nav>
          <div className={`p-3 border-t ${darkMode ? 'border-navy-light' : 'border-gray-200'} space-y-1`}>
            {bottomNavItems.map(item => (
              <button
                key={item.key}
                onClick={() => handleNavClick(item.key)}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors duration-200
                            ${activeSection === item.key 
                              ? (darkMode ? 'bg-primary/20 text-primary-light' : 'bg-primary/10 text-primary-dark font-medium') 
                              : (darkMode ? 'hover:bg-navy-light text-gray-300 hover:text-white' : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900')}`}
              >
                <item.icon size={20} className={`${activeSection === item.key ? (darkMode ? 'text-primary-light' : 'text-primary-dark') : ''}`} />
                <span className="text-sm">{language === 'en' ? item.label : item.labelKhmer}</span>
              </button>
            ))}
          </div>
        </div>
      </aside>
    );
  };
  
  // Header Component
  const Header: React.FC = () => (
    <header className={`p-3 border-b ${darkMode ? 'bg-navy border-navy-light' : 'bg-gray-50 border-gray-200'} flex items-center justify-between sticky top-0 z-40`}>
      <div className="flex items-center">
        {!isDesktop && (
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 mr-2 rounded hover:bg-gray-200 dark:hover:bg-navy-light"
            >
                <Menu size={22} />
            </button>
        )}
        <h1 className="text-xl font-semibold">{language === 'en' ? navigationItems.find(i=>i.key === activeSection)?.label : navigationItems.find(i=>i.key === activeSection)?.labelKhmer}</h1>
      </div>
      <div className="flex items-center space-x-3">
        <button className={`p-2 rounded-full ${darkMode ? 'hover:bg-navy-light' : 'hover:bg-gray-200'}`}>
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-accent-coral rounded-full animate-pulse"></span>
        </button>
        <div className="relative cursor-pointer" onClick={() => handleNavClick('settings')}>
          <img 
            src={userProfile.avatarUrl || `https://ui-avatars.com/api/?name=${userProfile.name.replace(/\s+/g, '+')}&background=50C878&color=fff&size=128`} 
            alt={userProfile.name} 
            className="w-9 h-9 rounded-full object-cover border-2 border-primary"
          />
          <svg className="w-10 h-10 absolute -top-0.5 -left-0.5" viewBox="0 0 36 36">
            <path
              className="text-gray-300 dark:text-navy-light"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none" stroke="currentColor" strokeWidth="1.5"
            />
            <path
              className="text-primary"
              strokeDasharray={`${userProfile.overallProgress}, 100`}
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
            />
          </svg>
        </div>
      </div>
    </header>
  );

  // Main Content Renderer
  const renderActiveSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardSection />;
      case 'aiPractice':
        return <AIConversationPractice language={language} darkMode={darkMode} />;
      case 'flashcards':
        return <FlashcardSystem language={language} darkMode={darkMode} />;
      case 'videoLearning':
        return <VideoLearningPlayer language={language} darkMode={darkMode} />; 
      case 'analytics':
        return <PlaceholderSection title="Progress Analytics" titleKhmer="ការវិភាគវឌ្ឍនភាព" language={language} icon={BarChart3} />;
      case 'assessments':
        return <PlaceholderSection title="Assessments & Quizzes" titleKhmer="ការវាយតម្លៃ & កម្រងសំណួរ" language={language} icon={CalendarCheck} />;
      case 'planner':
        return <PlaceholderSection title="Study Planner" titleKhmer="ផែនការសិក្សា" language={language} icon={CalendarDays} />;
      case 'achievements':
        return <PlaceholderSection title="Achievements" titleKhmer="សមិទ្ធផល" language={language} icon={Trophy} />;
      case 'courses':
        return <PlaceholderSection title="Courses" titleKhmer="វគ្គសិក្សា" language={language} icon={BookOpen} />;
      case 'community':
        return <PlaceholderSection title="Community Forum" titleKhmer="វេទិកាសហគមន៍" language={language} icon={Users} />;
      case 'supervisor':
        return <PlaceholderSection title="Supervisor Dashboard" titleKhmer="ផ្ទាំងគ្រប់គ្រងអ្នកគ្រប់គ្រង" language={language} icon={SlidersHorizontal} />;
      case 'offline':
        return <PlaceholderSection title="Offline Content" titleKhmer="មាតិកាក្រៅបណ្ដាញ" language={language} icon={DownloadCloud} />;
      case 'settings':
        return <SettingsPage />;
      case 'help':
        return <PlaceholderSection title="Help & Support" titleKhmer="ជំនួយ & គាំទ្រ" language={language} icon={HelpCircle} />;
      default:
        return <DashboardSection />;
    }
  };
  
  // Dashboard Section Component
  const DashboardSection: React.FC = () => (
    <div className="p-4 md:p-6 space-y-6 scrollbar-luxury">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">{greeting}, {userProfile.name}!</h1>
          <p className="text-gray-600 dark:text-gray-400">{language === 'en' ? 'Ready to elevate your hospitality skills?' : 'ត្រៀមខ្លួនដើម្បីបង្កើនជំនាញបដិសណ្ឋារកិច្ចរបស់អ្នកហើយឬនៅ?'}</p>
        </div>
        <div className={`mt-2 sm:mt-0 p-2 rounded-lg text-xs ${darkMode ? 'bg-navy-light' : 'bg-gray-100'}`}>
          Phnom Penh: 32°C ☀️ (Placeholder)
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[
          { label: language === 'en' ? 'Streak' : 'ថ្ងៃជាប់គ្នា', value: `${userProfile.streak} ${language === 'en' ? 'days' : 'ថ្ងៃ'}`, icon: Flame, color: 'accent-coral' },
          { label: language === 'en' ? 'Skills Unlocked' : 'ជំនាញដោះសោ', value: userProfile.skillsUnlocked, icon: Award, color: 'primary' },
          { label: language === 'en' ? 'This Week' : 'សប្តាហ៍នេះ', value: `${userProfile.minutesLearnedThisWeek} ${language === 'en' ? 'min' : 'នាទី'}`, icon: Clock, color: 'accent-blue' },
          { label: language === 'en' ? 'Overall Progress' : 'វឌ្ឍនភាពសរុប', value: `${userProfile.overallProgress}%`, icon: TrendingUp, color: 'accent-orange' },
        ].map(stat => (
          <motion.div 
            key={stat.label}
            className={`p-4 rounded-xl shadow-lg relative overflow-hidden ${darkMode ? 'glassmorphism-dark' : 'glassmorphism'}`}
            whileHover={{ y: -5 }}
          >
            <div className={`absolute top-3 right-3 p-2 rounded-full bg-${stat.color}/20`}>
              <stat.icon size={20} className={`text-${stat.color}`} />
            </div>
            <p className="text-sm opacity-80 mb-1">{stat.label}</p>
            <p className="text-2xl font-bold">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <motion.div 
        className={`rounded-xl p-5 text-white relative overflow-hidden shadow-lg ${darkMode ? 'bg-navy-light border border-primary/50' : 'bg-luxury-green'}`}
        whileHover={{ scale: 1.02 }}
      >
        <div className="flex flex-col sm:flex-row justify-between items-start">
          <div>
            <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-medium mb-2">{language === 'en' ? 'Daily Challenge' : 'ការប្រកួតប្រចាំថ្ងៃ'}</span>
            <h3 className="text-lg font-bold mb-1">{language === 'en' ? dailyChallenge.title : dailyChallenge.titleKhmer}</h3>
            <p className="text-sm opacity-90 max-w-md">{language === 'en' ? dailyChallenge.description : dailyChallenge.descriptionKhmer}</p>
          </div>
          <div className="mt-3 sm:mt-0 sm:text-right">
            <div className="flex items-center text-sm mb-2">
              <Clock size={16} className="mr-1.5" /> {challengeTimeRemaining} {language === 'en' ? 'left' : 'នៅសល់'}
            </div>
            <button className="btn bg-white text-navy hover:bg-gray-100 dark:bg-primary dark:text-white dark:hover:bg-primary-dark text-sm px-4 py-2">
              {language === 'en' ? 'Start Challenge' : 'ចាប់ផ្តើមការប្រកួត'}
            </button>
          </div>
        </div>
        <div className="absolute -bottom-8 -right-8 w-24 h-24 opacity-20">
         {dailyChallenge.icon && <dailyChallenge.icon size={96} className="text-white" />}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
          className={`lg:col-span-2 p-5 rounded-xl shadow-lg ${darkMode ? 'glassmorphism-dark' : 'glassmorphism'}`}
          whileHover={{ y: -3 }}
        >
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xl font-semibold">{language === 'en' ? 'Continue Learning' : 'បន្តការសិក្សា'}</h3>
            <button onClick={() => handleNavClick(mockCurrentLessonData.targetSection as NavItemKey)} className="text-sm text-primary hover:underline flex items-center">
              {language === 'en' ? 'View All' : 'មើលទាំងអស់'} <ChevronRight size={16} />
            </button>
          </div>
          <div className="flex flex-col sm:flex-row items-center">
            {mockCurrentLessonData.image && <img src={mockCurrentLessonData.image} alt={mockCurrentLessonData.title} className="w-full sm:w-1/3 h-32 sm:h-auto object-cover rounded-lg mb-3 sm:mb-0 sm:mr-4" />}
            <div className="flex-1">
              <h4 className="font-bold text-lg mb-1">{language === 'en' ? mockCurrentLessonData.title : mockCurrentLessonData.titleKhmer}</h4>
              {mockCurrentLessonData.description && <p className="text-sm opacity-80 mb-2">{mockCurrentLessonData.description}</p>}
              <div className="flex justify-between items-center text-xs opacity-70 mb-1">
                <span>{mockCurrentLessonData.durationMinutes} {language === 'en' ? 'min' : 'នាទី'}</span>
                <span>{mockCurrentLessonData.progress}% {language === 'en' ? 'complete' : 'បានបញ្ចប់'}</span>
              </div>
              <div className={`progress-bar h-1.5 ${darkMode ? 'bg-navy' : 'bg-gray-200'}`}>
                <div className="progress-value h-1.5" style={{ width: `${mockCurrentLessonData.progress}%` }}></div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className={`p-5 rounded-xl shadow-lg ${darkMode ? 'glassmorphism-dark' : 'glassmorphism'}`}>
          <h3 className="text-xl font-semibold mb-3">{language === 'en' ? 'Explore Skills' : 'រុករកជំនាញ'}</h3>
          <div className="space-y-3">
            {mockSkillCategories.slice(0,3).map(cat => ( 
              <motion.button 
                key={cat.id}
                onClick={() => handleNavClick(cat.targetSection as NavItemKey)}
                className={`w-full flex items-center p-3 rounded-lg transition-colors ${darkMode ? 'hover:bg-navy-light/70' : 'hover:bg-gray-100/70'} ${cat.bgColor}`}
                whileHover={{ scale: 1.03 }}
              >
                <cat.icon size={22} className={`${cat.color} mr-3`} />
                <div>
                  <p className={`font-medium text-sm text-left ${cat.color}`}>{language === 'en' ? cat.title : cat.titleKhmer}</p>
                  <p className={`text-xs text-left ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{language === 'en' ? cat.description.substring(0,30)+'...' : cat.descriptionKhmer.substring(0,30)+'...'}</p>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Settings Page Component
  const SettingsPage: React.FC = () => (
    <div className="p-6 md:p-8 space-y-6 scrollbar-luxury">
      <h1 className="text-3xl font-bold">{language === 'en' ? 'Settings' : 'ការកំណត់'}</h1>
      <div className={`p-5 rounded-xl shadow-lg ${darkMode ? 'glassmorphism-dark' : 'glassmorphism'}`}>
        <h2 className="text-xl font-semibold mb-3">{language === 'en' ? 'Appearance' : 'រូបរាង'}</h2>
        <div className="flex items-center justify-between mb-3">
          <span>{language === 'en' ? 'Dark Mode' : 'ទម្រង់ងងឹត'}</span>
          <button 
            onClick={toggleDarkMode} 
            className={`w-12 h-6 rounded-full p-0.5 flex items-center transition-colors ${darkMode ? 'bg-primary justify-end' : 'bg-gray-300 dark:bg-gray-600 justify-start'}`}
          >
            <motion.div layout className="w-5 h-5 bg-white rounded-full shadow" />
          </button>
        </div>
        <div className="flex items-center justify-between">
          <span>{language === 'en' ? 'Language' : 'ភាសា'}</span>
          <button 
            onClick={toggleLanguage}
            className="btn btn-secondary text-sm px-3 py-1.5"
          >
            {language === 'en' ? 'ប្តូរទៅភាសាខ្មែរ' : 'Switch to English'}
          </button>
        </div>
      </div>
      <PlaceholderSection title="Profile Management" titleKhmer="ការគ្រប់គ្រងប្រវត្តិរូប" language={language} icon={User} />
      <PlaceholderSection title="Notification Preferences" titleKhmer="ចំណូលចិត្តការជូនដំណឹង" language={language} icon={Bell} />
      <PlaceholderSection title="Privacy & Security" titleKhmer="ឯកជនភាព & សុវត្ថិភាព" language={language} icon={ShieldCheck} />
      <PlaceholderSection title="Subscription & Billing" titleKhmer="ការជាវ & វិក្កយបត្រ" language={language} icon={DollarSign} />
    </div>
  );

  // Splash Screen Component
  const SplashScreen: React.FC = () => (
    <AnimatePresence>
      {showSplash && (
        <motion.div
          key="splashContainer"
          className={`fixed inset-0 z-[100] flex flex-col items-center justify-center ${darkMode ? 'bg-luxury-navy' : 'bg-white'}`}
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }} 
        >
          <AnimatePresence mode="wait">
            {loadingSplash ? (
              <motion.div
                key="splashContentLoading"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center"
              >
                <motion.div 
                  className="w-32 h-32 md:w-40 md:h-40 mb-6"
                  style={{ perspective: 1000 }}
                  animate={{ rotateY: [0, 360] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <div className="relative w-full h-full transform-style-preserve-3d">
                    <div className="absolute inset-0 bg-primary rounded-lg transform rotate-y-0 translate-z-[-15px] opacity-70"></div>
                    <div className="absolute inset-2 bg-secondary rounded-lg transform rotate-y-60 translate-z-[-5px] opacity-70"></div>
                    <div className="absolute inset-4 bg-white rounded-lg flex items-center justify-center transform rotate-y-120 translate-z-[5px] shadow-xl">
                      <span className="text-navy text-3xl font-bold">Lx</span>
                    </div>
                  </div>
                </motion.div>
                <h1 className={`text-3xl md:text-4xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-navy'}`}>LxLabs</h1>
                <p className={`text-lg ${darkMode ? 'text-white/80' : 'text-navy/70'}`}>{language === 'en' ? 'Hospitality Excellence Training' : 'បណ្តុះបណ្តាលឧត្តមភាពបដិសណ្ឋារកិច្ច'}</p>
              </motion.div>
            ) : (
              <motion.div
                key="splashContentExitingCheckmark" 
                initial={{ opacity: 0, scale: 0.5 }} 
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.2 }} 
                transition={{ duration: 0.5 }} 
              >
                <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center">
                  <Check size={40} className="text-white" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <SplashScreen />
      <AnimatePresence>
      {!showSplash && (
        <motion.div 
          className={`flex h-screen antialiased font-sans text-sm md:text-base ${darkMode ? 'bg-navy text-white' : 'bg-gray-100 text-navy-dark'} scrollbar-luxury`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Desktop Sidebar */}
          {isDesktop && <Sidebar />}
          
          {/* Mobile Menu Overlay */}
          {!isDesktop && (
            <AnimatePresence>
              {mobileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="fixed inset-0 z-50 md:hidden"
                >
                  {/* Backdrop */}
                  <div 
                    className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                    onClick={() => setMobileMenuOpen(false)}
                  />
                  
                  {/* Sidebar */}
                  <motion.div
                    initial={{ x: '-100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '-100%' }}
                    transition={{ type: "tween", ease: "easeInOut", duration: 0.3 }}
                    className={`relative w-64 h-full ${darkMode ? 'bg-navy-dark border-r border-navy-light' : 'bg-white border-r border-gray-200'} shadow-lg`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex flex-col h-full">
                      <div className={`p-4 border-b ${darkMode ? 'border-navy-light' : 'border-gray-200'} flex items-center justify-between`}>
                        <div className="flex items-center">
                          <motion.div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-xl mr-2">Lx</motion.div>
                          <span className={`font-bold text-xl ${darkMode ? 'text-white' : 'text-navy'}`}>LxLabs</span>
                        </div>
                        <button 
                          onClick={() => setMobileMenuOpen(false)}
                          className="p-1 hover:bg-gray-200 dark:hover:bg-navy-light rounded"
                        >
                          <X size={20} />
                        </button>
                      </div>
                      <nav className="flex-grow p-3 space-y-1 overflow-y-auto scrollbar-luxury">
                        {navigationItems.filter(item => !item.isBottom).map(item => (
                          <button
                            key={item.key}
                            onClick={() => handleNavClick(item.key)}
                            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors duration-200
                                        ${activeSection === item.key 
                                          ? (darkMode ? 'bg-primary/20 text-primary-light' : 'bg-primary/10 text-primary-dark font-medium') 
                                          : (darkMode ? 'hover:bg-navy-light text-gray-300 hover:text-white' : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900')}`}
                          >
                            <item.icon size={20} className={`${activeSection === item.key ? (darkMode ? 'text-primary-light' : 'text-primary-dark') : ''}`} />
                            <span className="text-sm">{language === 'en' ? item.label : item.labelKhmer}</span>
                          </button>
                        ))}
                      </nav>
                      <div className={`p-3 border-t ${darkMode ? 'border-navy-light' : 'border-gray-200'} space-y-1`}>
                        {navigationItems.filter(item => item.isBottom).map(item => (
                          <button
                            key={item.key}
                            onClick={() => handleNavClick(item.key)}
                            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors duration-200
                                        ${activeSection === item.key 
                                          ? (darkMode ? 'bg-primary/20 text-primary-light' : 'bg-primary/10 text-primary-dark font-medium') 
                                          : (darkMode ? 'hover:bg-navy-light text-gray-300 hover:text-white' : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900')}`}
                          >
                            <item.icon size={20} className={`${activeSection === item.key ? (darkMode ? 'text-primary-light' : 'text-primary-dark') : ''}`} />
                            <span className="text-sm">{language === 'en' ? item.label : item.labelKhmer}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
          
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header />
            <main className="flex-1 overflow-y-auto bg-transparent">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSection}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className="h-full" 
                >
                  {renderActiveSection()}
                </motion.div>
              </AnimatePresence>
            </main>
          </div>
        </motion.div>
      )}
      </AnimatePresence>
    </>
  );
};

export default App;
