import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { 
  Save, 
  X, 
  Plus, 
  DollarSign, 
  Clock, 
  FileText, 
  Tag, 
  Users,
  AlertTriangle 
} from 'lucide-react';
import Modal, { ModalFooter } from '../ui/Modal';
import toast from '../../utils/toast';

const cn = (...classes) => classes.filter(Boolean).join(' ');

const TherapyModal = ({ 
  isOpen, 
  onClose, 
  therapy = null, 
  onSave, 
  mode = 'create' // 'create', 'edit', 'view'
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const isEditing = mode === 'edit';
  const isCreating = mode === 'create';
  const isViewing = mode === 'view';

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue
  } = useForm({
    defaultValues: {
      name: '',
      description: '',
      category: 'massage',
      duration: 60,
      price: 100,
      isActive: true,
      maxParticipants: 1,
      requirements: '',
      benefits: '',
      contraindications: ''
    }
  });

  // Reset form when therapy changes
  useEffect(() => {
    if (therapy) {
      reset({
        name: therapy.name || '',
        description: therapy.description || '',
        category: therapy.category || 'massage',
        duration: therapy.duration || 60,
        price: therapy.price || 100,
        isActive: therapy.isActive !== false,
        maxParticipants: therapy.maxParticipants || 1,
        requirements: therapy.requirements || '',
        benefits: therapy.benefits || '',
        contraindications: therapy.contraindications || ''
      });
    } else {
      reset({
        name: '',
        description: '',
        category: 'massage',
        duration: 60,
        price: 100,
        isActive: true,
        maxParticipants: 1,
        requirements: '',
        benefits: '',
        contraindications: ''
      });
    }
  }, [therapy, reset]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await onSave({
        id: therapy?.id,
        ...data,
        price: parseFloat(data.price),
        duration: parseInt(data.duration),
        maxParticipants: parseInt(data.maxParticipants)
      });
      
      toast.success(
        isCreating 
          ? `Therapy "${data.name}" created successfully!`
          : `Therapy "${data.name}" updated successfully!`
      );
      onClose();
    } catch (error) {
      toast.error(
        isCreating 
          ? 'Failed to create therapy. Please try again.'
          : 'Failed to update therapy. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const categories = [
    { value: 'massage', label: 'Massage Therapy' },
    { value: 'detox', label: 'Detoxification' },
    { value: 'rejuvenation', label: 'Rejuvenation' },
    { value: 'panchakarma', label: 'Panchakarma' },
    { value: 'meditation', label: 'Meditation & Yoga' },
    { value: 'consultation', label: 'Consultation' },
    { value: 'herbal', label: 'Herbal Treatment' }
  ];

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

  const title = isCreating 
    ? 'Add New Therapy' 
    : isEditing 
      ? `Edit ${therapy?.name || 'Therapy'}` 
      : therapy?.name || 'Therapy Details';

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose} 
      title={title}
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField 
            label="Therapy Name" 
            error={errors.name} 
            required
          >
            <div className="relative">
              <input
                {...register('name', {
                  required: 'Therapy name is required',
                  minLength: { value: 3, message: 'Name must be at least 3 characters' }
                })}
                type="text"
                disabled={isViewing}
                className={cn(
                  "block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500",
                  errors.name ? "border-red-300" : "border-gray-300",
                  isViewing ? "bg-gray-50 text-gray-500" : ""
                )}
                placeholder="Enter therapy name"
              />
              <FileText className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </FormField>

          <FormField 
            label="Category" 
            error={errors.category} 
            required
          >
            <div className="relative">
              <select
                {...register('category', { required: 'Category is required' })}
                disabled={isViewing}
                className={cn(
                  "block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500",
                  errors.category ? "border-red-300" : "border-gray-300",
                  isViewing ? "bg-gray-50 text-gray-500" : ""
                )}
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
              <Tag className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </FormField>
        </div>

        {/* Description */}
        <FormField 
          label="Description" 
          error={errors.description} 
          required
          helpText="Provide a detailed description of the therapy"
        >
          <textarea
            {...register('description', {
              required: 'Description is required',
              minLength: { value: 10, message: 'Description must be at least 10 characters' }
            })}
            disabled={isViewing}
            rows={4}
            className={cn(
              "block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500",
              errors.description ? "border-red-300" : "border-gray-300",
              isViewing ? "bg-gray-50 text-gray-500" : ""
            )}
            placeholder="Describe the therapy, its techniques, and what patients can expect..."
          />
        </FormField>

        {/* Duration and Price */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField 
            label="Duration (minutes)" 
            error={errors.duration} 
            required
          >
            <div className="relative">
              <input
                {...register('duration', {
                  required: 'Duration is required',
                  min: { value: 15, message: 'Duration must be at least 15 minutes' },
                  max: { value: 480, message: 'Duration cannot exceed 8 hours' }
                })}
                type="number"
                disabled={isViewing}
                min="15"
                max="480"
                step="15"
                className={cn(
                  "block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500",
                  errors.duration ? "border-red-300" : "border-gray-300",
                  isViewing ? "bg-gray-50 text-gray-500" : ""
                )}
              />
              <Clock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </FormField>

          <FormField 
            label="Price ($)" 
            error={errors.price} 
            required
          >
            <div className="relative">
              <input
                {...register('price', {
                  required: 'Price is required',
                  min: { value: 0, message: 'Price cannot be negative' }
                })}
                type="number"
                disabled={isViewing}
                min="0"
                step="0.01"
                className={cn(
                  "block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500",
                  errors.price ? "border-red-300" : "border-gray-300",
                  isViewing ? "bg-gray-50 text-gray-500" : ""
                )}
              />
              <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </FormField>

          <FormField 
            label="Max Participants" 
            error={errors.maxParticipants}
            helpText="Usually 1 for individual therapy"
          >
            <div className="relative">
              <input
                {...register('maxParticipants', {
                  min: { value: 1, message: 'Must allow at least 1 participant' },
                  max: { value: 20, message: 'Cannot exceed 20 participants' }
                })}
                type="number"
                disabled={isViewing}
                min="1"
                max="20"
                className={cn(
                  "block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500",
                  errors.maxParticipants ? "border-red-300" : "border-gray-300",
                  isViewing ? "bg-gray-50 text-gray-500" : ""
                )}
              />
              <Users className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </FormField>
        </div>

        {/* Status */}
        <div className="flex items-center">
          <input
            {...register('isActive')}
            type="checkbox"
            disabled={isViewing}
            className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
          />
          <label className="ml-2 text-sm text-gray-700">
            Active (available for booking)
          </label>
        </div>

        {/* Additional Information */}
        <div className="space-y-6 border-t border-gray-200 pt-6">
          <h3 className="text-lg font-medium text-gray-900">Additional Information</h3>
          
          <FormField 
            label="Benefits" 
            error={errors.benefits}
            helpText="List the main benefits and outcomes"
          >
            <textarea
              {...register('benefits')}
              disabled={isViewing}
              rows={3}
              className={cn(
                "block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500",
                errors.benefits ? "border-red-300" : "border-gray-300",
                isViewing ? "bg-gray-50 text-gray-500" : ""
              )}
              placeholder="List the key benefits of this therapy..."
            />
          </FormField>

          <FormField 
            label="Requirements" 
            error={errors.requirements}
            helpText="Any preparation or requirements for patients"
          >
            <textarea
              {...register('requirements')}
              disabled={isViewing}
              rows={2}
              className={cn(
                "block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500",
                errors.requirements ? "border-red-300" : "border-gray-300",
                isViewing ? "bg-gray-50 text-gray-500" : ""
              )}
              placeholder="Any special requirements or preparation needed..."
            />
          </FormField>

          <FormField 
            label="Contraindications" 
            error={errors.contraindications}
            helpText="Important warnings or conditions that exclude patients"
          >
            <textarea
              {...register('contraindications')}
              disabled={isViewing}
              rows={2}
              className={cn(
                "block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500",
                errors.contraindications ? "border-red-300" : "border-gray-300",
                isViewing ? "bg-gray-50 text-gray-500" : ""
              )}
              placeholder="List any contraindications or warnings..."
            />
          </FormField>
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
          
          {!isViewing && (
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
                  {isCreating ? <Plus className="h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                  {isCreating ? 'Create Therapy' : 'Save Changes'}
                </>
              )}
            </button>
          )}
        </ModalFooter>
      </form>
    </Modal>
  );
};

export default TherapyModal;