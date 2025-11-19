import React, { useState } from 'react';
import { Button, Input } from './index';
import { FaTimes, FaPlus, FaTrash, FaVideo, FaBook, FaSave } from 'react-icons/fa';

const ModuleEditor = ({ module, isOpen, onClose, onSave, isEditing = false }) => {
  const [moduleData, setModuleData] = useState({
    title: module?.title || '',
    description: module?.description || '',
    lessons: module?.lessons || []
  });
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleLessonChange = (index, field, value) => {
    const lessons = [...moduleData.lessons];
    lessons[index] = { ...lessons[index], [field]: value };
    setModuleData({ ...moduleData, lessons });
  };

  const addLesson = () => {
    const newLesson = {
      id: Date.now().toString(),
      title: '',
      type: 'video',
      duration: '',
      content: ''
    };
    setModuleData({
      ...moduleData,
      lessons: [...moduleData.lessons, newLesson]
    });
  };

  const removeLesson = (index) => {
    const lessons = moduleData.lessons.filter((_, i) => i !== index);
    setModuleData({ ...moduleData, lessons });
  };

  const handleSave = async () => {
    if (!moduleData.title.trim()) {
      alert('Module title is required');
      return;
    }

    setSaving(true);
    try {
      await onSave(moduleData);
      onClose();
    } catch (error) {
      console.error('Error saving module:', error);
      alert('Failed to save module. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 border border-gray-600 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <h3 className="text-xl font-bold text-white font-mono">
            {isEditing ? 'EDIT MODULE' : 'ADD MODULE'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
            disabled={saving}
          >
            <FaTimes />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Module Details */}
          <div className="space-y-4">
            <div>
              <label className="block text-gray-300 font-mono text-sm mb-2">
                MODULE TITLE *
              </label>
              <Input
                value={moduleData.title}
                onChange={(e) => setModuleData({ ...moduleData, title: e.target.value })}
                placeholder="Enter module title"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-gray-300 font-mono text-sm mb-2">
                DESCRIPTION
              </label>
              <textarea
                value={moduleData.description}
                onChange={(e) => setModuleData({ ...moduleData, description: e.target.value })}
                placeholder="Enter module description"
                rows={3}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white font-mono resize-none"
              />
            </div>
          </div>

          {/* Lessons */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-bold text-white font-mono">LESSONS</h4>
              <Button
                onClick={addLesson}
                className="bg-teal-500 hover:bg-teal-400 text-gray-900"
              >
                <FaPlus className="mr-2" />
                ADD LESSON
              </Button>
            </div>

            <div className="space-y-4">
              {moduleData.lessons.map((lesson, index) => (
                <div key={lesson.id || index} className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                  <div className="flex justify-between items-start mb-4">
                    <h5 className="text-white font-mono font-bold">LESSON {index + 1}</h5>
                    <Button
                      onClick={() => removeLesson(index)}
                      className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 text-sm"
                    >
                      <FaTrash />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-300 font-mono text-xs mb-1">
                        LESSON TITLE
                      </label>
                      <Input
                        value={lesson.title}
                        onChange={(e) => handleLessonChange(index, 'title', e.target.value)}
                        placeholder="Enter lesson title"
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-300 font-mono text-xs mb-1">
                        TYPE
                      </label>
                      <select
                        value={lesson.type}
                        onChange={(e) => handleLessonChange(index, 'type', e.target.value)}
                        className="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white font-mono"
                      >
                        <option value="video">Video</option>
                        <option value="text">Text/Reading</option>
                        <option value="quiz">Quiz</option>
                        <option value="assignment">Assignment</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-gray-300 font-mono text-xs mb-1">
                        DURATION
                      </label>
                      <Input
                        value={lesson.duration}
                        onChange={(e) => handleLessonChange(index, 'duration', e.target.value)}
                        placeholder="e.g., 15 mins"
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-300 font-mono text-xs mb-1">
                        CONTENT URL/TEXT
                      </label>
                      <Input
                        value={lesson.content || ''}
                        onChange={(e) => handleLessonChange(index, 'content', e.target.value)}
                        placeholder="Video URL, text content, etc."
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              ))}

              {moduleData.lessons.length === 0 && (
                <div className="text-center py-8 bg-gray-700/50 border border-gray-600 rounded-lg">
                  <div className="text-4xl text-gray-600 mb-2">📚</div>
                  <p className="text-gray-400 font-mono text-sm">
                    No lessons yet. Click "Add Lesson" to get started.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-700">
            <Button
              onClick={onClose}
              className="bg-gray-600 hover:bg-gray-500 text-white"
              disabled={saving}
            >
              CANCEL
            </Button>
            <Button
              onClick={handleSave}
              className="bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white"
              disabled={saving}
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  SAVING...
                </>
              ) : (
                <>
                  <FaSave className="mr-2" />
                  {isEditing ? 'UPDATE MODULE' : 'CREATE MODULE'}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModuleEditor;
