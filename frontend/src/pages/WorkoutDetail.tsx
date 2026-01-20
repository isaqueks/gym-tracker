import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  GripVertical,
  Dumbbell,
} from 'lucide-react';
import api from '../services/api';
import { Workout, Exercise, CreateExerciseDto } from '../types';
import Toast from '../components/Toast';
import { useToast } from '../hooks/useToast';

export default function WorkoutDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast, showToast, hideToast } = useToast();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [exercises, setExercises] = useState<
    (Exercise | CreateExerciseDto & { id?: string })[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadWorkout();
  }, [id]);

  const loadWorkout = async () => {
    try {
      const response = await api.get<Workout>(`/workouts/${id}`);
      setWorkout(response.data);
      setName(response.data.name);
      setDescription(response.data.description || '');
      setExercises(response.data.exercises || []);
    } catch (error) {
      console.error('Error loading workout:', error);
      navigate('/workouts');
    } finally {
      setIsLoading(false);
    }
  };

  const addExercise = () => {
    setExercises([
      ...exercises,
      {
        name: '',
        sets: 3,
        reps: 12,
        weight: 0,
        order: exercises.length,
      },
    ]);
  };

  const updateExercise = (
    index: number,
    field: keyof CreateExerciseDto,
    value: string | number
  ) => {
    const updated = [...exercises];
    updated[index] = { ...updated[index], [field]: value };
    setExercises(updated);
  };

  const removeExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!name.trim()) {
      showToast('Nome do treino é obrigatório', 'warning');
      return;
    }

    if (exercises.some((e) => !e.name.trim())) {
      showToast('Todos os exercícios precisam ter um nome', 'warning');
      return;
    }

    setIsSaving(true);
    try {
      await api.patch(`/workouts/${id}`, {
        name,
        description,
        exercises: exercises.map((e, i) => ({
          name: e.name,
          sets: e.sets,
          reps: e.reps,
          weight: e.weight || null,
          order: i,
        })),
      });
      showToast('Treino salvo com sucesso!', 'success');
      setTimeout(() => navigate('/workouts'), 500);
    } catch (error) {
      console.error('Error saving workout:', error);
      showToast('Erro ao salvar treino', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const logWorkout = async () => {
    try {
      await api.post('/tracker/log', {
        workoutId: id,
        loggedDate: new Date().toISOString().split('T')[0],
      });
      showToast('Treino registrado com sucesso!', 'success');
    } catch (error) {
      console.error('Error logging workout:', error);
      showToast('Erro ao registrar treino', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900">
      <Toast {...toast} onClose={hideToast} />
      {/* Header */}
      <header className="sticky top-0 bg-dark-900/95 backdrop-blur-lg z-10 px-4 py-4 flex items-center justify-between border-b border-dark-800">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/workouts')}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-dark-800 hover:bg-dark-700 transition-colors"
          >
            <ArrowLeft size={20} className="text-white" />
          </button>
          <h1 className="text-lg font-semibold text-white">Editar Treino</h1>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 bg-primary-500 text-white px-4 py-2 rounded-xl font-medium disabled:opacity-50"
        >
          <Save size={18} />
          {isSaving ? 'Salvando...' : 'Salvar'}
        </button>
      </header>

      <div className="px-4 py-6 space-y-6">
        {/* Workout Info */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-dark-300 mb-2 block">
              Nome do Treino
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Treino de Peito"
              className="w-full bg-dark-800 border border-dark-700 rounded-xl py-3 px-4 text-white placeholder:text-dark-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-dark-300 mb-2 block">
              Descrição (opcional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Adicione uma descrição..."
              rows={2}
              className="w-full bg-dark-800 border border-dark-700 rounded-xl py-3 px-4 text-white placeholder:text-dark-500 focus:border-primary-500 resize-none"
            />
          </div>
        </div>

        {/* Quick Log Button */}
        <button
          onClick={logWorkout}
          className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
        >
          <Dumbbell size={20} />
          Registrar Treino Hoje
        </button>

        {/* Exercises */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Exercícios</h2>
            <button
              onClick={addExercise}
              className="flex items-center gap-2 text-primary-400 text-sm font-medium"
            >
              <Plus size={18} />
              Adicionar
            </button>
          </div>

          {exercises.length === 0 ? (
            <div className="card flex flex-col items-center py-8">
              <Dumbbell size={40} className="text-dark-600 mb-3" />
              <p className="text-dark-400 text-center">
                Nenhum exercício adicionado
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {exercises.map((exercise, index) => (
                <div key={index} className="card">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 flex items-center justify-center text-dark-500 cursor-grab">
                      <GripVertical size={18} />
                    </div>
                    <div className="flex-1 space-y-3">
                      <input
                        type="text"
                        value={exercise.name}
                        onChange={(e) =>
                          updateExercise(index, 'name', e.target.value)
                        }
                        placeholder="Nome do exercício"
                        className="w-full bg-dark-700 border border-dark-600 rounded-lg py-2 px-3 text-white text-sm placeholder:text-dark-500 focus:border-primary-500"
                      />
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="text-xs text-dark-400 mb-1 block">
                            Séries
                          </label>
                          <input
                            type="number"
                            value={exercise.sets}
                            onChange={(e) =>
                              updateExercise(
                                index,
                                'sets',
                                parseInt(e.target.value) || 0
                              )
                            }
                            min={1}
                            className="w-full bg-dark-700 border border-dark-600 rounded-lg py-2 px-3 text-white text-sm text-center focus:border-primary-500"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-dark-400 mb-1 block">
                            Reps
                          </label>
                          <input
                            type="number"
                            value={exercise.reps}
                            onChange={(e) =>
                              updateExercise(
                                index,
                                'reps',
                                parseInt(e.target.value) || 0
                              )
                            }
                            min={1}
                            className="w-full bg-dark-700 border border-dark-600 rounded-lg py-2 px-3 text-white text-sm text-center focus:border-primary-500"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-dark-400 mb-1 block">
                            Peso (kg)
                          </label>
                          <input
                            type="number"
                            value={exercise.weight || ''}
                            onChange={(e) =>
                              updateExercise(
                                index,
                                'weight',
                                parseFloat(e.target.value) || 0
                              )
                            }
                            min={0}
                            step={0.5}
                            className="w-full bg-dark-700 border border-dark-600 rounded-lg py-2 px-3 text-white text-sm text-center focus:border-primary-500"
                          />
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => removeExercise(index)}
                      className="w-8 h-8 flex items-center justify-center text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


