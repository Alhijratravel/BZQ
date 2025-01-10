import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Trash2, Plus, X, Loader2 } from 'lucide-react';
import { planAPI } from '../../lib/api';
import { toast } from 'sonner';

const billingCycleOptions = {
  monthly: "Monthly",
  half_yearly: "Half Yearly",
  yearly: "Yearly"
};

export default function PlanList() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<string | null>(null);

  const loadPlans = async () => {
    try {
      const data = await planAPI.getAll();
      setPlans(data);
    } catch (error) {
      console.error('Failed to load plans:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const handleEdit = (plan: any) => {
    setEditingPlan({ ...plan, features: [...plan.features] });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;

    try {
      await planAPI.update(editingPlan.id, editingPlan);
      await loadPlans(); // Reload plans after update
      setEditingPlan(null);
    } catch (error) {
      console.error('Failed to update plan:', error);
    }
  };

  const handleDelete = (id: string) => {
    setPlanToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!planToDelete) return;

    try {
      await planAPI.delete(planToDelete);
      await loadPlans(); // Reload plans after deletion
      setShowDeleteModal(false);
      setPlanToDelete(null);
    } catch (error) {
      console.error('Failed to delete plan:', error);
    }
  };

  const handleFeatureChange = (index: number, value: string) => {
    const updatedFeatures = [...editingPlan.features];
    updatedFeatures[index] = value;
    setEditingPlan({ ...editingPlan, features: updatedFeatures });
  };

  const handleAddFeature = () => {
    setEditingPlan({ 
      ...editingPlan, 
      features: [...editingPlan.features, ''] 
    });
  };

  const handleRemoveFeature = (index: number) => {
    const updatedFeatures = editingPlan.features.filter((_: any, i: number) => i !== index);
    setEditingPlan({ ...editingPlan, features: updatedFeatures });
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
            <h2 className="text-2xl font-bold text-gray-800">Plans</h2>
            <button
              onClick={() => navigate('/plans/create')}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Plan
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="border rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                  <p className="text-gray-500 mt-1">{plan.description}</p>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleEdit(plan)}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => handleDelete(plan.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="mt-4">
                <div className="text-2xl font-bold text-gray-900">
                  ${plan.price}
                  <span className="text-sm font-normal text-gray-500">
                    /{billingCycleOptions[plan.billing_cycle as keyof typeof billingCycleOptions].toLowerCase()}
                  </span>
                </div>
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-900">Features:</h4>
                  <ul className="mt-2 space-y-2">
                    {plan.features.map((feature: string, index: number) => (
                      <li key={index} className="text-sm text-gray-500 flex items-center">
                        <span className="mr-2">•</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-4 flex items-center">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      plan.active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {plan.active ? 'Active' : 'Inactive'}
                  </span>
                  <span className="ml-2 text-sm text-gray-500">
                    Max Members: {plan.max_family_members}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Modal */}
      {editingPlan && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Edit Plan</h3>
              <button onClick={() => setEditingPlan(null)} className="text-gray-400 hover:text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Plan Name</label>
                <input
                  type="text"
                  value={editingPlan.name}
                  onChange={e => setEditingPlan({...editingPlan, name: e.target.value})}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={editingPlan.description}
                  onChange={e => setEditingPlan({...editingPlan, description: e.target.value})}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  rows={3}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Price</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    value={editingPlan.price}
                    onChange={e => setEditingPlan({...editingPlan, price: parseFloat(e.target.value)})}
                    className="block w-full pl-7 pr-12 rounded-md border border-gray-300 px-3 py-2"
                    step="0.01"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Billing Cycle</label>
                <select
                  value={editingPlan.billing_cycle}
                  onChange={e => setEditingPlan({...editingPlan, billing_cycle: e.target.value})}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                >
                  {Object.entries(billingCycleOptions).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Maximum Family Members</label>
                <input
                  type="number"
                  value={editingPlan.max_family_members}
                  onChange={e => setEditingPlan({...editingPlan, max_family_members: parseInt(e.target.value)})}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  min="1"
                  required
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">Features</label>
                  <button
                    type="button"
                    onClick={handleAddFeature}
                    className="text-sm text-indigo-600 hover:text-indigo-800"
                  >
                    Add Feature
                  </button>
                </div>
                {editingPlan.features.map((feature: string, index: number) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={feature}
                      onChange={(e) => handleFeatureChange(index, e.target.value)}
                      className="flex-1 rounded-md border border-gray-300 px-3 py-2"
                      placeholder="Enter feature"
                      required
                    />
                    {editingPlan.features.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={editingPlan.active}
                  onChange={e => setEditingPlan({...editingPlan, active: e.target.checked})}
                  className="h-4 w-4 text-indigo-600 rounded border-gray-300"
                />
                <label className="ml-2 text-sm text-gray-700">Plan is active</label>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setEditingPlan(null)}
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
            <p className="text-gray-500 mb-4">Are you sure you want to delete this plan? This action cannot be undone.</p>
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