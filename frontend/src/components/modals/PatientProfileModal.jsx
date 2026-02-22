import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Heart,
  AlertTriangle,
  Plus,
  Trash2,
  Save,
  X,
  FileText,
  Clock,
  Activity,
  Stethoscope,
  Pill
} from 'lucide-react';
import Modal, { ModalFooter } from '../ui/Modal';
import toast from '../../utils/toast';

const cn = (...classes) => classes.filter(Boolean).join(' ');

const PatientProfileModal = ({ 
  isOpen, 
  onClose, 
  patient = null, 
  onSave, 
  mode = 'view' // 'view', 'edit', 'create'
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  const isEditing = mode === 'edit';
  const isCreating = mode === 'create';
  const isViewing = mode === 'view';

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
    watch
  } = useForm({
    defaultValues: {
      // Basic Information
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      gender: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'USA'
      },
      
      // Medical Information
      medicalHistory: '',
      currentMedications: [{ name: '', dosage: '', frequency: '', notes: '' }],
      allergies: [{ allergen: '', reaction: '', severity: 'mild' }],
      emergencyContact: {
        name: '',
        relationship: '',
        phone: '',
        email: ''
      },
      
      // Ayurvedic Profile
      constitution: 'vata', // vata, pitta, kapha
      currentImbalance: '',
      treatmentGoals: '',
      practitionerNotes: '',
      
      // Lifestyle Information
      occupation: '',
      exerciseLevel: 'moderate',
      sleepPattern: '',
      dietaryPreferences: [],
      stressLevel: 'moderate',
      
      // Preferences
      preferredPractitioner: '',
      preferredTime: 'morning',
      specialRequests: '',
      communicationPreference: 'email'
    }
  });

  const { fields: medicationFields, append: addMedication, remove: removeMedication } = useFieldArray({
    control,
    name: 'currentMedications'
  });

  const { fields: allergyFields, append: addAllergy, remove: removeAllergy } = useFieldArray({
    control,
    name: 'allergies'
  });

  // Reset form when patient changes
  useEffect(() => {
    if (patient) {
      reset({
        firstName: patient.firstName || '',
        lastName: patient.lastName || '',
        email: patient.email || '',
        phone: patient.phone || '',
        dateOfBirth: patient.dateOfBirth || '',
        gender: patient.gender || '',
        address: {
          street: patient.address?.street || '',
          city: patient.address?.city || '',
          state: patient.address?.state || '',
          zipCode: patient.address?.zipCode || '',
          country: patient.address?.country || 'USA'
        },
        medicalHistory: patient.medicalHistory || '',
        currentMedications: patient.currentMedications || [{ name: '', dosage: '', frequency: '', notes: '' }],
        allergies: patient.allergies || [{ allergen: '', reaction: '', severity: 'mild' }],
        emergencyContact: patient.emergencyContact || {
          name: '', relationship: '', phone: '', email: ''
        },
        constitution: patient.constitution || 'vata',
        currentImbalance: patient.currentImbalance || '',
        treatmentGoals: patient.treatmentGoals || '',
        practitionerNotes: patient.practitionerNotes || '',
        occupation: patient.occupation || '',
        exerciseLevel: patient.exerciseLevel || 'moderate',
        sleepPattern: patient.sleepPattern || '',
        dietaryPreferences: patient.dietaryPreferences || [],
        stressLevel: patient.stressLevel || 'moderate',
        preferredPractitioner: patient.preferredPractitioner || '',
        preferredTime: patient.preferredTime || 'morning',
        specialRequests: patient.specialRequests || '',
        communicationPreference: patient.communicationPreference || 'email'
      });
    }
  }, [patient, reset]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const profileData = {
        id: patient?.id,
        ...data,
        updatedAt: new Date().toISOString()
      };

      await onSave(profileData);
      
      toast.success(
        isCreating 
          ? 'Patient profile created successfully!'
          : 'Patient profile updated successfully!'
      );
      onClose();
    } catch (error) {
      toast.error(
        isCreating 
          ? 'Failed to create patient profile. Please try again.'
          : 'Failed to update patient profile. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    setActiveTab('basic');
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

  const tabs = [
    { id: 'basic', name: 'Basic Info', icon: User },
    { id: 'medical', name: 'Medical', icon: Stethoscope },
    { id: 'ayurvedic', name: 'Ayurvedic Profile', icon: Heart },
    { id: 'lifestyle', name: 'Lifestyle', icon: Activity },
    { id: 'preferences', name: 'Preferences', icon: FileText }
  ];

  const title = isCreating 
    ? 'New Patient Profile' 
    : isEditing 
      ? `Edit ${patient?.firstName || 'Patient'}'s Profile` 
      : `${patient?.firstName || 'Patient'} ${patient?.lastName || ''} Profile`;

  const renderBasicInfo = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField label="First Name" error={errors.firstName} required>
          <input
            {...register('firstName', { required: 'First name is required' })}
            disabled={isViewing}
            className={cn(
              "block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500",
              errors.firstName ? "border-red-300" : "border-gray-300",
              isViewing ? "bg-gray-50 text-gray-500" : ""
            )}
          />
        </FormField>

        <FormField label="Last Name" error={errors.lastName} required>
          <input
            {...register('lastName', { required: 'Last name is required' })}
            disabled={isViewing}
            className={cn(
              "block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500",
              errors.lastName ? "border-red-300" : "border-gray-300",
              isViewing ? "bg-gray-50 text-gray-500" : ""
            )}
          />
        </FormField>

        <FormField label="Email" error={errors.email} required>
          <input
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Please enter a valid email'
              }
            })}
            type="email"
            disabled={isViewing}
            className={cn(
              "block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500",
              errors.email ? "border-red-300" : "border-gray-300",
              isViewing ? "bg-gray-50 text-gray-500" : ""
            )}
          />
        </FormField>

        <FormField label="Phone" error={errors.phone}>
          <input
            {...register('phone')}
            type="tel"
            disabled={isViewing}
            className={cn(
              "block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500",
              errors.phone ? "border-red-300" : "border-gray-300",
              isViewing ? "bg-gray-50 text-gray-500" : ""
            )}
          />
        </FormField>

        <FormField label="Date of Birth" error={errors.dateOfBirth}>
          <input
            {...register('dateOfBirth')}
            type="date"
            disabled={isViewing}
            className={cn(
              "block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500",
              errors.dateOfBirth ? "border-red-300" : "border-gray-300",
              isViewing ? "bg-gray-50 text-gray-500" : ""
            )}
          />
        </FormField>

        <FormField label="Gender" error={errors.gender}>
          <select
            {...register('gender')}
            disabled={isViewing}
            className={cn(
              "block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500",
              errors.gender ? "border-red-300" : "border-gray-300",
              isViewing ? "bg-gray-50 text-gray-500" : ""
            )}
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="non-binary">Non-binary</option>
            <option value="prefer-not-to-say">Prefer not to say</option>
          </select>
        </FormField>
      </div>

      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Address</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <FormField label="Street Address" error={errors.address?.street}>
              <input
                {...register('address.street')}
                disabled={isViewing}
                className={cn(
                  "block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500",
                  errors.address?.street ? "border-red-300" : "border-gray-300",
                  isViewing ? "bg-gray-50 text-gray-500" : ""
                )}
              />
            </FormField>
          </div>

          <FormField label="City" error={errors.address?.city}>
            <input
              {...register('address.city')}
              disabled={isViewing}
              className={cn(
                "block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500",
                errors.address?.city ? "border-red-300" : "border-gray-300",
                isViewing ? "bg-gray-50 text-gray-500" : ""
              )}
            />
          </FormField>

          <FormField label="State" error={errors.address?.state}>
            <input
              {...register('address.state')}
              disabled={isViewing}
              className={cn(
                "block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500",
                errors.address?.state ? "border-red-300" : "border-gray-300",
                isViewing ? "bg-gray-50 text-gray-500" : ""
              )}
            />
          </FormField>

          <FormField label="ZIP Code" error={errors.address?.zipCode}>
            <input
              {...register('address.zipCode')}
              disabled={isViewing}
              className={cn(
                "block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500",
                errors.address?.zipCode ? "border-red-300" : "border-gray-300",
                isViewing ? "bg-gray-50 text-gray-500" : ""
              )}
            />
          </FormField>

          <FormField label="Country" error={errors.address?.country}>
            <select
              {...register('address.country')}
              disabled={isViewing}
              className={cn(
                "block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500",
                errors.address?.country ? "border-red-300" : "border-gray-300",
                isViewing ? "bg-gray-50 text-gray-500" : ""
              )}
            >
              <option value="USA">United States</option>
              <option value="Canada">Canada</option>
              <option value="UK">United Kingdom</option>
              <option value="India">India</option>
              <option value="Australia">Australia</option>
            </select>
          </FormField>
        </div>
      </div>
    </div>
  );

  const renderMedicalInfo = () => (
    <div className="space-y-6">
      <FormField label="Medical History" error={errors.medicalHistory}>
        <textarea
          {...register('medicalHistory')}
          disabled={isViewing}
          rows={4}
          className={cn(
            "block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500",
            errors.medicalHistory ? "border-red-300" : "border-gray-300",
            isViewing ? "bg-gray-50 text-gray-500" : ""
          )}
          placeholder="Previous medical conditions, surgeries, treatments..."
        />
      </FormField>

      {/* Current Medications */}
      <div className="border-t border-gray-200 pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Current Medications</h3>
          {!isViewing && (
            <button
              type="button"
              onClick={() => addMedication({ name: '', dosage: '', frequency: '', notes: '' })}
              className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-emerald-700 bg-emerald-100 hover:bg-emerald-200"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Medication
            </button>
          )}
        </div>

        <div className="space-y-4">
          {medicationFields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border border-gray-200 rounded-lg">
              <FormField label="Medication Name">
                <input
                  {...register(`currentMedications.${index}.name`)}
                  disabled={isViewing}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Medication name"
                />
              </FormField>

              <FormField label="Dosage">
                <input
                  {...register(`currentMedications.${index}.dosage`)}
                  disabled={isViewing}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="e.g., 5mg"
                />
              </FormField>

              <FormField label="Frequency">
                <input
                  {...register(`currentMedications.${index}.frequency`)}
                  disabled={isViewing}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="e.g., Twice daily"
                />
              </FormField>

              <div className="flex items-end">
                {!isViewing && (
                  <button
                    type="button"
                    onClick={() => removeMedication(index)}
                    className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Allergies */}
      <div className="border-t border-gray-200 pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Allergies</h3>
          {!isViewing && (
            <button
              type="button"
              onClick={() => addAllergy({ allergen: '', reaction: '', severity: 'mild' })}
              className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Allergy
            </button>
          )}
        </div>

        <div className="space-y-4">
          {allergyFields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border border-gray-200 rounded-lg">
              <FormField label="Allergen">
                <input
                  {...register(`allergies.${index}.allergen`)}
                  disabled={isViewing}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="e.g., Peanuts"
                />
              </FormField>

              <FormField label="Reaction">
                <input
                  {...register(`allergies.${index}.reaction`)}
                  disabled={isViewing}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="e.g., Rash, swelling"
                />
              </FormField>

              <FormField label="Severity">
                <select
                  {...register(`allergies.${index}.severity`)}
                  disabled={isViewing}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="mild">Mild</option>
                  <option value="moderate">Moderate</option>
                  <option value="severe">Severe</option>
                  <option value="life-threatening">Life-threatening</option>
                </select>
              </FormField>

              <div className="flex items-end">
                {!isViewing && (
                  <button
                    type="button"
                    onClick={() => removeAllergy(index)}
                    className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Emergency Contact */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Emergency Contact</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label="Name" error={errors.emergencyContact?.name}>
            <input
              {...register('emergencyContact.name')}
              disabled={isViewing}
              className={cn(
                "block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500",
                errors.emergencyContact?.name ? "border-red-300" : "border-gray-300",
                isViewing ? "bg-gray-50 text-gray-500" : ""
              )}
            />
          </FormField>

          <FormField label="Relationship" error={errors.emergencyContact?.relationship}>
            <input
              {...register('emergencyContact.relationship')}
              disabled={isViewing}
              className={cn(
                "block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500",
                errors.emergencyContact?.relationship ? "border-red-300" : "border-gray-300",
                isViewing ? "bg-gray-50 text-gray-500" : ""
              )}
              placeholder="e.g., Spouse, Parent"
            />
          </FormField>

          <FormField label="Phone" error={errors.emergencyContact?.phone}>
            <input
              {...register('emergencyContact.phone')}
              type="tel"
              disabled={isViewing}
              className={cn(
                "block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500",
                errors.emergencyContact?.phone ? "border-red-300" : "border-gray-300",
                isViewing ? "bg-gray-50 text-gray-500" : ""
              )}
            />
          </FormField>

          <FormField label="Email" error={errors.emergencyContact?.email}>
            <input
              {...register('emergencyContact.email')}
              type="email"
              disabled={isViewing}
              className={cn(
                "block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500",
                errors.emergencyContact?.email ? "border-red-300" : "border-gray-300",
                isViewing ? "bg-gray-50 text-gray-500" : ""
              )}
            />
          </FormField>
        </div>
      </div>
    </div>
  );

  const renderAyurvedicProfile = () => (
    <div className="space-y-6">
      <FormField label="Constitution (Prakriti)" error={errors.constitution}>
        <select
          {...register('constitution')}
          disabled={isViewing}
          className={cn(
            "block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500",
            errors.constitution ? "border-red-300" : "border-gray-300",
            isViewing ? "bg-gray-50 text-gray-500" : ""
          )}
        >
          <option value="vata">Vata (Air & Space)</option>
          <option value="pitta">Pitta (Fire & Water)</option>
          <option value="kapha">Kapha (Earth & Water)</option>
          <option value="vata-pitta">Vata-Pitta</option>
          <option value="pitta-kapha">Pitta-Kapha</option>
          <option value="vata-kapha">Vata-Kapha</option>
          <option value="tridosha">Tridosha (Balanced)</option>
        </select>
      </FormField>

      <FormField label="Current Imbalance (Vikriti)" error={errors.currentImbalance}>
        <textarea
          {...register('currentImbalance')}
          disabled={isViewing}
          rows={3}
          className={cn(
            "block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500",
            errors.currentImbalance ? "border-red-300" : "border-gray-300",
            isViewing ? "bg-gray-50 text-gray-500" : ""
          )}
          placeholder="Describe current dosha imbalances and symptoms..."
        />
      </FormField>

      <FormField label="Treatment Goals" error={errors.treatmentGoals}>
        <textarea
          {...register('treatmentGoals')}
          disabled={isViewing}
          rows={4}
          className={cn(
            "block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500",
            errors.treatmentGoals ? "border-red-300" : "border-gray-300",
            isViewing ? "bg-gray-50 text-gray-500" : ""
          )}
          placeholder="What are the patient's health and wellness goals?"
        />
      </FormField>

      <FormField label="Practitioner Notes" error={errors.practitionerNotes}>
        <textarea
          {...register('practitionerNotes')}
          disabled={isViewing}
          rows={4}
          className={cn(
            "block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500",
            errors.practitionerNotes ? "border-red-300" : "border-gray-300",
            isViewing ? "bg-gray-50 text-gray-500" : ""
          )}
          placeholder="Clinical observations, treatment notes..."
        />
      </FormField>
    </div>
  );

  const renderLifestyleInfo = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField label="Occupation" error={errors.occupation}>
          <input
            {...register('occupation')}
            disabled={isViewing}
            className={cn(
              "block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500",
              errors.occupation ? "border-red-300" : "border-gray-300",
              isViewing ? "bg-gray-50 text-gray-500" : ""
            )}
          />
        </FormField>

        <FormField label="Exercise Level" error={errors.exerciseLevel}>
          <select
            {...register('exerciseLevel')}
            disabled={isViewing}
            className={cn(
              "block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500",
              errors.exerciseLevel ? "border-red-300" : "border-gray-300",
              isViewing ? "bg-gray-50 text-gray-500" : ""
            )}
          >
            <option value="sedentary">Sedentary</option>
            <option value="light">Light Activity</option>
            <option value="moderate">Moderate Activity</option>
            <option value="active">Very Active</option>
            <option value="intense">Intense Training</option>
          </select>
        </FormField>

        <FormField label="Stress Level" error={errors.stressLevel}>
          <select
            {...register('stressLevel')}
            disabled={isViewing}
            className={cn(
              "block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500",
              errors.stressLevel ? "border-red-300" : "border-gray-300",
              isViewing ? "bg-gray-50 text-gray-500" : ""
            )}
          >
            <option value="low">Low</option>
            <option value="moderate">Moderate</option>
            <option value="high">High</option>
            <option value="severe">Severe</option>
          </select>
        </FormField>
      </div>

      <FormField label="Sleep Pattern" error={errors.sleepPattern}>
        <textarea
          {...register('sleepPattern')}
          disabled={isViewing}
          rows={3}
          className={cn(
            "block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500",
            errors.sleepPattern ? "border-red-300" : "border-gray-300",
            isViewing ? "bg-gray-50 text-gray-500" : ""
          )}
          placeholder="Describe sleep habits, quality, duration..."
        />
      </FormField>
    </div>
  );

  const renderPreferences = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField label="Preferred Practitioner" error={errors.preferredPractitioner}>
          <select
            {...register('preferredPractitioner')}
            disabled={isViewing}
            className={cn(
              "block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500",
              errors.preferredPractitioner ? "border-red-300" : "border-gray-300",
              isViewing ? "bg-gray-50 text-gray-500" : ""
            )}
          >
            <option value="">No preference</option>
            <option value="dr-sarah-smith">Dr. Sarah Smith</option>
            <option value="dr-raj-patel">Dr. Raj Patel</option>
            <option value="dr-maya-sharma">Dr. Maya Sharma</option>
          </select>
        </FormField>

        <FormField label="Preferred Time" error={errors.preferredTime}>
          <select
            {...register('preferredTime')}
            disabled={isViewing}
            className={cn(
              "block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500",
              errors.preferredTime ? "border-red-300" : "border-gray-300",
              isViewing ? "bg-gray-50 text-gray-500" : ""
            )}
          >
            <option value="morning">Morning (9AM - 12PM)</option>
            <option value="afternoon">Afternoon (12PM - 5PM)</option>
            <option value="evening">Evening (5PM - 8PM)</option>
          </select>
        </FormField>

        <FormField label="Communication Preference" error={errors.communicationPreference}>
          <select
            {...register('communicationPreference')}
            disabled={isViewing}
            className={cn(
              "block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500",
              errors.communicationPreference ? "border-red-300" : "border-gray-300",
              isViewing ? "bg-gray-50 text-gray-500" : ""
            )}
          >
            <option value="email">Email</option>
            <option value="sms">SMS</option>
            <option value="phone">Phone Call</option>
            <option value="app">App Notifications</option>
          </select>
        </FormField>
      </div>

      <FormField label="Special Requests" error={errors.specialRequests}>
        <textarea
          {...register('specialRequests')}
          disabled={isViewing}
          rows={4}
          className={cn(
            "block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500",
            errors.specialRequests ? "border-red-300" : "border-gray-300",
            isViewing ? "bg-gray-50 text-gray-500" : ""
          )}
          placeholder="Any special accommodations, preferences, or requests..."
        />
      </FormField>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'basic':
        return renderBasicInfo();
      case 'medical':
        return renderMedicalInfo();
      case 'ayurvedic':
        return renderAyurvedicProfile();
      case 'lifestyle':
        return renderLifestyleInfo();
      case 'preferences':
        return renderPreferences();
      default:
        return renderBasicInfo();
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose} 
      title={title}
      size="xl"
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors",
                    activeTab === tab.id
                      ? "border-emerald-500 text-emerald-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-6 max-h-96 overflow-y-auto">
          {renderTabContent()}
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
                  <Save className="h-4 w-4 mr-2" />
                  {isCreating ? 'Create Profile' : 'Save Changes'}
                </>
              )}
            </button>
          )}
        </ModalFooter>
      </form>
    </Modal>
  );
};

export default PatientProfileModal;