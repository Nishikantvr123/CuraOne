import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { 
  Calendar, 
  Clock, 
  User, 
  FileText, 
  DollarSign, 
  Plus, 
  Save,
  X,
  AlertTriangle,
  Users,
  MapPin,
  Phone,
  Mail
} from 'lucide-react';
import Modal, { ModalFooter } from '../ui/Modal';
import toast from '../../utils/toast';
import { useRealtime } from '../../contexts/RealtimeContext';

const cn = (...classes) => classes.filter(Boolean).join(' ');

const BookingModal = ({ 
  isOpen, 
  onClose, 
  booking = null, 
  onSave, 
  mode = 'create', // 'create', 'edit', 'view'
  availableTherapies = [],
  availablePractitioners = [],
  currentUser = null
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTherapy, setSelectedTherapy] = useState(null);
  const [selectedPractitioner, setSelectedPractitioner] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const { sendBookingUpdate } = useRealtime();

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
      therapyId: '',
      practitionerId: '',
      scheduledDate: '',
      scheduledTime: '',
      duration: 60,
      notes: '',
      patientName: '',
      patientEmail: '',
      patientPhone: '',
      specialRequests: '',
      roomPreference: '',
      status: 'pending'
    }
  });

  const watchTherapyId = watch('therapyId');
  const watchPractitionerId = watch('practitionerId');
  const watchScheduledDate = watch('scheduledDate');

  // Mock available times (in real app, this would come from API based on practitioner availability)
  const generateAvailableSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeString);
      }
    }
    return slots;
  };

  useEffect(() => {
    if (watchPractitionerId && watchScheduledDate) {
      // In a real app, this would fetch available slots from the API
      setAvailableSlots(generateAvailableSlots());
    }
  }, [watchPractitionerId, watchScheduledDate]);

  useEffect(() => {
    const therapy = availableTherapies.find(t => t.id === watchTherapyId);
    setSelectedTherapy(therapy);
    if (therapy) {
      setValue('duration', therapy.duration);
    }
  }, [watchTherapyId, availableTherapies, setValue]);

  useEffect(() => {
    const practitioner = availablePractitioners.find(p => p.id === watchPractitionerId);
    setSelectedPractitioner(practitioner);
  }, [watchPractitionerId, availablePractitioners]);

  // Reset form when booking changes
  useEffect(() => {
    if (booking) {
      reset({
        therapyId: booking.therapy?.id || '',
        practitionerId: booking.practitioner?.id || '',
        scheduledDate: booking.scheduledDate || '',
        scheduledTime: booking.scheduledTime || '',
        duration: booking.duration || 60,
        notes: booking.notes || '',
        patientName: booking.patient?.name || '',
        patientEmail: booking.patient?.email || '',
        patientPhone: booking.patient?.phone || '',
        specialRequests: booking.specialRequests || '',
        roomPreference: booking.roomPreference || '',
        status: booking.status || 'pending'
      });
    } else if (currentUser) {
      // Pre-fill user info for new bookings
      reset({
        therapyId: '',
        practitionerId: '',
        scheduledDate: '',
        scheduledTime: '',
        duration: 60,
        notes: '',
        patientName: currentUser.name || `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim(),
        patientEmail: currentUser.email || '',
        patientPhone: currentUser.phone || '',
        specialRequests: '',
        roomPreference: '',
        status: 'pending'
      });
    }
  }, [booking, currentUser, reset]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const bookingData = {
        id: booking?.id,
        ...data,
        therapy: selectedTherapy,
        practitioner: selectedPractitioner,
        patient: {
          name: data.patientName,
          email: data.patientEmail,
          phone: data.patientPhone
        },
        amount: selectedTherapy?.price || 0,
        duration: parseInt(data.duration)
      };

      await onSave(bookingData);
      
      // Send real-time update
      if (sendBookingUpdate) {
        const action = isCreating ? 'created' : 'updated';
        sendBookingUpdate(bookingData, action);
      }
      
      toast.success(
        isCreating 
          ? 'Booking created successfully!'
          : 'Booking updated successfully!'
      );
      onClose();
    } catch (error) {
      toast.error(
        isCreating 
          ? 'Failed to create booking. Please try again.'
          : 'Failed to update booking. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
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

  const title = isCreating 
    ? 'Book New Session' 
    : isEditing 
      ? 'Edit Booking' 
      : 'Booking Details';

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose} 
      title={title}
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Patient Information */}
        <div className="border-b border-gray-200 pb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Patient Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField label="Patient Name" error={errors.patientName} required>
              <div className="relative">
                <input
                  {...register('patientName', {
                    required: 'Patient name is required'
                  })}
                  type="text"
                  disabled={isViewing}
                  className={cn(
                    "block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500",
                    errors.patientName ? "border-red-300" : "border-gray-300",
                    isViewing ? "bg-gray-50 text-gray-500" : ""
                  )}
                  placeholder="Enter patient name"
                />
                <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </FormField>

            <FormField label="Email" error={errors.patientEmail} required>
              <div className="relative">
                <input
                  {...register('patientEmail', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Please enter a valid email'
                    }
                  })}
                  type="email"
                  disabled={isViewing}
                  className={cn(
                    "block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500",
                    errors.patientEmail ? "border-red-300" : "border-gray-300",
                    isViewing ? "bg-gray-50 text-gray-500" : ""
                  )}
                  placeholder="patient@example.com"
                />
                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </FormField>

            <FormField label="Phone" error={errors.patientPhone}>
              <div className="relative">
                <input
                  {...register('patientPhone')}
                  type="tel"
                  disabled={isViewing}
                  className={cn(
                    "block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500",
                    errors.patientPhone ? "border-red-300" : "border-gray-300",
                    isViewing ? "bg-gray-50 text-gray-500" : ""
                  )}
                  placeholder="+1 (555) 000-0000"
                />
                <Phone className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </FormField>
          </div>
        </div>

        {/* Booking Details */}
        <div className="space-y-6">
          <h3 className="text-lg font-medium text-gray-900">Booking Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Therapy" error={errors.therapyId} required>
              <select
                {...register('therapyId', { required: 'Please select a therapy' })}
                disabled={isViewing}
                className={cn(
                  "block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500",
                  errors.therapyId ? "border-red-300" : "border-gray-300",
                  isViewing ? "bg-gray-50 text-gray-500" : ""
                )}
              >
                <option value="">Select a therapy...</option>
                {availableTherapies.map((therapy) => (
                  <option key={therapy.id} value={therapy.id}>
                    {therapy.name} - ${therapy.price} ({therapy.duration}min)
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Practitioner" error={errors.practitionerId} required>
              <select
                {...register('practitionerId', { required: 'Please select a practitioner' })}
                disabled={isViewing}
                className={cn(
                  "block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500",
                  errors.practitionerId ? "border-red-300" : "border-gray-300",
                  isViewing ? "bg-gray-50 text-gray-500" : ""
                )}
              >
                <option value="">Select a practitioner...</option>
                {availablePractitioners.map((practitioner) => (
                  <option key={practitioner.id} value={practitioner.id}>
                    {practitioner.name || `${practitioner.firstName} ${practitioner.lastName}`}
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField label="Date" error={errors.scheduledDate} required>
              <div className="relative">
                <input
                  {...register('scheduledDate', {
                    required: 'Please select a date'
                  })}
                  type="date"
                  min={today}
                  disabled={isViewing}
                  className={cn(
                    "block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500",
                    errors.scheduledDate ? "border-red-300" : "border-gray-300",
                    isViewing ? "bg-gray-50 text-gray-500" : ""
                  )}
                />
                <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </FormField>

            <FormField label="Time" error={errors.scheduledTime} required>
              <div className="relative">
                <select
                  {...register('scheduledTime', { required: 'Please select a time' })}
                  disabled={isViewing || !watchPractitionerId || !watchScheduledDate}
                  className={cn(
                    "block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500",
                    errors.scheduledTime ? "border-red-300" : "border-gray-300",
                    isViewing ? "bg-gray-50 text-gray-500" : ""
                  )}
                >
                  <option value="">Select time...</option>
                  {availableSlots.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
                <Clock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </FormField>

            <FormField label="Duration (min)" error={errors.duration}>
              <div className="relative">
                <input
                  {...register('duration', {
                    min: { value: 15, message: 'Minimum 15 minutes' },
                    max: { value: 480, message: 'Maximum 8 hours' }
                  })}
                  type="number"
                  min="15"
                  max="480"
                  step="15"
                  disabled={isViewing}
                  className={cn(
                    "block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500",
                    errors.duration ? "border-red-300" : "border-gray-300",
                    isViewing ? "bg-gray-50 text-gray-500" : ""
                  )}
                />
                <Clock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </FormField>
          </div>

          {/* Room Preference */}
          <FormField label="Room Preference" error={errors.roomPreference}>
            <div className="relative">
              <select
                {...register('roomPreference')}
                disabled={isViewing}
                className={cn(
                  "block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500",
                  errors.roomPreference ? "border-red-300" : "border-gray-300",
                  isViewing ? "bg-gray-50 text-gray-500" : ""
                )}
              >
                <option value="">No preference</option>
                <option value="room-101">Room 101 (Ground Floor)</option>
                <option value="room-201">Room 201 (Quiet)</option>
                <option value="room-202">Room 202 (Garden View)</option>
                <option value="room-301">Room 301 (Premium)</option>
              </select>
              <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </FormField>

          {/* Notes and Special Requests */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Notes" error={errors.notes}>
              <textarea
                {...register('notes')}
                disabled={isViewing}
                rows={3}
                className={cn(
                  "block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500",
                  errors.notes ? "border-red-300" : "border-gray-300",
                  isViewing ? "bg-gray-50 text-gray-500" : ""
                )}
                placeholder="Any additional notes..."
              />
            </FormField>

            <FormField label="Special Requests" error={errors.specialRequests}>
              <textarea
                {...register('specialRequests')}
                disabled={isViewing}
                rows={3}
                className={cn(
                  "block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500",
                  errors.specialRequests ? "border-red-300" : "border-gray-300",
                  isViewing ? "bg-gray-50 text-gray-500" : ""
                )}
                placeholder="Any special requests or requirements..."
              />
            </FormField>
          </div>
        </div>

        {/* Booking Summary */}
        {selectedTherapy && (
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Booking Summary</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Therapy:</span>
                <span className="text-sm font-medium">{selectedTherapy.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Duration:</span>
                <span className="text-sm font-medium">{watch('duration')} minutes</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Price:</span>
                <span className="text-sm font-medium">${selectedTherapy.price}</span>
              </div>
              {selectedPractitioner && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Practitioner:</span>
                  <span className="text-sm font-medium">
                    {selectedPractitioner.name || `${selectedPractitioner.firstName} ${selectedPractitioner.lastName}`}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Status (for editing mode) */}
        {(isEditing || isViewing) && (
          <FormField label="Status">
            <select
              {...register('status')}
              disabled={isViewing}
              className={cn(
                "block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500",
                isViewing ? "bg-gray-50 text-gray-500" : ""
              )}
            >
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="no-show">No Show</option>
            </select>
          </FormField>
        )}

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
                  {isCreating ? 'Book Session' : 'Save Changes'}
                </>
              )}
            </button>
          )}
        </ModalFooter>
      </form>
    </Modal>
  );
};

export default BookingModal;