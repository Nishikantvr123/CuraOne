import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { 
  Star, 
  MessageSquare, 
  Heart, 
  ThumbsUp, 
  ThumbsDown,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  X,
  Send,
  Calendar,
  Clock,
  User
} from 'lucide-react';

const cn = (...classes) => classes.filter(Boolean).join(' ');

// Rating Component
const StarRating = ({ rating, onRatingChange, readonly = false, size = 'md' }) => {
  const [hoverRating, setHoverRating] = useState(0);
  
  const starSize = size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-8 w-8' : 'h-6 w-6';
  
  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          className={cn(
            "transition-colors duration-200",
            !readonly && "hover:scale-110 transform",
            readonly && "cursor-default"
          )}
          onClick={() => !readonly && onRatingChange(star)}
          onMouseEnter={() => !readonly && setHoverRating(star)}
          onMouseLeave={() => !readonly && setHoverRating(0)}
        >
          <Star
            className={cn(
              starSize,
              (hoverRating >= star || rating >= star)
                ? "text-yellow-400 fill-current"
                : "text-gray-300"
            )}
          />
        </button>
      ))}
      <span className="ml-2 text-sm text-gray-600">
        {rating > 0 && `${rating}/5`}
      </span>
    </div>
  );
};

// Symptom Selector Component
const SymptomSelector = ({ selectedSymptoms, onSymptomToggle, type = "symptoms" }) => {
  const symptomOptions = {
    symptoms: [
      'Headache', 'Nausea', 'Dizziness', 'Fatigue', 'Joint Pain', 
      'Muscle Soreness', 'Sleep Issues', 'Anxiety', 'Stress', 'Digestive Issues'
    ],
    improvements: [
      'Better Sleep', 'Increased Energy', 'Reduced Stress', 'Improved Mood',
      'Less Pain', 'Better Digestion', 'Enhanced Flexibility', 'Mental Clarity',
      'Skin Health', 'Overall Wellbeing'
    ],
    sideEffects: [
      'Skin Irritation', 'Temporary Fatigue', 'Mild Nausea', 'Emotional Release',
      'Detox Symptoms', 'Temporary Discomfort', 'Sleep Disturbance', 'Appetite Changes'
    ]
  };

  const options = symptomOptions[type] || symptomOptions.symptoms;
  const colors = {
    symptoms: 'text-red-600 bg-red-50 border-red-200',
    improvements: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    sideEffects: 'text-orange-600 bg-orange-50 border-orange-200'
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onSymptomToggle(option)}
          className={cn(
            "px-3 py-2 text-sm rounded-lg border transition-all duration-200 text-left",
            selectedSymptoms.includes(option)
              ? colors[type]
              : "text-gray-600 bg-white border-gray-300 hover:bg-gray-50"
          )}
        >
          {option}
        </button>
      ))}
    </div>
  );
};

// Session Feedback Form
export const SessionFeedbackForm = ({ session, onSubmit, onCancel }) => {
  const [rating, setRating] = useState(0);
  const [symptoms, setSymptoms] = useState([]);
  const [improvements, setImprovements] = useState([]);
  const [sideEffects, setSideEffects] = useState([]);
  const [overallFeeling, setOverallFeeling] = useState('');
  
  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  
  const comments = watch('comments', '');
  
  const toggleSymptom = (symptom, type) => {
    const setters = {
      symptoms: setSymptoms,
      improvements: setImprovements,
      sideEffects: setSideEffects
    };
    
    const current = type === 'symptoms' ? symptoms : 
                   type === 'improvements' ? improvements : sideEffects;
    
    setters[type](prev => 
      prev.includes(symptom) 
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };
  
  const feelingOptions = [
    { value: 'excellent', label: 'Excellent', icon: '😊', color: 'text-emerald-600 bg-emerald-50' },
    { value: 'good', label: 'Good', icon: '🙂', color: 'text-blue-600 bg-blue-50' },
    { value: 'average', label: 'Average', icon: '😐', color: 'text-yellow-600 bg-yellow-50' },
    { value: 'poor', label: 'Poor', icon: '☹️', color: 'text-orange-600 bg-orange-50' },
    { value: 'very-poor', label: 'Very Poor', icon: '😞', color: 'text-red-600 bg-red-50' }
  ];

  const handleFormSubmit = (data) => {
    const feedbackData = {
      sessionId: session.id,
      rating,
      symptoms,
      improvements,
      sideEffects,
      overallFeeling,
      comments: data.comments,
      timestamp: new Date().toISOString()
    };
    
    onSubmit(feedbackData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Session Feedback</h2>
              <p className="text-sm text-gray-600 mt-1">
                {session?.therapy} - {session?.date}
              </p>
            </div>
            <button
              onClick={onCancel}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="h-5 w-5 text-gray-400" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-6">
          {/* Overall Rating */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Overall Session Rating
            </label>
            <StarRating 
              rating={rating} 
              onRatingChange={setRating} 
              size="lg"
            />
            {rating === 0 && (
              <p className="text-red-500 text-sm mt-2">Please provide a rating</p>
            )}
          </div>

          {/* Overall Feeling */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              How do you feel after this session?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {feelingOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setOverallFeeling(option.value)}
                  className={cn(
                    "p-3 rounded-lg border transition-all duration-200 text-center",
                    overallFeeling === option.value
                      ? option.color + " border-current shadow-sm"
                      : "text-gray-600 bg-white border-gray-300 hover:bg-gray-50"
                  )}
                >
                  <div className="text-xl mb-1">{option.icon}</div>
                  <div className="text-xs font-medium">{option.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Improvements */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              What improvements did you notice?
            </label>
            <SymptomSelector
              selectedSymptoms={improvements}
              onSymptomToggle={(symptom) => toggleSymptom(symptom, 'improvements')}
              type="improvements"
            />
          </div>

          {/* Symptoms */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Any symptoms or concerns? (Optional)
            </label>
            <SymptomSelector
              selectedSymptoms={symptoms}
              onSymptomToggle={(symptom) => toggleSymptom(symptom, 'symptoms')}
              type="symptoms"
            />
          </div>

          {/* Side Effects */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Any side effects? (Optional)
            </label>
            <SymptomSelector
              selectedSymptoms={sideEffects}
              onSymptomToggle={(symptom) => toggleSymptom(symptom, 'sideEffects')}
              type="sideEffects"
            />
          </div>

          {/* Additional Comments */}
          <div>
            <label htmlFor="comments" className="block text-sm font-semibold text-gray-900 mb-3">
              Additional Comments (Optional)
            </label>
            <textarea
              {...register('comments')}
              rows={4}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Share any additional thoughts about your session..."
            />
            <div className="mt-2 text-right">
              <span className="text-xs text-gray-500">
                {comments.length}/500 characters
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={rating === 0}
              className={cn(
                "px-6 py-2 text-sm font-medium text-white rounded-lg transition-all duration-200",
                rating > 0
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
                  : "bg-gray-300 cursor-not-allowed"
              )}
            >
              <Send className="h-4 w-4 mr-2 inline" />
              Submit Feedback
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Feedback History Component
export const FeedbackHistory = ({ feedbacks = [] }) => {
  const [selectedFeedback, setSelectedFeedback] = useState(null);

  // Mock feedback data
  const mockFeedbacks = feedbacks.length > 0 ? feedbacks : [
    {
      id: '1',
      sessionType: 'Abhyanga (Oil Massage)',
      practitioner: 'Dr. Sarah Smith',
      date: '2024-03-18',
      rating: 5,
      overallFeeling: 'excellent',
      improvements: ['Better Sleep', 'Reduced Stress', 'Increased Energy'],
      symptoms: [],
      sideEffects: ['Temporary Fatigue'],
      comments: 'Amazing session! Felt incredibly relaxed and energized afterwards. The oil used was perfect for my skin type.'
    },
    {
      id: '2',
      sessionType: 'Shirodhara',
      practitioner: 'Dr. Sarah Smith',
      date: '2024-03-16',
      rating: 4,
      overallFeeling: 'good',
      improvements: ['Mental Clarity', 'Reduced Stress'],
      symptoms: ['Mild Nausea'],
      sideEffects: [],
      comments: 'Very calming experience. Initially felt a bit nauseous but it passed quickly.'
    },
    {
      id: '3',
      sessionType: 'Panchakarma Consultation',
      practitioner: 'Dr. Raj Patel',
      date: '2024-03-14',
      rating: 5,
      overallFeeling: 'excellent',
      improvements: ['Mental Clarity', 'Better Understanding'],
      symptoms: [],
      sideEffects: [],
      comments: 'Dr. Patel provided excellent guidance on my treatment plan. Very knowledgeable and caring.'
    }
  ];

  const getFeelingIcon = (feeling) => {
    const icons = {
      'excellent': '😊',
      'good': '🙂',
      'average': '😐',
      'poor': '☹️',
      'very-poor': '😞'
    };
    return icons[feeling] || '😐';
  };

  const getFeelingColor = (feeling) => {
    const colors = {
      'excellent': 'text-emerald-600 bg-emerald-50',
      'good': 'text-blue-600 bg-blue-50',
      'average': 'text-yellow-600 bg-yellow-50',
      'poor': 'text-orange-600 bg-orange-50',
      'very-poor': 'text-red-600 bg-red-50'
    };
    return colors[feeling] || 'text-gray-600 bg-gray-50';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
        <h3 className="text-lg font-bold text-gray-900">Feedback History</h3>
        <p className="text-sm text-gray-600 mt-1">Track your therapy experiences and progress</p>
      </div>

      <div className="p-6">
        {mockFeedbacks.length > 0 ? (
          <div className="space-y-4">
            {mockFeedbacks.map((feedback) => (
              <div 
                key={feedback.id}
                className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200 cursor-pointer"
                onClick={() => setSelectedFeedback(feedback)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="font-semibold text-gray-900">{feedback.sessionType}</h4>
                      <StarRating rating={feedback.rating} readonly size="sm" />
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        {feedback.practitioner}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {feedback.date}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className={cn(
                        "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                        getFeelingColor(feedback.overallFeeling)
                      )}>
                        {getFeelingIcon(feedback.overallFeeling)} {feedback.overallFeeling.replace('-', ' ')}
                      </span>
                      
                      {feedback.improvements.length > 0 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          {feedback.improvements.length} improvements
                        </span>
                      )}
                      
                      {feedback.symptoms.length > 0 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          {feedback.symptoms.length} symptoms
                        </span>
                      )}
                    </div>

                    {feedback.comments && (
                      <p className="text-sm text-gray-700 mt-2 line-clamp-2">
                        "{feedback.comments}"
                      </p>
                    )}
                  </div>
                  
                  <div className="ml-4">
                    <CheckCircle className="h-5 w-5 text-emerald-500" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">No Feedback Yet</h4>
            <p className="text-gray-600">Complete a session to start providing feedback</p>
          </div>
        )}
      </div>

      {/* Detailed Feedback Modal */}
      {selectedFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">Feedback Details</h3>
                <button
                  onClick={() => setSelectedFeedback(null)}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="h-5 w-5 text-gray-400" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900">{selectedFeedback.sessionType}</h4>
                <p className="text-sm text-gray-600">with {selectedFeedback.practitioner} on {selectedFeedback.date}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                <StarRating rating={selectedFeedback.rating} readonly />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Overall Feeling</label>
                <span className={cn(
                  "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium",
                  getFeelingColor(selectedFeedback.overallFeeling)
                )}>
                  {getFeelingIcon(selectedFeedback.overallFeeling)} {selectedFeedback.overallFeeling.replace('-', ' ')}
                </span>
              </div>

              {selectedFeedback.improvements.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Improvements</label>
                  <div className="flex flex-wrap gap-1">
                    {selectedFeedback.improvements.map((improvement) => (
                      <span key={improvement} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-emerald-100 text-emerald-800">
                        {improvement}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedFeedback.symptoms.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Symptoms</label>
                  <div className="flex flex-wrap gap-1">
                    {selectedFeedback.symptoms.map((symptom) => (
                      <span key={symptom} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
                        {symptom}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedFeedback.sideEffects.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Side Effects</label>
                  <div className="flex flex-wrap gap-1">
                    {selectedFeedback.sideEffects.map((effect) => (
                      <span key={effect} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-orange-100 text-orange-800">
                        {effect}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedFeedback.comments && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Comments</label>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                    "{selectedFeedback.comments}"
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};