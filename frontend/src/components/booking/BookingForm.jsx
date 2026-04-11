import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Calendar, Clock, User, AlertCircle } from 'lucide-react';
import therapyService from '../../services/therapyService.js';
import bookingService from '../../services/bookingService.js';
import { useFormSubmit, useDataFetching } from '../../hooks/useAsyncOperation.js';
import LoadingSpinner, { CardLoader, FormSkeleton } from '../../components/ui/LoadingSpinner.jsx';
import { SimpleErrorFallback } from '../../components/ErrorBoundary.jsx';
import toast from '../../utils/toast.js';

const BookingForm = ({ onSuccess, onCancel }) => {
  const [availableSlots, setAvailableSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState(null);
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset
  } = useForm();

  // Load therapies using data fetching hook
  const {
    data: therapies = [],
    loading: therapiesLoading,
    error: therapiesError,
    refetch: refetchTherapies
  } = useDataFetching(
    () => therapyService.getAllTherapies().then(response => response.therapies || []),
    [],
    {
      onError: (error) => console.error('Error loading therapies:', error)
    }
  );

  // Mock practitioners - in real app would use data fetching hook
  const practitioners = [
    {
      id: 'practitioner-1',
      firstName: 'Dr. Sarah',
      lastName: 'Smith',
      specialization: ['Panchakarma', 'Ayurvedic Massage']
    },
    {
      id: 'practitioner-2', 
      firstName: 'Dr. Michael',
      lastName: 'Johnson',
      specialization: ['Detox', 'Wellness']
    }
  ];

  // Form submission hook
  const { handleSubmit: submitForm, submitting, error: submitError } = useFormSubmit(
    async (data) => {
      const bookingData = {
        therapyId: data.therapyId,
        practitionerId: data.practitionerId,
        preferredDate: data.preferredDate,
        preferredTime: data.preferredTime,
        duration: parseInt(data.duration) || 60,
        notes: data.notes || ''
      };

      return await bookingService.createBooking(bookingData);
    },
    {
      onSuccess: (booking) => {
        toast.success('Booking created successfully! You will receive a confirmation email shortly.');
        if (onSuccess) {
          onSuccess(booking);
        }
        reset();
      },
      onError: (error) => {
        console.error('Booking error:', error);
        toast.error(`Booking failed: ${error.message || 'Please try again.'}`);
      }
    }
  );

  const selectedTherapy = watch('therapyId');
  const selectedPractitioner = watch('practitionerId');
  const selectedDate = watch('preferredDate');

  // Load available slots when practitioner and date change
  useEffect(() => {
    if (selectedPractitioner && selectedDate) {
      loadAvailableSlots(selectedPractitioner, selectedDate);
    } else {
      setAvailableSlots([]);
    }
  }, [selectedPractitioner, selectedDate]);

  const loadAvailableSlots = async (practitionerId, date) => {
    try {
      setSlotsLoading(true);
      setSlotsError(null);
      const response = await bookingService.getAvailableSlots(practitionerId, date);
      setAvailableSlots(response.availableSlots || []);
    } catch (error) {
      console.error('Error loading available slots:', error);
      setSlotsError({ message: error.message || 'Failed to load available slots' });
      setAvailableSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  };

  const selectedTherapyDetails = therapies.find(t => t.id === selectedTherapy);
  const combinedError = therapiesError || submitError;

  // Show loading skeleton while therapies are loading
  if (therapiesLoading) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Book a Therapy Session</h2>
          <p className="text-gray-600">Loading therapy options...</p>
        </div>
        <FormSkeleton fields={6} />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Book a Therapy Session</h2>
        <p className="text-gray-600">Schedule your Panchakarma therapy session with our qualified practitioners.</p>
      </div>

      {/* Error Display */}
      {combinedError && (
        <SimpleErrorFallback 
          error={combinedError} 
          retry={() => {
            if (therapiesError) {
              refetchTherapies();
            }
          }}
        />
      )}

      <form onSubmit={handleSubmit(submitForm)} className="space-y-6">
        {/* Therapy Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Therapy *
          </label>
          <select
            {...register('therapyId', { required: 'Please select a therapy' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="">Choose a therapy...</option>
            {therapies.map(therapy => (
              <option key={therapy.id} value={therapy.id}>
                {therapy.name} - ${therapy.price} ({therapy.duration}min)
              </option>
            ))}
          </select>
          {errors.therapyId && (
            <p className="mt-1 text-sm text-red-600">{errors.therapyId.message}</p>
          )}
        </div>

        {/* Therapy Details */}
        {selectedTherapyDetails && (
          <div className="p-4 bg-emerald-50 rounded-md">
            <h4 className="font-medium text-emerald-900 mb-2">{selectedTherapyDetails.fullName}</h4>
            <p className="text-sm text-emerald-800 mb-2">{selectedTherapyDetails.description}</p>
            <div className="flex flex-wrap gap-4 text-sm text-emerald-700">
              <span>Duration: {selectedTherapyDetails.duration} minutes</span>
              <span>Price: ${selectedTherapyDetails.price}</span>
              <span>Category: {selectedTherapyDetails.category}</span>
            </div>
          </div>
        )}

        {/* Practitioner Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Practitioner *
          </label>
          <select
            {...register('practitionerId', { required: 'Please select a practitioner' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="">Choose a practitioner...</option>
            {practitioners.map(practitioner => (
              <option key={practitioner.id} value={practitioner.id}>
                {practitioner.firstName} {practitioner.lastName}
              </option>
            ))}
          </select>
          {errors.practitionerId && (
            <p className="mt-1 text-sm text-red-600">{errors.practitionerId.message}</p>
          )}
        </div>

        {/* Date Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Preferred Date *
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="date"
              {...register('preferredDate', { required: 'Please select a date' })}
              min={new Date().toISOString().split('T')[0]}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          {errors.preferredDate && (
            <p className="mt-1 text-sm text-red-600">{errors.preferredDate.message}</p>
          )}
        </div>

        {/* Time Selection */}
        {selectedPractitioner && selectedDate && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Available Time Slots *
            </label>
            {slotsLoading ? (
              <CardLoader text="Loading available slots..." />
            ) : slotsError ? (
              <SimpleErrorFallback 
                error={slotsError} 
                retry={() => loadAvailableSlots(selectedPractitioner, selectedDate)}
              />
            ) : availableSlots.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {availableSlots.map(slot => (
                  <label key={slot.time} className="flex items-center space-x-2 p-2 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      value={slot.time}
                      {...register('preferredTime', { required: 'Please select a time' })}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-sm">{slot.time}</span>
                  </label>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-gray-50 rounded-lg text-center">
                <p className="text-gray-500 text-sm mb-2">No available slots for the selected date.</p>
                <button
                  type="button"
                  onClick={() => loadAvailableSlots(selectedPractitioner, selectedDate)}
                  className="text-emerald-600 hover:text-emerald-700 text-sm underline"
                >
                  Refresh slots
                </button>
              </div>
            )}
            {errors.preferredTime && (
              <p className="mt-1 text-sm text-red-600">{errors.preferredTime.message}</p>
            )}
          </div>
        )}

        {/* Duration Override */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Duration (minutes)
          </label>
          <input
            type="number"
            {...register('duration', { min: 30, max: 240 })}
            placeholder={selectedTherapyDetails?.duration || '60'}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
          <p className="mt-1 text-sm text-gray-500">Leave blank to use default therapy duration</p>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Special Notes (Optional)
          </label>
          <textarea
            {...register('notes')}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            placeholder="Any special requirements or notes for your session..."
          />
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || therapiesLoading}
            className="px-6 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {submitting ? (
              <LoadingSpinner size="small" className="mr-2" />
            ) : null}
            {submitting ? 'Booking...' : 'Book Session'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BookingForm;