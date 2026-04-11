import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Plus,
  Edit,
  Eye,
  Calendar,
  Phone,
  Mail,
  Heart,
  Clock,
  AlertCircle,
  Download,
  Upload,
  Trash2
} from 'lucide-react';
import PatientProfileModal from './modals/PatientProfileModal';
import SelectPatientModal from './modals/SelectPatientModal';
import patientService from '../services/patientService';
import toast from '../utils/toast';
import AdvancedSearchFilter, { filterConfigs } from './common/AdvancedSearchFilter';

const cn = (...classes) => classes.filter(Boolean).join(' ');

const PatientManagement = () => {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [modalMode, setModalMode] = useState('view');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSelectModalOpen, setIsSelectModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [advancedFilters, setAdvancedFilters] = useState({
    constitution: '',
    practitioner: '',
    ageRange: { min: '', max: '' },
    lastVisit: { from: '', to: '' },
    status: '',
    allergies: ''
  });

  useEffect(() => {
    let cancelled = false;
    const loadPatients = async () => {
      setIsLoading(true);
      try {
        const response = await patientService.getAllPatients();
        if (cancelled) return;
        if (response.success) {
          // Filter out any null/undefined entries
          const validPatients = (response.data || []).filter(p => p !== null && p !== undefined);
          setPatients(validPatients);
          setFilteredPatients(validPatients);
        }
      } catch (error) {
        if (cancelled) return;
        console.error('Failed to load patients:', error);
        setPatients([]);
        setFilteredPatients([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    loadPatients();
    return () => { cancelled = true; };
  }, []);

  // Filter and search logic
  useEffect(() => {
    let filtered = patients
      .filter(patient => patient !== null && patient !== undefined)
      .filter(patient => {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = searchTerm === '' ||
          patient.firstName?.toLowerCase().includes(searchLower) ||
          patient.lastName?.toLowerCase().includes(searchLower) ||
          patient.email?.toLowerCase().includes(searchLower) ||
          patient.phone?.includes(searchTerm);

        const matchesConstitution = !advancedFilters.constitution ||
          patient.constitution === advancedFilters.constitution;

        const matchesPractitioner = !advancedFilters.practitioner ||
          patient.preferredPractitioner === advancedFilters.practitioner;

        const matchesStatus = !advancedFilters.status ||
          patient.status === advancedFilters.status;

        let matchesAge = true;
        if (patient.dateOfBirth) {
          const age = new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear();
          if (advancedFilters.ageRange.min && !isNaN(parseInt(advancedFilters.ageRange.min)))
            matchesAge = matchesAge && age >= parseInt(advancedFilters.ageRange.min);
          if (advancedFilters.ageRange.max && !isNaN(parseInt(advancedFilters.ageRange.max)))
            matchesAge = matchesAge && age <= parseInt(advancedFilters.ageRange.max);
        }

        let matchesLastVisit = true;
        if (patient.lastVisit) {
          const lastVisitDate = new Date(patient.lastVisit);
          if (advancedFilters.lastVisit.from)
            matchesLastVisit = matchesLastVisit && lastVisitDate >= new Date(advancedFilters.lastVisit.from);
          if (advancedFilters.lastVisit.to) {
            const toDate = new Date(advancedFilters.lastVisit.to);
            toDate.setHours(23, 59, 59, 999);
            matchesLastVisit = matchesLastVisit && lastVisitDate <= toDate;
          }
        }

        let matchesAllergies = true;
        if (advancedFilters.allergies) {
          switch (advancedFilters.allergies) {
            case 'none': matchesAllergies = !patient.allergies || patient.allergies.length === 0; break;
            case 'mild': matchesAllergies = patient.allergies?.some(a => a.severity === 'mild'); break;
            case 'severe': matchesAllergies = patient.allergies?.some(a => a.severity === 'severe'); break;
            case 'life-threatening': matchesAllergies = patient.allergies?.some(a => a.severity === 'life-threatening'); break;
          }
        }

        return matchesSearch && matchesConstitution && matchesPractitioner &&
          matchesStatus && matchesAge && matchesLastVisit && matchesAllergies;
      });

    setFilteredPatients(filtered);
  }, [searchTerm, advancedFilters, patients]);

  const handleViewPatient = (patient) => {
    if (!patient) return;
    setSelectedPatient(patient);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleEditPatient = (patient) => {
    if (!patient) return;
    setSelectedPatient(patient);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  // Show select modal first
  const handleCreatePatient = () => {
    setIsSelectModalOpen(true);
  };

  // When user selected from SelectPatientModal
  const handleUserSelected = (user) => {
    setSelectedPatient({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone || '',
      userId: user.id,
    });
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleSavePatient = async (patientData) => {
    if (modalMode === 'create') {
      const response = await patientService.createPatient({
        ...patientData,
        userId: selectedPatient?.userId,
      });
      if (response.success && response.data) {
        setPatients(prev => [
          ...prev.filter(p => p !== null && p !== undefined),
          response.data
        ]);
        setFilteredPatients(prev => [
          ...prev.filter(p => p !== null && p !== undefined),
          response.data
        ]);
        toast.success('Patient added to dashboard successfully!');
      } else {
        throw new Error(response.error || 'Failed to add patient');
      }
    } else {
      const response = await patientService.updatePatient(patientData.id, patientData);
      if (response.success && response.data) {
        setPatients(prev =>
          prev
            .filter(p => p !== null && p !== undefined)
            .map(p => p.id === patientData.id ? response.data : p)
        );
        setFilteredPatients(prev =>
          prev
            .filter(p => p !== null && p !== undefined)
            .map(p => p.id === patientData.id ? response.data : p)
        );
        toast.success('Patient profile updated successfully!');
      } else {
        throw new Error(response.error || 'Failed to update patient');
      }
    }
  };

  const handleDeletePatient = async (patient) => {
    if (!patient) return;
    
    const confirmed = window.confirm(
      `Are you sure you want to remove ${patient.firstName} ${patient.lastName} from the dashboard?\n\nThis will not delete their account, just remove them from this view.`
    );
    
    if (!confirmed) return;

    try {
      const response = await patientService.deletePatient(patient.id);
      if (response.success) {
        setPatients(prev => prev.filter(p => p.id !== patient.id));
        setFilteredPatients(prev => prev.filter(p => p.id !== patient.id));
        toast.success('Patient removed from dashboard successfully!');
      } else {
        throw new Error(response.error || 'Failed to remove patient');
      }
    } catch (error) {
      console.error('Failed to delete patient:', error);
      toast.error(error.message || 'Failed to remove patient from dashboard');
    }
  };

  const getAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'N/A';
    const today = new Date();
    const birth = new Date(dateOfBirth);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not scheduled';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getConstitutionColor = (constitution) => {
    switch (constitution) {
      case 'vata': return 'bg-blue-100 text-blue-800';
      case 'pitta': return 'bg-red-100 text-red-800';
      case 'kapha': return 'bg-green-100 text-green-800';
      default: return 'bg-purple-100 text-purple-800';
    }
  };

  const hasActiveFilters = Object.values(advancedFilters).some(f =>
    typeof f === 'object' ? Object.values(f).some(v => v !== '') : f !== ''
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4" />
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
        onSearchChange={setSearchTerm}
        filters={advancedFilters}
        onFiltersChange={setAdvancedFilters}
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
              {searchTerm || hasActiveFilters
                ? 'Try adjusting your search or filters'
                : 'Get started by adding your first patient'}
            </p>
            {!searchTerm && !hasActiveFilters && (
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Constitution</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Visit</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPatients.map((patient) => {
                  if (!patient) return null;
                  return (
                    <tr key={patient.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                              <span className="text-sm font-medium text-emerald-700">
                                {patient?.firstName?.[0]}{patient?.lastName?.[0]}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {patient?.firstName} {patient?.lastName}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {getAge(patient?.dateOfBirth)} years old
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 flex items-center">
                          <Mail className="h-3 w-3 mr-1 text-gray-400" />
                          {patient?.email}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center mt-1">
                          <Phone className="h-3 w-3 mr-1 text-gray-400" />
                          {patient?.phone || '—'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={cn(
                          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize',
                          getConstitutionColor(patient?.constitution)
                        )}>
                          <Heart className="h-3 w-3 mr-1" />
                          {patient?.constitution || 'Not set'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 flex items-center">
                          <Clock className="h-3 w-3 mr-1 text-gray-400" />
                          {formatDate(patient?.lastVisit)}
                        </div>
                        {patient?.nextAppointment && (
                          <div className="text-sm text-gray-500 mt-1">
                            Next: {formatDate(patient.nextAppointment)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={cn(
                          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize',
                          getStatusColor(patient?.status)
                        )}>
                          {patient?.status === 'active' && <div className="w-2 h-2 rounded-full bg-green-400 mr-1" />}
                          {patient?.status === 'inactive' && <div className="w-2 h-2 rounded-full bg-gray-400 mr-1" />}
                          {patient?.status === 'pending' && <div className="w-2 h-2 rounded-full bg-yellow-400 mr-1" />}
                          {patient?.status || 'pending'}
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
                          <button
                            onClick={() => handleDeletePatient(patient)}
                            className="text-red-600 hover:text-red-700"
                            title="Remove from Dashboard"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                          {patient?.allergies?.some(a => a.severity === 'life-threatening') && (
                            <AlertCircle className="h-4 w-4 text-red-500" title="Critical Allergies" />
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Select Patient Modal */}
      <SelectPatientModal
        isOpen={isSelectModalOpen}
        onClose={() => setIsSelectModalOpen(false)}
        onSelect={handleUserSelected}
      />

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