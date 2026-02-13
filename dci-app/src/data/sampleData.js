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
      {
        id: 'mod-1',
        title: 'React Hooks Deep Dive',
        description: 'Advanced hooks patterns',
        lessons: [
          { id: 'les-1', title: 'useState & useEffect', type: 'video', duration: '15 mins' },
          { id: 'les-2', title: 'useMemo & useCallback', type: 'video', duration: '20 mins' }
        ]
      },
      {
        id: 'mod-2',
        title: 'Context and State Management',
        description: 'Managing complex state',
        lessons: [
          { id: 'les-3', title: 'Context API Basics', type: 'text', duration: '10 mins' }
        ]
      }
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
      {
        id: 'mod-3',
        title: 'Python Basics',
        description: 'Variables, functions, and control flow',
        lessons: [
          { id: 'les-4', title: 'Hello World & Variables', type: 'video', duration: '10 mins' },
          { id: 'les-5', title: 'Loops & If statements', type: 'video', duration: '20 mins' }
        ]
      },
      {
        id: 'mod-4',
        title: 'NumPy and Pandas',
        description: 'Data manipulation libraries',
        lessons: [
          { id: 'les-6', title: 'Introduction to NumPy', type: 'video', duration: '15 mins' }
        ]
      }
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
      {
        id: 'mod-5',
        title: 'Design Principles',
        description: 'Color, typography, layout',
        lessons: [
          { id: 'les-7', title: 'Visual Hierarchy', type: 'video', duration: '12 mins' }
        ]
      },
      {
        id: 'mod-6',
        title: 'User Research',
        description: 'Understanding user needs',
        lessons: [
          { id: 'les-8', title: 'Interviewing Users', type: 'video', duration: '25 mins' }
        ]
      }
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
