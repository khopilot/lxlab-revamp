import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Clock, ListChecks, Award, Brain, Users, MessageSquare, Edit, BarChart3, ChevronRight, ChevronLeft, RotateCcw, Lightbulb, FileText, Star, Search } from 'lucide-react';

// --- Types ---
type AssessmentType = 'Quiz' | 'Simulation' | 'Role-Playing' | 'Certification Exam';
type QuestionType = 'multiple-choice' | 'true-false' | 'scenario-based' | 'drag-drop-sequence';

interface AnswerOption {
  id: string;
  textEn: string;
  textKh: string;
  isCorrect?: boolean; // For multiple-choice, true-false
}

interface Question {
  id: string;
  type: QuestionType;
  textEn: string;
  textKh: string;
  options?: AnswerOption[]; // For MCQ, T/F
  correctAnswer?: string | string[] | boolean; // Option ID(s) or boolean for T/F
  scenarioContextEn?: string; // For scenario-based
  scenarioContextKh?: string;
  explanationEn?: string; // Feedback for correct/incorrect
  explanationKh?: string;
  points: number;
  difficulty?: 1 | 2 | 3; // For adaptive learning
}

interface Assessment {
  id: string;
  titleEn: string;
  titleKh: string;
  descriptionEn: string;
  descriptionKh: string;
  type: AssessmentType;
  category: 'Front Desk' | 'Food & Beverage' | 'Housekeeping' | 'Cultural Skills' | 'Language Proficiency' | 'General Hospitality';
  difficulty: 1 | 2 | 3; // 1: Easy, 2: Medium, 3: Hard
  durationMinutes: number;
  questions: Question[];
  passMarkPercent: number; // e.g., 70 for 70%
  isPracticeModeAvailable?: boolean;
  certificationId?: string; // If it's part of a certification
  prerequisites?: string[]; // IDs of other assessments or courses
}

interface UserAnswer {
  questionId: string;
  answer: string | string[] | boolean | null; // User's selected answer(s)
  isCorrect?: boolean;
  score?: number;
}

interface AssessmentAttempt {
  assessmentId: string;
  userId: string; // Placeholder
  startTime: Date;
  endTime?: Date;
  answers: UserAnswer[];
  scorePercent?: number;
  passed?: boolean;
  isPractice: boolean;
}

interface AssessmentsPageProps {
  language: 'en' | 'km';
  darkMode?: boolean;
}

// --- Mock Data ---
const mockQuestions: Question[] = [
  // Front Desk Quiz
  { id: 'q1_fd', type: 'multiple-choice', textEn: 'What is the standard greeting when a guest approaches the front desk?', textKh: 'តើអ្វីជាការសំពះស្វាគមន៍ស្ដង់ដារនៅពេលភ្ញៀវដើរមកកាន់ផ្នែកទទួលភ្ញៀវ?', points: 10, difficulty: 1,
    options: [
      { id: 'a', textEn: '"Hey, what do you want?"', textKh: '"សួស្ដី តើអ្នកចង់បានអ្វី?"' },
      { id: 'b', textEn: '"Good morning/afternoon/evening, welcome to [Hotel Name]. How may I assist you?"', textKh: '"អរុណសួស្ដី/ទិវាសួស្ដី/សាយណ្ហសួស្ដី សូមស្វាគមន៍មកកាន់ [ឈ្មោះសណ្ឋាគារ]។ តើខ្ញុំអាចជួយអ្វីបានដែរ?"', isCorrect: true },
      { id: 'c', textEn: '"Yes?"', textKh: '"បាទ/ចាស?"' },
      { id: 'd', textEn: 'Ignore the guest until they speak first.', textKh: 'មិនអើពើភ្ញៀវរហូតដល់ពួកគេនិយាយមុន។' }
    ], correctAnswer: 'b', explanationEn: 'A polite and professional greeting is crucial for a positive first impression.', explanationKh: 'ការសំពះស្វាគមន៍ប្រកបដោយសុជីវធម៌និងវិជ្ជាជីវៈគឺសំខាន់ណាស់សម្រាប់ចំណាប់អារម្មណ៍ដំបូងដ៏ល្អ។'
  },
  { id: 'q2_fd', type: 'true-false', textEn: 'It is acceptable to discuss a guest\'s personal information with other colleagues not involved in their service.', textKh: 'វាអាចទទួលយកបានក្នុងការពិភាក្សាព័ត៌មានផ្ទាល់ខ្លួនរបស់ភ្ញៀវជាមួយសហការីផ្សេងទៀតដែលមិនពាក់ព័ន្ធនឹងសេវាកម្មរបស់ពួកគេ។', points: 5, difficulty: 2,
    correctAnswer: false, explanationEn: 'Guest privacy is paramount. Personal information should only be shared on a need-to-know basis.', explanationKh: 'ឯកជនភាពរបស់ភ្ញៀវគឺសំខាន់បំផុត។ ព័ត៌មានផ្ទាល់ខ្លួនគួរតែត្រូវបានចែករំលែកតែលើមូលដ្ឋានចាំបាច់ប៉ុណ្ណោះ។'
  },
  { id: 'q3_fd', type: 'scenario-based', textEn: 'A guest reports that their room key is not working. What is the BEST first step?', textKh: 'ភ្ញៀវម្នាក់រាយការណ៍ថាកូនសោបន្ទប់របស់ពួកគេមិនដំណើរការ។ តើអ្វីជាជំហានដំបូងដ៏ល្អបំផុត?', points: 15, difficulty: 2,
    scenarioContextEn: 'The guest seems slightly annoyed and is holding two key cards.', scenarioContextKh: 'ភ្ញៀវហាក់ដូចជារាងមួម៉ៅបន្តិច ហើយកំពុងកាន់កាតកូនសោពីរ។',
    options: [
      { id: 'a', textEn: 'Tell them to try again more carefully.', textKh: 'ប្រាប់ពួកគេឱ្យព្យាយាមម្ដងទៀតដោយប្រុងប្រយ័ត្នជាងមុន។' },
      { id: 'b', textEn: 'Apologize, verify their identity discreetly, and issue new, tested keys.', textKh: 'សុំទោស ផ្ទៀងផ្ទាត់អត្តសញ្ញាណរបស់ពួកគេដោយសម្ងាត់ ហើយចេញកូនសោថ្មីដែលបានសាកល្បងរួច។', isCorrect: true },
      { id: 'c', textEn: 'Ask them if they demagnetized it near their phone.', textKh: 'សួរពួកគេថាតើពួកគេបានធ្វើឱ្យវាខូចមេដែកនៅជិតទូរស័ព្ទរបស់ពួកគេដែរឬទេ។' },
      { id: 'd', textEn: 'Send them to security to get it fixed.', textKh: 'បញ្ជូនពួកគេទៅផ្នែកសន្តិសុខដើម្បីឱ្យគេជួសជុល។' }
    ], correctAnswer: 'b', explanationEn: 'Empathy, identity verification, and providing a working solution promptly are key.', explanationKh: 'ការយល់ចិត្ត ការផ្ទៀងផ្ទាត់អត្តសញ្ញាណ និងការផ្តល់ដំណោះស្រាយដែលដំណើរការបានយ៉ាងឆាប់រហ័សគឺជាគន្លឹះ។'
  },
  // F&B Quiz
  { id: 'q1_fb', type: 'multiple-choice', textEn: 'When serving wine, from which side of the guest should you typically pour?', textKh: 'នៅពេលបម្រើស្រា តើអ្នកគួរចាក់ពីខាងណាជាធម្មតា?', points: 10, difficulty: 2,
    options: [
      { id: 'a', textEn: 'Guest\'s left', textKh: 'ខាងឆ្វេងភ្ញៀវ' },
      { id: 'b', textEn: 'Guest\'s right', textKh: 'ខាងស្ដាំភ្ញៀវ', isCorrect: true },
      { id: 'c', textEn: 'Whichever is more convenient', textKh: 'ខាងណាដែលងាយស្រួលជាង' },
      { id: 'd', textEn: 'Directly in front of the guest', textKh: 'ចំពីមុខភ្ញៀវ' }
    ], correctAnswer: 'b', explanationEn: 'Traditionally, beverages are served from the guest\'s right.', explanationKh: 'តាមប្រពៃណី ភេសជ្ជៈត្រូវបានបម្រើពីខាងស្ដាំរបស់ភ្ញៀវ។'
  },
  // Cultural Skills Quiz
  { id: 'q1_cs', type: 'true-false', textEn: 'When performing a "Sampeah" greeting in Cambodia, the higher the hands are held, the greater the respect shown.', textKh: 'នៅពេលធ្វើការសំពះស្វាគមន៍នៅកម្ពុជា កាលណាដាក់ដៃកាន់តែខ្ពស់ ការគោរពក៏កាន់តែខ្លាំង។', points: 10, difficulty: 1,
    correctAnswer: true, explanationEn: 'The level of the Sampeah indicates the level of respect for the person being greeted.', explanationKh: 'កម្រិតនៃការសំពះបង្ហាញពីកម្រិតនៃការគោរពចំពោះអ្នកដែលត្រូវបានសំពះ។'
  },
];

const mockAssessments: Assessment[] = [
  { id: 'asm_fd_quiz_01', titleEn: 'Front Desk Basics Quiz', titleKh: 'កម្រងសំណួរមូលដ្ឋានគ្រឹះផ្នែកទទួលភ្ញៀវ', type: 'Quiz', category: 'Front Desk', difficulty: 1, durationMinutes: 20, questions: mockQuestions.filter(q => q.id.startsWith('q1_fd') || q.id.startsWith('q2_fd')), passMarkPercent: 70, isPracticeModeAvailable: true, descriptionEn: 'Test your knowledge on essential front desk procedures and guest interactions.', descriptionKh: 'សាកល្បងចំណេះដឹងរបស់អ្នកលើនីតិវិធីសំខាន់ៗរបស់ផ្នែកទទួលភ្ញៀវ និងអន្តរកម្មជាមួយភ្ញៀវ។' },
  { id: 'asm_fd_sim_01', titleEn: 'Check-in Simulation Challenge', titleKh: 'ការប្រកួតក្លែងធ្វើការចុះឈ្មោះចូល', type: 'Simulation', category: 'Front Desk', difficulty: 2, durationMinutes: 30, questions: [mockQuestions.find(q=>q.id === 'q3_fd')!], passMarkPercent: 80, descriptionEn: 'Handle a realistic guest check-in scenario with multiple interactions.', descriptionKh: 'ដោះស្រាយសេណារីយ៉ូការចុះឈ្មោះចូលរបស់ភ្ញៀវជាក់ស្តែងជាមួយនឹងអន្តរកម្មច្រើន។' },
  { id: 'asm_fb_quiz_01', titleEn: 'F&B Service Fundamentals', titleKh: 'មូលដ្ឋានគ្រឹះសេវាកម្ម F&B', type: 'Quiz', category: 'Food & Beverage', difficulty: 2, durationMinutes: 25, questions: [mockQuestions.find(q=>q.id === 'q1_fb')!], passMarkPercent: 75, descriptionEn: 'Assess your understanding of core food and beverage service principles.', descriptionKh: 'វាយតម្លៃការយល់ដឹងរបស់អ្នកអំពីគោលការណ៍ស្នូលនៃសេវាកម្មម្ហូបអាហារ និងភេសជ្ជៈ។' },
  { id: 'asm_cs_exam_cert01', titleEn: 'Cambodian Cultural Expert Exam', titleKh: 'ការប្រឡងអ្នកជំនាញវប្បធម៌កម្ពុជា', type: 'Certification Exam', category: 'Cultural Skills', difficulty: 3, durationMinutes: 60, questions: [mockQuestions.find(q=>q.id === 'q1_cs')!], passMarkPercent: 85, certificationId: 'CERT_CS_01', descriptionEn: 'Final exam for the Cambodian Cultural Hospitality certification.', descriptionKh: 'ការប្រឡងចុងក្រោយសម្រាប់វិញ្ញាបនបត្របដិសណ្ឋារកិច្ចវប្បធម៌កម្ពុជា។' },
];

// --- Main Component ---
const AssessmentsPage: React.FC<AssessmentsPageProps> = ({ language, darkMode = false }) => {
  const [view, setView] = useState<'list' | 'taking' | 'results'>('list');
  const [currentAssessment, setCurrentAssessment] = useState<Assessment | null>(null);
  const [currentAttempt, setCurrentAttempt] = useState<AssessmentAttempt | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [timeLeft, setTimeLeft] = useState(0); // in seconds
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ category: 'All', type: 'All', difficulty: 'All' });

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (view === 'taking' && currentAssessment && timeLeft > 0) {
      timerRef.current = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && view === 'taking') {
      handleSubmitAssessment(); // Auto-submit if time runs out
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [view, currentAssessment, timeLeft]);

  const startAssessment = (assessment: Assessment, isPractice: boolean = false) => {
    setCurrentAssessment(assessment);
    setUserAnswers(assessment.questions.map(q => ({ questionId: q.id, answer: null })));
    setCurrentQuestionIndex(0);
    setTimeLeft(assessment.durationMinutes * 60);
    setCurrentAttempt({
      assessmentId: assessment.id,
      userId: 'user123', // Placeholder
      startTime: new Date(),
      answers: [],
      isPractice,
    });
    setView('taking');
  };

  const handleAnswerSelect = (questionId: string, answer: string | string[] | boolean) => {
    setUserAnswers(prev => prev.map(ua => ua.questionId === questionId ? { ...ua, answer } : ua));
  };

  const navigateQuestion = (direction: 'next' | 'prev') => {
    if (direction === 'next' && currentAssessment && currentQuestionIndex < currentAssessment.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else if (direction === 'prev' && currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmitAssessment = () => {
    if (!currentAssessment || !currentAttempt) return;

    let score = 0;
    const processedAnswers: UserAnswer[] = currentAssessment.questions.map((q, idx) => {
      const userAnswer = userAnswers.find(ua => ua.questionId === q.id);
      let isCorrect = false;
      let questionScore = 0;

      if (userAnswer && userAnswer.answer !== null) {
        if (q.type === 'multiple-choice' || q.type === 'scenario-based') {
          isCorrect = userAnswer.answer === q.correctAnswer;
        } else if (q.type === 'true-false') {
          isCorrect = userAnswer.answer === q.correctAnswer;
        }
        // Add other question type scoring here
      }
      if (isCorrect) {
        questionScore = q.points;
        score += q.points;
      }
      return { ...userAnswer!, isCorrect, score: questionScore };
    });
    
    const totalPossibleScore = currentAssessment.questions.reduce((sum, q) => sum + q.points, 0);
    const scorePercent = totalPossibleScore > 0 ? Math.round((score / totalPossibleScore) * 100) : 0;

    setCurrentAttempt(prev => prev ? ({
      ...prev,
      endTime: new Date(),
      answers: processedAnswers,
      scorePercent,
      passed: scorePercent >= currentAssessment.passMarkPercent,
    }) : null);
    setView('results');
    if (timerRef.current) clearTimeout(timerRef.current);
  };
  
  const cardAnimation = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 }
  };

  const filteredAssessments = useMemo(() => {
    return mockAssessments.filter(asm => {
      const titleMatch = (language === 'en' ? asm.titleEn : asm.titleKh).toLowerCase().includes(searchTerm.toLowerCase());
      const categoryMatch = filters.category === 'All' || asm.category === filters.category;
      const typeMatch = filters.type === 'All' || asm.type === filters.type;
      const difficultyMatch = filters.difficulty === 'All' || asm.difficulty.toString() === filters.difficulty;
      return titleMatch && categoryMatch && typeMatch && difficultyMatch;
    });
  }, [searchTerm, filters, language]);

  const assessmentCategories = ['All', ...Array.from(new Set(mockAssessments.map(a => a.category)))];
  const assessmentTypes = ['All', ...Array.from(new Set(mockAssessments.map(a => a.type)))];
  const assessmentDifficulties = [
    { value: 'All', labelEn: 'All Difficulties', labelKh: 'គ្រប់កម្រិត' },
    { value: '1', labelEn: 'Easy', labelKh: 'ងាយ' },
    { value: '2', labelEn: 'Medium', labelKh: 'មធ្យម' },
    { value: '3', labelEn: 'Hard', labelKh: 'ពិបាក' },
  ];

  // --- Sub-Components ---
  const AssessmentCard: React.FC<{ assessment: Assessment }> = ({ assessment }) => {
    const Icon = assessment.type === 'Quiz' ? ListChecks : 
                 assessment.type === 'Simulation' ? Brain :
                 assessment.type === 'Role-Playing' ? Users : Award;
    return (
      <motion.div 
        {...cardAnimation}
        className={`p-4 rounded-xl shadow-lg flex flex-col justify-between ${darkMode ? 'bg-navy-light hover:border-primary' : 'bg-white hover:border-primary'} border-2 border-transparent transition-all`}
      >
        <div>
          <div className="flex items-center mb-2">
            <Icon size={24} className={`mr-2 ${darkMode ? 'text-primary-light' : 'text-primary'}`} />
            <h3 className="text-md font-bold leading-tight">{language === 'en' ? assessment.titleEn : assessment.titleKh}</h3>
          </div>
          <p className="text-xs opacity-70 mb-1">{language === 'en' ? assessment.type : assessment.type} - {language === 'en' ? assessment.category : assessment.category}</p>
          <p className={`text-xs mb-3 h-10 overflow-hidden ${language === 'km' ? 'khmer' : ''}`}>{language === 'en' ? assessment.descriptionEn.substring(0,80)+'...' : assessment.descriptionKh.substring(0,80)+'...'}</p>
          <div className="flex justify-between items-center text-xs opacity-80 mb-3">
            <span><Clock size={12} className="inline mr-1"/>{assessment.durationMinutes} {language === 'en' ? 'min' : 'នាទី'}</span>
            <span>{assessment.questions.length} {language === 'en' ? 'Qs' : 'សំណួរ'}</span>
            <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${
                assessment.difficulty === 1 ? 'bg-success/20 text-success' :
                assessment.difficulty === 2 ? 'bg-accent-blue/20 text-accent-blue' :
                'bg-accent-coral/20 text-accent-coral'
            }`}>
                {assessmentDifficulties.find(d => d.value === assessment.difficulty.toString())?.[language === 'en' ? 'labelEn' : 'labelKh']}
            </span>
          </div>
        </div>
        <div className="flex space-x-2 mt-auto">
          {assessment.isPracticeModeAvailable && (
            <button 
              onClick={() => startAssessment(assessment, true)}
              className={`flex-1 btn text-xs ${darkMode ? 'bg-navy hover:bg-navy/80' : 'bg-gray-200 hover:bg-gray-300'}`}
            >
              <Edit size={14} className="mr-1"/>{language === 'en' ? 'Practice' : 'អនុវត្ត'}
            </button>
          )}
          <button 
            onClick={() => startAssessment(assessment, false)}
            className="flex-1 btn btn-primary text-xs"
          >
            {language === 'en' ? 'Start Assessment' : 'ចាប់ផ្តើមវាយតម្លៃ'}
          </button>
        </div>
      </motion.div>
    );
  };

  const AssessmentTakingUI: React.FC = () => {
    if (!currentAssessment || !currentAttempt) return null;
    const question = currentAssessment.questions[currentQuestionIndex];
    const currentAnswerObj = userAnswers.find(ua => ua.questionId === question.id);

    return (
      <div className={`p-4 md:p-6 h-full flex flex-col ${darkMode ? 'bg-navy' : 'bg-gray-100'}`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{language === 'en' ? currentAssessment.titleEn : currentAssessment.titleKh} {currentAttempt.isPractice ? `(${language === 'en' ? 'Practice' : 'អនុវត្ត'})` : ''}</h2>
          <div className="flex items-center space-x-2 text-sm">
            <Clock size={16} className="opacity-70"/> 
            <span>{Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}</span>
            <span className="opacity-70">| Q {currentQuestionIndex + 1}/{currentAssessment.questions.length}</span>
          </div>
        </div>

        {/* Question Area */}
        <div className={`flex-grow p-4 rounded-lg shadow mb-4 overflow-y-auto scrollbar-luxury ${darkMode ? 'bg-navy-light' : 'bg-white'}`}>
          <p className="text-sm font-semibold mb-1">{language === 'en' ? `Question ${currentQuestionIndex + 1}` : `សំណួរទី ${currentQuestionIndex + 1}`}: ({question.points} {language === 'en' ? 'pts' : 'ពិន្ទុ'})</p>
          <p className={`mb-3 ${language === 'km' ? 'khmer text-lg' : 'text-md'}`}>{language === 'en' ? question.textEn : question.textKh}</p>
          {question.scenarioContextEn && (
            <div className={`p-3 rounded-md text-sm mb-3 ${darkMode ? 'bg-navy' : 'bg-gray-50'} border ${darkMode ? 'border-navy-dark' : 'border-gray-200'}`}>
              <p className="font-medium mb-1">{language === 'en' ? 'Scenario:' : 'សេណារីយ៉ូ៖'}</p>
              <p className={`${language === 'km' ? 'khmer' : ''}`}>{language === 'en' ? question.scenarioContextEn : question.scenarioContextKh}</p>
            </div>
          )}

          {/* Answer Options */}
          <div className="space-y-2">
            {question.type === 'multiple-choice' && question.options?.map(opt => (
              <button 
                key={opt.id}
                onClick={() => handleAnswerSelect(question.id, opt.id)}
                className={`w-full text-left p-3 rounded-md border-2 transition-colors text-sm
                  ${currentAnswerObj?.answer === opt.id 
                    ? `border-primary ${darkMode ? 'bg-primary/20' : 'bg-primary/10'}` 
                    : `${darkMode ? 'border-navy hover:border-primary/50 bg-navy' : 'border-gray-300 hover:border-primary/50 bg-gray-50'}`}
                `}
              >
                <span className={`font-medium mr-2 ${currentAnswerObj?.answer === opt.id ? 'text-primary' : ''}`}>{opt.id.toUpperCase()}.</span> 
                {language === 'en' ? opt.textEn : opt.textKh}
              </button>
            ))}
            {question.type === 'true-false' && [
              { id: 'true', textEn: 'True', textKh: 'ពិត' }, { id: 'false', textEn: 'False', textKh: 'មិនពិត' }
            ].map(opt => (
              <button 
                key={opt.id}
                onClick={() => handleAnswerSelect(question.id, opt.id === 'true')}
                className={`w-full text-left p-3 rounded-md border-2 transition-colors text-sm
                  ${currentAnswerObj?.answer === (opt.id === 'true') 
                    ? `border-primary ${darkMode ? 'bg-primary/20' : 'bg-primary/10'}` 
                    : `${darkMode ? 'border-navy hover:border-primary/50 bg-navy' : 'border-gray-300 hover:border-primary/50 bg-gray-50'}`}
                `}
              >
                {language === 'en' ? opt.textEn : opt.textKh}
              </button>
            ))}
            {/* Add other question types here (e.g., scenario-based with text input) */}
          </div>
        </div>

        {/* Navigation & Submission */}
        <div className="flex justify-between items-center">
          <button 
            onClick={() => navigateQuestion('prev')} 
            disabled={currentQuestionIndex === 0}
            className="btn btn-secondary text-sm disabled:opacity-50 flex items-center"
          >
            <ChevronLeft size={16} className="mr-1"/> {language === 'en' ? 'Previous' : 'មុន'}
          </button>
          {currentQuestionIndex === currentAssessment.questions.length - 1 ? (
            <button onClick={handleSubmitAssessment} className="btn btn-primary text-sm flex items-center">
              {language === 'en' ? 'Submit Assessment' : 'បញ្ជូនការវាយតម្លៃ'} <CheckCircle size={16} className="ml-1"/>
            </button>
          ) : (
            <button 
              onClick={() => navigateQuestion('next')} 
              className="btn btn-primary text-sm flex items-center"
            >
              {language === 'en' ? 'Next' : 'បន្ទាប់'} <ChevronRight size={16} className="ml-1"/>
            </button>
          )}
        </div>
      </div>
    );
  };

  const AssessmentResultsUI: React.FC = () => {
    if (!currentAssessment || !currentAttempt) return null;
    const { scorePercent, passed, answers } = currentAttempt;

    return (
      <div className={`p-4 md:p-6 h-full flex flex-col ${darkMode ? 'bg-navy' : 'bg-gray-100'}`}>
        <div className="text-center mb-6">
          <motion.div initial={{scale:0.5, opacity:0}} animate={{scale:1, opacity:1}} transition={{delay:0.2, type:'spring', stiffness:200}}>
            {passed ? <CheckCircle size={64} className="text-success mx-auto mb-2"/> : <XCircle size={64} className="text-accent-coral mx-auto mb-2"/>}
          </motion.div>
          <h2 className="text-2xl font-bold mb-1">{language === 'en' ? (passed ? 'Congratulations! You Passed!' : 'Attempt Complete') : (passed ? 'សូមអបអរសាទរ! អ្នកបានប្រឡងជាប់!' : 'ការប៉ុនប៉ងបានបញ្ចប់')}</h2>
          <p className="text-4xl font-bold my-2">{scorePercent}%</p>
          <p className="opacity-80">{language === 'en' ? `You needed ${currentAssessment.passMarkPercent}% to pass.` : `អ្នកត្រូវការ ${currentAssessment.passMarkPercent}% ដើម្បីជាប់។`}</p>
        </div>

        <div className={`flex-grow p-4 rounded-lg shadow overflow-y-auto scrollbar-luxury mb-4 ${darkMode ? 'bg-navy-light' : 'bg-white'}`}>
          <h3 className="text-lg font-semibold mb-3">{language === 'en' ? 'Review Your Answers' : 'ពិនិត្យចម្លើយរបស់អ្នក'}</h3>
          {currentAssessment.questions.map((q, idx) => {
            const userAnswer = answers.find(a => a.questionId === q.id);
            return (
              <div key={q.id} className={`p-3 mb-2 rounded-md border-l-4 ${userAnswer?.isCorrect ? 'border-success bg-success/10' : 'border-accent-coral bg-accent-coral/10'}`}>
                <p className="text-sm font-medium mb-1">{language === 'en' ? `Q${idx+1}: ${q.textEn}` : `ស${idx+1}: ${q.textKh}`}</p>
                <p className="text-xs mb-1">
                  <span className="font-semibold">{language === 'en' ? 'Your Answer:' : 'ចម្លើយរបស់អ្នក៖'} </span> 
                  {/* Display user answer appropriately based on type */}
                  {userAnswer?.answer?.toString()} 
                  {userAnswer?.isCorrect ? <CheckCircle size={14} className="inline ml-1 text-success"/> : <XCircle size={14} className="inline ml-1 text-accent-coral"/>}
                </p>
                {!userAnswer?.isCorrect && q.explanationEn && (
                  <p className="text-xs opacity-80 italic">
                    <Lightbulb size={12} className="inline mr-1"/>
                    {language === 'en' ? q.explanationEn : q.explanationKh}
                  </p>
                )}
              </div>
            );
          })}
        </div>
        <button onClick={() => setView('list')} className="btn btn-primary w-full md:w-auto md:mx-auto text-sm">
          {language === 'en' ? 'Back to Assessments List' : 'ត្រឡប់ទៅបញ្ជីការវាយតម្លៃ'}
        </button>
      </div>
    );
  };


  // --- Main Render ---
  if (view === 'taking') return <AssessmentTakingUI />;
  if (view === 'results') return <AssessmentResultsUI />;

  // Default: Assessment List View
  return (
    <div className={`p-4 md:p-6 h-full flex flex-col ${darkMode ? 'bg-navy text-white-pure' : 'bg-gray-50 text-navy-dark'}`}>
      <h1 className="text-2xl md:text-3xl font-bold mb-6">{language === 'en' ? 'Assessments & Certifications' : 'ការវាយតម្លៃ និងវិញ្ញាបនបត្រ'}</h1>
      
      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
        <div className="relative">
          <input type="text" placeholder={language === 'en' ? 'Search assessments...' : 'ស្វែងរកការវាយតម្លៃ...'} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full p-2.5 pl-9 border rounded-lg text-sm ${darkMode ? 'bg-navy-light border-navy placeholder-gray-400' : 'bg-white border-gray-300 placeholder-gray-500'} focus:ring-1 focus:ring-primary outline-none`} />
          <Search size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
        </div>
        <div>
          <label className="block text-xs font-medium opacity-80 mb-0.5">{language === 'en' ? 'Category' : 'ប្រភេទ'}</label>
          <select value={filters.category} onChange={(e) => setFilters(f => ({...f, category: e.target.value}))}
            className={`w-full p-2.5 border rounded-lg text-sm ${darkMode ? 'bg-navy-light border-navy' : 'bg-white border-gray-300'} focus:ring-1 focus:ring-primary outline-none appearance-none`}>
            {assessmentCategories.map(cat => <option key={cat} value={cat}>{language === 'en' || cat === 'All' ? cat : cat}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium opacity-80 mb-0.5">{language === 'en' ? 'Type' : 'ប្រភេទ'}</label>
          <select value={filters.type} onChange={(e) => setFilters(f => ({...f, type: e.target.value}))}
            className={`w-full p-2.5 border rounded-lg text-sm ${darkMode ? 'bg-navy-light border-navy' : 'bg-white border-gray-300'} focus:ring-1 focus:ring-primary outline-none appearance-none`}>
            {assessmentTypes.map(type => <option key={type} value={type}>{language === 'en' || type === 'All' ? type : type}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium opacity-80 mb-0.5">{language === 'en' ? 'Difficulty' : 'កម្រិត'}</label>
          <select value={filters.difficulty} onChange={(e) => setFilters(f => ({...f, difficulty: e.target.value}))}
            className={`w-full p-2.5 border rounded-lg text-sm ${darkMode ? 'bg-navy-light border-navy' : 'bg-white border-gray-300'} focus:ring-1 focus:ring-primary outline-none appearance-none`}>
            {assessmentDifficulties.map(opt => <option key={opt.value} value={opt.value}>{language === 'en' ? opt.labelEn : opt.labelKh}</option>)}
          </select>
        </div>
      </div>

      {/* Assessment Grid */}
      <div className="flex-grow overflow-y-auto scrollbar-luxury -mx-1">
        {filteredAssessments.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-1">
            {filteredAssessments.map(assessment => <AssessmentCard key={assessment.id} assessment={assessment} />)}
          </div>
        ) : (
          <div className="text-center py-10 opacity-60">
            <FileText size={48} className="mx-auto mb-2" />
            <p>{language === 'en' ? 'No assessments match your criteria.' : 'មិនមានការវាយតម្លៃត្រូវនឹងលក្ខខណ្ឌរបស់អ្នកទេ។'}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssessmentsPage;
