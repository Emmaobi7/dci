// Sample course data for testing
export const sampleCourses = [
  {
    id: 'course-1',
    title: 'Advanced React Development',
    description: 'Master React with hooks, context, and modern patterns. Build production-ready applications with best practices.',
    price: 25000,
    level: 'advanced',
    duration: '8 weeks',
    instructorId: 'instructor-1',
    instructorName: 'John Doe',
    enrolledStudents: ['student-1', 'student-2'],
    totalStudents: 2,
    status: 'published',
    tags: ['React', 'JavaScript', 'Frontend'],
    modules: [
      { id: 1, title: 'React Hooks Deep Dive', description: 'Advanced hooks patterns' },
      { id: 2, title: 'Context and State Management', description: 'Managing complex state' },
      { id: 3, title: 'Performance Optimization', description: 'Making React fast' }
    ],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20')
  },
  {
    id: 'course-2',
    title: 'Python for Data Science',
    description: 'Learn Python programming specifically for data analysis, visualization, and machine learning.',
    price: 0,
    level: 'beginner',
    duration: '6 weeks',
    instructorId: 'instructor-2',
    instructorName: 'Jane Smith',
    enrolledStudents: ['student-1', 'student-3', 'student-4'],
    totalStudents: 3,
    status: 'published',
    tags: ['Python', 'Data Science', 'ML'],
    modules: [
      { id: 1, title: 'Python Basics', description: 'Variables, functions, and control flow' },
      { id: 2, title: 'NumPy and Pandas', description: 'Data manipulation libraries' },
      { id: 3, title: 'Data Visualization', description: 'Creating charts and graphs' }
    ],
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-05')
  },
  {
    id: 'course-3',
    title: 'UI/UX Design Fundamentals',
    description: 'Design beautiful and functional user interfaces. Learn design principles, tools, and best practices.',
    price: 15000,
    level: 'intermediate',
    duration: '4 weeks',
    instructorId: 'instructor-1',
    instructorName: 'John Doe',
    enrolledStudents: ['student-2'],
    totalStudents: 1,
    status: 'published',
    tags: ['Design', 'UI', 'UX', 'Figma'],
    modules: [
      { id: 1, title: 'Design Principles', description: 'Color, typography, layout' },
      { id: 2, title: 'User Research', description: 'Understanding user needs' },
      { id: 3, title: 'Prototyping', description: 'Creating interactive mockups' }
    ],
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-25')
  }
];

export const sampleUsers = [
  {
    uid: 'instructor-1',
    email: 'john@example.com',
    displayName: 'John Doe',
    role: 'instructor',
    enrolledCourses: [],
    createdAt: new Date('2024-01-01')
  },
  {
    uid: 'instructor-2', 
    email: 'jane@example.com',
    displayName: 'Jane Smith',
    role: 'instructor',
    enrolledCourses: [],
    createdAt: new Date('2024-01-02')
  },
  {
    uid: 'student-1',
    email: 'student1@example.com',
    displayName: 'Student One',
    role: 'student',
    enrolledCourses: ['course-1', 'course-2'],
    createdAt: new Date('2024-01-05')
  }
];

// Default export with all sample data
const sampleData = {
  courses: sampleCourses,
  users: sampleUsers
};

export default sampleData;
