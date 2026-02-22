import React, { useState, useEffect } from 'react';
import {
  FileText,
  Calendar,
  User,
  Pill,
  Clock,
  Printer,
  Eye,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react';
import { apiService } from '../../services/api';

const Prescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadPrescriptions();
  }, [pagination.page, filter]);

  const loadPrescriptions = async () => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filter !== 'all' && { status: filter })
      });

      const response = await apiService.get(`/prescriptions/my?${queryParams}`);
      if (response.success) {
        setPrescriptions(response.data.prescriptions);
        setPagination(prev => ({
          ...prev,
          total: response.data.pagination.total,
          pages: response.data.pagination.pages
        }));
      }
    } catch (error) {
      console.error('Error loading prescriptions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = (prescription) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Prescription - ${prescription.patientName}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
          .header { text-align: center; border-bottom: 2px solid #059669; padding-bottom: 20px; margin-bottom: 30px; }
          .header h1 { color: #059669; margin: 0; }
          .header p { color: #666; margin: 5px 0; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
          .info-box { background: #f9fafb; padding: 15px; border-radius: 8px; }
          .info-box label { font-weight: bold; color: #374151; display: block; margin-bottom: 5px; }
          .medications { margin-bottom: 30px; }
          .medications h3 { color: #059669; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px; }
          .medication { background: #f0fdf4; padding: 15px; border-radius: 8px; margin-bottom: 10px; border-left: 4px solid #059669; }
          .medication .name { font-weight: bold; font-size: 1.1em; }
          .medication .details { color: #666; margin-top: 5px; }
          .instructions { background: #fffbeb; padding: 20px; border-radius: 8px; margin-bottom: 30px; border-left: 4px solid #f59e0b; }
          .footer { text-align: center; color: #666; font-size: 0.9em; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>CuraOne</h1>
          <p>Ayurvedic Therapy Center</p>
          <p>E-Prescription</p>
        </div>
        
        <div class="info-grid">
          <div class="info-box">
            <label>Patient</label>
            <span>${prescription.patientName}</span>
          </div>
          <div class="info-box">
            <label>Practitioner</label>
            <span>${prescription.practitionerName}</span>
          </div>
          <div class="info-box">
            <label>Date</label>
            <span>${new Date(prescription.createdAt).toLocaleDateString()}</span>
          </div>
          <div class="info-box">
            <label>Duration</label>
            <span>${prescription.duration}</span>
          </div>
        </div>
        
        <div class="info-box" style="margin-bottom: 30px;">
          <label>Diagnosis</label>
          <span>${prescription.diagnosis}</span>
        </div>
        
        <div class="medications">
          <h3>Medications</h3>
          ${prescription.medications.map(med => `
            <div class="medication">
              <div class="name">${med.name}</div>
              <div class="details">
                <strong>Dosage:</strong> ${med.dosage} | 
                <strong>Frequency:</strong> ${med.frequency}
                ${med.duration ? ` | <strong>Duration:</strong> ${med.duration}` : ''}
              </div>
              ${med.instructions ? `<div class="details"><strong>Instructions:</strong> ${med.instructions}</div>` : ''}
            </div>
          `).join('')}
        </div>
        
        ${prescription.instructions ? `
          <div class="instructions">
            <label style="font-weight: bold; display: block; margin-bottom: 10px;">Special Instructions</label>
            <p>${prescription.instructions}</p>
          </div>
        ` : ''}
        
        ${prescription.notes ? `
          <div class="info-box">
            <label>Notes</label>
            <p>${prescription.notes}</p>
          </div>
        ` : ''}
        
        <div class="footer">
          <p>This is a computer-generated prescription from CuraOne.</p>
          <p>For any queries, please contact your practitioner.</p>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const getStatusBadge = (status) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      completed: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Prescriptions</h1>
          <p className="text-gray-600">View and manage your prescriptions</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              setPagination(prev => ({ ...prev, page: 1 }));
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="all">All Prescriptions</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading prescriptions...</p>
          </div>
        ) : prescriptions.length === 0 ? (
          <div className="p-8 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No prescriptions found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {prescriptions.map((prescription) => (
              <div key={prescription.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{prescription.diagnosis}</h3>
                      {getStatusBadge(prescription.status)}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>{prescription.practitionerName}</span>
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
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => setSelectedPrescription(prescription)}
                      className="p-2 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handlePrint(prescription)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Print"
                    >
                      <Printer className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {pagination.pages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <span className="text-sm text-gray-600">
              Page {pagination.page} of {pagination.pages}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page === pagination.pages}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {selectedPrescription && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Prescription Details</h2>
              <button
                onClick={() => setSelectedPrescription(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="text-sm font-medium text-gray-500">Diagnosis</label>
                  <p className="text-gray-900 mt-1">{selectedPrescription.diagnosis}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="text-sm font-medium text-gray-500">Duration</label>
                  <p className="text-gray-900 mt-1">{selectedPrescription.duration}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="text-sm font-medium text-gray-500">Practitioner</label>
                  <p className="text-gray-900 mt-1">{selectedPrescription.practitionerName}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="text-sm font-medium text-gray-500">Date</label>
                  <p className="text-gray-900 mt-1">{new Date(selectedPrescription.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Medications</h3>
                <div className="space-y-3">
                  {selectedPrescription.medications.map((med, idx) => (
                    <div key={idx} className="bg-emerald-50 p-4 rounded-lg border-l-4 border-emerald-500">
                      <p className="font-medium text-gray-900">{med.name}</p>
                      <div className="text-sm text-gray-600 mt-1">
                        <span className="mr-4"><strong>Dosage:</strong> {med.dosage}</span>
                        <span><strong>Frequency:</strong> {med.frequency}</span>
                      </div>
                      {med.instructions && (
                        <p className="text-sm text-gray-600 mt-2">
                          <strong>Instructions:</strong> {med.instructions}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {selectedPrescription.instructions && (
                <div className="bg-amber-50 p-4 rounded-lg border-l-4 border-amber-500">
                  <label className="text-sm font-medium text-amber-800">Special Instructions</label>
                  <p className="text-gray-700 mt-1">{selectedPrescription.instructions}</p>
                </div>
              )}

              {selectedPrescription.notes && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="text-sm font-medium text-gray-500">Notes</label>
                  <p className="text-gray-700 mt-1">{selectedPrescription.notes}</p>
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setSelectedPrescription(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={() => handlePrint(selectedPrescription)}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  Print
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Prescriptions;
