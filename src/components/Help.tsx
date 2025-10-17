import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Play, HelpCircle } from 'lucide-react';
import api from '../api';

interface FAQ {
  id: number;
  question: string;
  answer: string;
  category: string;
}

interface Tutorial {
  id: number;
  title: string;
  description: string;
  duration: string;
  url: string;
  thumbnail: string;
}

const Help = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHelpData();
  }, []);

  const fetchHelpData = async () => {
    try {
      const [faqResponse, tutorialResponse] = await Promise.all([
        api.get('/help/faq'),
        api.get('/help/tutorials')
      ]);
      setFaqs(faqResponse.data.faq);
      setTutorials(tutorialResponse.data.tutorials);
    } catch (error) {
      console.error('Error fetching help data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...Array.from(new Set(faqs.map(faq => faq.category)))];

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Central de Ajuda</h1>
        <p className="text-gray-600">
          Encontre respostas para suas dúvidas e tutoriais para usar o sistema.
        </p>
      </div>

      {/* Search and Filter */}
      <div className="mb-8 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar perguntas frequentes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="border rounded-md px-3 py-2"
        >
          {categories.map(category => (
            <option key={category} value={category}>
              {category === 'all' ? 'Todas as categorias' : category}
            </option>
          ))}
        </select>
      </div>

      {/* FAQ Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 flex items-center">
          <HelpCircle className="h-6 w-6 mr-2" />
          Perguntas Frequentes
        </h2>

        {filteredFaqs.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-gray-500">
                {searchTerm ? 'Nenhuma pergunta encontrada para sua busca.' : 'Nenhuma pergunta frequente disponível.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredFaqs.map((faq) => (
              <Card key={faq.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{faq.question}</CardTitle>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {faq.category}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm">
                    {faq.answer}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Tutorials Section */}
      <div>
        <h2 className="text-2xl font-bold mb-6 flex items-center">
          <Play className="h-6 w-6 mr-2" />
          Tutoriais em Vídeo
        </h2>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tutorials.map((tutorial) => (
            <Card key={tutorial.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="aspect-video bg-gray-200 rounded-md mb-3 flex items-center justify-center">
                  <Play className="h-12 w-12 text-gray-400" />
                </div>
                <CardTitle className="text-lg">{tutorial.title}</CardTitle>
                <CardDescription>{tutorial.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">{tutorial.duration}</span>
                  <Button
                    size="sm"
                    onClick={() => window.open(tutorial.url, '_blank')}
                    disabled={tutorial.url === '#'}
                  >
                    <Play className="h-4 w-4 mr-1" />
                    Assistir
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Contact Support */}
      <div className="mt-12 text-center">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-2">Não encontrou o que procurava?</h3>
            <p className="text-gray-600 mb-4">
              Entre em contato com nosso suporte para obter ajuda personalizada.
            </p>
            <Button>
              Contatar Suporte
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Help;
