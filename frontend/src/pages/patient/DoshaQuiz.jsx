import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Wind,
  Flame,
  Droplets,
  RefreshCw,
  BookOpen,
  Calendar
} from 'lucide-react';
import { apiService } from '../../services/api';

const DoshaQuiz = () => {
  const [step, setStep] = useState('intro');
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [existingProfile, setExistingProfile] = useState(null);

  useEffect(() => {
    loadExistingProfile();
  }, []);

  const loadExistingProfile = async () => {
    try {
      const response = await apiService.get('/dosha/profile');
      if (response.success && response.data) {
        setExistingProfile(response.data);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const startQuiz = async () => {
    setIsLoading(true);
    try {
      const response = await apiService.get('/dosha/questions');
      if (response.success) {
        setQuestions(response.data.questions);
        setAnswers([]);
        setCurrentQuestion(0);
        setStep('quiz');
      }
    } catch (error) {
      console.error('Error loading questions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswer = (answer) => {
    const newAnswers = [...answers, { questionId: questions[currentQuestion].id, answer }];
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      submitQuiz(newAnswers);
    }
  };

  const submitQuiz = async (finalAnswers) => {
    setIsLoading(true);
    try {
      const response = await apiService.post('/dosha/quiz', { answers: finalAnswers });
      if (response.success) {
        setResult(response.data);
        setStep('result');
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getDoshaIcon = (dosha) => {
    switch (dosha) {
      case 'vata':
        return <Wind className="w-8 h-8" />;
      case 'pitta':
        return <Flame className="w-8 h-8" />;
      case 'kapha':
        return <Droplets className="w-8 h-8" />;
      default:
        return <Sparkles className="w-8 h-8" />;
    }
  };

  const getDoshaColor = (dosha) => {
    switch (dosha) {
      case 'vata':
        return 'from-purple-500 to-indigo-600';
      case 'pitta':
        return 'from-orange-500 to-red-600';
      case 'kapha':
        return 'from-teal-500 to-green-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const renderIntro = () => (
    <div className="max-w-2xl mx-auto text-center">
      <div className="mb-8">
        <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Sparkles className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Discover Your Dosha</h1>
        <p className="text-lg text-gray-600">
          Understanding your Ayurvedic constitution (Prakriti) is the first step towards personalized wellness.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-purple-50 rounded-xl p-6 text-center">
          <Wind className="w-8 h-8 text-purple-600 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900">Vata</h3>
          <p className="text-sm text-gray-600">Air & Space</p>
        </div>
        <div className="bg-orange-50 rounded-xl p-6 text-center">
          <Flame className="w-8 h-8 text-orange-600 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900">Pitta</h3>
          <p className="text-sm text-gray-600">Fire & Water</p>
        </div>
        <div className="bg-teal-50 rounded-xl p-6 text-center">
          <Droplets className="w-8 h-8 text-teal-600 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900">Kapha</h3>
          <p className="text-sm text-gray-600">Earth & Water</p>
        </div>
      </div>

      <p className="text-gray-500 mb-8">
        Answer 10 simple questions about your physical and mental characteristics to discover your unique constitution.
      </p>

      <button
        onClick={startQuiz}
        disabled={isLoading}
        className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
      >
        {isLoading ? 'Loading...' : 'Start Quiz'}
      </button>

      {existingProfile && existingProfile.profile && (
        <div className="mt-8 p-6 bg-gray-50 rounded-xl">
          <h3 className="font-semibold text-gray-900 mb-2">Your Previous Result</h3>
          <p className="text-gray-600 mb-3">
            Dominant Dosha: <span className="font-bold capitalize">{existingProfile.profile.dominant}</span>
          </p>
          <p className="text-sm text-gray-500">
            Completed on: {new Date(existingProfile.profile.completedAt).toLocaleDateString()}
          </p>
          <button
            onClick={startQuiz}
            className="mt-4 text-emerald-600 hover:text-emerald-700 flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            Retake Quiz
          </button>
        </div>
      )}
    </div>
  );

  const renderQuiz = () => (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">
            Question {currentQuestion + 1} of {questions.length}
          </span>
          <span className="text-sm text-gray-600">
            {Math.round(((currentQuestion + 1) / questions.length) * 100)}%
          </span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 transition-all duration-300"
            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-8">
        <span className="inline-block px-3 py-1 text-xs font-medium bg-emerald-100 text-emerald-800 rounded-full mb-4 capitalize">
          {questions[currentQuestion]?.category}
        </span>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          {questions[currentQuestion]?.question}
        </h2>

        <div className="space-y-3">
          {questions[currentQuestion]?.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(option.text)}
              className="w-full p-4 text-left border-2 border-gray-200 rounded-xl hover:border-emerald-500 hover:bg-emerald-50 transition-all group"
            >
              <span className="text-gray-700 group-hover:text-gray-900">{option.text}</span>
            </button>
          ))}
        </div>

        {currentQuestion > 0 && (
          <button
            onClick={() => {
              setCurrentQuestion(prev => prev - 1);
              setAnswers(prev => prev.slice(0, -1));
            }}
            className="mt-6 text-gray-600 hover:text-gray-900 flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>
        )}
      </div>
    </div>
  );

  const renderResult = () => (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Dosha Profile</h1>
        <p className="text-gray-600">Based on your answers, here's your Ayurvedic constitution</p>
      </div>

      <div className={`bg-gradient-to-br ${getDoshaColor(result.profile.dominant)} rounded-2xl p-8 text-white mb-8`}>
        <div className="flex items-center justify-center gap-4 mb-4">
          {getDoshaIcon(result.profile.dominant)}
          <h2 className="text-2xl font-bold capitalize">{result.profile.constitution}</h2>
        </div>
        <p className="text-center text-white/90">
          {result.recommendations.description}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {Object.entries(result.profile.percentages).map(([dosha, percentage]) => (
          <div key={dosha} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
            <div className={`w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center ${
              dosha === 'vata' ? 'bg-purple-100 text-purple-600' :
              dosha === 'pitta' ? 'bg-orange-100 text-orange-600' :
              'bg-teal-100 text-teal-600'
            }`}>
              {getDoshaIcon(dosha)}
            </div>
            <h3 className="font-semibold text-gray-900 capitalize">{dosha}</h3>
            <p className="text-2xl font-bold text-gray-900">{percentage}%</p>
            <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full ${
                  dosha === 'vata' ? 'bg-purple-500' :
                  dosha === 'pitta' ? 'bg-orange-500' :
                  'bg-teal-500'
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            Lifestyle Recommendations
          </h3>
          <ul className="space-y-2">
            {result.recommendations.lifestyle.map((tip, index) => (
              <li key={index} className="flex items-start gap-2 text-gray-600">
                <span className="text-emerald-500 mt-1">•</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-500" />
            Things to Avoid
          </h3>
          <ul className="space-y-2">
            {result.recommendations.avoid.map((item, index) => (
              <li key={index} className="flex items-start gap-2 text-gray-600">
                <span className="text-red-500 mt-1">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-emerald-50 rounded-xl p-6 mb-8">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-emerald-600" />
          Recommended Therapies
        </h3>
        <div className="flex flex-wrap gap-2">
          {result.suggestedTherapies.map((therapy, index) => (
            <span
              key={index}
              className="px-4 py-2 bg-white text-emerald-700 rounded-full shadow-sm border border-emerald-200"
            >
              {therapy}
            </span>
          ))}
        </div>
      </div>

      <div className="flex justify-center gap-4">
        <button
          onClick={() => {
            setStep('intro');
            setResult(null);
            loadExistingProfile();
          }}
          className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Take Again
        </button>
        <button
          onClick={() => window.location.href = '/dashboard'}
          className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4">
      {isLoading && step === 'quiz' ? (
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Processing your results...</p>
        </div>
      ) : (
        <>
          {step === 'intro' && renderIntro()}
          {step === 'quiz' && renderQuiz()}
          {step === 'result' && renderResult()}
        </>
      )}
    </div>
  );
};

export default DoshaQuiz;
