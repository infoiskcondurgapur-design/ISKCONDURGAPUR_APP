'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { FaCalendarAlt, FaPlus, FaEdit, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

interface Task {
  id: number;
  title: string;
  date: string;
  completed: boolean;
  color: string;
}

const STORAGE_KEY = 'iskcon_sadhana_tasks';

export default function ModernCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  // Tasks persist in the browser (localStorage) so they survive refreshes
  const [tasks, setTasks] = useState<Task[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) as Task[] : [];
    } catch {
      return [];
    }
  });
  const [showModal, setShowModal] = useState(false);
  const [newTaskDate, setNewTaskDate] = useState<string>('');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskColor, setNewTaskColor] = useState('bg-blue-400');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (err) {
      console.error('Error saving tasks:', err);
    }
  }, [tasks]);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1))));
  };

  const formatDate = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const getTasksForDate = (dateStr: string) => {
    return tasks.filter(task => task.date === dateStr);
  };

  // Open modal for a specific date
  const handleAddTask = (date: string) => {
    setNewTaskDate(date);
    setShowModal(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  // Add new task
  const handleSaveTask = () => {
    if (!newTaskTitle.trim()) return;
    setTasks([
      ...tasks,
      {
        id: Date.now(),
        title: newTaskTitle,
        date: newTaskDate,
        completed: false,
        color: newTaskColor,
      },
    ]);
    setShowModal(false);
    setNewTaskTitle('');
    setNewTaskColor('bg-blue-400');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-rose-100 pt-20">
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-3xl shadow-xl p-8">
          {/* Header Section */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full overflow-hidden">
                <Image
                  src="/images/iskcon-logo.png"
                  alt="ISKCON Logo"
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-800">Spiritual Calendar</h1>
                <p className="text-gray-500">Track your daily spiritual activities</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 hover:bg-purple-50 rounded-full"
                onClick={() => navigateMonth('prev')}
              >
                <FaChevronLeft className="text-gray-600" />
              </motion.button>
              <h2 className="text-xl font-semibold text-gray-800">
                {months[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 hover:bg-purple-50 rounded-full"
                onClick={() => navigateMonth('next')}
              >
                <FaChevronRight className="text-gray-600" />
              </motion.button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-4 mb-6">
            {days.map((day) => (
              <div key={day} className="text-sm font-medium text-gray-400 text-center py-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-4">
            {Array.from({ length: 42 }).map((_, index) => {
              const firstDay = getFirstDayOfMonth(currentDate);
              const daysInMonth = getDaysInMonth(currentDate);
              const day = index - firstDay + 1;
              const isCurrentMonth = day > 0 && day <= daysInMonth;
              const dateStr = isCurrentMonth ?
                formatDate(currentDate.getFullYear(), currentDate.getMonth(), day) : '';
              const tasksForDate = isCurrentMonth ? getTasksForDate(dateStr) : [];
              const isToday = dateStr === formatDate(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.01 }}
                  className={`relative p-2 h-24 rounded-xl border ${isCurrentMonth
                    ? isToday
                      ? 'bg-purple-50 border-purple-200'
                      : 'bg-white hover:bg-gray-50 border-gray-100'
                    : 'bg-gray-50 border-transparent'
                    }`}
                  onDoubleClick={() => isCurrentMonth && handleAddTask(dateStr)}
                  title={isCurrentMonth ? 'Double click to add a task' : ''}
                >
                  {isCurrentMonth && (
                    <>
                      <span className={`text-sm ${isToday ? 'text-purple-600 font-bold' : 'text-gray-600'
                        }`}>
                        {day}
                      </span>
                      <div className="mt-1 space-y-1">
                        {tasksForDate.map((task) => (
                          <motion.div
                            key={task.id}
                            whileHover={{ scale: 1.02 }}
                            className={`${task.color} p-1 rounded-md`}
                          >
                            <p className="text-white text-xs truncate">
                              {task.title}
                            </p>
                          </motion.div>
                        ))}
                      </div>
                      <button
                        className="absolute bottom-2 right-2 w-6 h-6 flex items-center justify-center rounded-full bg-purple-100 text-purple-600 hover:bg-purple-200 text-xs"
                        onClick={() => handleAddTask(dateStr)}
                        title="Add task"
                        tabIndex={-1}
                      >
                        <FaPlus />
                      </button>
                    </>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Add Task Modal */}
          {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md"
              >
                <h3 className="text-lg font-bold mb-4 text-gray-800">Add Task</h3>
                <input
                  ref={inputRef}
                  type="text"
                  className="w-full border rounded-lg px-4 py-2 mb-4 focus:ring-2 focus:ring-purple-300"
                  placeholder="Task title"
                  value={newTaskTitle}
                  onChange={e => setNewTaskTitle(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleSaveTask(); }}
                />
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-gray-600">Color:</span>
                  {['bg-blue-400', 'bg-pink-400', 'bg-yellow-400', 'bg-green-400', 'bg-purple-400'].map(color => (
                    <button
                      key={color}
                      className={`w-6 h-6 rounded-full border-2 ${color} ${newTaskColor === color ? 'border-black' : 'border-transparent'}`}
                      onClick={() => setNewTaskColor(color)}
                      aria-label={color}
                    />
                  ))}
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
                    onClick={() => setShowModal(false)}
                  >Cancel</button>
                  <button
                    className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700"
                    onClick={handleSaveTask}
                    disabled={!newTaskTitle.trim()}
                  >Add</button>
                </div>
              </motion.div>
            </div>
          )}

          {/* Tasks Section */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Today&apos;s Activities</h3>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 bg-purple-100 text-purple-600 rounded-full hover:bg-purple-200"
              >
                <FaPlus />
              </motion.button>
            </div>
            <div className="space-y-3">
              {tasks.map((task) => (
                <motion.div
                  key={task.id}
                  whileHover={{ scale: 1.01 }}
                  className="flex items-center justify-between p-3 bg-white rounded-xl shadow-sm border border-gray-100"
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => {
                        setTasks(tasks.map(t =>
                          t.id === task.id ? { ...t, completed: !t.completed } : t
                        ));
                      }}
                      className="w-5 h-5 text-purple-600 rounded-full focus:ring-purple-500"
                    />
                    <span className={task.completed ? 'text-gray-400 line-through' : 'text-gray-700'}>
                      {task.title}
                    </span>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="text-gray-400 hover:text-purple-600"
                  >
                    <FaEdit />
                  </motion.button>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
