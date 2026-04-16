import React, { useState, useEffect } from 'react';
import {
  FileText,
  Calendar,
  User,
  Pill,
  Clock,
  Download,
  Eye,
  Plus,
  CheckCircle,
  AlertCircle,
  Search,
  Filter
} from 'lucide-react';
import { apiService } from '../../services/api';
import PrescriptionForm from '../../pages/practitioner/PrescriptionForm';
import { downloadPrescriptionPDF, viewPrescriptionPDF } from './PrescriptionPDFGenerator';

const PrescriptionManagement = () => {
  const [activeView, setActiveView] = useState('bookings'); // 'bookings' or 'prescriptions' or 'create'
  const [bookings, setBookings] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([loadBookings(), loadPrescriptions()]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadBookings = async () => {
    try {
      const response = await apiService.get('/bookings/my-bookings');
      if (response.success) {
        // Filter for confirmed and completed bookings only
        const eligibleBookings = (response.data.bookings || []).filter(
          b => b.status === 'confirmed' || b.status === 'completed'
        );
        setBookings(eligibleBookings);
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
    }
  };

  const loadPrescriptions = async () => {
    try {
      const response = await apiService.get('/prescriptions/my');
      if (response.success) {
        setPrescriptions(response.data.prescriptions || []);
      }
    } catch (error) {
      console.error('Error loading prescriptions:', error);
    }
  };

  const handleCreatePrescription = (booking) => {
    setSelectedPatient({
      id: booking.patientId,
      firstName: booking.patient.firstName,
      lastName: booking.patient.lastName,
      email: booking.patient.email
    });
    setActiveView('create');
  };

  const handlePrescriptionCreated = () => {
    setActiveView('prescriptions');
    setSelectedPatient(null);
    loadData();
  };

  const getStatusBadge = (status) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      completed: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800',
      confirmed: 'bg-emerald-100 text-emerald-800'
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const filteredPrescriptions = prescriptions.filter(p => {
    const matchesSearch = searchQuery === '' || 
      p.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.diagnosis.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (activeView === 'create') {
    return (
      <PrescriptionForm
        patient={selectedPatient}
        onBack={() => {
          setActiveView('bookings');
          setSelectedPatient(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Prescription Management</h1>
          <p className="text-gray-600">Create and manage patient prescriptions</p>
        </div>
        <button
          onClick={() => setActiveView('create')}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Prescription
        </button>
      </div>

      {/* View Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveView('bookings')}
            className={`flex-1 px-6 py-3 text-sm font-medium ${
              activeView === 'bookings'
                ? 'text-emerald-600 border-b-2 border-emerald-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Calendar className="w-4 h-4" />
              Confirmed Sessions ({bookings.length})
            </div>
          </button>
          <button
            onClick={() => setActiveView('prescriptions')}
            className={`flex-1 px-6 py-3 text-sm font-medium ${
              activeView === 'prescriptions'
                ? 'text-emerald-600 border-b-2 border-emerald-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <FileText className="w-4 h-4" />
              All Prescriptions ({prescriptions.length})
            </div>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading...</p>
            </div>
          ) : activeView === 'bookings' ? (
            // Confirmed Bookings View
            <div className="space-y-4">
              {bookings.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No confirmed sessions found</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Confirmed patient sessions will appear here
                  </p>
                </div>
              ) : (
                bookings.map((booking) => {
                  const hasPrescription = prescriptions.some(
                    p => p.patientId === booking.patientId && 
                    new Date(p.createdAt).toDateString() === new Date(booking.scheduledDate).toDateString()
                  );

                  return (
                    <div
                      key={booking.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                {booking.patient.firstName} {booking.patient.lastName}
                              </h3>
                              <p className="text-sm text-gray-500">{booking.patient.email}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-gray-600 ml-13">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4" />
                              <span>{booking.therapy.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(booking.scheduledDate).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              <span>{booking.scheduledTime}</span>
                            </div>
                            <div>
                              {getStatusBadge(booking.status)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {hasPrescription ? (
                            <div className="flex items-center gap-2 text-green-600 text-sm">
                              <CheckCircle className="w-4 h-4" />
                              <span>Prescribed</span>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleCreatePrescription(booking)}
                              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2 text-sm"
                            >
                              <Plus className="w-4 h-4" />
                              Create Prescription
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            // All Prescriptions View
            <div className="space-y-4">
              {/* Search and Filter */}
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by patient name or diagnosis..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {filteredPrescriptions.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No prescriptions found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredPrescriptions.map((prescription) => (
                    <div
                      key={prescription.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-gray-900">{prescription.diagnosis}</h3>
                            {getStatusBadge(prescription.status)}
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4" />
                              <span>{prescription.patientName}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(prescription.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              <span>{prescription.duration}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Pill className="w-4 h-4" />
                              <span>{prescription.medications.length} medication(s)</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => viewPrescriptionPDF(prescription)}
                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View PDF"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => downloadPrescriptionPDF(prescription)}
                            className="p-2 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Download PDF"
                          >
                            <Download className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PrescriptionManagement;
