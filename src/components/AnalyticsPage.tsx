import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart2, TrendingUp, Zap, Award, CalendarDays, Target, Download, Lightbulb, Users, BookOpen, CheckCircle, Clock, Activity, Brain, Edit2, Flame, Layers } from 'lucide-react';

interface AnalyticsPageProps {
  language: 'en' | 'km';
  darkMode?: boolean;
}

// --- Mock Data Types ---
interface OverallProgress {
  progressPercent: number;
  streakDays: number;
  timeSpentHours: number;
  skillsMastered: number;
}

interface StudyTimeData {
  daily: { day: string; dayKh: string; hours: number }[];
  weekly: { week: string; weekKh: string; hours: number }[];
  monthly: { month: string; monthKh: string; hours: number }[];
}

interface CourseProgress {
  id: string;
  titleEn: string;
  titleKh: string;
  progress: number; // 0-100
  category: string;
}

interface SkillAssessment {
  skillEn: string;
  skillKh: string;
  proficiency: number; // 0-100
}

interface Achievement {
  id: string;
  titleEn: string;
  titleKh: string;
  date: string; // YYYY-MM-DD
  icon: React.ElementType;
}

interface LearningGoal {
  id: string;
  textEn: string;
  textKh: string;
  isCompleted: boolean;
  targetDate?: string;
}

interface PerformanceInsight {
  id: string;
  textEn: string;
  textKh: string;
  type: 'strength' | 'improvement' | 'observation';
}

interface PeerComparison {
  metricEn: string;
  metricKh: string;
  userValue: number;
  peerAverage: number;
  unit: string;
}

interface HeatmapData {
  [date: string]: number; // date (YYYY-MM-DD): activityLevel (0-4)
}

// --- Mock Data ---
const mockOverallProgress: OverallProgress = {
  progressPercent: 72,
  streakDays: 28,
  timeSpentHours: 125,
  skillsMastered: 42,
};

const mockStudyTimeData: StudyTimeData = {
  daily: [
    { day: 'Mon', dayKh: 'ចន្ទ', hours: 1.5 }, { day: 'Tue', dayKh: 'អង្គារ', hours: 2 }, { day: 'Wed', dayKh: 'ពុធ', hours: 1 },
    { day: 'Thu', dayKh: 'ព្រហ', hours: 2.5 }, { day: 'Fri', dayKh: 'សុក្រ', hours: 1.2 }, { day: 'Sat', dayKh: 'សៅរ៍', hours: 3 },
    { day: 'Sun', dayKh: 'អាទិត្យ', hours: 0.5 },
  ],
  weekly: [
    { week: 'W1', weekKh: 'ស១', hours: 10 }, { week: 'W2', weekKh: 'ស២', hours: 12 }, { week: 'W3', weekKh: 'ស៣', hours: 8 }, { week: 'W4', weekKh: 'ស៤', hours: 15 },
  ],
  monthly: [
    { month: 'Jan', monthKh: 'មករា', hours: 45 }, { month: 'Feb', monthKh: 'កុម្ភៈ', hours: 50 }, { month: 'Mar', monthKh: 'មីនា', hours: 60 },
    { month: 'Apr', monthKh: 'មេសា', hours: 35 }, { month: 'May', monthKh: 'ឧសភា', hours: 55 }, { month: 'Jun', monthKh: 'មិថុនា', hours: 40 },
  ],
};

const mockCourseProgress: CourseProgress[] = [
  { id: 'c1', titleEn: 'Front Desk Excellence', titleKh: 'ឧត្តមភាពផ្នែកទទួលភ្ញៀវ', progress: 85, category: 'Front Desk' },
  { id: 'c2', titleEn: 'F&B Service Mastery', titleKh: 'ជំនាញសេវាកម្ម F&B', progress: 60, category: 'Food & Beverage' },
  { id: 'c3', titleEn: 'Cambodian Cultural Etiquette', titleKh: 'សុជីវធម៌វប្បធម៌កម្ពុជា', progress: 95, category: 'Cultural Skills' },
  { id: 'c4', titleEn: 'Advanced English Communication', titleKh: 'ទំនាក់ទំនងភាសាអង់គ្លេសកម្រិតខ្ពស់', progress: 40, category: 'Language' },
];

const mockSkillAssessment: SkillAssessment[] = [
  { skillEn: 'Greeting Guests', skillKh: 'ការស្វាគមន៍ភ្ញៀវ', proficiency: 90 },
  { skillEn: 'Complaint Handling', skillKh: 'ការដោះស្រាយបណ្តឹង', proficiency: 75 },
  { skillEn: 'Upselling Techniques', skillKh: 'បច្ចេកទេសលក់បន្ថែម', proficiency: 60 },
  { skillEn: 'Cultural Sensitivity', skillKh: 'ភាពរសើបវប្បធម៌', proficiency: 95 },
  { skillEn: 'English Pronunciation', skillKh: 'ការបញ្ចេញសំឡេងអង់គ្លេស', proficiency: 70 },
  { skillEn: 'Team Communication', skillKh: 'ទំនាក់ទំនងក្រុម', proficiency: 80 },
];

const mockAchievements: Achievement[] = [
  { id: 'a1', titleEn: 'Completed "Front Desk Basics" Course', titleKh: 'បានបញ្ចប់វគ្គ "មូលដ្ឋានគ្រឹះផ្នែកទទួលភ្ញៀវ"', date: '2025-05-20', icon: BookOpen },
  { id: 'a2', titleEn: 'Achieved 10-day study streak', titleKh: 'សម្រេចបានការសិក្សាជាប់គ្នា ១០ថ្ងៃ', date: '2025-05-15', icon: Flame },
  { id: 'a3', titleEn: 'Mastered 50 Vocabulary Flashcards', titleKh: 'ស្ទាត់ជំនាញកាតពាក្យចំនួន ៥០', date: '2025-05-10', icon: Layers },
  { id: 'a4', titleEn: 'Scored 90%+ in Check-in Simulation', titleKh: 'ទទួលបានពិន្ទុ ៩០%+ ក្នុងការក្លែងធ្វើការចុះឈ្មោះចូល', date: '2025-05-05', icon: Award },
];

const mockLearningGoals: LearningGoal[] = [
  { id: 'g1', textEn: 'Improve English pronunciation for common guest questions.', textKh: 'កែលម្អការបញ្ចេញសំឡេងអង់គ្លេសសម្រាប់សំណួរភ្ញៀវទូទៅ។', isCompleted: false, targetDate: '2025-06-30' },
  { id: 'g2', textEn: 'Complete the "Advanced Complaint Handling" module.', textKh: 'បញ្ចប់មេរៀន "ការដោះស្រាយបណ្តឹងកម្រិតខ្ពស់"។', isCompleted: true, targetDate: '2025-05-25' },
  { id: 'g3', textEn: 'Practice AI conversations for 30 minutes daily.', textKh: 'អនុវត្តការសន្ទនា AI រយៈពេល ៣០នាទីជារៀងរាល់ថ្ងៃ។', isCompleted: false },
];

const mockPerformanceInsights: PerformanceInsight[] = [
  { id: 'pi1', textEn: 'You excel in cultural etiquette scenarios. Keep it up!', textKh: 'អ្នកពូកែណាស់ក្នុងសេណារីយ៉ូសុជីវធម៌វប្បធម៌។ បន្តធ្វើបានល្អ!', type: 'strength' },
  { id: 'pi2', textEn: 'Focus more on practicing upselling phrases; your attempts are a bit hesitant.', textKh: 'ផ្តោតបន្ថែមលើការអនុវត្តឃ្លាលក់បន្ថែម; ការព្យាយាមរបស់អ្នកនៅមានភាពស្ទាក់ស្ទើរ។', type: 'improvement' },
  { id: 'pi3', textEn: 'Your study consistency is highest on Tuesdays and Thursdays.', textKh: 'ភាពជាប់លាប់នៃការសិក្សារបស់អ្នកគឺខ្ពស់បំផុតនៅថ្ងៃអង្គារ និងព្រហស្បតិ៍។', type: 'observation' },
];

const mockPeerComparison: PeerComparison[] = [
  { metricEn: 'Weekly Study Time', metricKh: 'ម៉ោងសិក្សាប្រចាំសប្តាហ៍', userValue: 12.5, peerAverage: 10, unit: 'hrs' },
  { metricEn: 'Average Quiz Score', metricKh: 'ពិន្ទុមធ្យមតេស្ត', userValue: 82, peerAverage: 78, unit: '%' },
  { metricEn: 'Flashcards Mastered', metricKh: 'កាតបានស្ទាត់ជំនាញ', userValue: 150, peerAverage: 120, unit: 'cards' },
];

const mockHeatmapData: HeatmapData = {
  '2025-05-01': 2, '2025-05-02': 3, '2025-05-03': 1, '2025-05-05': 4, '2025-05-06': 2, '2025-05-07': 3,
  '2025-05-08': 1, '2025-05-09': 2, '2025-05-12': 3, '2025-05-13': 4, '2025-05-14': 2, '2025-05-15': 3,
  '2025-05-16': 1, '2025-05-19': 2, '2025-05-20': 4, '2025-05-21': 3, '2025-05-22': 2, '2025-05-23': 1,
  '2025-05-26': 3, '2025-05-27': 2, '2025-05-28': 4, '2025-05-29': 1,
};


// --- Helper Components (SVG Charts) ---
const BarChart: React.FC<{ data: { label: string; labelKh: string, value: number }[]; language: 'en' | 'km'; darkMode?: boolean; title: string; titleKh: string; }> = 
  ({ data, language, darkMode, title, titleKh }) => {
  const maxValue = Math.max(...data.map(d => d.value), 0);
  const barColor = darkMode ? 'fill-primary-light' : 'fill-primary';
  const textColor = darkMode ? 'fill-gray-300' : 'fill-gray-600';
  const gridColor = darkMode ? 'stroke-gray-700' : 'stroke-gray-300';

  return (
    <div className={`p-4 rounded-lg shadow ${darkMode ? 'bg-navy-light' : 'bg-white'}`}>
      <h3 className="text-md font-semibold mb-3">{language === 'en' ? title : titleKh}</h3>
      <svg viewBox={`0 0 ${data.length * 60 + 40} 220`} className="w-full h-auto">
        {/* Y-axis grid lines and labels */}
        {[0, 0.25, 0.5, 0.75, 1].map(tick => (
          <g key={tick}>
            <line x1="35" y1={180 - tick * 150} x2={data.length * 60 + 40} y2={180 - tick * 150} className={gridColor} strokeDasharray="2,2" />
            <text x="30" y={180 - tick * 150 + 4} textAnchor="end" fontSize="10" className={textColor}>
              {Math.round(maxValue * tick)}
            </text>
          </g>
        ))}
        {/* Bars and X-axis labels */}
        {data.map((item, index) => {
          const barHeight = maxValue > 0 ? (item.value / maxValue) * 150 : 0;
          return (
            <g key={index}>
              <rect
                x={index * 60 + 50}
                y={180 - barHeight}
                width="40"
                height={barHeight}
                className={barColor}
                rx="3"
              />
              <text x={index * 60 + 70} y="200" textAnchor="middle" fontSize="10" className={textColor}>
                {language === 'en' ? item.label : item.labelKh}
              </text>
              <text x={index * 60 + 70} y={175 - barHeight} textAnchor="middle" fontSize="10" className={barColor} fontWeight="bold">
                {item.value}
              </text>
            </g>
          );
        })}
        <line x1="35" y1="180" x2={data.length * 60 + 40} y2="180" className={gridColor} />
      </svg>
    </div>
  );
};

const RadarChart: React.FC<{ data: SkillAssessment[]; language: 'en' | 'km'; darkMode?: boolean; }> = ({ data, language, darkMode }) => {
  const size = 200; // SVG canvas size
  const center = size / 2;
  const radius = size * 0.35;
  const numLevels = 5;
  const numAxes = data.length;
  const angleSlice = (Math.PI * 2) / numAxes;

  const textColor = darkMode ? 'fill-gray-300' : 'fill-gray-700';
  const gridColor = darkMode ? 'stroke-gray-600' : 'stroke-gray-300';
  const dataPathColor = darkMode ? 'fill-primary-light/30 stroke-primary-light' : 'fill-primary/30 stroke-primary';

  const points = data.map((item, i) => {
    const angle = angleSlice * i - Math.PI / 2; // Start from top
    const value = (item.proficiency / 100) * radius;
    return {
      x: center + value * Math.cos(angle),
      y: center + value * Math.sin(angle),
    };
  });
  const pathData = points.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <div className={`p-4 rounded-lg shadow ${darkMode ? 'bg-navy-light' : 'bg-white'}`}>
      <h3 className="text-md font-semibold mb-3">{language === 'en' ? 'Skill Proficiency' : 'ជំនាញជំនាញ'}</h3>
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-xs mx-auto h-auto">
        {/* Grid Levels */}
        {[...Array(numLevels)].map((_, levelIndex) => {
          const levelRadius = (radius / numLevels) * (levelIndex + 1);
          const levelPath = [...Array(numAxes)].map((_, i) => {
            const angle = angleSlice * i - Math.PI / 2;
            return `${center + levelRadius * Math.cos(angle)},${center + levelRadius * Math.sin(angle)}`;
          }).join(' ');
          return <polygon key={levelIndex} points={levelPath} className={`fill-none ${gridColor} opacity-50`} />;
        })}
        {/* Axes Lines */}
        {[...Array(numAxes)].map((_, i) => {
          const angle = angleSlice * i - Math.PI / 2;
          return (
            <line
              key={i}
              x1={center} y1={center}
              x2={center + radius * Math.cos(angle)}
              y2={center + radius * Math.sin(angle)}
              className={gridColor}
            />
          );
        })}
        {/* Data Polygon */}
        <polygon points={pathData} className={dataPathColor} strokeWidth="2" />
        {/* Data Points and Labels */}
        {data.map((item, i) => {
          const angle = angleSlice * i - Math.PI / 2;
          const labelRadius = radius * 1.25; // Position labels outside the main radar
          return (
            <g key={i}>
              <circle cx={points[i].x} cy={points[i].y} r="3" className={darkMode ? 'fill-primary-light' : 'fill-primary'} />
              <text
                x={center + labelRadius * Math.cos(angle)}
                y={center + labelRadius * Math.sin(angle) + 3} // Adjust y for better alignment
                textAnchor={angle === -Math.PI/2 || angle === Math.PI/2 ? "middle" : (angle > -Math.PI/2 && angle < Math.PI/2 ? "start" : "end")}
                fontSize="8"
                className={textColor}
              >
                {language === 'en' ? item.skillEn : item.skillKh}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

const CalendarHeatmap: React.FC<{ data: HeatmapData; language: 'en' | 'km'; darkMode?: boolean; }> = ({ data, language, darkMode }) => {
  const today = new Date(2025, 4, 31); // May 31, 2025
  const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
  const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const daysInMonth = endDate.getDate();
  const firstDayOfMonth = startDate.getDay(); // 0 (Sun) - 6 (Sat)

  const cells = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    cells.push(<div key={`empty-${i}`} className="w-5 h-5 md:w-6 md:h-6"></div>);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const activityLevel = data[dateStr] || 0;
    let bgColor = darkMode ? 'bg-gray-700' : 'bg-gray-200'; // Level 0
    if (activityLevel === 1) bgColor = darkMode ? 'bg-primary/30' : 'bg-primary/20';
    else if (activityLevel === 2) bgColor = darkMode ? 'bg-primary/50' : 'bg-primary/40';
    else if (activityLevel === 3) bgColor = darkMode ? 'bg-primary/70' : 'bg-primary/60';
    else if (activityLevel >= 4) bgColor = darkMode ? 'bg-primary' : 'bg-primary';
    
    cells.push(
      <div key={day} title={`${dateStr}: ${activityLevel} ${language==='en'?'activities':'សកម្មភាព'}`}
           className={`w-5 h-5 md:w-6 md:h-6 rounded-sm ${bgColor} transition-colors`}>
      </div>
    );
  }

  const dayLabelsEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayLabelsKh = ['អា', 'ចន្ទ', 'អង្គ', 'ពុធ', 'ព្រហ', 'សុក្រ', 'សៅរ៍'];
  const currentDayLabels = language === 'en' ? dayLabelsEn : dayLabelsKh;

  return (
    <div className={`p-4 rounded-lg shadow ${darkMode ? 'bg-navy-light' : 'bg-white'}`}>
      <h3 className="text-md font-semibold mb-3">{language === 'en' ? 'Study Heatmap (May 2025)' : 'ផែនទីកម្តៅសិក្សា (ឧសភា ២០២៥)'}</h3>
      <div className="grid grid-cols-7 gap-1 text-xs text-center mb-1">
        {currentDayLabels.map(label => <div key={label} className={darkMode ? 'text-gray-400' : 'text-gray-500'}>{label}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells}
      </div>
       <div className="flex justify-end items-center mt-2 space-x-2 text-xs">
        <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>{language === 'en' ? 'Less' : 'តិច'}</span>
        <div className={`w-3 h-3 rounded-sm ${darkMode ? 'bg-primary/30' : 'bg-primary/20'}`}></div>
        <div className={`w-3 h-3 rounded-sm ${darkMode ? 'bg-primary/50' : 'bg-primary/40'}`}></div>
        <div className={`w-3 h-3 rounded-sm ${darkMode ? 'bg-primary/70' : 'bg-primary/60'}`}></div>
        <div className={`w-3 h-3 rounded-sm ${darkMode ? 'bg-primary' : 'bg-primary'}`}></div>
        <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>{language === 'en' ? 'More' : 'ច្រើន'}</span>
      </div>
    </div>
  );
};


// --- Main Analytics Page Component ---
const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ language, darkMode = false }) => {
  const [goals, setGoals] = useState<LearningGoal[]>(mockLearningGoals);
  const [showAddGoalModal, setShowAddGoalModal] = useState(false);
  const [newGoalText, setNewGoalText] = useState("");

  const toggleGoalCompletion = (id: string) => {
    setGoals(prevGoals => prevGoals.map(goal => goal.id === id ? { ...goal, isCompleted: !goal.isCompleted } : goal));
  };

  const handleAddNewGoal = () => {
    if(newGoalText.trim() === "") return;
    const newGoal: LearningGoal = {
        id: `g${goals.length + 1}`,
        textEn: newGoalText, // For simplicity, using English text for both if Khmer not provided
        textKh: newGoalText, // Ideally, this would come from a Khmer input field
        isCompleted: false
    };
    setGoals(prev => [newGoal, ...prev]);
    setNewGoalText("");
    setShowAddGoalModal(false);
  };

  const cardAnimation = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  return (
    <div className={`p-4 md:p-6 space-y-6 scrollbar-luxury ${darkMode ? 'bg-navy text-white-pure' : 'bg-gray-50 text-navy-dark'}`}>
      <motion.h1 {...cardAnimation} className="text-2xl md:text-3xl font-bold">
        {language === 'en' ? 'My Progress & Analytics' : 'វឌ្ឍនភាព និងការវិភាគរបស់ខ្ញុំ'}
      </motion.h1>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[
          { icon: TrendingUp, labelEn: 'Overall Progress', labelKh: 'វឌ្ឍនភាពសរុប', value: `${mockOverallProgress.progressPercent}%`, color: 'text-primary' },
          { icon: Flame, labelEn: 'Study Streak', labelKh: 'ថ្ងៃសិក្សាជាប់គ្នា', value: `${mockOverallProgress.streakDays} ${language === 'en' ? 'days' : 'ថ្ងៃ'}`, color: 'text-accent-coral' },
          { icon: Clock, labelEn: 'Time Spent', labelKh: 'ពេលវាលាចំណាយ', value: `${mockOverallProgress.timeSpentHours} ${language === 'en' ? 'hrs' : 'ម៉ោង'}`, color: 'text-accent-blue' },
          { icon: Brain, labelEn: 'Skills Mastered', labelKh: 'ជំនាញបានស្ទាត់', value: mockOverallProgress.skillsMastered, color: 'text-accent-orange' },
        ].map((item, index) => (
          <motion.div 
            key={item.labelEn}
            {...cardAnimation}
            transition={{ ...cardAnimation.transition, delay: index * 0.1 }}
            className={`p-4 rounded-xl shadow-lg flex items-center space-x-3 ${darkMode ? 'bg-navy-light' : 'bg-white'}`}
          >
            <div className={`p-3 rounded-full bg-opacity-20 ${item.color.replace('text-', 'bg-')}`}>
              <item.icon size={24} className={item.color} />
            </div>
            <div>
              <p className="text-sm opacity-80">{language === 'en' ? item.labelEn : item.labelKh}</p>
              <p className="text-xl font-bold">{item.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Learning Statistics Charts */}
      <motion.div {...cardAnimation} transition={{ ...cardAnimation.transition, delay: 0.4 }} className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="lg:col-span-1">
          <BarChart 
            data={mockStudyTimeData.daily.map(item => ({ label: item.day, labelKh: item.dayKh, value: item.hours }))} 
            language={language} 
            darkMode={darkMode} 
            title="Daily Study Time" 
            titleKh="ម៉ោងសិក្សាប្រចាំថ្ងៃ"
          />
        </div>
        <div className="lg:col-span-1">
          <BarChart 
            data={mockStudyTimeData.weekly.map(item => ({ label: item.week, labelKh: item.weekKh, value: item.hours }))} 
            language={language} 
            darkMode={darkMode} 
            title="Weekly Study Time" 
            titleKh="ម៉ោងសិក្សាប្រចាំសប្តាហ៍"
          />
        </div>
         <div className="lg:col-span-1">
          <BarChart 
            data={mockStudyTimeData.monthly.slice(-6).map(item => ({ label: item.month, labelKh: item.monthKh, value: item.hours }))} 
            language={language} 
            darkMode={darkMode} 
            title="Monthly Study (Last 6)" 
            titleKh="សិក្សាប្រចាំខែ (៦ខែចុងក្រោយ)"
          />
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Course Progress */}
        <motion.div {...cardAnimation} transition={{ ...cardAnimation.transition, delay: 0.5 }} className={`lg:col-span-2 p-4 rounded-lg shadow ${darkMode ? 'bg-navy-light' : 'bg-white'}`}>
          <h3 className="text-md font-semibold mb-3">{language === 'en' ? 'Course Progress' : 'វឌ្ឍនភាពវគ្គសិក្សា'}</h3>
          <div className="space-y-3 max-h-80 overflow-y-auto scrollbar-luxury pr-2">
            {mockCourseProgress.map(course => (
              <div key={course.id}>
                <div className="flex justify-between text-sm mb-0.5">
                  <span>{language === 'en' ? course.titleEn : course.titleKh}</span>
                  <span className="font-medium">{course.progress}%</span>
                </div>
                <div className={`w-full h-2 rounded-full ${darkMode ? 'bg-navy' : 'bg-gray-200'}`}>
                  <div className="h-full bg-primary rounded-full" style={{ width: `${course.progress}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Skill Assessment Radar Chart */}
        <motion.div {...cardAnimation} transition={{ ...cardAnimation.transition, delay: 0.6 }}>
          <RadarChart data={mockSkillAssessment} language={language} darkMode={darkMode} />
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {/* Achievement Timeline */}
        <motion.div {...cardAnimation} transition={{ ...cardAnimation.transition, delay: 0.7 }} className={`p-4 rounded-lg shadow ${darkMode ? 'bg-navy-light' : 'bg-white'}`}>
          <h3 className="text-md font-semibold mb-3">{language === 'en' ? 'Recent Achievements' : 'សមិទ្ធផលថ្មីៗ'}</h3>
          <ul className="space-y-3 max-h-72 overflow-y-auto scrollbar-luxury pr-2">
            {mockAchievements.map(ach => (
              <li key={ach.id} className="flex items-center space-x-3 text-sm">
                <div className={`p-2 rounded-full ${darkMode ? 'bg-navy' : 'bg-gray-100'}`}>
                  <ach.icon size={18} className="text-primary" />
                </div>
                <div>
                  <p>{language === 'en' ? ach.titleEn : ach.titleKh}</p>
                  <p className="text-xs opacity-70">{new Date(ach.date).toLocaleDateString(language === 'en' ? 'en-US' : 'km-KH', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                </div>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Learning Goals */}
        <motion.div {...cardAnimation} transition={{ ...cardAnimation.transition, delay: 0.8 }} className={`p-4 rounded-lg shadow ${darkMode ? 'bg-navy-light' : 'bg-white'}`}>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-md font-semibold">{language === 'en' ? 'Learning Goals' : 'គោលដៅសិក្សា'}</h3>
            <button onClick={() => setShowAddGoalModal(true)} className={`btn btn-secondary btn-sm text-xs px-2 py-1 ${darkMode ? 'bg-primary/80 hover:bg-primary' : ''}`}>
                <Edit2 size={14} className="mr-1"/> {language === 'en' ? 'Manage' : 'គ្រប់គ្រង'}
            </button>
          </div>
          <ul className="space-y-2 max-h-72 overflow-y-auto scrollbar-luxury pr-2">
            {goals.map(goal => (
              <li key={goal.id} className="flex items-center space-x-2 text-sm p-2 rounded-md hover:bg-gray-50 dark:hover:bg-navy transition-colors">
                <button onClick={() => toggleGoalCompletion(goal.id)} className="flex-shrink-0">
                  {goal.isCompleted ? <CheckCircle size={20} className="text-success" /> : <div className={`w-5 h-5 border-2 rounded ${darkMode ? 'border-gray-500' : 'border-gray-400'}`}></div>}
                </button>
                <span className={`${goal.isCompleted ? 'line-through opacity-60' : ''}`}>{language === 'en' ? goal.textEn : goal.textKh}</span>
                {goal.targetDate && <span className="ml-auto text-xs opacity-60 whitespace-nowrap">{new Date(goal.targetDate).toLocaleDateString(language === 'en' ? 'en-GB' : 'km-KH', {month:'short', day:'numeric'})}</span>}
              </li>
            ))}
             {goals.length === 0 && <p className="text-sm opacity-70 text-center py-4">{language === 'en' ? 'No goals set yet.' : 'មិនមានគោលដៅកំណត់ទេ។'}</p>}
          </ul>
        </motion.div>
      </div>
      
      {/* Add Goal Modal */}
      {showAddGoalModal && (
        <motion.div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            onClick={() => setShowAddGoalModal(false)}
        >
            <motion.div 
                className={`p-6 rounded-xl shadow-2xl w-full max-w-md ${darkMode ? 'bg-navy-dark border border-navy' : 'bg-white'}`}
                initial={{scale:0.9, opacity:0}} animate={{scale:1, opacity:1}} exit={{scale:0.9, opacity:0}}
                onClick={(e) => e.stopPropagation()}
            >
                <h3 className="text-lg font-semibold mb-4">{language === 'en' ? 'Add New Goal' : 'បន្ថែមគោលដៅថ្មី'}</h3>
                <textarea 
                    value={newGoalText}
                    onChange={(e) => setNewGoalText(e.target.value)}
                    placeholder={language === 'en' ? 'Describe your goal...' : 'ពិពណ៌នាគោលដៅរបស់អ្នក...'}
                    className={`w-full p-2 border rounded-md text-sm resize-none h-24 mb-4 ${darkMode ? 'bg-navy-light border-navy placeholder-gray-400' : 'bg-gray-50 border-gray-300 placeholder-gray-500'}`}
                />
                <div className="flex justify-end space-x-2">
                    <button onClick={() => setShowAddGoalModal(false)} className={`btn text-sm ${darkMode ? 'bg-navy hover:bg-navy/70' : 'bg-gray-200 hover:bg-gray-300'}`}>{language === 'en' ? 'Cancel' : 'បោះបង់'}</button>
                    <button onClick={handleAddNewGoal} className="btn btn-primary text-sm">{language === 'en' ? 'Add Goal' : 'បន្ថែមគោលដៅ'}</button>
                </div>
            </motion.div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {/* Performance Insights */}
        <motion.div {...cardAnimation} transition={{ ...cardAnimation.transition, delay: 0.9 }} className={`p-4 rounded-lg shadow ${darkMode ? 'bg-navy-light' : 'bg-white'}`}>
          <h3 className="text-md font-semibold mb-3 flex items-center"><Lightbulb size={18} className="mr-2 text-accent-orange"/>{language === 'en' ? 'Performance Insights' : 'ការយល់ដឹងពីសមិទ្ធផល'}</h3>
          <ul className="space-y-2 text-sm">
            {mockPerformanceInsights.map(insight => (
              <li key={insight.id} className={`p-2 rounded-md ${
                insight.type === 'strength' ? (darkMode ? 'bg-green-700/20' : 'bg-green-100') :
                insight.type === 'improvement' ? (darkMode ? 'bg-yellow-700/20' : 'bg-yellow-100') :
                (darkMode ? 'bg-blue-700/20' : 'bg-blue-100')
              }`}>
                {language === 'en' ? insight.textEn : insight.textKh}
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Comparative Analytics */}
        <motion.div {...cardAnimation} transition={{ ...cardAnimation.transition, delay: 1.0 }} className={`p-4 rounded-lg shadow ${darkMode ? 'bg-navy-light' : 'bg-white'}`}>
          <h3 className="text-md font-semibold mb-3 flex items-center"><Users size={18} className="mr-2 text-accent-blue"/>{language === 'en' ? 'Peer Comparison (Anonymous)' : 'ការប្រៀបធៀបជាមួយមិត្ត (អនាមិក)'}</h3>
          <div className="space-y-3 text-sm">
            {mockPeerComparison.map(comp => (
              <div key={comp.metricEn}>
                <p className="font-medium mb-0.5">{language === 'en' ? comp.metricEn : comp.metricKh}</p>
                <div className="flex items-center">
                  <div className="w-2/3 h-4 bg-gray-200 dark:bg-navy rounded-full overflow-hidden mr-2">
                    <div className="h-full bg-primary" style={{ width: `${(comp.userValue / (comp.peerAverage * 1.5)) * 100}%` }}></div> {/* Scale user value relative to 1.5x peer avg for viz */}
                  </div>
                  <span className="font-bold">{comp.userValue} {comp.unit}</span>
                </div>
                <p className="text-xs opacity-70">{language === 'en' ? 'Peer Avg:' : 'មធ្យមភាគមិត្ត៖'} {comp.peerAverage} {comp.unit}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
      
      {/* Study Heatmap */}
      <motion.div {...cardAnimation} transition={{ ...cardAnimation.transition, delay: 1.1 }}>
        <CalendarHeatmap data={mockHeatmapData} language={language} darkMode={darkMode} />
      </motion.div>

      {/* Export Reports */}
      <motion.div {...cardAnimation} transition={{ ...cardAnimation.transition, delay: 1.2 }} className="text-center mt-4">
        <button 
          onClick={() => console.log("Exporting report...")}
          className="btn btn-primary flex items-center mx-auto"
        >
          <Download size={18} className="mr-2" />
          {language === 'en' ? 'Export Progress Report' : 'នាំចេញរបាយការណ៍វឌ្ឍនភាព'}
        </button>
      </motion.div>

    </div>
  );
};

export default AnalyticsPage;
