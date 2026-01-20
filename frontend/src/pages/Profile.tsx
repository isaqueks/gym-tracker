import { useState, useEffect } from 'react';
import { ArrowLeft, Save, User as UserIcon, Ruler, Scale, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { User, Gender } from '../types';
import Toast from '../components/Toast';
import { useToast } from '../hooks/useToast';

export default function Profile() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { toast, showToast, hideToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [name, setName] = useState('');
  const [gender, setGender] = useState<Gender | ''>('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await api.get<User>('/users/profile');
      setName(response.data.name || '');
      setGender(response.data.gender || '');
      setHeight(response.data.height?.toString() || '');
      setWeight(response.data.weight?.toString() || '');
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      const data: Record<string, string | number> = {};
      if (name) data.name = name;
      if (gender) data.gender = gender;
      if (height) data.height = parseFloat(height);
      if (weight) data.weight = parseFloat(weight);

      await api.patch('/users/profile', data);

      // Update localStorage user
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        const user = JSON.parse(savedUser);
        localStorage.setItem(
          'user',
          JSON.stringify({ ...user, name, gender: gender || null })
        );
      }

      showToast('Perfil atualizado com sucesso!', 'success');
    } catch (error) {
      console.error('Error saving profile:', error);
      showToast('Erro ao salvar perfil', 'error');
    } finally {
      setIsSaving(false);
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
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-dark-800 hover:bg-dark-700 transition-colors"
          >
            <ArrowLeft size={20} className="text-white" />
          </button>
          <h1 className="text-lg font-semibold text-white">Meu Perfil</h1>
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

        {/* Info Card */}
        <div className="card bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20">
          <p className="text-sm text-dark-300">
            Preencha seus dados físicos para que a IA possa gerar treinos mais
            personalizados para você.
          </p>
        </div>

        {/* Name */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-dark-300 flex items-center gap-2">
            <UserIcon size={16} />
            Nome
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Seu nome"
            className="w-full bg-dark-800 border border-dark-700 rounded-xl py-3.5 px-4 text-white placeholder:text-dark-500 focus:border-primary-500"
          />
        </div>

        {/* Gender */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-dark-300">Sexo</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setGender('male')}
              className={`py-3.5 px-4 rounded-xl border font-medium transition-all ${
                gender === 'male'
                  ? 'bg-blue-500 border-blue-500 text-white'
                  : 'bg-dark-800 border-dark-700 text-dark-300 hover:border-dark-600'
              }`}
            >
              Masculino
            </button>
            <button
              type="button"
              onClick={() => setGender('female')}
              className={`py-3.5 px-4 rounded-xl border font-medium transition-all ${
                gender === 'female'
                  ? 'bg-pink-500 border-pink-500 text-white'
                  : 'bg-dark-800 border-dark-700 text-dark-300 hover:border-dark-600'
              }`}
            >
              Feminino
            </button>
          </div>
        </div>

        {/* Height */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-dark-300 flex items-center gap-2">
            <Ruler size={16} />
            Altura (cm)
          </label>
          <input
            type="number"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            placeholder="Ex: 175"
            min={100}
            max={250}
            className="w-full bg-dark-800 border border-dark-700 rounded-xl py-3.5 px-4 text-white placeholder:text-dark-500 focus:border-primary-500"
          />
        </div>

        {/* Weight */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-dark-300 flex items-center gap-2">
            <Scale size={16} />
            Peso (kg)
          </label>
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="Ex: 70"
            min={30}
            max={300}
            step={0.1}
            className="w-full bg-dark-800 border border-dark-700 rounded-xl py-3.5 px-4 text-white placeholder:text-dark-500 focus:border-primary-500"
          />
        </div>

        {/* BMI Display */}
        {height && weight && (
          <div className="card">
            <p className="text-sm text-dark-400 mb-1">Seu IMC</p>
            <p className="text-2xl font-bold text-white">
              {(parseFloat(weight) / Math.pow(parseFloat(height) / 100, 2)).toFixed(1)}
            </p>
            <p className="text-xs text-dark-500 mt-1">
              {(() => {
                const bmi = parseFloat(weight) / Math.pow(parseFloat(height) / 100, 2);
                if (bmi < 18.5) return 'Abaixo do peso';
                if (bmi < 25) return 'Peso normal';
                if (bmi < 30) return 'Sobrepeso';
                return 'Obesidade';
              })()}
            </p>
          </div>
        )}

        {/* Logout Button */}
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 py-3.5 rounded-xl font-medium hover:bg-red-500/20 transition-colors"
        >
          <LogOut size={18} />
          Sair da Conta
        </button>
      </div>
    </div>
  );
}

