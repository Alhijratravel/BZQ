import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Trash2, Plus, X, Loader2, Users } from 'lucide-react';
import { customerAPI } from '../../lib/api';
import type { Customer } from '../../types';

interface FamilyMember {
  id?: string;
  name: string;
  date_of_birth: string;
  relationship: string;
}

export default function CustomerList() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<string | null>(null);

  const loadCustomers = async () => {
    try {
      const data = await customerAPI.getAll();
      setCustomers(data);
    } catch (error) {
      console.error('Failed to load customers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleEdit = (customer: Customer) => {
    setEditingCustomer({
      ...customer,
      family_members: customer.family_members || []
    });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer) return;

    try {
      await customerAPI.update(editingCustomer.id, editingCustomer);
      // Refresh the customer list after successful update
      await loadCustomers();
      setEditingCustomer(null);
    } catch (error) {
      console.error('Failed to update customer:', error);
    }
  };

  const handleAddFamilyMember = () => {
    if (!editingCustomer) return;
    setEditingCustomer({
      ...editingCustomer,
      type: 'family',
      family_members: [
        ...(editingCustomer.family_members || []),
        { name: '', date_of_birth: '', relationship: '' }
      ]
    });
  };

  const handleRemoveFamilyMember = (index: number) => {
    if (!editingCustomer) return;
    const updatedMembers = [...editingCustomer.family_members];
    updatedMembers.splice(index, 1);
    setEditingCustomer({
      ...editingCustomer,
      family_members: updatedMembers
    });
  };

  const handleFamilyMemberChange = (index: number, field: keyof FamilyMember, value: string) => {
    if (!editingCustomer) return;
    const updatedMembers = [...editingCustomer.family_members];
    updatedMembers[index] = { ...updatedMembers[index], [field]: value };
    setEditingCustomer({
      ...editingCustomer,
      family_members: updatedMembers
    });
  };

  const handleDelete = (id: string) => {
    setCustomerToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!customerToDelete) return;

    try {
      await customerAPI.delete(customerToDelete);
      // Refresh the customer list after successful deletion
      await loadCustomers();
      setShowDeleteModal(false);
      setCustomerToDelete(null);
    } catch (error) {
      console.error('Failed to delete customer:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">Customers</h2>
            <button
              onClick={() => navigate('/customers/create')}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Customer
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Family Members
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {customers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {customer.id}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {customer.first_name} {customer.last_name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{customer.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      customer.type === 'family' 
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {customer.type === 'family' ? 'Family' : 'Single'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {customer.type === 'family' && customer.family_members && (
                      <div className="flex items-center">
                        <Users className="h-4 w-4 text-gray-500 mr-1" />
                        <span className="text-sm text-gray-500">
                          {customer.family_members.length} members
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {customer.city && customer.country 
                        ? `${customer.city}, ${customer.country}`
                        : '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-3">
                      <button 
                        onClick={() => handleEdit(customer)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(customer.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editingCustomer && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Edit Customer</h3>
              <button onClick={() => setEditingCustomer(null)} className="text-gray-400 hover:text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">First Name</label>
                  <input
                    type="text"
                    value={editingCustomer.first_name}
                    onChange={e => setEditingCustomer({...editingCustomer, first_name: e.target.value})}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Name</label>
                  <input
                    type="text"
                    value={editingCustomer.last_name}
                    onChange={e => setEditingCustomer({...editingCustomer, last_name: e.target.value})}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={editingCustomer.email}
                  onChange={e => setEditingCustomer({...editingCustomer, email: e.target.value})}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input
                  type="tel"
                  value={editingCustomer.phone || ''}
                  onChange={e => setEditingCustomer({...editingCustomer, phone: e.target.value})}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">City</label>
                  <input
                    type="text"
                    value={editingCustomer.city || ''}
                    onChange={e => setEditingCustomer({...editingCustomer, city: e.target.value})}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Country</label>
                  <input
                    type="text"
                    value={editingCustomer.country || ''}
                    onChange={e => setEditingCustomer({...editingCustomer, country: e.target.value})}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Customer Type</label>
                <select
                  value={editingCustomer.type}
                  onChange={e => setEditingCustomer({...editingCustomer, type: e.target.value as 'single' | 'family'})}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                >
                  <option value="single">Single</option>
                  <option value="family">Family</option>
                </select>
              </div>

              {/* Family Members Section */}
              {editingCustomer.type === 'family' && (
                <div className="border-t pt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Family Members</h3>
                    <button
                      type="button"
                      onClick={handleAddFamilyMember}
                      className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                    >
                      Add Family Member
                    </button>
                  </div>
                  {editingCustomer.family_members.map((member, index) => (
                    <div key={index} className="border p-4 rounded-md mb-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Name</label>
                          <input
                            type="text"
                            value={member.name}
                            onChange={(e) => handleFamilyMemberChange(index, 'name', e.target.value)}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                          <input
                            type="date"
                            value={member.date_of_birth}
                            onChange={(e) => handleFamilyMemberChange(index, 'date_of_birth', e.target.value)}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Relationship</label>
                          <select
                            value={member.relationship}
                            onChange={(e) => handleFamilyMemberChange(index, 'relationship', e.target.value)}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                            required
                          >
                            <option value="">Select Relationship</option>
                            <option value="spouse">Spouse</option>
                            <option value="child">Child</option>
                            <option value="parent">Parent</option>
                          </select>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFamilyMember(index)}
                        className="mt-2 text-sm text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setEditingCustomer(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-medium mb-4">Confirm Delete</h3>
            <p className="text-gray-500 mb-4">Are you sure you want to delete this customer? This action cannot be undone.</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}