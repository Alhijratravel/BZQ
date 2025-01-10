import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { planAPI } from '../../lib/api';
import { toast } from 'sonner';

export default function CreatePlan() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    billing_cycle: 'monthly',
    max_family_members: '4',
    features: [''],
    active: true
  });

  const handleFeatureChange = (index: number, value: string) => {
    const updatedFeatures = [...formData.features];
    updatedFeatures[index] = value;
    setFormData({ ...formData, features: updatedFeatures });
  };

  const handleAddFeature = () => {
    setFormData({ ...formData, features: [...formData.features, ''] });
  };

  const handleRemoveFeature = (index: number) => {
    const updatedFeatures = formData.features.filter((_, i) => i !== index);
    setFormData({ ...formData, features: updatedFeatures });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const planData = {
        ...formData,
        price: parseFloat(formData.price),
        max_family_members: parseInt(formData.max_family_members),
        features: formData.features.filter(f => f.trim() !== '')
      };

      await planAPI.create(planData);
      navigate('/plans/list');
    } catch (error) {
      console.error('Failed to create plan:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-6">Create New Plan</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Plan Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="block w-full pl-7 pr-12 rounded-md border border-gray-300 px-3 py-2"
              placeholder="0.00"
              step="0.01"
              min="0"
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Billing Cycle</label>
          <select
            value={formData.billing_cycle}
            onChange={(e) => setFormData({ ...formData, billing_cycle: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          >
            <option value="monthly">Monthly</option>
            <option value="half_yearly">Half Yearly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Maximum Family Members</label>
          <input
            type="number"
            value={formData.max_family_members}
            onChange={(e) => setFormData({ ...formData, max_family_members: e.target.value })}
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
          {formData.features.map((feature, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                value={feature}
                onChange={(e) => handleFeatureChange(index, e.target.value)}
                className="flex-1 rounded-md border border-gray-300 px-3 py-2"
                placeholder="Enter feature"
                required
              />
              {formData.features.length > 1 && (
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
            checked={formData.active}
            onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
            className="h-4 w-4 text-indigo-600 rounded border-gray-300"
          />
          <label className="ml-2 text-sm text-gray-700">Plan is active</label>
        </div>
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/plans/list')}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-400"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create Plan'}
          </button>
        </div>
      </form>
    </div>
  );
}