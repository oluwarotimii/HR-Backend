// LeaveRequestForm.tsx
// A React component for submitting leave requests

import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext'; // Adjust the import path as needed
import { apiService } from './api-service'; // Adjust the import path as needed

interface LeaveType {
  id: number;
  name: string;
  description: string;
  max_days_per_year: number;
}

interface LeaveFormData {
  leave_type_id: number;
  start_date: string;
  end_date: string;
  reason: string;
  attachments: FileList | null;
}

const LeaveRequestForm: React.FC = () => {
  const { user, hasPermission } = useAuth();
  const [formData, setFormData] = useState<LeaveFormData>({
    leave_type_id: 0,
    start_date: '',
    end_date: '',
    reason: '',
    attachments: null
  });
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load leave types when component mounts
  useEffect(() => {
    const fetchLeaveTypes = async () => {
      try {
        const response = await apiService.getLeaveTypes();
        
        if (response.success) {
          setLeaveTypes(response.data.leaveTypes || []);
        } else {
          setMessage({ type: 'error', text: response.message || 'Failed to load leave types' });
        }
      } catch (error: any) {
        setMessage({ type: 'error', text: error.message || 'Failed to load leave types' });
      }
    };

    fetchLeaveTypes();
  }, []);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'leave_type_id' ? parseInt(value) : value
    }));
    
    // Clear error for this field when user types
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Handle file attachment
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      attachments: e.target.files
    }));
  };

  // Validate form data
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.leave_type_id) {
      newErrors.leave_type_id = 'Please select a leave type';
    }

    if (!formData.start_date) {
      newErrors.start_date = 'Start date is required';
    }

    if (!formData.end_date) {
      newErrors.end_date = 'End date is required';
    }

    if (formData.start_date && formData.end_date) {
      const startDate = new Date(formData.start_date);
      const endDate = new Date(formData.end_date);
      const today = new Date();

      if (startDate < today) {
        newErrors.start_date = 'Start date cannot be in the past';
      }

      if (endDate < startDate) {
        newErrors.end_date = 'End date cannot be before start date';
      }
    }

    if (!formData.reason.trim()) {
      newErrors.reason = 'Reason is required';
    } else if (formData.reason.length < 10) {
      newErrors.reason = 'Reason must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      // Prepare form data for submission
      const requestData = {
        leave_type_id: formData.leave_type_id,
        start_date: formData.start_date,
        end_date: formData.end_date,
        reason: formData.reason
      };

      // Submit the leave request
      const response = await apiService.createLeaveRequest(requestData);

      if (response.success) {
        setMessage({ type: 'success', text: response.message || 'Leave request submitted successfully!' });
        
        // Reset form
        setFormData({
          leave_type_id: 0,
          start_date: '',
          end_date: '',
          reason: '',
          attachments: null
        });
      } else {
        setMessage({ type: 'error', text: response.message || 'Failed to submit leave request' });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'An error occurred while submitting the request' });
    } finally {
      setLoading(false);
    }
  };

  // Check if user has permission to create leave requests
  const canCreateLeave = hasPermission('leave:create');

  if (!canCreateLeave) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Access Denied! </strong>
          <span className="block sm:inline">You don't have permission to create leave requests.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Request Time Off</h1>

      {message && (
        <div className={`mb-4 p-4 rounded-md ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="leave_type_id">
            Leave Type *
          </label>
          <select
            id="leave_type_id"
            name="leave_type_id"
            value={formData.leave_type_id}
            onChange={handleChange}
            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.leave_type_id ? 'border-red-500' : ''}`}
          >
            <option value="">Select Leave Type</option>
            {leaveTypes.map(leaveType => (
              <option key={leaveType.id} value={leaveType.id}>
                {leaveType.name} ({leaveType.max_days_per_year} days/year)
              </option>
            ))}
          </select>
          {errors.leave_type_id && <p className="text-red-500 text-xs italic">{errors.leave_type_id}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="start_date">
              Start Date *
            </label>
            <input
              id="start_date"
              name="start_date"
              type="date"
              value={formData.start_date}
              onChange={handleChange}
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.start_date ? 'border-red-500' : ''}`}
            />
            {errors.start_date && <p className="text-red-500 text-xs italic">{errors.start_date}</p>}
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="end_date">
              End Date *
            </label>
            <input
              id="end_date"
              name="end_date"
              type="date"
              value={formData.end_date}
              onChange={handleChange}
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.end_date ? 'border-red-500' : ''}`}
            />
            {errors.end_date && <p className="text-red-500 text-xs italic">{errors.end_date}</p>}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="reason">
            Reason *
          </label>
          <textarea
            id="reason"
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            rows={4}
            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.reason ? 'border-red-500' : ''}`}
            placeholder="Please provide a detailed reason for your leave request..."
          ></textarea>
          {errors.reason && <p className="text-red-500 text-xs italic">{errors.reason}</p>}
          <p className="text-gray-500 text-xs mt-1">Minimum 10 characters required</p>
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="attachments">
            Attachments (Optional)
          </label>
          <input
            id="attachments"
            name="attachments"
            type="file"
            onChange={handleFileChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            multiple
          />
          <p className="text-gray-500 text-xs mt-1">Upload supporting documents if required</p>
        </div>

        <div className="flex items-center justify-between">
          <button
            type="submit"
            disabled={loading}
            className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Submitting...' : 'Submit Request'}
          </button>
          
          <button
            type="button"
            onClick={() => {
              setFormData({
                leave_type_id: 0,
                start_date: '',
                end_date: '',
                reason: '',
                attachments: null
              });
              setErrors({});
              setMessage(null);
            }}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ml-2"
          >
            Reset
          </button>
        </div>
      </form>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-bold text-blue-800 mb-2">Leave Request Guidelines</h3>
        <ul className="list-disc pl-5 space-y-1 text-sm text-blue-700">
          <li>Leave requests must be submitted at least 2 days in advance</li>
          <li>All requests are subject to manager approval</li>
          <li>You can view the status of your requests in the "My Requests" section</li>
          <li>For medical leaves, attach relevant documentation</li>
        </ul>
      </div>
    </div>
  );
};

export default LeaveRequestForm;