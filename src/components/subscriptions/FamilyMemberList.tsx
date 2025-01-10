import React from 'react';
import { Users, Edit, Trash2, Plus } from 'lucide-react';
import type { FamilyMember } from '../../types/supabase';

interface FamilyMemberListProps {
  members: FamilyMember[];
  onEdit: (member: FamilyMember) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}

export default function FamilyMemberList({
  members,
  onEdit,
  onDelete,
  onAdd
}: FamilyMemberListProps) {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Users className="h-6 w-6 text-indigo-600 mr-2" />
            <h2 className="text-lg font-medium text-gray-900">Family Members</h2>
          </div>
          <button
            onClick={onAdd}
            className="flex items-center px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Member
          </button>
        </div>
      </div>
      <div className="divide-y divide-gray-200">
        {members.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No family members added yet
          </div>
        ) : (
          members.map((member) => (
            <div key={member.id} className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">{member.name}</h3>
                  <div className="mt-1 text-sm text-gray-500">
                    <p>Date of Birth: {new Date(member.date_of_birth).toLocaleDateString()}</p>
                    <p className="capitalize">Relationship: {member.relationship}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => onEdit(member)}
                    className="p-1 text-indigo-600 hover:text-indigo-900"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onDelete(member.id)}
                    className="p-1 text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}