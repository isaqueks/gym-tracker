import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Sparkles,
  Edit3,
  Plus,
  Trash2,
  GripVertical,
  Loader2,
} from 'lucide-react';
import api from '../services/api';
import { CreateExerciseDto, GeneratedWorkout } from '../types';
import Toast from '../components/Toast';
import { useToast } from '../hooks/useToast';

type Mode = 'select' | 'manual' | 'ai';

export default function NewWorkout() {
  const navigate = useNavigate();
  const { toast, showToast, hideToast } = useToast();
  const [mode, setMode] = useState<Mode>('select');

  // Manual mode state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [exercises, setExercises] = useState<CreateExerciseDto[]>([
    { name: '', sets: 3, reps: 12, weight: 0, order: 0 },
  ]);

  // AI mode state
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedWorkouts, setGeneratedWorkouts] = useState<GeneratedWorkout[]>([]);

  const [isSaving, setIsSaving] = useState(false);

  const addExercise = () => {
    setExercises([
      ...exercises,
      { name: '', sets: 3, reps: 12, weight: 0, order: exercises.length },
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
    if (exercises.length === 1) return;
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const handleManualSave = async () => {
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
      await api.post('/workouts', {
        name,
        description,
        exercises: exercises.map((e, i) => ({
          ...e,
          order: i,
          weight: e.weight || null,
        })),
      });
      navigate('/workouts');
    } catch (error) {
      console.error('Error creating workout:', error);
      showToast('Erro ao criar treino', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateAI = async () => {
    if (!prompt.trim()) {
      showToast('Descreva o tipo de treino que deseja', 'warning');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await api.post<GeneratedWorkout[]>('/ai/generate-workout', {
        prompt,
      });
      setGeneratedWorkouts(response.data);
      showToast(`${response.data.length} treino(s) gerado(s) com sucesso!`, 'success');
    } catch (error) {
      console.error('Error generating workout:', error);
      showToast('Erro ao gerar treino. Verifique sua chave da OpenAI.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const saveGeneratedWorkout = async (workout: GeneratedWorkout) => {
    setIsSaving(true);
    try {
      await api.post('/workouts', {
        ...workout,
        aiGenerated: true,
      });
      const remaining = generatedWorkouts.filter((w) => w !== workout);
      setGeneratedWorkouts(remaining);
      showToast('Treino salvo com sucesso!', 'success');
      if (remaining.length === 0) {
        setTimeout(() => navigate('/workouts'), 500);
      }
    } catch (error) {
      console.error('Error saving workout:', error);
      showToast('Erro ao salvar treino', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const renderModeSelect = () => (
    <div className="px-4 py-6 space-y-4">
      <p className="text-dark-400 text-center mb-6">
        Como você deseja criar seu treino?
      </p>

      <button
        onClick={() => setMode('manual')}
        className="card w-full flex items-center gap-4 hover:border-primary-500/50 transition-colors"
      >
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-500/20 to-primary-600/20 flex items-center justify-center">
          <Edit3 size={24} className="text-primary-400" />
        </div>
        <div className="text-left">
          <h3 className="font-semibold text-white">Criar Manualmente</h3>
          <p className="text-sm text-dark-400">
            Monte seu treino do zero
          </p>
        </div>
      </button>

      <button
        onClick={() => setMode('ai')}
        className="card w-full flex items-center gap-4 hover:border-purple-500/50 transition-colors"
      >
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
          <Sparkles size={24} className="text-purple-400" />
        </div>
        <div className="text-left">
          <h3 className="font-semibold text-white">Gerar com IA</h3>
          <p className="text-sm text-dark-400">
            Descreva e deixe a IA criar
          </p>
        </div>
      </button>
    </div>
  );

  const renderManualMode = () => (
    <div className="px-4 py-6 space-y-6">
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
                  disabled={exercises.length === 1}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleManualSave}
        disabled={isSaving}
        className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white py-3.5 rounded-xl font-semibold disabled:opacity-50"
      >
        {isSaving ? 'Salvando...' : 'Criar Treino'}
      </button>
    </div>
  );

  const renderAIMode = () => (
    <div className="px-4 py-6 space-y-6">
      {generatedWorkouts.length === 0 ? (
        <>
          <div className="card bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
            <div className="flex items-center gap-3 mb-3">
              <Sparkles size={20} className="text-purple-400" />
              <span className="font-medium text-white">
                Geração com Inteligência Artificial
              </span>
            </div>
            <p className="text-sm text-dark-300">
              Descreva o tipo de treino que você quer e a IA vai criar um plano
              completo com exercícios, séries e repetições. Você pode pedir um ou
              vários treinos de uma vez.
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-dark-300 mb-2 block">
              Descreva seu treino ideal
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Exemplos:&#10;• Treino de peito para hipertrofia, nível intermediário&#10;• Divisão ABC para iniciante focando em força&#10;• 4 treinos semanais para definição muscular"
              rows={5}
              className="w-full bg-dark-800 border border-dark-700 rounded-xl py-3 px-4 text-white placeholder:text-dark-500 focus:border-purple-500 resize-none"
            />
          </div>

          <button
            onClick={handleGenerateAI}
            disabled={isGenerating || !prompt.trim()}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3.5 rounded-xl font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <Sparkles size={20} />
                Gerar Treino
              </>
            )}
          </button>
        </>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">
              Treinos Gerados ({generatedWorkouts.length})
            </h2>
            <button
              onClick={() => setGeneratedWorkouts([])}
              className="text-sm text-dark-400 hover:text-white"
            >
              Gerar novos
            </button>
          </div>

          <div className="space-y-4">
            {generatedWorkouts.map((workout, index) => (
              <div key={index} className="card space-y-4">
                <div>
                  <h3 className="font-semibold text-white text-lg">
                    {workout.name}
                  </h3>
                  {workout.description && (
                    <p className="text-sm text-dark-400 mt-1">
                      {workout.description}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  {workout.exercises.map((exercise, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between py-2 border-b border-dark-700 last:border-0"
                    >
                      <span className="text-white">{exercise.name}</span>
                      <span className="text-sm text-dark-400">
                        {exercise.sets}x{exercise.reps}
                        {exercise.weight ? ` • ${exercise.weight}kg` : ''}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => saveGeneratedWorkout(workout)}
                  disabled={isSaving}
                  className="w-full bg-purple-500 text-white py-2.5 rounded-xl font-medium disabled:opacity-50"
                >
                  Salvar Treino
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-dark-900">
      <Toast {...toast} onClose={hideToast} />
      {/* Header */}
      <header className="sticky top-0 bg-dark-900/95 backdrop-blur-lg z-10 px-4 py-4 flex items-center gap-3 border-b border-dark-800">
        <button
          onClick={() =>
            mode === 'select' ? navigate('/workouts') : setMode('select')
          }
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-dark-800 hover:bg-dark-700 transition-colors"
        >
          <ArrowLeft size={20} className="text-white" />
        </button>
        <h1 className="text-lg font-semibold text-white">
          {mode === 'select'
            ? 'Novo Treino'
            : mode === 'manual'
            ? 'Criar Manualmente'
            : 'Gerar com IA'}
        </h1>
      </header>

      {mode === 'select' && renderModeSelect()}
      {mode === 'manual' && renderManualMode()}
      {mode === 'ai' && renderAIMode()}
    </div>
  );
}


