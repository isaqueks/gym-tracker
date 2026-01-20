import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Dumbbell, Flame, Target, TrendingUp, Plus, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Workout, Stats } from '../types';

export default function Home() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [activeWorkouts, setActiveWorkouts] = useState<Workout[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsRes, workoutsRes] = await Promise.all([
        api.get<Stats>('/tracker/stats'),
        api.get<Workout[]>('/workouts', { params: { active: true } }),
      ]);
      setStats(statsRes.data);
      setActiveWorkouts(workoutsRes.data.slice(0, 3));
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const logWorkout = async (workoutId: string) => {
    try {
      await api.post('/tracker/log', {
        workoutId,
        loggedDate: new Date().toISOString().split('T')[0],
      });
      loadData();
    } catch (error) {
      console.error('Error logging workout:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-4 pt-safe">
      {/* Header */}
      <header className="py-6">
        <p className="text-dark-400 text-sm">Olá,</p>
        <h1 className="text-2xl font-bold text-white">{user?.name || 'Atleta'}</h1>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
              <Flame size={20} className="text-orange-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats?.currentStreak || 0}</p>
              <p className="text-xs text-dark-400">Dias seguidos</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center">
              <Target size={20} className="text-primary-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats?.totalThisMonth || 0}</p>
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
              <p className="text-2xl font-bold text-white">{stats?.weeklyFrequency?.toFixed(1) || 0}</p>
              <p className="text-xs text-dark-400">Média semanal</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <Dumbbell size={20} className="text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats?.totalWorkouts || 0}</p>
              <p className="text-xs text-dark-400">Total treinos</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Log Section */}
      <section className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Treinar Agora</h2>
          <Link
            to="/workouts"
            className="text-primary-400 text-sm font-medium flex items-center gap-1"
          >
            Ver todos <ChevronRight size={16} />
          </Link>
        </div>

        {activeWorkouts.length === 0 ? (
          <div className="card flex flex-col items-center justify-center py-8">
            <Dumbbell size={40} className="text-dark-600 mb-3" />
            <p className="text-dark-400 text-center mb-4">
              Você ainda não tem treinos ativos
            </p>
            <Link
              to="/workouts/new"
              className="flex items-center gap-2 bg-primary-500 text-white px-4 py-2 rounded-xl font-medium"
            >
              <Plus size={18} />
              Criar Treino
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {activeWorkouts.map((workout) => (
              <div
                key={workout.id}
                className="card flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500/20 to-primary-600/20 flex items-center justify-center">
                    <Dumbbell size={22} className="text-primary-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{workout.name}</h3>
                    <p className="text-xs text-dark-400">
                      {workout.exercises?.length || 0} exercícios
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => logWorkout(workout.id)}
                  className="bg-primary-500 text-white px-4 py-2 rounded-xl font-medium text-sm hover:bg-primary-600 transition-colors"
                >
                  Registrar
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Motivational Banner */}
      <div className="card bg-gradient-to-br from-primary-600 to-primary-800 border-0">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
            <Flame size={28} className="text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-lg">
              {stats?.currentStreak && stats.currentStreak >= 7
                ? 'Incrível! 🔥'
                : 'Continue assim!'}
            </h3>
            <p className="text-primary-100 text-sm">
              {stats?.currentStreak && stats.currentStreak >= 7
                ? `${stats.currentStreak} dias de treino consecutivo!`
                : 'Cada treino conta para seu progresso'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


