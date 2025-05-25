import React, { useState, useEffect, useRef } from 'react';
import { 
  FaBookOpen, FaTasks, FaChartPie, FaCalendarAlt, FaQuoteLeft, FaSyncAlt, FaMapMarkerAlt, FaSpinner, 
  FaChevronLeft, FaChevronRight, FaPlus, FaTrash, FaCircle, FaCheckCircle, FaClipboardList, 
  FaSun, FaCloudSun, FaCloud, FaCloudRain, FaBolt, FaSnowflake, FaSmog, FaQuestion, FaClock
} from 'react-icons/fa';
import "./App.css"
import quotesData from "../src/data/quotes.json";

const App = () => {
  // State
  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem('tasks');
    return savedTasks ? JSON.parse(savedTasks) : [];
  });
  const [taskInput, setTaskInput] = useState('');
  const [taskType, setTaskType] = useState('study');
  const [quote, setQuote] = useState({ text: 'Loading motivational quote...', author: '- Author' });
  const [weather, setWeather] = useState({
    city: 'Loading...',
    temperature: '--°C',
    description: '--',
    icon: <FaSpinner className="animate-spin" />
  });
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Refs
  const draggedItemRef = useRef(null);

  // Derived state
  const completedTasks = tasks.filter(task => task.completed).length;
  const completionPercentage = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;

  // Load data on component mount
  useEffect(() => {
    fetchMotivationalQuote();
    getWeather();
    
    // Set up clock interval
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  // Save tasks to localStorage when they change
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Task form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (taskInput.trim()) {
      const newTask = {
        id: Date.now(),
        text: taskInput.trim(),
        type: taskType,
        completed: false,
        createdAt: new Date().toISOString()
      };
      
      setTasks([...tasks, newTask]);
      setTaskInput('');
    }
  };

  // Toggle task completion
  const toggleTaskComplete = (taskId) => {
    setTasks(tasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  // Delete task
  const deleteTask = (taskId) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

// Fetch motivational quote
const fetchMotivationalQuote = () => {
  setQuote({ text: 'Loading motivational quote...', author: '- Author' });

  try {
    const randomIndex = Math.floor(Math.random() * quotesData.length);
    const randomQuote = quotesData[randomIndex];
    setQuote({ 
      text: randomQuote.text, 
      author: randomQuote.author 
    });
  } catch {
    const fallbackQuotes = [
      { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
      { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
      { text: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier" }
    ];
    const randomQuote = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
    setQuote({ text: randomQuote.text, author: randomQuote.author });
  }
};



  // Weather functions
  const getWeather = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude } = position.coords;
          fetch(`https://api.weatherapi.com/v1/current.json?key=3f189dd2e7204680a19184315252105&q=${latitude},${longitude}&aqi=no`)
            .then(response => response.json())
            .then(data => {
              if (data?.current && data?.location) {
                displayWeather(data);
              } else {
                mockWeatherResponse();
              }
            })
            .catch(mockWeatherResponse);
        },
        mockWeatherResponse
      );
    } else {
      mockWeatherResponse();
    }
  };

  const mockWeatherResponse = () => {
    const mockData = {
      location: { name: "New York" },
      current: {
        temp_c: 22,
        condition: {
          text: "Partly cloudy",
          icon: "//cdn.weatherapi.com/weather/64x64/day/116.png"
        }
      }
    };
    displayWeather(mockData);
  };

  const getWeatherIcon = (weatherCode) => {
    if (weatherCode.includes('01')) return <FaSun />;
    if (weatherCode.includes('02')) return <FaCloudSun />;
    if (weatherCode.includes('03') || weatherCode.includes('04')) return <FaCloud />;
    if (weatherCode.includes('09') || weatherCode.includes('10')) return <FaCloudRain />;
    if (weatherCode.includes('11')) return <FaBolt />;
    if (weatherCode.includes('13')) return <FaSnowflake />;
    if (weatherCode.includes('50')) return <FaSmog />;
    if (weatherCode.includes('99')) return <FaQuestion />;

    return <FaSun />;
  };

  const displayWeather = (data) => {
    const iconUrl = data.current.condition.icon;
    const weatherCode = iconUrl?.match(/(\d{2,3})\.png$/)?.[1] || "";
    setWeather({
      city: data.location.name,
      temperature: `${Math.round(data.current.temp_c)}°C`,
      description: data.current.condition.text,
      icon: getWeatherIcon(weatherCode)
    });
  };

  // Calendar functions
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const renderCalendar = () => {
    const currentYear = calendarDate.getFullYear();
    const currentMonth = calendarDate.getMonth();
    const now = new Date();
    const isCurrentMonth = now.getFullYear() === currentYear && now.getMonth() === currentMonth;
    const currentDate = now.getDate();

    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    const emptyDays = [];
    for (let i = 0; i < firstDay; i++) {
      emptyDays.push(<div key={`empty-${i}`}>&nbsp;</div>);
    }

    const days = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const isToday = isCurrentMonth && d === currentDate;
      days.push(
        <div 
          key={`day-${d}`}
          className={`flex items-center justify-center w-8 h-8 rounded-full cursor-pointer transition ${
            isToday 
              ? 'bg-indigo-600 text-white font-bold ring-2 ring-indigo-400' 
              : 'hover:bg-indigo-100'
          }`}
        >
          {d}
        </div>
      );
    }

    return [...emptyDays, ...days];
  };

  const prevMonth = () => {
    const newDate = new Date(calendarDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setCalendarDate(newDate);
  };

  const nextMonth = () => {
    const newDate = new Date(calendarDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setCalendarDate(newDate);
  };

  // Drag and drop functions
  const handleDragStart = (e, taskId) => {
    console.log('Drag start:', taskId);
    draggedItemRef.current = taskId;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', taskId.toString());
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e, targetTaskId) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Drop on:', targetTaskId);
    const draggedTaskIdStr = e.dataTransfer.getData('text/plain');
    const draggedTaskId = draggedTaskIdStr ? parseInt(draggedTaskIdStr, 10) : null;
    console.log('Dragged task id:', draggedTaskId);
    if (!draggedTaskId || draggedTaskId === targetTaskId) return;

    const draggedIndex = tasks.findIndex(task => task.id === draggedTaskId);
    const targetIndex = tasks.findIndex(task => task.id === targetTaskId);
    if (draggedIndex === -1 || targetIndex === -1) return;

    const newTasks = [...tasks];
    const [removed] = newTasks.splice(draggedIndex, 1);
    newTasks.splice(targetIndex, 0, removed);

    setTasks(newTasks);
    draggedItemRef.current = null;
  };

  const handleDragEnd = () => {
    console.log('Drag end');
    draggedItemRef.current = null;
  };

  // Helper functions
  const getTagClass = (type) => {
    switch (type) {
      case 'study': return 'study-tag';
      case 'break': return 'break-tag';
      case 'revision': return 'revision-tag';
      default: return 'bg-gray-200 text-gray-800';
    }
  };

  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  const formatTime = (date, timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
      timeZone
    });
  };

  const formatDate = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
  };

  // Render tasks in current order without sorting to preserve drag and drop order
  const sortedTasks = tasks;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header with weather*/}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center">
              <FaBookOpen className="text-indigo-600 mr-3" />
              Zendy
            </h1>
            <p className="text-gray-600">Your daily study companion</p>
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-4">
            {/* Weather */}
            <div className="weather-card rounded-lg shadow-md p-4 text-white w-full md:w-auto">
              <div className="flex items-center justify-between gap-5">
                <div>
                  <div className="flex items-center">
                    <FaMapMarkerAlt className="mr-2" />
                    <span id="city" className="font-semibold">{weather.city}</span>
                  </div>
                  <div id="date" className="text-sm opacity-90">
                    {new Date().toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </div>
                </div>
                <div className="flex items-center">
                  <div id="weather-icon" className="text-4xl mr-3">
                    {weather.icon}
                  </div>
                  <div>
                    <div id="temperature" className="text-2xl font-bold">{weather.temperature}</div>
                    <div id="weather-description" className="text-xs capitalize">{weather.description}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Quote and stats */}
          <div className="lg:col-span-1 space-y-6">
            {/* Motivational quote */}
            <div className="quote-container rounded-xl shadow-md p-6 text-white">
              <div className="flex items-start">
                <FaQuoteLeft className="text-white opacity-50 text-2xl mr-3 mt-1" />
                <div>
                  <p id="quote-text" className="text-lg font-medium">{quote.text}</p>
                  <p id="quote-author" className="text-right text-sm opacity-80 mt-2">- {quote.author}</p>
                </div>
              </div>
              <button 
                id="new-quote-btn" 
                className="mt-4 bg-white text-indigo-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-100 transition"
                onClick={fetchMotivationalQuote}
              >
                <FaSyncAlt className="mr-2 inline" /> New Quote
              </button>
            </div>
            
            {/* Stats */}
            <div className="bg-white rounded-xl shadow-md p-6">
            
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                <FaChartPie className="text-indigo-600 mr-2" />
                Today's Progress
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Tasks Completed</span>
                    <span id="completed-count">{completedTasks} / {tasks.length}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      id="completed-bar" 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${completionPercentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
            </div>

             {/* Digital Clock */}
            <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-lg shadow-md px-8 py-3 flex items-center  font-mono text-2xl font-bold text-white tracking-widest border border-indigo-200">
              <FaClock className="mr-3 text-white opacity-80" />
              {formatTime(currentTime)}
            </div>
            
            {/* Calendar */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                <FaCalendarAlt className="text-indigo-600 mr-2" />
                Calendar
              </h3>
              <div className="flex justify-between items-center mb-2">
                <button 
                  id="prev-month" 
                  className="px-2 py-1 rounded hover:bg-indigo-100 text-indigo-600"
                  onClick={prevMonth}
                >
                  <FaChevronLeft />
                </button>
                <span id="calendar-month-title" className="font-semibold text-indigo-700">
                  {monthNames[calendarDate.getMonth()]} {calendarDate.getFullYear()}
                </span>
                <button 
                  id="next-month" 
                  className="px-2 py-1 rounded hover:bg-indigo-100 text-indigo-600"
                  onClick={nextMonth}
                >
                  <FaChevronRight />
                </button>
              </div>
              <div id="calendar-container" className="grid grid-cols-7 text-xs text-gray-500 mb-1">
                {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(day => (
                  <div key={day}>{day}</div>
                ))}
                {renderCalendar()}
              </div>
            </div>
          </div>
          
          {/* Right column - Tasks */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="font-semibold text-gray-800 text-xl flex items-center">
                  <FaTasks className="text-indigo-600 mr-3" />
                  Today's Study Plan
                </h2>
                
                {/* Add task form */}
                <form id="task-form" className="mt-4 flex" onSubmit={handleSubmit}>
                  <input 
                    type="text" 
                    id="task-input" 
                    placeholder="Add a new task (e.g. 'Review Calculus Chapter 3')" 
                    className="flex-1 border border-gray-300 rounded-l-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                    value={taskInput}
                    onChange={(e) => setTaskInput(e.target.value)}
                  />
                  <div className="relative ml-2">
                    <select 
                      id="task-type" 
                      className="appearance-none border border-gray-300 border-l-0 px-4 py-2 pr-8 rounded-r-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                      value={taskType}
                      onChange={(e) => setTaskType(e.target.value)}
                    >
                      <option value="study">Study</option>
                      <option value="revision">Revision</option>
                      <option value="other">Other</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <i className="fas fa-chevron-down"></i>
                    </div>
                  </div>
                  <button 
                    type="submit" 
                    className="ml-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition"
                  >
                    <FaPlus />
                  </button>
                </form>
              </div>
              
              {/* Task list */}
              <div className="task-list overflow-y-auto" style={{ maxHeight: '500px' }}>
                <ul id="task-list" className="divide-y divide-gray-200">
                  {sortedTasks.length === 0 ? (
                    <li className="p-4 text-center text-gray-500" id="empty-state">
                      No tasks for today. Add a new task!
                    </li>
                  ) : (
                    sortedTasks.map(task => (
                      <li 
                        key={task.id}
                        className={`task-item p-4 hover:bg-gray-50 cursor-move ${
                          task.completed ? 'bg-gray-50' : 'bg-white'
                        } ${draggedItemRef.current === task.id ? 'dragging opacity-50 bg-gray-200' : ''}`}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, task.id)}
                        onDragEnd={handleDragEnd}
                      >
                        <div className="flex items-start">
                          <button 
                            className="complete-btn mr-3 mt-1 text-gray-400 hover:text-green-500 transition" 
                            data-id={task.id}
                            onClick={() => toggleTaskComplete(task.id)}
                          >
                            {task.completed ? (
                              <FaCheckCircle className="text-green-500" />
                            ) : (
                              <FaCircle />
                            )}
                          </button>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className={`${task.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                                {task.text}
                              </span>
                              <div>
                                <span className={`text-xs px-2 py-1 rounded-full ${getTagClass(task.type)}`}>
                                  {capitalizeFirstLetter(task.type)}
                                </span>
                              </div>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              Added {formatDate(task.createdAt)}
                            </div>
                          </div>
                          <button 
                            className="delete-btn ml-3 text-gray-400 hover:text-red-500 transition" 
                            data-id={task.id}
                            onClick={() => deleteTask(task.id)}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        body {
          font-family: 'Poppins', sans-serif;
          background-color: #f5f7fa;
        }
        
        .task-item {
          transition: all 0.3s ease;
        }
        
        .task-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .quote-container {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        
        .weather-card {
          background: linear-gradient(135deg, #6b73ff 0%, #000dff 100%);
        }
        
        .dragging {
          opacity: 0.5;
          background-color: #e2e8f0;
        }
        
        .study-tag {
          background-color: #c6f6d5;
          color: #22543d;
        }
        
        .other-tag {
          background-color: #fbd38d;
          color: #744210;
        }
        
        .break-tag {
          background-color: #fed7d7;
          color: #742a2a;
        }
        
        .revision-tag {
          background-color: #bee3f8;
          color: #2c5282;
        }
        
        /* Custom scrollbar */
        .task-list::-webkit-scrollbar {
          width: 6px;
        }
        
        .task-list::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        
        .task-list::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 3px;
        }
        
        .task-list::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `}</style>
    </div>
  );
};

export default App;