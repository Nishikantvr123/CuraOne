import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Calendar, MapPin, Heart, Edit2, Save, X } from 'lucide-react';
import Modal from '../ui/Modal';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/api';
import toast from '../../utils/toast';

const cn = (...classes) => classes.filter(Boolean).join(' ');

// Move FormField outside to prevent re-creation on each render
const FormField = ({ label, name, value, type = 'text', icon: Icon, disabled = false, onChange }) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <div className="relative">
      {Icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="h-5 w-5 text-gray-400" />
        </div>
      )}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={cn(
          "block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500",
          Icon ? "pl-10" : "pl-3",
          disabled ? "bg-gray-50 text-gray-500" : "bg-white"
        )}
      />
    </div>
  </div>
);

const PatientProfileView = ({ isOpen, onClose }) => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    address: '',
    constitution: '',
    medicalHistory: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        dateOfBirth: user.dateOfBirth || '',
        address: user.address || '',
        constitution: user.constitution || '',
        medicalHistory: user.medicalHistory || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const response = await apiService.put('/auth/profile', formData);
      if (response.success) {
        updateUser(response.data);
        toast.success('Profile updated successfully!');
        setIsEditing(false);
      }
    } catch (error) {
      toast.error('Failed to update profile');
      console.error('Profile update error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="My Profile"
      size="lg"
    >
      <div className="space-y-6">
        {/* Profile Header */}
        <div className="flex items-center space-x-4 pb-6 border-b">
          <img
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(`${formData.firstName} ${formData.lastName}` || 'User')}&background=059669&color=fff`}
            alt={`${formData.firstName} ${formData.lastName}`}
            className="h-20 w-20 rounded-full border-4 border-emerald-100"
          />
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900">
              {formData.firstName && formData.lastName 
                ? `${formData.firstName} ${formData.lastName}` 
                : user?.name}
            </h3>
            <p className="text-sm text-gray-500 capitalize">{user?.role}</p>
          </div>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
            >
              <Edit2 className="h-4 w-4 mr-2" />
              Edit Profile
            </button>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors disabled:opacity-50"
              >
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setFormData({
                    firstName: user.firstName || '',
                    lastName: user.lastName || '',
                    email: user.email || '',
                    phone: user.phone || '',
                    dateOfBirth: user.dateOfBirth || '',
                    address: user.address || '',
                    constitution: user.constitution || '',
                    medicalHistory: user.medicalHistory || ''
                  });
                }}
                className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Profile Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            label="First Name"
            name="firstName"
            value={formData.firstName}
            icon={User}
            onChange={handleChange}
            disabled={!isEditing}
          />
          <FormField
            label="Last Name"
            name="lastName"
            value={formData.lastName}
            icon={User}
            onChange={handleChange}
            disabled={!isEditing}
          />
          <FormField
            label="Email"
            name="email"
            value={formData.email}
            type="email"
            icon={Mail}
            onChange={handleChange}
            disabled={true}
          />
          <FormField
            label="Phone"
            name="phone"
            value={formData.phone}
            type="tel"
            icon={Phone}
            onChange={handleChange}
            disabled={!isEditing}
          />
          <FormField
            label="Date of Birth"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            type="date"
            icon={Calendar}
            onChange={handleChange}
            disabled={!isEditing}
          />
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Constitution</label>
            <div className="relative">
              <Heart className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                name="constitution"
                value={formData.constitution}
                onChange={handleChange}
                disabled={!isEditing}
                className={cn(
                  "block w-full pl-10 rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500",
                  !isEditing ? "bg-gray-50 text-gray-500" : "bg-white"
                )}
              >
                <option value="">Select Constitution</option>
                <option value="vata">Vata</option>
                <option value="pitta">Pitta</option>
                <option value="kapha">Kapha</option>
                <option value="vata-pitta">Vata-Pitta</option>
                <option value="pitta-kapha">Pitta-Kapha</option>
                <option value="vata-kapha">Vata-Kapha</option>
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Address</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              disabled={!isEditing}
              rows={2}
              className={cn(
                "block w-full pl-10 rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500",
                !isEditing ? "bg-gray-50 text-gray-500" : "bg-white"
              )}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Medical History</label>
          <textarea
            name="medicalHistory"
            value={formData.medicalHistory}
            onChange={handleChange}
            disabled={!isEditing}
            rows={3}
            placeholder="Any relevant medical history, allergies, or conditions..."
            className={cn(
              "block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500",
              !isEditing ? "bg-gray-50 text-gray-500" : "bg-white"
            )}
          />
        </div>
      </div>
    </Modal>
  );
};

export default PatientProfileView;
