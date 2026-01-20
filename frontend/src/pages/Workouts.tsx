import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus,
  Dumbbell,
  Sparkles,
  MoreVertical,
  Trash2,
  Power,
  Edit,
} from 'lucide-react';
import api from '../services/api';
import { Workout } from '../types';
import ConfirmModal from '../components/ConfirmModal';
import Toast from '../components/Toast';
import { useToast } from '../hooks/useToast';

export default function Workouts() {
  const navigate = useNavigate();
  const { toast, showToast, hideToast } = useToast();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    loadWorkouts();
  }, [filter]);

  const loadWorkouts = async () => {
    try {
      const params: Record<string, boolean | undefined> = {};
      if (filter === 'active') params.active = true;
      if (filter === 'inactive') params.active = false;

      const response = await api.get<Workout[]>('/workouts', { params });
      setWorkouts(response.data);
    } catch (error) {
      console.error('Error loading workouts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleWorkout = async (id: string) => {
    try {
      await api.patch(`/workouts/${id}/toggle`);
      loadWorkouts();
      setMenuOpen(null);
      showToast('Treino atualizado!', 'success');
    } catch (error) {
      console.error('Error toggling workout:', error);
      showToast('Erro ao atualizar treino', 'error');
    }
  };

  const handleDeleteClick = (id: string) => {
    setMenuOpen(null);
    setDeleteConfirm(id);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;

    try {
      await api.delete(`/workouts/${deleteConfirm}`);
      loadWorkouts();
      showToast('Treino excluído com sucesso!', 'success');
    } catch (error) {
      console.error('Error deleting workout:', error);
      showToast('Erro ao excluir treino', 'error');
    } finally {
      setDeleteConfirm(null);
    }
  };

  const workoutToDelete = workouts.find((w) => w.id === deleteConfirm);

  return (
    <div className="px-4 pt-safe">
      <Toast {...toast} onClose={hideToast} />
      
      <ConfirmModal
        isOpen={!!deleteConfirm}
        title="Excluir treino"
        message={`Tem certeza que deseja excluir "${workoutToDelete?.name || 'este treino'}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm(null)}
      />

      {/* Header */}
      <header className="py-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Meus Treinos</h1>
        <Link
          to="/workouts/new"
          className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30"
        >
          <Plus size={22} className="text-white" />
        </Link>
      </header>

      {/* Filter */}
      <div className="flex gap-2 mb-6">
        {[
          { key: 'all', label: 'Todos' },
          { key: 'active', label: 'Ativos' },
          { key: 'inactive', label: 'Inativos' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key as typeof filter)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              filter === key
                ? 'bg-primary-500 text-white'
                : 'bg-dark-800 text-dark-400 hover:bg-dark-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Workouts List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-[40vh]">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : workouts.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[40vh]">
          <Dumbbell size={48} className="text-dark-600 mb-4" />
          <p className="text-dark-400 text-center mb-6">
            {filter === 'all'
              ? 'Você ainda não criou nenhum treino'
              : `Nenhum treino ${filter === 'active' ? 'ativo' : 'inativo'}`}
          </p>
          <Link
            to="/workouts/new"
            className="flex items-center gap-2 bg-primary-500 text-white px-6 py-3 rounded-xl font-medium"
          >
            <Plus size={20} />
            Criar Treino
          </Link>
        </div>
      ) : (
        <div className="space-y-3 pb-6">
          {workouts.map((workout) => (
            <div
              key={workout.id}
              className={`card relative ${!workout.isActive ? 'opacity-60' : ''}`}
            >
              <div
                className="flex items-start gap-3 cursor-pointer"
                onClick={() => navigate(`/workouts/${workout.id}`)}
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    workout.aiGenerated
                      ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20'
                      : 'bg-gradient-to-br from-primary-500/20 to-primary-600/20'
                  }`}
                >
                  {workout.aiGenerated ? (
                    <Sparkles size={22} className="text-purple-400" />
                  ) : (
                    <Dumbbell size={22} className="text-primary-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white truncate">
                    {workout.name}
                  </h3>
                  {workout.description && (
                    <p className="text-sm text-dark-400 truncate">
                      {workout.description}
                    </p>
                  )}
                  <p className="text-xs text-dark-500 mt-1">
                    {workout.exercises?.length || 0} exercícios
                    {!workout.isActive && ' • Inativo'}
                  </p>
                </div>
              </div>

              {/* Menu Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(menuOpen === workout.id ? null : workout.id);
                }}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-dark-700 transition-colors"
              >
                <MoreVertical size={18} className="text-dark-400" />
              </button>

              {/* Dropdown Menu */}
              {menuOpen === workout.id && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setMenuOpen(null)}
                  />
                  <div className="absolute top-12 right-4 bg-dark-700 rounded-xl shadow-xl border border-dark-600 overflow-hidden z-20 animate-scale-in">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/workouts/${workout.id}`);
                      }}
                      className="flex items-center gap-3 px-4 py-3 w-full text-left hover:bg-dark-600 transition-colors"
                    >
                      <Edit size={16} className="text-dark-400" />
                      <span className="text-sm text-white">Editar</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWorkout(workout.id);
                      }}
                      className="flex items-center gap-3 px-4 py-3 w-full text-left hover:bg-dark-600 transition-colors"
                    >
                      <Power size={16} className="text-dark-400" />
                      <span className="text-sm text-white">
                        {workout.isActive ? 'Desativar' : 'Ativar'}
                      </span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(workout.id);
                      }}
                      className="flex items-center gap-3 px-4 py-3 w-full text-left hover:bg-dark-600 transition-colors text-red-400"
                    >
                      <Trash2 size={16} />
                      <span className="text-sm">Excluir</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
