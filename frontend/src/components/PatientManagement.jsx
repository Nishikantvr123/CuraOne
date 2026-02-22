import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  Plus,
  Edit,
  Eye,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Heart,
  Clock,
  AlertCircle,
  ChevronDown,
  X,
  Download,
  Upload
} from 'lucide-react';
import PatientProfileModal from './modals/PatientProfileModal';
import patientService from '../services/patientService';
import toast from '../utils/toast';
import AdvancedSearchFilter, { filterConfigs } from './common/AdvancedSearchFilter';

const cn = (...classes) => classes.filter(Boolean).join(' ');

const PatientManagement = () => {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [modalMode, setModalMode] = useState('view'); // 'view', 'edit', 'create'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Advanced filters state
  const [advancedFilters, setAdvancedFilters] = useState({
    constitution: '',
    practitioner: '',
    ageRange: { min: '', max: '' },
    lastVisit: { from: '', to: '' },
    status: '',
    allergies: ''
  });

  // Mock patient data - in real app, this would come from API
  const mockPatients = [
    {
      id: 1,
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.johnson@email.com',
      phone: '+1-555-0123',
      dateOfBirth: '1985-03-15',
      gender: 'female',
      address: {
        street: '123 Oak St',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94102',
        country: 'USA'
      },
      constitution: 'vata',
      currentImbalance: 'Excess vata causing anxiety and digestive issues',
      treatmentGoals: 'Reduce stress and improve sleep quality',
      practitionerNotes: 'Responds well to grounding practices. Continue with current herbs.',
      preferredPractitioner: 'dr-sarah-smith',
      lastVisit: '2024-01-15T10:00:00Z',
      nextAppointment: '2024-02-15T14:00:00Z',
      status: 'active',
      medicalHistory: 'History of anxiety, chronic fatigue',
      currentMedications: [
        { name: 'Ashwagandha', dosage: '300mg', frequency: 'Twice daily', notes: 'With meals' }
      ],
      allergies: [
        { allergen: 'Shellfish', reaction: 'Hives', severity: 'moderate' }
      ],
      emergencyContact: {
        name: 'John Johnson',
        relationship: 'Spouse',
        phone: '+1-555-0124',
        email: 'john.johnson@email.com'
      }
    },
    {
      id: 2,
      firstName: 'Michael',
      lastName: 'Chen',
      email: 'michael.chen@email.com',
      phone: '+1-555-0234',
      dateOfBirth: '1978-07-22',
      gender: 'male',
      address: {
        street: '456 Pine Ave',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90210',
        country: 'USA'
      },
      constitution: 'pitta',
      currentImbalance: 'Pitta aggravation with inflammation and irritability',
      treatmentGoals: 'Cool excess heat, improve digestive fire',
      practitionerNotes: 'Good compliance with diet changes. Monitor blood pressure.',
      preferredPractitioner: 'dr-raj-patel',
      lastVisit: '2024-01-10T09:30:00Z',
      nextAppointment: '2024-02-10T11:00:00Z',
      status: 'active',
      medicalHistory: 'Hypertension, acid reflux',
      currentMedications: [
        { name: 'Amlaki', dosage: '500mg', frequency: 'Three times daily', notes: 'Before meals' },
        { name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily', notes: 'Morning' }
      ],
      allergies: [],
      emergencyContact: {
        name: 'Lisa Chen',
        relationship: 'Sister',
        phone: '+1-555-0235',
        email: 'lisa.chen@email.com'
      }
    },
    {
      id: 3,
      firstName: 'Emma',
      lastName: 'Williams',
      email: 'emma.williams@email.com',
      phone: '+1-555-0345',
      dateOfBirth: '1990-12-08',
      gender: 'female',
      address: {
        street: '789 Maple Dr',
        city: 'Seattle',
        state: 'WA',
        zipCode: '98101',
        country: 'USA'
      },
      constitution: 'kapha',
      currentImbalance: 'Kapha excess causing weight gain and lethargy',
      treatmentGoals: 'Increase metabolism, improve energy levels',
      practitionerNotes: 'Started exercise routine. Needs more stimulating herbs.',
      preferredPractitioner: 'dr-maya-sharma',
      lastVisit: '2024-01-20T15:00:00Z',
      nextAppointment: null,
      status: 'inactive',
      medicalHistory: 'Hypothyroidism, depression',
      currentMedications: [
        { name: 'Guggulu', dosage: '250mg', frequency: 'Twice daily', notes: 'With warm water' },
        { name: 'Levothyroxine', dosage: '50mcg', frequency: 'Once daily', notes: 'Empty stomach' }
      ],
      allergies: [
        { allergen: 'Peanuts', reaction: 'Anaphylaxis', severity: 'life-threatening' }
      ],
      emergencyContact: {
        name: 'David Williams',
        relationship: 'Father',
        phone: '+1-555-0346',
        email: 'david.williams@email.com'
      }
    }
  ];

  useEffect(() => {
    // Load patients from API
    const loadPatients = async () => {
      setIsLoading(true);
      try {
        const response = await patientService.getAllPatients();
        if (response.success) {
          setPatients(response.data);
          setFilteredPatients(response.data);
        }
      } catch (error) {
        console.error('Failed to load patients:', error);
        toast.error('Failed to load patients');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPatients();
  }, []);

  // Filter and search logic
  useEffect(() => {
    let filtered = patients.filter(patient => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = searchTerm === '' || 
        patient.firstName.toLowerCase().includes(searchLower) ||
        patient.lastName.toLowerCase().includes(searchLower) ||
        patient.email.toLowerCase().includes(searchLower) ||
        patient.phone.includes(searchTerm);

      // Check constitution
      const matchesConstitution = !advancedFilters.constitution || 
        patient.constitution === advancedFilters.constitution;
      
      // Check practitioner
      const matchesPractitioner = !advancedFilters.practitioner || 
        patient.preferredPractitioner === advancedFilters.practitioner;
      
      // Check status
      const matchesStatus = !advancedFilters.status || patient.status === advancedFilters.status;
      
      // Check age range
      let matchesAge = true;
      if (patient.dateOfBirth) {
        const age = new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear();
        
        if (advancedFilters.ageRange.min && !isNaN(parseInt(advancedFilters.ageRange.min))) {
          matchesAge = matchesAge && age >= parseInt(advancedFilters.ageRange.min);
        }
        
        if (advancedFilters.ageRange.max && !isNaN(parseInt(advancedFilters.ageRange.max))) {
          matchesAge = matchesAge && age <= parseInt(advancedFilters.ageRange.max);
        }
      }
      
      // Check last visit date range
      let matchesLastVisit = true;
      if (patient.lastVisit) {
        const lastVisitDate = new Date(patient.lastVisit);
        
        if (advancedFilters.lastVisit.from) {
          const fromDate = new Date(advancedFilters.lastVisit.from);
          matchesLastVisit = matchesLastVisit && lastVisitDate >= fromDate;
        }
        
        if (advancedFilters.lastVisit.to) {
          const toDate = new Date(advancedFilters.lastVisit.to);
          toDate.setHours(23, 59, 59, 999); // End of the day
          matchesLastVisit = matchesLastVisit && lastVisitDate <= toDate;
        }
      }
      
      // Check allergies
      let matchesAllergies = true;
      if (advancedFilters.allergies) {
        switch (advancedFilters.allergies) {
          case 'none':
            matchesAllergies = patient.allergies.length === 0;
            break;
          case 'mild':
            matchesAllergies = patient.allergies.some(a => a.severity === 'mild');
            break;
          case 'severe':
            matchesAllergies = patient.allergies.some(a => a.severity === 'severe');
            break;
          case 'life-threatening':
            matchesAllergies = patient.allergies.some(a => a.severity === 'life-threatening');
            break;
        }
      }

      return matchesSearch && matchesConstitution && matchesPractitioner && 
             matchesStatus && matchesAge && matchesLastVisit && matchesAllergies;
    });

    setFilteredPatients(filtered);
  }, [searchTerm, advancedFilters, patients]);

  const handleViewPatient = (patient) => {
    setSelectedPatient(patient);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleEditPatient = (patient) => {
    setSelectedPatient(patient);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleCreatePatient = () => {
    setSelectedPatient(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleSavePatient = async (patientData) => {
    try {
      if (modalMode === 'create') {
        const response = await patientService.createPatient(patientData);
        if (response.success) {
          setPatients(prev => [...prev, response.data]);
          setFilteredPatients(prev => [...prev, response.data]);
          toast.success('Patient profile created successfully!');
        }
      } else {
        const response = await patientService.updatePatient(patientData.id, patientData);
        if (response.success) {
          setPatients(prev => 
            prev.map(p => p.id === patientData.id ? response.data : p)
          );
          setFilteredPatients(prev => 
            prev.map(p => p.id === patientData.id ? response.data : p)
          );
          toast.success('Patient profile updated successfully!');
        }
      }
    } catch (error) {
      console.error('Failed to save patient:', error);
      toast.error(error.message || 'Failed to save patient profile');
    }
  };

  const handleAdvancedFiltersChange = (newFilters) => {
    setAdvancedFilters(newFilters);
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
  };

  const getAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'N/A';
    return new Date().getFullYear() - new Date(dateOfBirth).getFullYear();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not scheduled';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getConstitutionColor = (constitution) => {
    if (!constitution) return 'bg-gray-100 text-gray-800';
    switch (constitution) {
      case 'vata':
        return 'bg-blue-100 text-blue-800';
      case 'pitta':
        return 'bg-red-100 text-red-800';
      case 'kapha':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-purple-100 text-purple-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading patients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <Users className="h-6 w-6 mr-2 text-emerald-600" />
          Patient Management
        </h1>
        <p className="text-gray-600 mt-1">
          Manage patient profiles, medical histories, and treatment plans
        </p>
      </div>

      {/* Advanced Search and Filters */}
      <AdvancedSearchFilter
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        filters={advancedFilters}
        onFiltersChange={handleAdvancedFiltersChange}
        filterConfig={filterConfigs.patients}
        resultsCount={filteredPatients.length}
        totalCount={patients.length}
        placeholder="Search patients by name, email, or phone..."
        customActions={[
          {
            label: 'Add Patient',
            icon: Plus,
            onClick: handleCreatePatient,
            variant: 'primary'
          },
          {
            label: 'Export',
            icon: Download,
            onClick: () => toast.info('Export functionality coming soon!')
          },
          {
            label: 'Import',
            icon: Upload,
            onClick: () => toast.info('Import functionality coming soon!')
          }
        ]}
      />

      {/* Patient List */}
      <div className="bg-white rounded-lg border border-gray-200">
        {filteredPatients.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No patients found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || Object.values(advancedFilters).some(f => {
                if (typeof f === 'object' && f !== null) {
                  return Object.values(f).some(v => v !== '');
                }
                return f !== '';
              })
                ? "Try adjusting your search or filters"
                : "Get started by adding your first patient"
              }
            </p>
            {!searchTerm && !Object.values(advancedFilters).some(f => {
              if (typeof f === 'object' && f !== null) {
                return Object.values(f).some(v => v !== '');
              }
              return f !== '';
            }) && (
              <button
                onClick={handleCreatePatient}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add First Patient
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Constitution
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Visit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPatients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-emerald-700">
                              {patient.firstName[0]}{patient.lastName[0]}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {patient.firstName} {patient.lastName}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {getAge(patient.dateOfBirth)} years old
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center">
                        <Mail className="h-3 w-3 mr-1 text-gray-400" />
                        {patient.email}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center mt-1">
                        <Phone className="h-3 w-3 mr-1 text-gray-400" />
                        {patient.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={cn(
                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize",
                        getConstitutionColor(patient.constitution)
                      )}>
                        <Heart className="h-3 w-3 mr-1" />
                        {patient.constitution || 'Not set'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center">
                        <Clock className="h-3 w-3 mr-1 text-gray-400" />
                        {formatDate(patient.lastVisit)}
                      </div>
                      {patient.nextAppointment && (
                        <div className="text-sm text-gray-500 mt-1">
                          Next: {formatDate(patient.nextAppointment)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={cn(
                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize",
                        getStatusColor(patient.status)
                      )}>
                        {patient.status === 'active' && <div className="w-2 h-2 rounded-full bg-green-400 mr-1" />}
                        {patient.status === 'inactive' && <div className="w-2 h-2 rounded-full bg-gray-400 mr-1" />}
                        {patient.status === 'pending' && <div className="w-2 h-2 rounded-full bg-yellow-400 mr-1" />}
                        {patient.status || 'pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewPatient(patient)}
                          className="text-emerald-600 hover:text-emerald-700"
                          title="View Profile"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEditPatient(patient)}
                          className="text-blue-600 hover:text-blue-700"
                          title="Edit Profile"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        {patient.allergies?.some(allergy => allergy.severity === 'life-threatening') && (
                          <AlertCircle className="h-4 w-4 text-red-500" title="Critical Allergies" />
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Patient Profile Modal */}
      <PatientProfileModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        patient={selectedPatient}
        onSave={handleSavePatient}
        mode={modalMode}
      />
    </div>
  );
};

export default PatientManagement;