import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Circle } from 'lucide-react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  action?: string;
}

const Onboarding = () => {
  const { user } = useAuth();
  const [steps, setSteps] = useState<OnboardingStep[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOnboardingSteps();
  }, []);

  const fetchOnboardingSteps = async () => {
    try {
      const response = await api.get('/onboarding/steps');
      setSteps(response.data.steps);
    } catch (error) {
      console.error('Error fetching onboarding steps:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStepClick = (action?: string) => {
    if (action) {
      navigate(action);
    }
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  const completedSteps = steps.filter(step => step.completed).length;
  const totalSteps = steps.length;
  const progress = (completedSteps / totalSteps) * 100;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Bem-vindo ao Contabilidade Fácil, {user?.name}!</h1>
        <p className="text-gray-600 mb-4">
          Vamos configurar seu sistema juntos. Siga os passos abaixo para começar.
        </p>
        <div className="bg-gray-200 rounded-full h-4 mb-4">
          <div
            className="bg-blue-600 h-4 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-500">
          {completedSteps} de {totalSteps} passos concluídos
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {steps.map((step) => (
          <Card
            key={step.id}
            className={`cursor-pointer transition-all duration-200 ${
              step.completed
                ? 'bg-green-50 border-green-200'
                : step.action
                ? 'hover:shadow-md hover:border-blue-300'
                : ''
            }`}
            onClick={() => handleStepClick(step.action)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                {step.completed ? (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                ) : (
                  <Circle className="h-6 w-6 text-gray-400" />
                )}
                <CardTitle className="text-lg">{step.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm">
                {step.description}
              </CardDescription>
              {step.action && !step.completed && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStepClick(step.action);
                  }}
                >
                  Começar
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {completedSteps === totalSteps && (
        <div className="mt-8 text-center">
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              <span className="font-semibold">Parabéns!</span>
            </div>
            <p className="mt-1">Você completou todos os passos de configuração inicial.</p>
          </div>
          <Button onClick={() => navigate('/')} className="mr-4">
            Ir para o Dashboard
          </Button>
          <Button variant="outline" onClick={() => navigate('/help')}>
            Ver Tutoriais
          </Button>
        </div>
      )}
    </div>
  );
};

export default Onboarding;
