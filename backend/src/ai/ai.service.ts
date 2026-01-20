import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { GenerateWorkoutDto } from './dto/generate-workout.dto';
import { UsersService } from '../users/users.service';
import { Gender } from '../users/entities/user.entity';

export interface GeneratedExercise {
  name: string;
  sets: number;
  reps: number;
  weight: number | null;
  order: number;
}

export interface GeneratedWorkout {
  name: string;
  description: string;
  exercises: GeneratedExercise[];
}

export interface UserProfile {
  gender: Gender | null;
  height: number | null;
  weight: number | null;
}

@Injectable()
export class AiService {
  private openai: OpenAI | null = null;

  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (apiKey && apiKey !== 'your-openai-api-key-here') {
      this.openai = new OpenAI({ apiKey });
    }
  }

  async generateWorkout(
    userId: string,
    dto: GenerateWorkoutDto,
  ): Promise<GeneratedWorkout[]> {
    if (!this.openai) {
      throw new BadRequestException(
        'OpenAI API key não configurada. Configure a variável OPENAI_API_KEY.',
      );
    }

    // Get user profile data
    const userProfile = await this.usersService.getProfile(userId);

    // Build user context from profile
    let userContext = '';
    if (userProfile.gender || userProfile.height || userProfile.weight) {
      const parts: string[] = [];
      if (userProfile.gender) {
        parts.push(`Sexo: ${userProfile.gender === 'male' ? 'Masculino' : 'Feminino'}`);
      }
      if (userProfile.height) {
        parts.push(`Altura: ${userProfile.height}cm`);
      }
      if (userProfile.weight) {
        parts.push(`Peso: ${userProfile.weight}kg`);
      }
      userContext = `\n\nDADOS FÍSICOS DO USUÁRIO:\n${parts.join('\n')}`;
    }

    const systemPrompt = `Você é um personal trainer experiente. Sua tarefa é criar treinos de academia em formato JSON.${userContext}

REGRAS CRÍTICAS:
1. ANALISE O PEDIDO: Se o usuário pedir "treino ABC" = 3 treinos (A, B, C). Se pedir "divisão de 4 dias" = 4 treinos. Se pedir "treino de peito" = 1 treino.
2. CADA TREINO SEPARADO: Cada dia/divisão deve ser um objeto SEPARADO no array "workouts". NÃO coloque todos exercícios em um único treino.
3. QUANTIDADE DE EXERCÍCIOS: Cada treino individual deve ter 5-8 exercícios.

FORMATO JSON OBRIGATÓRIO (retorne APENAS este JSON, sem texto):
{
  "workouts": [
    {
      "name": "Treino A - Peito e Tríceps",
      "description": "Treino focado em peito e tríceps para hipertrofia",
      "exercises": [
        {"name": "Supino Reto", "sets": 4, "reps": 10, "weight": null, "order": 0},
        {"name": "Supino Inclinado", "sets": 3, "reps": 12, "weight": null, "order": 1}
      ]
    },
    {
      "name": "Treino B - Costas e Bíceps",
      "description": "Treino focado em costas e bíceps",
      "exercises": [
        {"name": "Puxada Frontal", "sets": 4, "reps": 10, "weight": null, "order": 0},
        {"name": "Remada Curvada", "sets": 3, "reps": 12, "weight": null, "order": 1}
      ]
    }
  ]
}

EXEMPLOS DE INTERPRETAÇÃO:
- "treino ABC" ou "ABC" = GERE 3 treinos separados (A, B, C)
- "divisão de 4 dias" ou "4 treinos" = GERE 4 treinos separados
- "treino de perna" ou "leg day" = GERE 1 treino
- "semana completa" ou "5 dias" = GERE 5 treinos separados

Use nomes de exercícios em português. O campo "weight" sempre null.`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: dto.prompt },
        ],
        temperature: 0.7,
        max_tokens: 4000,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new BadRequestException('Não foi possível gerar o treino');
      }

      console.log('OpenAI Response:', content);

      // Parse the JSON response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new BadRequestException('Resposta inválida da IA');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      if (!parsed.workouts || !Array.isArray(parsed.workouts)) {
        throw new BadRequestException('Formato de resposta inválido');
      }

      // Validate and sanitize the response
      return parsed.workouts.map((workout: GeneratedWorkout) => ({
        name: String(workout.name || 'Treino Gerado'),
        description: String(workout.description || ''),
        exercises: (workout.exercises || []).map(
          (exercise: GeneratedExercise, index: number) => ({
            name: String(exercise.name || `Exercício ${index + 1}`),
            sets: Number(exercise.sets) || 3,
            reps: Number(exercise.reps) || 12,
            weight: exercise.weight ? Number(exercise.weight) : null,
            order: index,
          }),
        ),
      }));
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.error('OpenAI Error:', error);
      throw new BadRequestException(
        'Erro ao comunicar com a IA. Tente novamente.',
      );
    }
  }
}
