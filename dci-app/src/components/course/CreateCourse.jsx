import React, { useState } from 'react';
import { Button, Input } from '../index';
import { FaPlus, FaTrash, FaImage } from 'react-icons/fa';

const CreateCourse = ({ onCreateCourse, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: 0,
    level: 'beginner',
    duration: '',
    thumbnail: '',
    tags: [],
    modules: []
  });
  const [newTag, setNewTag] = useState('');
  const [newModule, setNewModule] = useState({ title: '', description: '' });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) || 0 : value
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const addModule = () => {
    if (newModule.title.trim()) {
      setFormData(prev => ({
        ...prev,
        modules: [...prev.modules, { ...newModule, id: Date.now() }]
      }));
      setNewModule({ title: '', description: '' });
    }
  };

  const removeModule = (moduleId) => {
    setFormData(prev => ({
      ...prev,
      modules: prev.modules.filter(module => module.id !== moduleId)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreateCourse(formData);
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500 mb-2 font-mono tracking-wider">
            CREATE NEW COURSE
          </h1>
          <p className="text-gray-400 font-mono text-sm tracking-wider">
            DESIGN YOUR TRAINING PROGRAM
          </p>
        </div>

        {/* Form */}
        <div className="bg-gray-800/70 backdrop-blur-lg border border-gray-700 rounded-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-400 font-mono tracking-wider">
                  COURSE TITLE
                </label>
                <Input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Advanced React Development"
                  required
                  className="w-full bg-gray-900/50 border border-gray-700 focus:border-teal-400 text-gray-900 placeholder-gray-500 font-mono text-sm rounded-lg px-4 py-3"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-400 font-mono tracking-wider">
                  PRICE (₦)
                </label>
                <Input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="0"
                  min="0"
                  className="w-full bg-gray-900/50 border border-gray-700 focus:border-teal-400 text-gray-900 placeholder-gray-500 font-mono text-sm rounded-lg px-4 py-3"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-400 font-mono tracking-wider">
                  LEVEL
                </label>
                <select
                  name="level"
                  value={formData.level}
                  onChange={handleInputChange}
                  className="w-full bg-gray-900/50 border border-gray-700 focus:border-teal-400 text-white font-mono text-sm rounded-lg px-4 py-3"
                >
                  <option value="beginner">BEGINNER</option>
                  <option value="intermediate">INTERMEDIATE</option>
                  <option value="advanced">ADVANCED</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-400 font-mono tracking-wider">
                  DURATION
                </label>
                <Input
                  type="text"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  placeholder="4 weeks"
                  className="w-full bg-gray-900/50 border border-gray-700 focus:border-teal-400 text-gray-900 placeholder-gray-500 font-mono text-sm rounded-lg px-4 py-3"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-400 font-mono tracking-wider">
                DESCRIPTION
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Comprehensive course description..."
                rows="4"
                required
                className="w-full bg-gray-900/50 border border-gray-700 focus:border-teal-400 text-white placeholder-gray-500 font-mono text-sm rounded-lg px-4 py-3 resize-none"
              />
            </div>

            {/* Thumbnail URL */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-400 font-mono tracking-wider">
                THUMBNAIL URL (OPTIONAL)
              </label>
              <div className="relative">
                <FaImage className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                <Input
                  type="url"
                  name="thumbnail"
                  value={formData.thumbnail}
                  onChange={handleInputChange}
                  placeholder="https://example.com/image.jpg"
                  className="w-full bg-gray-900/50 border border-gray-700 focus:border-teal-400 text-gray-100 placeholder-gray-500 font-mono text-sm rounded-lg pl-10 pr-4 py-3"
                />
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-400 font-mono tracking-wider">
                TAGS
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 bg-teal-500/20 text-teal-400 text-sm font-mono rounded-full"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-2 text-teal-400 hover:text-red-400"
                    >
                      <FaTrash className="text-xs" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a tag"
                  className="flex-1 bg-gray-900/50 border border-gray-700 focus:border-teal-400 text-gray-900 placeholder-gray-500 font-mono text-sm rounded-lg px-4 py-2"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button
                  type="button"
                  onClick={addTag}
                  className="bg-teal-500 hover:bg-teal-400 text-gray-900 px-4 py-2"
                >
                  <FaPlus />
                </Button>
              </div>
            </div>

            {/* Modules */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-400 font-mono tracking-wider">
                COURSE MODULES
              </label>
              <div className="space-y-3 mb-4">
                {formData.modules.map((module, index) => (
                  <div key={module.id} className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="text-white font-mono font-bold">{module.title}</h4>
                        {module.description && (
                          <p className="text-gray-400 text-sm mt-1">{module.description}</p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeModule(module.id)}
                        className="text-red-400 hover:text-red-300 ml-4"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Input
                  type="text"
                  value={newModule.title}
                  onChange={(e) => setNewModule(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Module title"
                  className="bg-gray-900/50 border border-gray-700 focus:border-teal-400 text-gray-900 placeholder-gray-500 font-mono text-sm rounded-lg px-4 py-2"
                />
                <Input
                  type="text"
                  value={newModule.description}
                  onChange={(e) => setNewModule(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Module description (optional)"
                  className="bg-gray-900/50 border border-gray-700 focus:border-teal-400 text-gray-900 placeholder-gray-500 font-mono text-sm rounded-lg px-4 py-2"
                />
              </div>
              <Button
                type="button"
                onClick={addModule}
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 mt-2"
              >
                <FaPlus className="mr-2" />
                ADD MODULE
              </Button>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6">
              <Button
                type="button"
                onClick={onCancel}
                className="bg-gray-600 hover:bg-gray-500 text-white px-6 py-3"
              >
                CANCEL
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 text-gray-900 font-bold px-6 py-3"
              >
                {loading ? 'CREATING...' : 'CREATE COURSE'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateCourse;
