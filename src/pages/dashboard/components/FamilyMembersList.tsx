import React, { useState } from 'react';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';

interface FamilyMembersListProps {
  subscription: any;
  onUpdate: () => void;
}

export default function FamilyMembersList({ subscription, onUpdate }: FamilyMembersListProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMember, setEditingMember] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    date_of_birth: '',
    relationship: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Add family member logic here
      await onUpdate();
      setShowAddModal(false);
      setFormData({ name: '', date_of_birth: '', relationship: '' });
      toast.success('Family member added successfully');
    } catch (error) {
      console.error('Failed to add family member:', error);
      toast.error('Failed to add family member');
    }
  };

  const handleDelete = async (memberId: string) => {
    try {
      // Delete family member logic here
      await onUpdate();
      toast.success('Family member removed successfully');
    } catch (error) {
      console.error('Failed to remove family member:', error);
      toast.error('Failed to remove family member');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Family Members</h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Member
          </button>
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {subscription?.family_members?.map((member: any) => (
          <div key={member.id} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">{member.name}</h3>
                <div className="mt-1 text-sm text-gray-500">
                  <p>Date of Birth: {new Date(member.date_of_birth).toLocaleDateString()}</p>
                  <p className="capitalize">Relationship: {member.relationship}</p>
                </div>
                {member.status === 'addon' && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mt-2">
                    Addon Member
                  </span>
                )}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setEditingMember(member)}
                  className="p-1 text-indigo-600 hover:text-indigo-900"
                >
                  <Edit className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDelete(member.id)}
                  className="p-1 text-red-600 hover:text-red-900"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {(!subscription?.family_members || subscription.family_members.length === 0) && (
          <div className="p-6 text-center text-gray-500">
            No family members added yet
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || editingMember) && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">
                {editingMember ? 'Edit Family Member' : 'Add Family Member'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingMember(null);
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                <input
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Relationship</label>
                <select
                  value={formData.relationship}
                  onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  required
                >
                  <option value="">Select Relationship</option>
                  <option value="spouse">Spouse</option>
                  <option value="child">Child</option>
                  <option value="parent">Parent</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingMember(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  {editingMember ? 'Save Changes' : 'Add Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}