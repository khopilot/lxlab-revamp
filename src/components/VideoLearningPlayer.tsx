import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Pause, Volume2, VolumeX, Settings, X,
  Bookmark, Info, Tv2, List, StickyNote, Check, CornerDownLeft, Maximize2, Minimize2, ChevronRight
} from 'lucide-react';

interface VideoPlayerProps {
  videoSrc: string;
  videoTitle: string;
  videoTitleKh: string;
  transcript: TranscriptLine[];
  subtitles: SubtitleTrack[];
  hotspots: Hotspot[];
  language: 'en' | 'km';
  darkMode?: boolean;
}

interface TranscriptLine {
  id: string;
  startTime: number;
  endTime: number;
  textEn: string;
  textKh: string;
}

interface SubtitleTrack {
  id: string;
  lang: 'en' | 'km' | 'phonetic';
  label: string;
  labelKh: string;
}

interface Hotspot {
  id:string;
  time: number; // Time in seconds when hotspot appears
  duration: number; // How long it stays visible
  x: number; // Percentage from left
  y: number; // Percentage from top
  titleEn: string;
  titleKh: string;
  contentEn: string;
  contentKh: string;
}

interface Note {
  id: string;
  time: number;
  text: string;
}

interface BookmarkData {
  id: string;
  time: number;
  label: string;
}

const mockVideo = {
  src: "https://www.w3schools.com/html/mov_bbb.mp4", // Placeholder
  titleEn: "Advanced Guest Interaction Techniques",
  titleKh: "បច្ចេកទេសអន្តរកម្មភ្ញៀវកម្រិតខ្ពស់",
};

const mockTranscript: TranscriptLine[] = [
  { id: 't1', startTime: 0, endTime: 4, textEn: "Welcome to this module on advanced guest interaction.", textKh: "សូមស្វាគមន៍មកកាន់មេរៀនស្តីពីអន្តរកម្មភ្ញៀវកម្រិតខ្ពស់។" },
  { id: 't2', startTime: 4.5, endTime: 8, textEn: "Today, we'll focus on handling difficult situations.", textKh: "ថ្ងៃនេះ យើងនឹងផ្តោតលើការដោះស្រាយស្ថានភាពលំបាក។" },
  { id: 't3', startTime: 8.5, endTime: 12, textEn: "Remember, empathy is key in these scenarios.", textKh: "ចងចាំថា ការយល់ចិត្តគឺជាគន្លឹះក្នុងសេណារីយ៉ូទាំងនេះ។" },
  { id: 't4', startTime: 12.5, endTime: 17, textEn: "Let's look at an example of a guest complaint.", textKh: "តោះមើលឧទាហរណ៍នៃការត្អូញត្អែររបស់ភ្ញៀវ។" },
  { id: 't5', startTime: 17.5, endTime: 22, textEn: "First, listen actively to understand their concerns.", textKh: "ដំបូង ស្តាប់ដោយយកចិត្តទុកដាក់ដើម្បីយល់ពីកង្វល់របស់ពួកគេ។" },
  { id: 't6', startTime: 22.5, endTime: 28, textEn: "Then, validate their feelings and apologize sincerely.", textKh: "បន្ទាប់មក ទទួលស្គាល់អារម្មណ៍របស់ពួកគេ ហើយសុំទោសដោយស្មោះ។" },
];

const mockSubtitles: SubtitleTrack[] = [
  { id: 'sub_en', lang: 'en', label: 'English', labelKh: 'ភាសាអង់គ្លេស' },
  { id: 'sub_km', lang: 'km', label: 'Khmer', labelKh: 'ភាសាខ្មែរ' },
  { id: 'sub_ph', lang: 'phonetic', label: 'Phonetic (EN)', labelKh: 'សូរស័ព្ទ (EN)' },
];

const mockHotspots: Hotspot[] = [
  { id: 'h1', time: 10, duration: 5, x: 70, y: 30, titleEn: "Empathy Tip", titleKh: "គន្លឹះយល់ចិត្ត", contentEn: "Using phrases like 'I understand how you feel' can de-escalate tension.", contentKh: "ការប្រើឃ្លាដូចជា 'ខ្ញុំយល់ពីអារម្មណ៍របស់អ្នក' អាចកាត់បន្ថយភាពតានតឹង។" },
  { id: 'h2', time: 20, duration: 6, x: 20, y: 50, titleEn: "Active Listening", titleKh: "ការស្តាប់សកម្ម", contentEn: "Maintain eye contact and nod to show you are engaged.", contentKh: "រក្សាការសម្លឹងមើល និងងក់ក្បាលដើម្បីបង្ហាញថាអ្នកកំពុងយកចិត្តទុកដាក់។" },
];

const VideoLearningPlayer: React.FC<Partial<VideoPlayerProps>> = ({
  videoSrc = mockVideo.src,
  videoTitle = mockVideo.titleEn,
  videoTitleKh = mockVideo.titleKh,
  transcript = mockTranscript,
  subtitles = mockSubtitles,
  hotspots = mockHotspots,
  language = 'en',
  darkMode = false,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLInputElement>(null);
  const notesTextareaRef = useRef<HTMLTextAreaElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.75);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isPip, setIsPip] = useState(false);
  const [selectedSubtitle, setSelectedSubtitle] = useState<SubtitleTrack | null>(null);
  const [showControls, setShowControls] = useState(true);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showSubtitleMenu, setShowSubtitleMenu] = useState(false);
  
  const [activeHotspot, setActiveHotspot] = useState<Hotspot | null>(null);
  const [visibleHotspotIds, setVisibleHotspotIds] = useState<string[]>([]);

  const [showTranscript, setShowTranscript] = useState(true);
  const [showNotes, setShowNotes] = useState(false);
  const [currentNote, setCurrentNote] = useState("");
  const [notes, setNotes] = useState<Note[]>([]);
  const [bookmarks, setBookmarks] = useState<BookmarkData[]>([]);

  let controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const formatTime = (timeInSeconds: number): string => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Video Event Handlers
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => setDuration(video.duration);
    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);
    const handleVolumeChange = () => {
      setVolume(video.volume);
      setIsMuted(video.muted);
    };
    const handleEnterPip = () => setIsPip(true);
    const handleLeavePip = () => setIsPip(false);

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('volumechange', handleVolumeChange);
    video.addEventListener('enterpictureinpicture', handleEnterPip);
    video.addEventListener('leavepictureinpicture', handleLeavePip);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended',handleEnded);
      video.removeEventListener('volumechange', handleVolumeChange);
      video.removeEventListener('enterpictureinpicture', handleEnterPip);
      video.removeEventListener('leavepictureinpicture', handleLeavePip);
    };
  }, []);

  // Controls Visibility
  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
    }
  }, [isPlaying]);

  const handleMouseLeave = () => {
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 500);
    }
  };
  
  useEffect(() => {
    if (!isPlaying) {
      setShowControls(true);
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    } else {
       handleMouseMove(); // Start timer if playing
    }
  }, [isPlaying, handleMouseMove]);


  // Hotspot Visibility
  useEffect(() => {
    const currentVisible: string[] = [];
    hotspots.forEach(hotspot => {
      if (currentTime >= hotspot.time && currentTime < hotspot.time + hotspot.duration) {
        currentVisible.push(hotspot.id);
      }
    });
    setVisibleHotspotIds(currentVisible);
  }, [currentTime, hotspots]);

  // Player Actions
  const togglePlayPause = () => {
    if (videoRef.current) {
      videoRef.current.paused ? videoRef.current.play() : videoRef.current.pause();
    }
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (videoRef.current) {
      const newTime = parseFloat(e.target.value);
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleVolumeSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (videoRef.current) {
      const newVolume = parseFloat(e.target.value);
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      videoRef.current.muted = newVolume === 0;
      setIsMuted(newVolume === 0);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
      if (!videoRef.current.muted && videoRef.current.volume === 0) {
        videoRef.current.volume = 0.1; // Restore to a low volume if unmuting from 0
      }
    }
  };

  const toggleFullScreen = useCallback(() => {
    const container = playerContainerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen().catch(err => {
        alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
      setIsFullScreen(true);
    } else {
      document.exitFullscreen();
      setIsFullScreen(false);
    }
  }, []);
  
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);


  const togglePip = async () => {
    if (videoRef.current) {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        setIsPip(false);
      } else if (document.pictureInPictureEnabled) {
        await videoRef.current.requestPictureInPicture();
        setIsPip(true);
      }
    }
  };

  const handleSubtitleSelect = (sub: SubtitleTrack | null) => {
    setSelectedSubtitle(sub);
    setShowSubtitleMenu(false);
    setShowSettingsMenu(false);
    // In a real app, you'd load the VTT track here.
    // For demo, we'll use this state to show overlay text.
  };
  
  const getCurrentSubtitleText = (): string | null => {
    if (!selectedSubtitle || !videoRef.current) return null;
    const currentVidTime = videoRef.current.currentTime;
    const activeLine = transcript.find(line => currentVidTime >= line.startTime && currentVidTime <= line.endTime);
    if (!activeLine) return null;

    if (selectedSubtitle.lang === 'en') return activeLine.textEn;
    if (selectedSubtitle.lang === 'km') return activeLine.textKh;
    if (selectedSubtitle.lang === 'phonetic') return `[Phonetic: ${activeLine.textEn}]`; // Placeholder for phonetic
    return null;
  };


  // Transcript Interaction
  const handleTranscriptLineClick = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
      if(videoRef.current.paused) videoRef.current.play();
    }
  };

  // Notes
  const handleAddNote = () => {
    if (currentNote.trim() === "") return;
    const newNote: Note = {
      id: `note-${Date.now()}`,
      time: Math.floor(currentTime),
      text: currentNote,
    };
    setNotes(prev => [...prev, newNote]);
    setCurrentNote("");
    if(notesTextareaRef.current) notesTextareaRef.current.focus();
  };

  // Bookmarks
  const handleAddBookmark = () => {
    const newBookmark: BookmarkData = {
      id: `bookmark-${Date.now()}`,
      time: Math.floor(currentTime),
      label: `${language === 'en' ? 'Bookmark at' : 'ចំណាំនៅ'} ${formatTime(currentTime)}`,
    };
    // Avoid duplicate bookmarks at the exact same second
    if (!bookmarks.find(b => b.time === newBookmark.time)) {
      setBookmarks(prev => [...prev, newBookmark].sort((a,b) => a.time - b.time));
    }
  };
  
  const handleBookmarkClick = (time:number) => {
    if(videoRef.current) {
        videoRef.current.currentTime = time;
    }
  }

  const playerUiClasses = darkMode ? 'bg-navy-dark text-white-pure' : 'bg-white text-navy';
  const controlPanelClasses = darkMode 
    ? 'bg-navy-dark/80 backdrop-blur-md border-t border-white-pure/10' 
    : 'bg-white/80 backdrop-blur-md border-t border-gray-200';
  const buttonClasses = `p-2 rounded-full transition-colors ${darkMode ? 'hover:bg-white-pure/20' : 'hover:bg-navy/10'}`;
  const menuClasses = `${darkMode ? 'bg-navy-light border-white-pure/10' : 'bg-white border-gray-200'} absolute bottom-14 right-2 p-2 rounded-lg shadow-xl border z-20 w-48`;

  const currentTranscriptLineId = transcript.find(line => currentTime >= line.startTime && currentTime <= line.endTime)?.id;

  return (
    <div ref={playerContainerRef} className={`w-full max-w-4xl mx-auto rounded-lg overflow-hidden shadow-2xl ${playerUiClasses} flex flex-col md:flex-row h-[700px] md:h-[500px] lg:h-[600px]`}>
      {/* Video Area */}
      <div 
        className="relative w-full md:w-2/3 h-1/2 md:h-full bg-black"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={togglePlayPause} // Click on video to play/pause
      >
        <video ref={videoRef} src={videoSrc} className="w-full h-full object-contain" />

        {/* Hotspots */}
        {visibleHotspotIds.map(id => {
          const hotspot = hotspots.find(h => h.id === id);
          if (!hotspot) return null;
          return (
            <motion.button
              key={hotspot.id}
              className={`absolute w-8 h-8 rounded-full bg-primary/70 backdrop-blur-sm flex items-center justify-center text-white shadow-lg animate-pulse z-10`}
              style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
              onClick={(e) => { e.stopPropagation(); setActiveHotspot(hotspot); }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              whileHover={{ scale: 1.2, backgroundColor: 'rgba(80, 200, 120, 0.9)'}} /* primary/90 */
            >
              <Info size={18} />
            </motion.button>
          );
        })}

        {/* Custom Subtitle Overlay */}
        {selectedSubtitle && getCurrentSubtitleText() && !isPip && (
          <AnimatePresence>
          <motion.div 
            key={currentTime} // Re-trigger animation on text change
            className="absolute bottom-20 left-1/2 -translate-x-1/2 p-2 bg-black/60 text-white text-center rounded-md text-sm md:text-base z-10 w-3/4"
            initial={{ opacity: 0, y:10 }}
            animate={{ opacity: 1, y:0 }}
            exit={{ opacity:0, y:10}}
            transition={{duration: 0.2}}
          >
            {getCurrentSubtitleText()}
          </motion.div>
          </AnimatePresence>
        )}

        {/* Controls */}
        <AnimatePresence>
          {showControls && !isPip && (
            <motion.div
              className={`absolute bottom-0 left-0 right-0 p-3 md:p-4 z-20 ${controlPanelClasses}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()} // Prevent click bubbling to video
            >
              {/* Progress Bar */}
              <div className="relative mb-2 group">
                <input
                  ref={progressRef}
                  type="range"
                  min="0"
                  max={duration || 0}
                  value={currentTime}
                  onChange={handleProgressChange}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gray-300/50 dark:bg-gray-700/50 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-none"
                />
                {/* Bookmarks on progress bar */}
                {bookmarks.map(bm => (
                  <div 
                    key={bm.id} 
                    title={bm.label}
                    className="absolute w-2 h-2 bg-accent-orange rounded-full -top-0 transform -translate-x-1/2 cursor-pointer group-hover:w-3 group-hover:h-3 transition-all" 
                    style={{ left: `${(bm.time / duration) * 100}%` }}
                    onClick={() => handleBookmarkClick(bm.time)}
                  />
                ))}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 md:space-x-3">
                  <button onClick={togglePlayPause} className={buttonClasses}>
                    {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                  </button>
                  <div className="flex items-center">
                    <button onClick={toggleMute} className={buttonClasses}>
                      {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeSliderChange}
                      className="w-16 md:w-20 h-1.5 rounded-lg appearance-none cursor-pointer bg-gray-300/70 dark:bg-gray-600/70 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-none"
                    />
                  </div>
                  <span className="text-xs md:text-smtabular-nums">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                <div className="flex items-center space-x-2 md:space-x-3">
                  <button onClick={handleAddBookmark} className={buttonClasses} title={language === 'en' ? 'Add Bookmark' : 'បន្ថែមចំណាំ'}>
                    <Bookmark size={18} />
                  </button>
                  {document.pictureInPictureEnabled && (
                    <button onClick={togglePip} className={buttonClasses} title={language === 'en' ? 'Picture-in-Picture' : 'រូបភាពក្នុងរូបភាព'}>
                      {isPip ? <CornerDownLeft size={18} /> : <Tv2 size={18} />}
                    </button>
                  )}
                  <div className="relative">
                    <button onClick={() => {setShowSettingsMenu(s => !s); setShowSubtitleMenu(false);}} className={buttonClasses} title={language === 'en' ? 'Settings' : 'ការកំណត់'}>
                      <Settings size={18} />
                    </button>
                    {showSettingsMenu && (
                        <div className={menuClasses}>
                            <button 
                                onClick={() => {setShowSubtitleMenu(s => !s); setShowSettingsMenu(true);}}
                                className={`w-full text-left px-3 py-2 text-sm rounded-md flex justify-between items-center ${darkMode ? 'hover:bg-white-pure/10' : 'hover:bg-navy/5'}`}
                            >
                                <span>{language === 'en' ? 'Subtitles' : 'ចំណងជើងរង'}</span>
                                <ChevronRight size={16} />
                            </button>
                            {/* Add other settings like playback speed here */}
                        </div>
                    )}
                    {showSubtitleMenu && (
                         <div className={`${menuClasses} right-full mr-1 bottom-0 md:bottom-14 md:mr-0 md:right-2`}>
                            <button onClick={() => handleSubtitleSelect(null)}  className={`w-full text-left px-3 py-2 text-sm rounded-md flex justify-between items-center ${darkMode ? 'hover:bg-white-pure/10' : 'hover:bg-navy/5'} ${!selectedSubtitle ? (darkMode ? 'bg-primary/30' : 'bg-primary/20') : ''}`}>
                                <span>{language === 'en' ? 'Off' : 'បិទ'}</span>
                                {!selectedSubtitle && <Check size={16} className="text-primary"/>}
                            </button>
                            {subtitles.map(sub => (
                                <button key={sub.id} onClick={() => handleSubtitleSelect(sub)} className={`w-full text-left px-3 py-2 text-sm rounded-md flex justify-between items-center ${darkMode ? 'hover:bg-white-pure/10' : 'hover:bg-navy/5'} ${selectedSubtitle?.id === sub.id ? (darkMode ? 'bg-primary/30' : 'bg-primary/20') : ''}`}>
                                    <span>{language === 'en' ? sub.label : sub.labelKh}</span>
                                    {selectedSubtitle?.id === sub.id && <Check size={16} className="text-primary"/>}
                                </button>
                            ))}
                        </div>
                    )}
                  </div>
                  <button onClick={toggleFullScreen} className={buttonClasses} title={language === 'en' ? 'Fullscreen' : 'ពេញអេក្រង់'}>
                    {isFullScreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Side Panel (Transcript/Notes) */}
      <div className={`w-full md:w-1/3 h-1/2 md:h-full flex flex-col border-l ${darkMode ? 'border-white-pure/10' : 'border-gray-200'}`}>
        <div className={`flex border-b ${darkMode ? 'border-white-pure/10' : 'border-gray-200'}`}>
          <button 
            onClick={() => { setShowTranscript(true); setShowNotes(false); }}
            className={`flex-1 py-2 px-3 text-sm font-medium flex items-center justify-center space-x-1 transition-colors ${showTranscript ? (darkMode ? 'bg-white-pure/5 text-primary' : 'bg-gray-100 text-primary') : (darkMode ? 'hover:bg-white-pure/5' : 'hover:bg-gray-50') }`}
          >
            <List size={16} />
            <span>{language === 'en' ? 'Transcript' : 'អក្សរជំនួយ'}</span>
          </button>
          <button 
            onClick={() => { setShowNotes(true); setShowTranscript(false); }}
            className={`flex-1 py-2 px-3 text-sm font-medium flex items-center justify-center space-x-1 transition-colors ${showNotes ? (darkMode ? 'bg-white-pure/5 text-primary' : 'bg-gray-100 text-primary') : (darkMode ? 'hover:bg-white-pure/5' : 'hover:bg-gray-50') }`}
          >
            <StickyNote size={16} />
            <span>{language === 'en' ? 'Notes' : 'កំណត់ចំណាំ'}</span>
          </button>
        </div>

        {/* Transcript Panel */}
        <AnimatePresence mode="wait">
        {showTranscript && (
          <motion.div 
            key="transcript"
            className="flex-grow overflow-y-auto p-3 space-y-1 scrollbar-luxury"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            {transcript.map((line) => (
              <div
                key={line.id}
                onClick={() => handleTranscriptLineClick(line.startTime)}
                className={`p-2 rounded-md cursor-pointer text-sm transition-all duration-150 ${
                  currentTranscriptLineId === line.id
                    ? (darkMode ? 'bg-primary/20 text-primary-light' : 'bg-primary/10 text-primary-dark')
                    : (darkMode ? 'hover:bg-white-pure/5' : 'hover:bg-gray-50')
                } ${language === 'km' ? 'khmer' : ''}`}
              >
                <p className={darkMode ? 'text-white-pure/90' : 'text-navy/90'}>{language === 'en' ? line.textEn : line.textKh}</p>
                {language === 'en' && <p className={`text-xs ${darkMode ? 'text-white-pure/60' : 'text-navy/60'} khmer`}>{line.textKh}</p>}
              </div>
            ))}
          </motion.div>
        )}
        </AnimatePresence>

        {/* Notes Panel */}
        <AnimatePresence mode="wait">
        {showNotes && (
          <motion.div 
            key="notes"
            className="flex-grow flex flex-col p-3"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <div className="flex-grow overflow-y-auto mb-2 space-y-2 scrollbar-luxury">
                {notes.sort((a,b) => a.time - b.time).map(note => (
                    <div key={note.id} className={`p-2 rounded-md text-sm ${darkMode ? 'bg-white-pure/5' : 'bg-gray-50'}`}>
                        <button onClick={() => handleTranscriptLineClick(note.time)} className={`font-semibold text-primary text-xs hover:underline`}>@{formatTime(note.time)}</button>
                        <p className="whitespace-pre-wrap">{note.text}</p>
                    </div>
                ))}
            </div>
            <textarea
              ref={notesTextareaRef}
              value={currentNote}
              onChange={(e) => setCurrentNote(e.target.value)}
              placeholder={language === 'en' ? `Add a note at ${formatTime(currentTime)}...` : `បន្ថែមចំណាំនៅ ${formatTime(currentTime)}...`}
              className={`w-full p-2 border rounded-md text-sm resize-none h-24 ${darkMode ? 'bg-navy-light border-white-pure/20 placeholder-white-pure/50' : 'bg-white border-gray-300 placeholder-gray-400'}`}
            />
            <button 
                onClick={handleAddNote} 
                className={`mt-2 w-full btn btn-primary text-sm`}
                disabled={currentNote.trim() === ""}
            >
              {language === 'en' ? 'Add Note' : 'បន្ថែមចំណាំ'}
            </button>
          </motion.div>
        )}
        </AnimatePresence>
      </div>

      {/* Hotspot Modal */}
      <AnimatePresence>
        {activeHotspot && (
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-30 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveHotspot(null)}
          >
            <motion.div
              className={`p-6 rounded-lg shadow-xl max-w-md w-full ${darkMode ? 'bg-navy-light border border-white-pure/10' : 'bg-white border border-gray-200'}`}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-3">
                <h3 className={`text-lg font-bold ${language === 'km' ? 'khmer' : ''}`}>{language === 'en' ? activeHotspot.titleEn : activeHotspot.titleKh}</h3>
                <button onClick={() => setActiveHotspot(null)} className={buttonClasses}><X size={18} /></button>
              </div>
              <p className={`text-sm ${language === 'km' ? 'khmer' : ''} ${darkMode ? 'text-white-pure/80' : 'text-navy/80'}`}>
                {language === 'en' ? activeHotspot.contentEn : activeHotspot.contentKh}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VideoLearningPlayer;
