import { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Flame,
  Target,
  TrendingUp,
  Award,
} from 'lucide-react';
import api from '../services/api';
import { WorkoutLog, Stats } from '../types';

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  useEffect(() => {
    loadData();
  }, [year, month]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [logsRes, statsRes] = await Promise.all([
        api.get<WorkoutLog[]>(`/tracker/calendar/${year}/${month + 1}`),
        api.get<Stats>('/tracker/stats'),
      ]);
      setLogs(logsRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error loading calendar data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDay(null);
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDay(null);
  };

  const getLogsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(
      day
    ).padStart(2, '0')}`;
    return logs.filter((log) => log.loggedDate === dateStr);
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const today = new Date();
    const isCurrentMonth =
      today.getFullYear() === year && today.getMonth() === month;
    const todayDate = today.getDate();

    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="aspect-square" />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayLogs = getLogsForDay(day);
      const hasWorkout = dayLogs.length > 0;
      const isToday = isCurrentMonth && day === todayDate;
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(
        day
      ).padStart(2, '0')}`;
      const isSelected = selectedDay === dateStr;

      days.push(
        <button
          key={day}
          onClick={() => setSelectedDay(isSelected ? null : dateStr)}
          className={`aspect-square rounded-xl flex flex-col items-center justify-center relative transition-all ${
            isSelected
              ? 'bg-primary-500 text-white'
              : isToday
              ? 'bg-dark-700 text-white ring-2 ring-primary-500'
              : 'text-white hover:bg-dark-700'
          }`}
        >
          <span className="text-sm font-medium">{day}</span>
          {hasWorkout && !isSelected && (
            <div className="absolute bottom-1.5 w-1.5 h-1.5 rounded-full bg-primary-500" />
          )}
          {hasWorkout && isSelected && (
            <span className="text-[10px] mt-0.5">{dayLogs.length}x</span>
          )}
        </button>
      );
    }

    return days;
  };

  const selectedDayLogs = selectedDay
    ? logs.filter((log) => log.loggedDate === selectedDay)
    : [];

  return (
    <div className="px-4 pt-safe pb-6">
      {/* Header */}
      <header className="py-6">
        <h1 className="text-2xl font-bold text-white">Calendário</h1>
        <p className="text-dark-400 text-sm">Acompanhe seu progresso</p>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
              <Flame size={20} className="text-orange-500" />
            </div>
            <div>
              <p className="text-xl font-bold text-white">
                {stats?.currentStreak || 0}
              </p>
              <p className="text-xs text-dark-400">Sequência atual</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
              <Award size={20} className="text-yellow-500" />
            </div>
            <div>
              <p className="text-xl font-bold text-white">
                {stats?.longestStreak || 0}
              </p>
              <p className="text-xs text-dark-400">Maior sequência</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center">
              <Target size={20} className="text-primary-500" />
            </div>
            <div>
              <p className="text-xl font-bold text-white">
                {stats?.totalThisMonth || 0}
              </p>
              <p className="text-xs text-dark-400">Este mês</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <TrendingUp size={20} className="text-blue-500" />
            </div>
            <div>
              <p className="text-xl font-bold text-white">
                {stats?.weeklyFrequency?.toFixed(1) || 0}
              </p>
              <p className="text-xs text-dark-400">Média semanal</p>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="card mb-6">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={goToPreviousMonth}
            className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-dark-700 transition-colors"
          >
            <ChevronLeft size={20} className="text-white" />
          </button>
          <h2 className="text-lg font-semibold text-white">
            {MONTHS[month]} {year}
          </h2>
          <button
            onClick={goToNextMonth}
            className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-dark-700 transition-colors"
          >
            <ChevronRight size={20} className="text-white" />
          </button>
        </div>

        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {WEEKDAYS.map((day) => (
            <div
              key={day}
              className="text-center text-xs font-medium text-dark-500 py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center h-[280px]">
            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-1">{renderCalendar()}</div>
        )}
      </div>

      {/* Selected Day Details */}
      {selectedDay && (
        <div className="card animate-slide-up">
          <h3 className="font-semibold text-white mb-3">
            {new Date(selectedDay + 'T00:00:00').toLocaleDateString('pt-BR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
          </h3>
          {selectedDayLogs.length === 0 ? (
            <p className="text-dark-400 text-sm">
              Nenhum treino registrado neste dia
            </p>
          ) : (
            <div className="space-y-2">
              {selectedDayLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center gap-3 py-2 border-b border-dark-700 last:border-0"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center">
                    <Target size={18} className="text-primary-500" />
                  </div>
                  <div>
                    <p className="font-medium text-white">
                      {log.workout?.name || 'Treino'}
                    </p>
                    {log.notes && (
                      <p className="text-xs text-dark-400">{log.notes}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}


