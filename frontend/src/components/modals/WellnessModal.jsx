import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { 
  Heart, 
  Activity, 
  Moon, 
  Brain, 
  Zap, 
  Save, 
  X,
  AlertTriangle,
  Smile,
  Meh,
  Frown,
  ThermometerSun,
  Droplets,
  Wind,
  Coffee,
  Calendar
} from 'lucide-react';
import Modal, { ModalFooter } from '../ui/Modal';
import toast from '../../utils/toast';
import { useRealtime } from '../../contexts/RealtimeContext';

const cn = (...classes) => classes.filter(Boolean).join(' ');

const WellnessModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  currentUser = null,
  existingData = null
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { sendWellnessUpdate } = useRealtime();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
    watch
  } = useForm({
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      energyLevel: 50,
      sleepQuality: 50,
      moodLevel: 50,
      stressLevel: 50,
      physicalComfort: 50,
      mentalClarity: 50,
      appetite: 'normal',
      digestion: 'normal',
      bowelMovement: 'normal',
      sleepHours: 7,
      exerciseMinutes: 0,
      waterIntake: 8,
      symptoms: '',
      notes: '',
      medications: '',
      moodDescription: '',
      painLevel: 0,
      painLocation: ''
    }
  });

  useEffect(() => {
    if (existingData) {
      reset(existingData);
    } else {
      // Reset to default values for new check-in
      reset({
        date: new Date().toISOString().split('T')[0],
        energyLevel: 50,
        sleepQuality: 50,
        moodLevel: 50,
        stressLevel: 50,
        physicalComfort: 50,
        mentalClarity: 50,
        appetite: 'normal',
        digestion: 'normal',
        bowelMovement: 'normal',
        sleepHours: 7,
        exerciseMinutes: 0,
        waterIntake: 8,
        symptoms: '',
        notes: '',
        medications: '',
        moodDescription: '',
        painLevel: 0,
        painLocation: ''
      });
    }
  }, [existingData, reset]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const wellnessData = {
        ...data,
        userId: currentUser?.id,
        timestamp: new Date().toISOString(),
        energyLevel: parseInt(data.energyLevel),
        sleepQuality: parseInt(data.sleepQuality),
        moodLevel: parseInt(data.moodLevel),
        stressLevel: parseInt(data.stressLevel),
        physicalComfort: parseInt(data.physicalComfort),
        mentalClarity: parseInt(data.mentalClarity),
        sleepHours: parseFloat(data.sleepHours),
        exerciseMinutes: parseInt(data.exerciseMinutes),
        waterIntake: parseInt(data.waterIntake),
        painLevel: parseInt(data.painLevel)
      };

      await onSave(wellnessData);
      
      // Send real-time wellness update to practitioner
      if (sendWellnessUpdate) {
        sendWellnessUpdate(wellnessData);
      }
      
      toast.success('Wellness check-in saved successfully!');
      onClose();
    } catch (error) {
      toast.error('Failed to save wellness check-in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  // Watch values for dynamic UI
  const watchMoodLevel = watch('moodLevel');
  const watchPainLevel = watch('painLevel');
  const watchStressLevel = watch('stressLevel');

  // Helper function for mood icon
  const getMoodIcon = (level) => {
    if (level >= 70) return <Smile className="h-5 w-5 text-green-500" />;
    if (level >= 40) return <Meh className="h-5 w-5 text-yellow-500" />;
    return <Frown className="h-5 w-5 text-red-500" />;
  };

  // Helper function for stress level color
  const getStressColor = (level) => {
    if (level <= 30) return 'text-green-600';
    if (level <= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const FormField = ({ label, error, required, children, helpText }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-sm text-red-600 flex items-center">
          <AlertTriangle className="h-4 w-4 mr-1" />
          {error.message}
        </p>
      )}
      {helpText && !error && (
        <p className="text-sm text-gray-500">{helpText}</p>
      )}
    </div>
  );

  const SliderField = ({ name, label, icon: Icon, min = 0, max = 100, step = 1, unit = '%', color = 'emerald' }) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700 flex items-center">
          <Icon className="h-4 w-4 mr-2" />
          {label}
        </label>
        <span className={cn(
          "text-sm font-semibold px-2 py-1 rounded-full",
          color === 'emerald' ? "bg-emerald-100 text-emerald-800" :
          color === 'blue' ? "bg-blue-100 text-blue-800" :
          color === 'yellow' ? "bg-yellow-100 text-yellow-800" :
          color === 'red' ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-800"
        )}>
          {watch(name)}{unit}
        </span>
      </div>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <div className="relative">
            <input
              {...field}
              type="range"
              min={min}
              max={max}
              step={step}
              className={cn(
                "w-full h-2 rounded-lg appearance-none cursor-pointer",
                color === 'emerald' ? "bg-emerald-200" :
                color === 'blue' ? "bg-blue-200" :
                color === 'yellow' ? "bg-yellow-200" :
                color === 'red' ? "bg-red-200" : "bg-gray-200"
              )}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Low</span>
              <span>High</span>
            </div>
          </div>
        )}
      />
    </div>
  );

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose} 
      title="Daily Wellness Check-in"
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Date */}
        <FormField label="Date" error={errors.date} required>
          <div className="relative">
            <input
              {...register('date', { required: 'Date is required' })}
              type="date"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
            <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </FormField>

        {/* Wellness Metrics Sliders */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6">Wellness Metrics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SliderField
              name="energyLevel"
              label="Energy Level"
              icon={Zap}
              color="yellow"
            />
            
            <SliderField
              name="sleepQuality"
              label="Sleep Quality"
              icon={Moon}
              color="blue"
            />
            
            <div className="flex items-center space-x-2">
              <SliderField
                name="moodLevel"
                label="Mood Level"
                icon={Heart}
                color="emerald"
              />
              <div className="mt-6">
                {getMoodIcon(watchMoodLevel)}
              </div>
            </div>
            
            <SliderField
              name="stressLevel"
              label="Stress Level"
              icon={AlertTriangle}
              color="red"
            />
            
            <SliderField
              name="physicalComfort"
              label="Physical Comfort"
              icon={Activity}
              color="emerald"
            />
            
            <SliderField
              name="mentalClarity"
              label="Mental Clarity"
              icon={Brain}
              color="blue"
            />
          </div>
        </div>

        {/* Physical Metrics */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Physical Metrics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField label="Sleep Hours" error={errors.sleepHours}>
              <div className="relative">
                <input
                  {...register('sleepHours', {
                    min: { value: 0, message: 'Cannot be negative' },
                    max: { value: 24, message: 'Cannot exceed 24 hours' }
                  })}
                  type="number"
                  min="0"
                  max="24"
                  step="0.5"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                <Moon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </FormField>

            <FormField label="Exercise (minutes)" error={errors.exerciseMinutes}>
              <div className="relative">
                <input
                  {...register('exerciseMinutes', {
                    min: { value: 0, message: 'Cannot be negative' }
                  })}
                  type="number"
                  min="0"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                <Activity className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </FormField>

            <FormField label="Water Intake (glasses)" error={errors.waterIntake}>
              <div className="relative">
                <input
                  {...register('waterIntake', {
                    min: { value: 0, message: 'Cannot be negative' }
                  })}
                  type="number"
                  min="0"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                <Droplets className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </FormField>
          </div>
        </div>

        {/* Body Systems */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Body Systems</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField label="Appetite" error={errors.appetite}>
              <select
                {...register('appetite')}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="poor">Poor</option>
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="good">Good</option>
                <option value="excellent">Excellent</option>
              </select>
            </FormField>

            <FormField label="Digestion" error={errors.digestion}>
              <select
                {...register('digestion')}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="poor">Poor</option>
                <option value="slow">Slow</option>
                <option value="normal">Normal</option>
                <option value="good">Good</option>
                <option value="excellent">Excellent</option>
              </select>
            </FormField>

            <FormField label="Bowel Movement" error={errors.bowelMovement}>
              <select
                {...register('bowelMovement')}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="constipated">Constipated</option>
                <option value="irregular">Irregular</option>
                <option value="normal">Normal</option>
                <option value="loose">Loose</option>
                <option value="diarrhea">Diarrhea</option>
              </select>
            </FormField>
          </div>
        </div>

        {/* Pain Assessment */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Pain Assessment</h3>
          <div className="space-y-4">
            <SliderField
              name="painLevel"
              label="Pain Level (0 = No Pain, 10 = Severe Pain)"
              icon={AlertTriangle}
              min={0}
              max={10}
              unit=""
              color="red"
            />
            
            {watchPainLevel > 0 && (
              <FormField label="Pain Location" error={errors.painLocation}>
                <input
                  {...register('painLocation')}
                  type="text"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Describe where you feel pain..."
                />
              </FormField>
            )}
          </div>
        </div>

        {/* Additional Information */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Information</h3>
          <div className="space-y-4">
            <FormField label="Current Symptoms" error={errors.symptoms}>
              <textarea
                {...register('symptoms')}
                rows={3}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Any symptoms you're experiencing today..."
              />
            </FormField>

            <FormField label="Medications/Supplements" error={errors.medications}>
              <textarea
                {...register('medications')}
                rows={2}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="List any medications or supplements taken today..."
              />
            </FormField>

            <FormField label="Additional Notes" error={errors.notes}>
              <textarea
                {...register('notes')}
                rows={3}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Any other observations or notes about your wellness today..."
              />
            </FormField>
          </div>
        </div>

        {/* Summary Card */}
        <div className="border-t border-gray-200 pt-6">
          <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-lg p-4">
            <h4 className="text-md font-semibold text-gray-900 mb-2">Today's Summary</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="text-lg font-bold text-emerald-600">{watch('energyLevel')}%</div>
                <div className="text-gray-600">Energy</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">{watch('sleepQuality')}%</div>
                <div className="text-gray-600">Sleep</div>
              </div>
              <div className="text-center flex flex-col items-center">
                <div className="text-lg font-bold text-emerald-600 flex items-center">
                  {watch('moodLevel')}% {getMoodIcon(watchMoodLevel)}
                </div>
                <div className="text-gray-600">Mood</div>
              </div>
              <div className="text-center">
                <div className={cn("text-lg font-bold", getStressColor(watchStressLevel))}>
                  {watch('stressLevel')}%
                </div>
                <div className="text-gray-600">Stress</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <ModalFooter>
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
          >
            <X className="h-4 w-4 mr-2 inline" />
            Cancel
          </button>
          
          <button
            type="submit"
            disabled={isLoading}
            className={cn(
              "inline-flex items-center px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2",
              isLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500"
            )}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Check-in
              </>
            )}
          </button>
        </ModalFooter>
      </form>
    </Modal>
  );
};

export default WellnessModal;