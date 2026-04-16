import React, { useState, useEffect } from 'react';
import { FileText, Download, Eye, Calendar, Pill, ChevronRight } from 'lucide-react';
import { apiService } from '../../services/api';
import { downloadPrescriptionPDF, viewPrescriptionPDF } from './PrescriptionPDFGenerator';
import { useNavigate } from 'react-router-dom';

const PrescriptionWidget = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadPrescriptions();
  }, []);

  const loadPrescriptions = async () => {
    setIsLoading(true);
    try {
      const response = await apiService.get('/prescriptions/my?limit=3');
      if (response.success) {
        setPrescriptions(response.data.prescriptions || []);
      }
    } catch (error) {
      console.error('Error loading prescriptions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      completed: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-600" />
            My Prescriptions
          </h2>
        </div>
        <div className="p-6 text-center">
          <div className="w-6 h-6 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-600" />
            My Prescriptions
          </h2>
          {prescriptions.length > 0 && (
            <button
              onClick={() => navigate('/patient/prescriptions')}
              className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              View All
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      <div className="p-6">
        {prescriptions.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No prescriptions yet</p>
            <p className="text-gray-400 text-xs mt-1">
              Your prescriptions will appear here after your sessions
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {prescriptions.map((prescription) => (
              <div
                key={prescription.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-gray-900 text-sm">
                        {prescription.diagnosis}
                      </h3>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(prescription.status)}`}>
                        {prescription.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(prescription.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Pill className="w-3 h-3" />
                        <span>{prescription.medications.length} med(s)</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={() => viewPrescriptionPDF(prescription)}
                    className="flex-1 px-3 py-1.5 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100 flex items-center justify-center gap-1"
                  >
                    <Eye className="w-3 h-3" />
                    View
                  </button>
                  <button
                    onClick={() => downloadPrescriptionPDF(prescription)}
                    className="flex-1 px-3 py-1.5 text-xs bg-emerald-50 text-emerald-600 rounded hover:bg-emerald-100 flex items-center justify-center gap-1"
                  >
                    <Download className="w-3 h-3" />
                    Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PrescriptionWidget;
