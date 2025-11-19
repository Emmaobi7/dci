import React, { useState } from 'react';
import { Button } from './index';
import { FaUser, FaChalkboardTeacher, FaCog } from 'react-icons/fa';

const TestRoleSwitcher = ({ onRoleChange, currentRole }) => {
  const roles = [
    { value: 'student', label: 'STUDENT', icon: FaUser, color: 'bg-blue-500' },
    { value: 'instructor', label: 'INSTRUCTOR', icon: FaChalkboardTeacher, color: 'bg-green-500' },
    { value: 'admin', label: 'ADMIN', icon: FaCog, color: 'bg-purple-500' }
  ];

  return (
    <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-xl p-4 mb-6">
      <h3 className="text-yellow-400 font-mono text-sm tracking-wider mb-3 flex items-center">
        ⚠️ TESTING MODE - ROLE SWITCHER - CURRENT: {currentRole?.toUpperCase()}
      </h3>
      <div className="flex gap-2">
        {roles.map((role) => {
          const IconComponent = role.icon;
          return (
            <Button
              key={role.value}
              onClick={() => onRoleChange(role.value)}
              className={`${
                currentRole === role.value 
                  ? `${role.color} text-white` 
                  : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
              } px-3 py-2 text-xs font-mono flex items-center space-x-2`}
            >
              <IconComponent className="text-sm" />
              <span>{role.label}</span>
            </Button>
          );
        })}
      </div>
      <p className="text-yellow-400/70 text-xs font-mono mt-2">
        This is for testing only. In production, roles will be managed by admin.
      </p>
    </div>
  );
};

export default TestRoleSwitcher;
