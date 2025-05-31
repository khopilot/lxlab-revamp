import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Search, Filter as FilterIcon, Star, Clock, BookOpen, Users, BarChartHorizontalBig, CheckCircle, XCircle, ArrowRight, Layers, Award, Briefcase, MapPin } from 'lucide-react';

// Types
interface Module {
  id: string;
  titleEn: string;
  titleKh: string;
  lessonsCount: number;
  durationMinutes: number;
}

interface Course {
  id: string;
  titleEn: string;
  titleKh: string;
  descriptionEn: string;
  descriptionKh: string;
  category: 'Front Desk' | 'Food & Beverage' | 'Housekeeping' | 'Cultural Skills' | 'Management' | 'Language';
  difficulty: 1 | 2 | 3; // 1: Beginner, 2: Intermediate, 3: Advanced
  durationHours: number;
  instructorName: string;
  instructorImage?: string;
  thumbnailImage: string;
  modules: Module[];
  learningOutcomesEn: string[];
  learningOutcomesKh: string[];
  prerequisitesEn: string[];
  prerequisitesKh: string[];
  isEnrolled?: boolean;
  progress?: number; // 0-100
  rating?: number; // 1-5
  reviewCount?: number;
}

interface LearningPath {
  id: string;
  titleEn: string;
  titleKh: string;
  descriptionEn: string;
  descriptionKh: string;
  courseIds: string[];
  targetRoleEn: string;
  targetRoleKh: string;
  estimatedTotalDurationHours: number;
  image?: string;
}

interface CoursesPageProps {
  language: 'en' | 'km';
  darkMode?: boolean;
  onNavigateToCourse: (courseId: string) => void; // Placeholder for navigation
}

// Mock Data
const mockInstructors = {
  sokChea: { name: "Sok Chea", image: "/assets/instructors/sok-chea.png" },
  davidWilson: { name: "David Wilson", image: "/assets/instructors/david-wilson.png" },
  lindaMeas: { name: "Linda Meas", image: "/assets/instructors/linda-meas.png" },
};

const mockCourses: Course[] = [
  {
    id: 'fd001', titleEn: 'Front Desk Operations Excellence', titleKh: 'ឧត្តមភាពប្រតិបត្តិការផ្នែកទទួលភ្ញៀវ',
    descriptionEn: 'Master check-in, check-out, guest communication, and problem-solving skills for front desk roles.',
    descriptionKh: 'ស្ទាត់ជំនាញការចុះឈ្មោះចូល-ចេញ ការប្រាស្រ័យទាក់ទងជាមួយភ្ញៀវ និងជំនាញដោះស្រាយបញ្ហាសម្រាប់តួនាទីផ្នែកទទួលភ្ញៀវ។',
    category: 'Front Desk', difficulty: 2, durationHours: 10,
    instructorName: mockInstructors.sokChea.name, instructorImage: mockInstructors.sokChea.image,
    thumbnailImage: '/assets/courses/front-desk-excellence.jpg',
    modules: [
      { id: 'fdm1', titleEn: 'Welcome & Check-in Procedures', titleKh: 'នីតិវិធីស្វាគមន៍ និងចុះឈ្មោះចូល', lessonsCount: 5, durationMinutes: 120 },
      { id: 'fdm2', titleEn: 'Effective Guest Communication', titleKh: 'ការប្រាស្រ័យទាក់ទងប្រកបដោយប្រសិទ្ធភាពជាមួយភ្ញៀវ', lessonsCount: 6, durationMinutes: 180 },
    ],
    learningOutcomesEn: ['Handle check-ins efficiently', 'Communicate professionally', 'Resolve common guest issues'],
    learningOutcomesKh: ['គ្រប់គ្រងការចុះឈ្មោះចូលប្រកបដោយប្រសិទ្ធភាព', 'ប្រាស្រ័យទាក់ទងប្រកបដោយវិជ្ជាជីវៈ', 'ដោះស្រាយបញ្ហាភ្ញៀវទូទៅ'],
    prerequisitesEn: ['Basic English proficiency'], prerequisitesKh: ['សមត្ថភាពភាសាអង់គ្លេសមូលដ្ឋាន'],
    isEnrolled: true, progress: 65, rating: 4.5, reviewCount: 120
  },
  {
    id: 'fb001', titleEn: 'Mastering Food & Beverage Service', titleKh: 'ស្ទាត់ជំនាញសេវាកម្មម្ហូបអាហារ និងភេសជ្ជៈ',
    descriptionEn: 'Learn essential skills for F&B service, including menu knowledge, order taking, and upselling.',
    descriptionKh: 'រៀនជំនាញសំខាន់ៗសម្រាប់សេវាកម្ម F&B រួមទាំងចំណេះដឹងអំពីម៉ឺនុយ ការទទួលការបញ្ជាទិញ និងការលក់បន្ថែម។',
    category: 'Food & Beverage', difficulty: 2, durationHours: 12,
    instructorName: mockInstructors.lindaMeas.name, instructorImage: mockInstructors.lindaMeas.image,
    thumbnailImage: '/assets/courses/fb-service.jpg',
    modules: [{ id: 'fbm1', titleEn: 'Menu Presentation & Order Taking', titleKh: 'ការបង្ហាញម៉ឺនុយ និងការទទួលការបញ្ជាទិញ', lessonsCount: 7, durationMinutes: 240 }],
    learningOutcomesEn: ['Present menus attractively', 'Take orders accurately', 'Suggest pairings and upsell'],
    learningOutcomesKh: ['បង្ហាញម៉ឺនុយយ៉ាងទាក់ទាញ', 'ទទួលការបញ្ជាទិញបានត្រឹមត្រូវ', 'ណែនាំការផ្គូផ្គង និងលក់បន្ថែម'],
    prerequisitesEn: ['None'], prerequisitesKh: ['គ្មាន'],
    isEnrolled: false, progress: 0, rating: 4.7, reviewCount: 95
  },
  {
    id: 'hk001', titleEn: 'Housekeeping Best Practices', titleKh: 'ឧត្តមានុវត្តន៍ផ្នែកថែទាំបន្ទប់',
    descriptionEn: 'Comprehensive guide to room cleaning, linen management, and maintaining hotel hygiene standards.',
    descriptionKh: 'មគ្គុទ្ទេសក៍គ្រប់ជ្រុងជ្រោយអំពីការសម្អាតបន្ទប់ ការគ្រប់គ្រងក្រណាត់គ្រែ និងការថែរក្សាស្តង់ដារអនាម័យសណ្ឋាគារ។',
    category: 'Housekeeping', difficulty: 1, durationHours: 8,
    instructorName: mockInstructors.davidWilson.name, instructorImage: mockInstructors.davidWilson.image,
    thumbnailImage: '/assets/courses/housekeeping-practices.jpg',
    modules: [{ id: 'hkm1', titleEn: 'Room Cleaning Standards', titleKh: 'ស្តង់ដារសម្អាតបន្ទប់', lessonsCount: 8, durationMinutes: 180 }],
    learningOutcomesEn: ['Follow standard room cleaning procedures', 'Manage linen effectively', 'Ensure guest safety'],
    learningOutcomesKh: ['អនុវត្តតាមនីតិវិធីសម្អាតបន្ទប់ស្តង់ដារ', 'គ្រប់គ្រងក្រណាត់គ្រែប្រកបដោយប្រសិទ្ធភាព', 'ធានាសុវត្ថិភាពភ្ញៀវ'],
    prerequisitesEn: ['None'], prerequisitesKh: ['គ្មាន'],
    isEnrolled: true, progress: 20, rating: 4.2, reviewCount: 70
  },
  {
    id: 'cs001', titleEn: 'Cambodian Hospitality Culture', titleKh: 'វប្បធម៌បដិសណ្ឋារកិច្ចកម្ពុជា',
    descriptionEn: 'Understand key cultural nuances, greetings, and etiquette for providing exceptional service in Cambodia.',
    descriptionKh: 'យល់ដឹងពីភាពខុសប្លែកគ្នានៃវប្បធម៌សំខាន់ៗ ការសំពះ និងសុជីវធម៌សម្រាប់ការផ្តល់សេវាកម្មពិសេសនៅកម្ពុជា។',
    category: 'Cultural Skills', difficulty: 1, durationHours: 6,
    instructorName: mockInstructors.sokChea.name, instructorImage: mockInstructors.sokChea.image,
    thumbnailImage: '/assets/courses/cambodian-culture.jpg',
    modules: [{ id: 'csm1', titleEn: 'The Art of Sampeah', titleKh: 'សិល្បៈនៃការសំពះ', lessonsCount: 4, durationMinutes: 90 }],
    learningOutcomesEn: ['Perform Sampeah correctly', 'Use basic Khmer honorifics', 'Understand guest expectations'],
    learningOutcomesKh: ['អនុវត្តការសំពះបានត្រឹមត្រូវ', 'ប្រើពាក្យគួរសមខ្មែរជាមូលដ្ឋាន', 'យល់ពីការរំពឹងទុករបស់ភ្ញៀវ'],
    prerequisitesEn: ['None'], prerequisitesKh: ['គ្មាន'],
    isEnrolled: false, progress: 0, rating: 4.9, reviewCount: 150
  },
];

const mockLearningPaths: LearningPath[] = [
  {
    id: 'lp001', titleEn: 'Front Desk Professional Path', titleKh: 'មាគ៌ាអ្នកជំនាញផ្នែកទទួលភ្ញៀវ',
    descriptionEn: 'A complete learning journey to become a skilled Front Desk Agent in Cambodia.',
    descriptionKh: 'ដំណើរការសិក្សាពេញលេញដើម្បីក្លាយជាភ្នាក់ងារផ្នែកទទួលភ្ញៀវដ៏ជំនាញនៅកម្ពុជា។',
    courseIds: ['fd001', 'cs001', 'lang001'], // Assuming lang001 is a basic English course
    targetRoleEn: 'Front Desk Agent', targetRoleKh: 'ភ្នាក់ងារផ្នែកទទួលភ្ញៀវ',
    estimatedTotalDurationHours: 20,
    image: '/assets/paths/front-desk-path.jpg'
  },
  {
    id: 'lp002', titleEn: 'F&B Service Excellence Path', titleKh: 'មាគ៌ាឧត្តមភាពសេវាកម្ម F&B',
    descriptionEn: 'Develop the skills needed to excel in food and beverage service roles.',
    descriptionKh: 'អភិវឌ្ឍជំនាញដែលត្រូវការដើម្បីពូកែក្នុងតួនាទីសេវាកម្មម្ហូបអាហារ និងភេសជ្ជៈ។',
    courseIds: ['fb001', 'cs001'],
    targetRoleEn: 'Restaurant Waitstaff / Supervisor', targetRoleKh: 'បុគ្គលិកភោជនីយដ្ឋាន / អ្នកគ្រប់គ្រង',
    estimatedTotalDurationHours: 18,
    image: '/assets/paths/fb-path.jpg'
  },
];

const CourseCard: React.FC<{ course: Course; language: 'en' | 'km'; darkMode?: boolean; onSelectCourse: (courseId: string) => void; onEnroll: (courseId: string) => void; }> = 
  ({ course, language, darkMode, onSelectCourse, onEnroll }) => {
  
  const difficultyText = (level: number) => {
    if (language === 'km') {
      return level === 1 ? 'ងាយស្រួល' : level === 2 ? 'មធ្យម' : 'កម្រិតខ្ពស់';
    }
    return level === 1 ? 'Beginner' : level === 2 ? 'Intermediate' : 'Advanced';
  };

  const difficultyColor = (level: number) => {
    return level === 1 ? 'bg-success/20 text-success' : level === 2 ? 'bg-accent-blue/20 text-accent-blue' : 'bg-accent-coral/20 text-accent-coral';
  };

  return (
    <motion.div 
      className={`rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-2xl flex flex-col ${darkMode ? 'bg-navy-light border border-navy' : 'bg-white'}`}
      whileHover={{ y: -5 }}
    >
      <div className="relative">
        <img src={course.thumbnailImage || '/assets/courses/default-thumb.jpg'} alt={language === 'en' ? course.titleEn : course.titleKh} className="w-full h-48 object-cover" />
        <div className={`absolute top-2 right-2 px-2 py-1 text-xs font-semibold rounded-full ${difficultyColor(course.difficulty)}`}>
          {difficultyText(course.difficulty)}
        </div>
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-bold mb-1 h-14 overflow-hidden"> {/* Fixed height for title */}
          {language === 'en' ? course.titleEn : course.titleKh}
        </h3>
        <p className={`text-xs opacity-70 mb-2 ${language === 'km' ? 'khmer' : ''}`}>
          <Users size={12} className="inline mr-1" /> {course.instructorName}
          <span className="mx-1">|</span>
          <Clock size={12} className="inline mr-1" /> {course.durationHours} {language === 'en' ? 'hrs' : 'ម៉ោង'}
        </p>
        <p className={`text-sm mb-3 flex-grow h-20 overflow-hidden ${language === 'km' ? 'khmer' : ''}`}> {/* Fixed height for description */}
          {language === 'en' ? course.descriptionEn.substring(0,100)+'...' : course.descriptionKh.substring(0,100)+'...'}
        </p>
        {course.isEnrolled && course.progress !== undefined && (
          <div className="mb-3">
            <div className="flex justify-between text-xs opacity-80 mb-0.5">
              <span>{language === 'en' ? 'Progress' : 'វឌ្ឍនភាព'}</span>
              <span>{course.progress}%</span>
            </div>
            <div className={`w-full h-1.5 rounded-full ${darkMode ? 'bg-navy' : 'bg-gray-200'}`}>
              <div className="h-full bg-primary rounded-full" style={{width: `${course.progress}%`}}></div>
            </div>
          </div>
        )}
        <div className="mt-auto flex space-x-2">
          <button 
            onClick={() => onSelectCourse(course.id)}
            className={`flex-1 btn text-sm ${darkMode ? 'bg-navy hover:bg-navy/70' : 'bg-gray-100 hover:bg-gray-200'} `}
          >
            {language === 'en' ? 'View Details' : 'មើលលម្អិត'}
          </button>
          <button 
            onClick={() => onEnroll(course.id)}
            className={`flex-1 btn btn-primary text-sm`}
            disabled={course.isEnrolled}
          >
            {course.isEnrolled ? (language === 'en' ? 'Enrolled' : 'បានចុះឈ្មោះ') : (language === 'en' ? 'Enroll Now' : 'ចុះឈ្មោះឥឡូវនេះ')}
          </button>
        </div>
      </div>
    </motion.div>
  );
};


const CoursesPage: React.FC<CoursesPageProps> = ({ language, darkMode, onNavigateToCourse }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: 'All',
    difficulty: 'All', // 1, 2, 3, or All
    duration: 'All' // <5, 5-10, >10, or All
  });
  const [allCourses, setAllCourses] = useState<Course[]>(mockCourses); // To manage enrollment state
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  const categories = ['All', 'Front Desk', 'Food & Beverage', 'Housekeeping', 'Cultural Skills', 'Management', 'Language'];
  const difficulties = [
    { value: 'All', labelEn: 'All Difficulties', labelKh: 'គ្រប់កម្រិត' },
    { value: '1', labelEn: 'Beginner', labelKh: 'ដំបូង' },
    { value: '2', labelEn: 'Intermediate', labelKh: 'មធ្យម' },
    { value: '3', labelEn: 'Advanced', labelKh: 'កម្រិតខ្ពស់' },
  ];
  const durations = [
    { value: 'All', labelEn: 'All Durations', labelKh: 'គ្រប់រយៈពេល' },
    { value: '<5', labelEn: '< 5 hours', labelKh: '< ៥ ម៉ោង' },
    { value: '5-10', labelEn: '5-10 hours', labelKh: '៥-១០ ម៉ោង' },
    { value: '>10', labelEn: '> 10 hours', labelKh: '> ១០ ម៉ោង' },
  ];

  const handleFilterChange = (filterName: string, value: string) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };

  const handleEnroll = (courseId: string) => {
    setAllCourses(prevCourses => prevCourses.map(c => 
      c.id === courseId ? { ...c, isEnrolled: true, progress: c.progress || 5 } : c // Start with 5% progress
    ));
    // In a real app, this would be an API call
    console.log(`Enrolled in course: ${courseId}`);
  };

  const handleSelectCourse = (courseId: string) => {
    const course = allCourses.find(c => c.id === courseId);
    setSelectedCourse(course || null);
  };

  const filteredCourses = useMemo(() => {
    return allCourses.filter(course => {
      const titleMatch = language === 'en' 
        ? course.titleEn.toLowerCase().includes(searchTerm.toLowerCase())
        : course.titleKh.toLowerCase().includes(searchTerm.toLowerCase());
      const categoryMatch = filters.category === 'All' || course.category === filters.category;
      const difficultyMatch = filters.difficulty === 'All' || course.difficulty.toString() === filters.difficulty;
      const durationMatch = filters.duration === 'All' || 
        (filters.duration === '<5' && course.durationHours < 5) ||
        (filters.duration === '5-10' && course.durationHours >= 5 && course.durationHours <= 10) ||
        (filters.duration === '>10' && course.durationHours > 10);
      
      return titleMatch && categoryMatch && difficultyMatch && durationMatch;
    });
  }, [allCourses, searchTerm, filters, language]);

  const CourseDetailModal: React.FC<{course: Course, onClose: () => void}> = ({course, onClose}) => {
    if (!course) return null;
    return (
      <AnimatePresence>
      <motion.div 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
        onClick={onClose}
      >
        <motion.div 
          className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-luxury rounded-xl p-6 shadow-2xl ${darkMode ? 'bg-navy-dark border border-navy' : 'bg-white'}`}
          initial={{scale:0.9, opacity:0}} animate={{scale:1, opacity:1}} exit={{scale:0.9, opacity:0}}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold">{language === 'en' ? course.titleEn : course.titleKh}</h2>
              <p className="text-sm opacity-70">{language === 'en' ? course.category : course.category} - {course.durationHours} {language === 'en' ? 'hrs' : 'ម៉ោង'}</p>
            </div>
            <button onClick={onClose} className={`p-2 rounded-full ${darkMode ? 'hover:bg-navy-light' : 'hover:bg-gray-200'}`}><XCircle size={24}/></button>
          </div>

          <img src={course.thumbnailImage} alt={course.titleEn} className="w-full h-64 object-cover rounded-lg mb-4"/>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
            <div><Users size={16} className="inline mr-2 opacity-70"/><strong>{language === 'en' ? 'Instructor:' : 'គ្រូ​បង្រៀន:'}</strong> {course.instructorName}</div>
            <div><BarChartHorizontalBig size={16} className="inline mr-2 opacity-70"/><strong>{language === 'en' ? 'Difficulty:' : 'កម្រិត:'}</strong> {filters.difficulty === '1' ? (language === 'en' ? 'Beginner':'ដំបូង') : filters.difficulty === '2' ? (language === 'en' ? 'Intermediate':'មធ្យម') : (language === 'en' ? 'Advanced':'កម្រិតខ្ពស់')}</div>
            {course.rating && <div><Star size={16} className="inline mr-2 text-yellow-400 fill-yellow-400"/><strong>{language === 'en' ? 'Rating:' : 'ការវាយតម្លៃ:'}</strong> {course.rating}/5 ({course.reviewCount} {language === 'en' ? 'reviews' : 'ការពិនិត្យឡើងវិញ'})</div>}
          </div>

          <h4 className="font-semibold mt-4 mb-2">{language === 'en' ? 'Description' : 'ការពិពណ៌នា'}</h4>
          <p className="text-sm opacity-90 mb-4">{language === 'en' ? course.descriptionEn : course.descriptionKh}</p>

          <h4 className="font-semibold mt-4 mb-2">{language === 'en' ? 'What you\'ll learn' : 'អ្វីដែលអ្នកនឹងរៀន'}</h4>
          <ul className="list-disc list-inside text-sm opacity-90 mb-4 space-y-1">
            {(language === 'en' ? course.learningOutcomesEn : course.learningOutcomesKh).map((item, i) => <li key={i}>{item}</li>)}
          </ul>

          <h4 className="font-semibold mt-4 mb-2">{language === 'en' ? 'Course Content' : 'មាតិកាវគ្គសិក្សា'}</h4>
          <div className="space-y-2 mb-4">
            {course.modules.map(module => (
              <div key={module.id} className={`p-3 rounded-md text-sm ${darkMode ? 'bg-navy' : 'bg-gray-100'}`}>
                <p className="font-medium">{language === 'en' ? module.titleEn : module.titleKh}</p>
                <p className="text-xs opacity-70">{module.lessonsCount} {language === 'en' ? 'lessons' : 'មេរៀន'} • {Math.floor(module.durationMinutes/60)}h {module.durationMinutes%60}m</p>
              </div>
            ))}
          </div>
          
          <h4 className="font-semibold mt-4 mb-2">{language === 'en' ? 'Prerequisites' : 'លក្ខខណ្ឌតម្រូវ'}</h4>
          <ul className="list-disc list-inside text-sm opacity-90 mb-6 space-y-1">
            {(language === 'en' ? course.prerequisitesEn : course.prerequisitesKh).map((item, i) => <li key={i}>{item}</li>)}
          </ul>

          <button 
            onClick={() => { handleEnroll(course.id); onClose(); }} 
            className="w-full btn btn-primary text-base"
            disabled={course.isEnrolled}
          >
            {course.isEnrolled ? (language === 'en' ? 'Already Enrolled - Go to Course' : 'បានចុះឈ្មោះរួចហើយ - ទៅកាន់វគ្គសិក្សា') : (language === 'en' ? 'Enroll in this Course' : 'ចុះឈ្មោះក្នុងវគ្គសិក្សានេះ')}
          </button>
        </motion.div>
      </motion.div>
      </AnimatePresence>
    );
  }


  return (
    <div className={`p-4 md:p-6 h-full flex flex-col ${darkMode ? 'bg-navy text-white-pure' : 'bg-gray-50 text-navy-dark'}`}>
      <h1 className="text-2xl md:text-3xl font-bold mb-6">{language === 'en' ? 'Our Courses' : 'វគ្គសិក្សារបស់យើង'}</h1>
      
      {/* Filters and Search */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
        <div className="relative">
          <input 
            type="text"
            placeholder={language === 'en' ? 'Search courses...' : 'ស្វែងរកវគ្គសិក្សា...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full p-3 pl-10 border rounded-lg text-sm ${darkMode ? 'bg-navy-light border-navy placeholder-gray-400' : 'bg-white border-gray-300 placeholder-gray-500'} focus:ring-2 focus:ring-primary outline-none`}
          />
          <Search size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
        </div>
        
        <div>
          <label htmlFor="categoryFilter" className="block text-xs font-medium opacity-80 mb-1">{language === 'en' ? 'Category' : 'ប្រភេទ'}</label>
          <select id="categoryFilter" value={filters.category} onChange={(e) => handleFilterChange('category', e.target.value)}
            className={`w-full p-3 border rounded-lg text-sm ${darkMode ? 'bg-navy-light border-navy' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-primary outline-none appearance-none`}
          >
            {categories.map(cat => <option key={cat} value={cat}>{language === 'en' || cat === 'All' ? cat : (cat === 'Front Desk' ? 'ផ្នែកទទួលភ្ញៀវ' : cat === 'Food & Beverage' ? 'ម្ហូបអាហារ និងភេសជ្ជៈ' : cat === 'Housekeeping' ? 'ថែទាំបន្ទប់' : cat === 'Cultural Skills' ? 'ជំនាញវប្បធម៌' : cat === 'Management' ? 'ការគ្រប់គ្រង' : 'ភាសា')}</option>)}
          </select>
        </div>

        <div>
          <label htmlFor="difficultyFilter" className="block text-xs font-medium opacity-80 mb-1">{language === 'en' ? 'Difficulty' : 'កម្រិត'}</label>
          <select id="difficultyFilter" value={filters.difficulty} onChange={(e) => handleFilterChange('difficulty', e.target.value)}
            className={`w-full p-3 border rounded-lg text-sm ${darkMode ? 'bg-navy-light border-navy' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-primary outline-none appearance-none`}
          >
            {difficulties.map(opt => <option key={opt.value} value={opt.value}>{language === 'en' ? opt.labelEn : opt.labelKh}</option>)}
          </select>
        </div>
        
        <div>
          <label htmlFor="durationFilter" className="block text-xs font-medium opacity-80 mb-1">{language === 'en' ? 'Duration' : 'រយៈពេល'}</label>
          <select id="durationFilter" value={filters.duration} onChange={(e) => handleFilterChange('duration', e.target.value)}
            className={`w-full p-3 border rounded-lg text-sm ${darkMode ? 'bg-navy-light border-navy' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-primary outline-none appearance-none`}
          >
            {durations.map(opt => <option key={opt.value} value={opt.value}>{language === 'en' ? opt.labelEn : opt.labelKh}</option>)}
          </select>
        </div>
      </div>

      {/* Learning Paths Section (Simplified) */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-3">{language === 'en' ? 'Featured Learning Paths' : 'មាគ៌ាសិក្សាពិសេស'}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mockLearningPaths.slice(0,2).map(path => (
            <motion.div 
              key={path.id}
              className={`p-4 rounded-lg shadow-md flex items-center space-x-4 cursor-pointer ${darkMode ? 'bg-navy-light hover:bg-navy' : 'bg-white hover:bg-gray-50'}`}
              whileHover={{scale:1.02}}
            >
              <img src={path.image || '/assets/paths/default-path.jpg'} alt={path.titleEn} className="w-20 h-20 object-cover rounded-md" />
              <div>
                <h4 className="font-bold">{language === 'en' ? path.titleEn : path.titleKh}</h4>
                <p className="text-xs opacity-80">{language === 'en' ? path.targetRoleEn : path.targetRoleKh}</p>
                <p className="text-xs opacity-70 mt-1">{path.estimatedTotalDurationHours} {language === 'en' ? 'hrs' : 'ម៉ោង'} • {path.courseIds.length} {language === 'en' ? 'courses' : 'វគ្គសិក្សា'}</p>
              </div>
              <ArrowRight size={20} className="ml-auto opacity-50"/>
            </motion.div>
          ))}
        </div>
      </div>
      
      {/* Course Grid */}
      <div className="flex-grow overflow-y-auto scrollbar-luxury -mx-2">
        {filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-2">
            {filteredCourses.map(course => (
              <CourseCard key={course.id} course={course} language={language} darkMode={darkMode} onSelectCourse={handleSelectCourse} onEnroll={handleEnroll} />
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <Layers size={48} className="mx-auto opacity-30 mb-2" />
            <p className="opacity-70">{language === 'en' ? 'No courses match your criteria.' : 'មិនមានវគ្គសិក្សាត្រូវនឹងលក្ខខណ្ឌរបស់អ្នកទេ។'}</p>
          </div>
        )}
      </div>
      {selectedCourse && <CourseDetailModal course={selectedCourse} onClose={() => setSelectedCourse(null)} />}
    </div>
  );
};

export default CoursesPage;
