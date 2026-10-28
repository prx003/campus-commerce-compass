export type Role = 'board' | 'chancellors';

export const ROLES: { id: Role; title: string; short: string; color: string; bg: string }[] = [
  { id: 'board', title: 'Board of Trustees', short: 'BOT', color: 'text-blue-600', bg: 'bg-blue-600' },
  { id: 'chancellors', title: 'Chancellors', short: 'CHC', color: 'text-cyan-600', bg: 'bg-cyan-600' },
];

export interface Department {
  id: string;
  name: string;
  code: string;
  head: string;
  faculty: number;
  students: number;
  courses: Course[];
  established: number;
  description: string;
  passRate: number;
  researchProjects: number;
  labs: number;
  accreditation: string;
}

export interface Course {
  id: string;
  name: string;
  code: string;
  credits: number;
  semester: number;
  type: 'UG' | 'PG' | 'PhD';
  enrolled: number;
  passRate: number;
  instructor: string;
}

export interface Student {
  id: string;
  name: string;
  roll: string;
  department: string;
  year: number;
  gpa: number;
  status: 'Active' | 'Inactive' | 'Graduated';
  email: string;
  phone: string;
  admissionYear: number;
}

export interface FacultyMember {
  id: string;
  name: string;
  designation: string;
  department: string;
  qualification: string;
  experience: number;
  email: string;
  specialization: string;
  publications: number;
  status: 'Active' | 'On Leave';
}

export interface Policy {
  id: string;
  title: string;
  category: string;
  status: 'Approved' | 'Pending' | 'Under Review' | 'Rejected';
  submittedBy: string;
  submittedDate: string;
  approvedBy?: string;
  approvedDate?: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
}

export interface BudgetItem {
  id: string;
  category: string;
  allocated: number;
  spent: number;
  remaining: number;
  percentage: number;
}

export interface Meeting {
  id: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  attendees: string[];
  agenda: string[];
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  decisions?: string[];
  actionItems?: { task: string; assignedTo: string; deadline: string; status: 'Pending' | 'In Progress' | 'Done' }[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  lead: string;
  startDate: string;
  endDate: string;
  status: 'Ongoing' | 'Completed' | 'Planned' | 'On Hold';
  progress: number;
  budget: number;
  category: string;
}

export interface Achievement {
  id: string;
  title: string;
  category: 'Award' | 'Ranking' | 'Accreditation' | 'Research' | 'Sports';
  date: string;
  description: string;
  awardedBy: string;
}

export interface Appointment {
  id: string;
  name: string;
  position: string;
  department: string;
  appointmentDate: string;
  status: 'Approved' | 'Pending' | 'Under Review' | 'Rejected';
  qualification: string;
  experience: number;
}

export interface Collaboration {
  id: string;
  partner: string;
  type: 'MoU' | 'Research' | 'Industry' | 'International';
  startDate: string;
  endDate: string;
  status: 'Active' | 'Pending' | 'Expired';
  description: string;
  benefits: string;
}

export interface ImprovementPlan {
  id: string;
  title: string;
  department: string;
  submittedBy: string;
  submittedDate: string;
  status: 'Submitted' | 'In Review' | 'Approved' | 'Implemented';
  priority: 'High' | 'Medium' | 'Low';
  description: string;
  progress: number;
}

// ─── DEPARTMENTS ────────────────────────────────────────────────────────────────
export const departments: Department[] = [
  {
    id: 'dept-cs',
    name: 'Computer Science & Engineering',
    code: 'CSE',
    head: 'Dr. Arun Kumar',
    faculty: 28,
    students: 620,
    established: 1998,
    description: 'Premier department offering cutting-edge programs in software engineering, AI, data science, and cybersecurity.',
    passRate: 94,
    researchProjects: 12,
    labs: 8,
    accreditation: 'NBA Accredited',
    courses: [
      { id: 'c1', name: 'Data Structures & Algorithms', code: 'CSE201', credits: 4, semester: 3, type: 'UG', enrolled: 120, passRate: 92, instructor: 'Dr. Priya Sharma' },
      { id: 'c2', name: 'Machine Learning', code: 'CSE401', credits: 4, semester: 7, type: 'UG', enrolled: 95, passRate: 88, instructor: 'Dr. Arun Kumar' },
      { id: 'c3', name: 'Database Management Systems', code: 'CSE301', credits: 3, semester: 5, type: 'UG', enrolled: 110, passRate: 90, instructor: 'Prof. Rajesh Nair' },
      { id: 'c4', name: 'M.Tech Software Engineering', code: 'CSE501', credits: 20, semester: 1, type: 'PG', enrolled: 40, passRate: 96, instructor: 'Dr. Meena Iyer' },
      { id: 'c5', name: 'PhD Computer Science', code: 'CSE901', credits: 0, semester: 1, type: 'PhD', enrolled: 15, passRate: 100, instructor: 'Dr. Arun Kumar' },
    ],
  },
  {
    id: 'dept-ec',
    name: 'Electronics & Communication',
    code: 'ECE',
    head: 'Dr. Sunita Rao',
    faculty: 24,
    students: 540,
    established: 1995,
    description: 'Focused on VLSI design, embedded systems, signal processing, and wireless communications.',
    passRate: 91,
    researchProjects: 9,
    labs: 7,
    accreditation: 'NBA Accredited',
    courses: [
      { id: 'c6', name: 'Digital Electronics', code: 'ECE201', credits: 4, semester: 3, type: 'UG', enrolled: 110, passRate: 89, instructor: 'Dr. Sunita Rao' },
      { id: 'c7', name: 'VLSI Design', code: 'ECE401', credits: 4, semester: 7, type: 'UG', enrolled: 85, passRate: 87, instructor: 'Dr. Vijay Menon' },
      { id: 'c8', name: 'Embedded Systems', code: 'ECE301', credits: 3, semester: 5, type: 'UG', enrolled: 100, passRate: 91, instructor: 'Prof. Anita Pillai' },
      { id: 'c9', name: 'M.Tech VLSI', code: 'ECE501', credits: 20, semester: 1, type: 'PG', enrolled: 35, passRate: 94, instructor: 'Dr. Vijay Menon' },
    ],
  },
  {
    id: 'dept-me',
    name: 'Mechanical Engineering',
    code: 'ME',
    head: 'Dr. Ramesh Patel',
    faculty: 22,
    students: 480,
    established: 1992,
    description: 'Covers thermodynamics, manufacturing, robotics, CAD/CAM, and industrial engineering.',
    passRate: 89,
    researchProjects: 7,
    labs: 9,
    accreditation: 'NBA Accredited',
    courses: [
      { id: 'c10', name: 'Thermodynamics', code: 'ME201', credits: 4, semester: 3, type: 'UG', enrolled: 100, passRate: 86, instructor: 'Dr. Ramesh Patel' },
      { id: 'c11', name: 'Manufacturing Processes', code: 'ME301', credits: 3, semester: 5, type: 'UG', enrolled: 95, passRate: 88, instructor: 'Prof. Suresh Kumar' },
      { id: 'c12', name: 'Robotics & Automation', code: 'ME401', credits: 4, semester: 7, type: 'UG', enrolled: 80, passRate: 90, instructor: 'Dr. Kavitha R' },
      { id: 'c13', name: 'M.Tech Manufacturing', code: 'ME501', credits: 20, semester: 1, type: 'PG', enrolled: 30, passRate: 93, instructor: 'Dr. Ramesh Patel' },
    ],
  },
  {
    id: 'dept-ce',
    name: 'Civil Engineering',
    code: 'CE',
    head: 'Dr. Anitha Krishnan',
    faculty: 20,
    students: 420,
    established: 1990,
    description: 'Specializes in structural engineering, transportation, geotechnical engineering, and environmental engineering.',
    passRate: 88,
    researchProjects: 6,
    labs: 6,
    accreditation: 'NBA Accredited',
    courses: [
      { id: 'c14', name: 'Structural Analysis', code: 'CE201', credits: 4, semester: 3, type: 'UG', enrolled: 95, passRate: 85, instructor: 'Dr. Anitha Krishnan' },
      { id: 'c15', name: 'Geotechnical Engineering', code: 'CE301', credits: 3, semester: 5, type: 'UG', enrolled: 88, passRate: 87, instructor: 'Prof. Mohan Das' },
      { id: 'c16', name: 'Transportation Engineering', code: 'CE401', credits: 4, semester: 7, type: 'UG', enrolled: 75, passRate: 89, instructor: 'Dr. Lakshmi V' },
      { id: 'c17', name: 'M.Tech Structural', code: 'CE501', credits: 20, semester: 1, type: 'PG', enrolled: 28, passRate: 95, instructor: 'Dr. Anitha Krishnan' },
    ],
  },
  {
    id: 'dept-ba',
    name: 'Business Administration',
    code: 'MBA',
    head: 'Dr. Neha Gupta',
    faculty: 18,
    students: 380,
    established: 2002,
    description: 'Offers MBA and BBA programs covering finance, marketing, HR, operations, and entrepreneurship.',
    passRate: 93,
    researchProjects: 5,
    labs: 3,
    accreditation: 'AICTE Approved',
    courses: [
      { id: 'c18', name: 'Financial Management', code: 'MBA201', credits: 4, semester: 2, type: 'PG', enrolled: 90, passRate: 91, instructor: 'Dr. Neha Gupta' },
      { id: 'c19', name: 'Marketing Management', code: 'MBA202', credits: 4, semester: 2, type: 'PG', enrolled: 90, passRate: 93, instructor: 'Prof. Ravi Shetty' },
      { id: 'c20', name: 'Human Resource Management', code: 'MBA203', credits: 3, semester: 3, type: 'PG', enrolled: 85, passRate: 94, instructor: 'Dr. Pooja Nair' },
      { id: 'c21', name: 'BBA Business Analytics', code: 'BBA301', credits: 3, semester: 5, type: 'UG', enrolled: 75, passRate: 92, instructor: 'Dr. Neha Gupta' },
    ],
  },
];

// ─── STUDENTS ────────────────────────────────────────────────────────────────
export const students: Student[] = [
  { id: 's1', name: 'Arjun Sharma', roll: 'CSE21001', department: 'CSE', year: 4, gpa: 9.2, status: 'Active', email: 'arjun@college.edu', phone: '9876543210', admissionYear: 2021 },
  { id: 's2', name: 'Priya Nair', roll: 'CSE21002', department: 'CSE', year: 4, gpa: 8.8, status: 'Active', email: 'priya@college.edu', phone: '9876543211', admissionYear: 2021 },
  { id: 's3', name: 'Rahul Mehta', roll: 'ECE22001', department: 'ECE', year: 3, gpa: 8.5, status: 'Active', email: 'rahul@college.edu', phone: '9876543212', admissionYear: 2022 },
  { id: 's4', name: 'Sneha Patel', roll: 'ME22001', department: 'ME', year: 3, gpa: 8.1, status: 'Active', email: 'sneha@college.edu', phone: '9876543213', admissionYear: 2022 },
  { id: 's5', name: 'Vikram Singh', roll: 'CE23001', department: 'CE', year: 2, gpa: 7.9, status: 'Active', email: 'vikram@college.edu', phone: '9876543214', admissionYear: 2023 },
  { id: 's6', name: 'Anjali Kumar', roll: 'MBA24001', department: 'MBA', year: 1, gpa: 8.7, status: 'Active', email: 'anjali@college.edu', phone: '9876543215', admissionYear: 2024 },
  { id: 's7', name: 'Rohan Verma', roll: 'CSE20001', department: 'CSE', year: 4, gpa: 9.5, status: 'Graduated', email: 'rohan@college.edu', phone: '9876543216', admissionYear: 2020 },
  { id: 's8', name: 'Meera Krishnan', roll: 'ECE21001', department: 'ECE', year: 4, gpa: 8.3, status: 'Active', email: 'meera@college.edu', phone: '9876543217', admissionYear: 2021 },
  { id: 's9', name: 'Karan Joshi', roll: 'ME21001', department: 'ME', year: 4, gpa: 7.6, status: 'Active', email: 'karan@college.edu', phone: '9876543218', admissionYear: 2021 },
  { id: 's10', name: 'Divya Reddy', roll: 'CE22001', department: 'CE', year: 3, gpa: 8.9, status: 'Active', email: 'divya@college.edu', phone: '9876543219', admissionYear: 2022 },
];

// ─── FACULTY ─────────────────────────────────────────────────────────────────
export const faculty: FacultyMember[] = [
  { id: 'f1', name: 'Dr. Arun Kumar', designation: 'Professor & HoD', department: 'CSE', qualification: 'PhD IIT Delhi', experience: 22, email: 'arun@college.edu', specialization: 'Machine Learning', publications: 45, status: 'Active' },
  { id: 'f2', name: 'Dr. Priya Sharma', designation: 'Associate Professor', department: 'CSE', qualification: 'PhD IIT Bombay', experience: 15, email: 'priya.s@college.edu', specialization: 'Algorithms', publications: 28, status: 'Active' },
  { id: 'f3', name: 'Dr. Sunita Rao', designation: 'Professor & HoD', department: 'ECE', qualification: 'PhD IIT Madras', experience: 20, email: 'sunita@college.edu', specialization: 'VLSI Design', publications: 38, status: 'Active' },
  { id: 'f4', name: 'Dr. Ramesh Patel', designation: 'Professor & HoD', department: 'ME', qualification: 'PhD NIT Trichy', experience: 18, email: 'ramesh@college.edu', specialization: 'Robotics', publications: 32, status: 'Active' },
  { id: 'f5', name: 'Dr. Anitha Krishnan', designation: 'Professor & HoD', department: 'CE', qualification: 'PhD IIT Roorkee', experience: 16, email: 'anitha@college.edu', specialization: 'Structural Engg', publications: 25, status: 'Active' },
  { id: 'f6', name: 'Dr. Neha Gupta', designation: 'Professor & HoD', department: 'MBA', qualification: 'PhD FMS Delhi', experience: 14, email: 'neha@college.edu', specialization: 'Finance', publications: 20, status: 'Active' },
  { id: 'f7', name: 'Prof. Rajesh Nair', designation: 'Assistant Professor', department: 'CSE', qualification: 'M.Tech NIT', experience: 8, email: 'rajesh@college.edu', specialization: 'Database Systems', publications: 12, status: 'Active' },
  { id: 'f8', name: 'Dr. Vijay Menon', designation: 'Associate Professor', department: 'ECE', qualification: 'PhD IISc', experience: 12, email: 'vijay@college.edu', specialization: 'Embedded Systems', publications: 22, status: 'Active' },
];

// ─── POLICIES ─────────────────────────────────────────────────────────────────
export const initialPolicies: Policy[] = [
  { id: 'p1', title: 'Academic Integrity Policy 2024', category: 'Academic', status: 'Approved', submittedBy: 'Registrar', submittedDate: '2024-01-10', approvedBy: 'Board of Trustees', approvedDate: '2024-01-25', description: 'Defines standards for academic honesty, plagiarism prevention, and consequences for violations.', priority: 'High' },
  { id: 'p2', title: 'Faculty Recruitment Policy Revision', category: 'HR', status: 'Pending', submittedBy: 'HR Department', submittedDate: '2024-06-01', description: 'Updated recruitment criteria including minimum research publications requirement for senior posts.', priority: 'High' },
  { id: 'p3', title: 'Student Fee Waiver Guidelines', category: 'Finance', status: 'Under Review', submittedBy: 'Finance Dept', submittedDate: '2024-05-15', description: 'Revised criteria for merit-based and need-based fee waivers for undergraduate students.', priority: 'Medium' },
  { id: 'p4', title: 'Research Grant Utilization Policy', category: 'Research', status: 'Approved', submittedBy: 'Research Cell', submittedDate: '2024-02-20', approvedBy: 'Vice-Chancellor', approvedDate: '2024-03-05', description: 'Guidelines for proper utilization and auditing of research grants received from external agencies.', priority: 'High' },
  { id: 'p5', title: 'Campus Safety & Security Protocol', category: 'Administration', status: 'Approved', submittedBy: 'Admin Office', submittedDate: '2024-03-01', approvedBy: 'Board of Trustees', approvedDate: '2024-03-20', description: 'Comprehensive campus safety procedures including CCTV monitoring, visitor management, and emergency protocols.', priority: 'High' },
  { id: 'p6', title: 'E-Learning Platform Adoption Policy', category: 'Academic', status: 'Under Review', submittedBy: 'IT Department', submittedDate: '2024-06-10', description: 'Policy for mandatory integration of LMS for all courses and blended learning guidelines.', priority: 'Medium' },
  { id: 'p7', title: 'Anti-Ragging Policy Amendment', category: 'Student Affairs', status: 'Approved', submittedBy: 'Dean Students', submittedDate: '2024-01-05', approvedBy: 'Board of Trustees', approvedDate: '2024-01-15', description: 'Enhanced anti-ragging measures with stricter punitive actions and anonymous reporting system.', priority: 'High' },
  { id: 'p8', title: 'Sustainability & Green Campus Policy', category: 'Infrastructure', status: 'Pending', submittedBy: 'Facilities Mgmt', submittedDate: '2024-06-20', description: 'Initiative to reduce carbon footprint by 40% through solar energy, waste management, and green spaces.', priority: 'Low' },
];

// ─── BUDGET ───────────────────────────────────────────────────────────────────
export const budgetItems: BudgetItem[] = [
  { id: 'b1', category: 'Faculty Salaries', allocated: 45000000, spent: 38500000, remaining: 6500000, percentage: 86 },
  { id: 'b2', category: 'Infrastructure Development', allocated: 20000000, spent: 12000000, remaining: 8000000, percentage: 60 },
  { id: 'b3', category: 'Research & Development', allocated: 15000000, spent: 9800000, remaining: 5200000, percentage: 65 },
  { id: 'b4', category: 'Student Scholarships', allocated: 10000000, spent: 8200000, remaining: 1800000, percentage: 82 },
  { id: 'b5', category: 'Library & Resources', allocated: 5000000, spent: 3400000, remaining: 1600000, percentage: 68 },
  { id: 'b6', category: 'IT & Technology', allocated: 8000000, spent: 5600000, remaining: 2400000, percentage: 70 },
  { id: 'b7', category: 'Administrative Costs', allocated: 6000000, spent: 4100000, remaining: 1900000, percentage: 68 },
  { id: 'b8', category: 'Sports & Co-curricular', allocated: 3000000, spent: 2100000, remaining: 900000, percentage: 70 },
];

// ─── MEETINGS ─────────────────────────────────────────────────────────────────
export const initialMeetings: Meeting[] = [
  {
    id: 'm1', title: 'Annual Board Review Meeting', date: '2024-07-15', time: '10:00 AM', venue: 'Board Room, Admin Block',
    attendees: ['Board of Trustees', 'Vice-Chancellor', 'Pro-Chancellor', 'Registrar', 'Finance Controller'],
    agenda: ['Review annual performance', 'Budget approval 2024-25', 'Senior appointments', 'Strategic plan review'],
    status: 'Completed',
    decisions: ['Budget of ₹1.2 Cr approved for infrastructure', 'New faculty positions sanctioned for ECE dept', 'Strategic plan 2025-30 adopted'],
    actionItems: [
      { task: 'Issue appointment orders', assignedTo: 'Registrar', deadline: '2024-08-01', status: 'Done' },
      { task: 'Initiate infrastructure tender', assignedTo: 'Admin Office', deadline: '2024-08-15', status: 'In Progress' },
    ],
  },
  {
    id: 'm2', title: 'Academic Council Meeting Q3', date: '2024-08-05', time: '11:00 AM', venue: 'Conference Hall A',
    attendees: ['Vice-Chancellor', 'Pro-Vice-Chancellor', 'All HoDs', 'Controller of Examinations'],
    agenda: ['Curriculum revision for CSE & ECE', 'New elective courses proposal', 'Examination reforms', 'Faculty development programs'],
    status: 'Scheduled',
    actionItems: [],
  },
  {
    id: 'm3', title: 'Finance Committee Meeting', date: '2024-07-28', time: '2:00 PM', venue: 'VC Conference Room',
    attendees: ['Pro-Chancellor', 'Vice-Chancellor', 'Finance Controller', 'Internal Auditor'],
    agenda: ['Q2 financial review', 'Fee structure revision', 'Research fund allocation', 'Pending payments approval'],
    status: 'Completed',
    decisions: ['Fee structure revision deferred to next FY', 'Research fund of ₹50L released to CSE dept'],
    actionItems: [
      { task: 'Release research funds', assignedTo: 'Finance Dept', deadline: '2024-08-05', status: 'Done' },
    ],
  },
  {
    id: 'm4', title: 'Accreditation Preparation Meeting', date: '2024-09-10', time: '9:30 AM', venue: 'Seminar Hall',
    attendees: ['Vice-Chancellor', 'Pro-Vice-Chancellor', 'IQAC Coordinator', 'All HoDs'],
    agenda: ['NAAC visit preparation', 'Self-study report review', 'Department-wise action plan', 'Mock assessment schedule'],
    status: 'Scheduled',
    actionItems: [],
  },
];

// ─── PROJECTS ─────────────────────────────────────────────────────────────────
export const initialProjects: Project[] = [
  { id: 'pr1', name: 'New Academic Block Construction', description: 'Construction of 5-story academic block with 40 classrooms and 10 labs', lead: 'Dr. Ramesh Patel', startDate: '2024-01-01', endDate: '2025-06-30', status: 'Ongoing', progress: 45, budget: 80000000, category: 'Infrastructure' },
  { id: 'pr2', name: 'Smart Campus Initiative', description: 'IoT-based campus management including smart lighting, attendance, and energy monitoring', lead: 'Dr. Arun Kumar', startDate: '2024-03-01', endDate: '2024-12-31', status: 'Ongoing', progress: 65, budget: 15000000, category: 'Technology' },
  { id: 'pr3', name: 'Central Research Laboratory', description: 'State-of-the-art interdisciplinary research lab serving all engineering departments', lead: 'Dr. Sunita Rao', startDate: '2023-09-01', endDate: '2024-08-31', status: 'Ongoing', progress: 80, budget: 25000000, category: 'Research' },
  { id: 'pr4', name: 'Digital Library Upgrade', description: 'Expansion of digital library with 50,000+ e-books, journals, and research databases', lead: 'Prof. Rajesh Nair', startDate: '2024-04-01', endDate: '2024-09-30', status: 'Ongoing', progress: 70, budget: 5000000, category: 'Academic' },
  { id: 'pr5', name: 'Alumni Connect Platform', description: 'Online platform to connect alumni with current students for mentoring and placement', lead: 'Dr. Neha Gupta', startDate: '2024-02-01', endDate: '2024-07-31', status: 'Completed', progress: 100, budget: 2000000, category: 'Technology' },
  { id: 'pr6', name: 'Solar Power Installation', description: '500kW solar plant installation across campus buildings', lead: 'Admin Office', startDate: '2024-06-01', endDate: '2024-11-30', status: 'Planned', progress: 10, budget: 12000000, category: 'Infrastructure' },
];

// ─── ACHIEVEMENTS ─────────────────────────────────────────────────────────────
export const achievements: Achievement[] = [
  { id: 'ac1', title: 'NAAC "A+" Accreditation', category: 'Accreditation', date: '2024-03-15', description: 'Achieved the highest NAAC grade with a CGPA of 3.72, recognizing excellence in teaching, research, and governance.', awardedBy: 'National Assessment & Accreditation Council' },
  { id: 'ac2', title: 'Best Engineering College – South India', category: 'Award', date: '2024-02-20', description: 'Ranked #3 among top engineering colleges in South India by Education World magazine.', awardedBy: 'Education World' },
  { id: 'ac3', title: 'NIRF Ranking 85', category: 'Ranking', date: '2024-06-01', description: 'Secured All-India Rank 85 in the Engineering category under NIRF 2024 rankings.', awardedBy: 'Ministry of Education, India' },
  { id: 'ac4', title: 'Best Research Output Award', category: 'Research', date: '2024-01-10', description: 'Published 148 research papers in Scopus-indexed journals; 3 patents granted in the academic year 2023-24.', awardedBy: 'AICTE' },
  { id: 'ac5', title: 'Inter-University Sports Champions', category: 'Sports', date: '2024-04-05', description: 'Students won gold medals in cricket, basketball, and athletics at the zonal inter-university games.', awardedBy: 'Association of Universities' },
  { id: 'ac6', title: 'Green Campus Certification', category: 'Award', date: '2023-11-20', description: 'Recognized for sustainability efforts including 40% renewable energy usage and zero-waste campus initiative.', awardedBy: 'CII Green Building Council' },
];

// ─── APPOINTMENTS ─────────────────────────────────────────────────────────────
export const initialAppointments: Appointment[] = [
  { id: 'ap1', name: 'Dr. Suresh Babu', position: 'Vice-Chancellor', department: 'Academic', appointmentDate: '2024-07-01', status: 'Approved', qualification: 'PhD IIT Madras', experience: 25 },
  { id: 'ap2', name: 'Dr. Lakshmi Priya', position: 'Chancellor', department: 'Research', appointmentDate: '2024-07-01', status: 'Approved', qualification: 'PhD IISc Bangalore', experience: 20 },
  { id: 'ap3', name: 'Mr. Venkatesh R', position: 'Finance Controller', department: 'Finance', appointmentDate: '2024-06-15', status: 'Pending', qualification: 'CA + MBA Finance', experience: 18 },
  { id: 'ap4', name: 'Dr. Kavitha Menon', position: 'Pro-Chancellor', department: 'ME', appointmentDate: '2024-08-01', status: 'Under Review', qualification: 'PhD NIT Calicut', experience: 16 },
  { id: 'ap5', name: 'Prof. Rajan Das', position: 'Director – International Relations', department: 'Admin', appointmentDate: '2024-09-01', status: 'Pending', qualification: 'PhD, MBA International', experience: 22 },
];

// ─── COLLABORATIONS ───────────────────────────────────────────────────────────
export const initialCollaborations: Collaboration[] = [
  { id: 'co1', partner: 'IIT Madras', type: 'Research', startDate: '2023-01-01', endDate: '2025-12-31', status: 'Active', description: 'Joint research in AI and Robotics; co-supervision of PhD students', benefits: 'Access to IIT labs, joint publications, PhD co-supervision' },
  { id: 'co2', partner: 'Infosys Ltd', type: 'Industry', startDate: '2022-06-01', endDate: '2024-05-31', status: 'Active', description: 'Campus placement partnership + curriculum advisory for CSE students', benefits: '200+ placements/year, curriculum inputs, internship opportunities' },
  { id: 'co3', partner: 'University of Melbourne', type: 'International', startDate: '2024-01-01', endDate: '2026-12-31', status: 'Active', description: 'Student exchange program and collaborative research in sustainable engineering', benefits: 'Exchange students, joint degrees, research grants' },
  { id: 'co4', partner: 'DRDO', type: 'MoU', startDate: '2023-06-01', endDate: '2025-05-31', status: 'Active', description: 'Collaborative projects in defense technology and materials research', benefits: 'Funded research projects, internships for final-year students' },
  { id: 'co5', partner: 'TCS Innovation Hub', type: 'Industry', startDate: '2024-03-01', endDate: '2026-02-28', status: 'Active', description: 'Co-development of AI curriculum and student project mentorship', benefits: 'Curriculum co-design, 150+ placements, sponsored projects' },
  { id: 'co6', partner: 'National University of Singapore', type: 'International', startDate: '2024-06-01', endDate: '2027-05-31', status: 'Pending', description: 'Joint PhD program and faculty exchange in data science and analytics', benefits: 'Dual degree PhDs, faculty exchange, joint grants' },
];

// ─── IMPROVEMENT PLANS ────────────────────────────────────────────────────────
export const initialImprovementPlans: ImprovementPlan[] = [
  { id: 'ip1', title: 'CSE Lab Modernization', department: 'CSE', submittedBy: 'Dr. Arun Kumar', submittedDate: '2024-05-01', status: 'Approved', priority: 'High', description: 'Upgrade 4 computer labs with latest hardware and software for AI/ML and cloud computing courses.', progress: 60 },
  { id: 'ip2', title: 'Faculty Research Output Enhancement', department: 'All', submittedBy: 'IQAC', submittedDate: '2024-04-15', status: 'In Review', priority: 'High', description: 'Incentive scheme and support system to improve research publication output by 30% in 2024-25.', progress: 20 },
  { id: 'ip3', title: 'Student Mentoring Program', department: 'All', submittedBy: 'Dean Students', submittedDate: '2024-06-01', status: 'Approved', priority: 'Medium', description: 'Structured mentoring program pairing each student with a faculty mentor for academic and career guidance.', progress: 45 },
  { id: 'ip4', title: 'ECE Industry Connect Program', department: 'ECE', submittedBy: 'Dr. Sunita Rao', submittedDate: '2024-03-20', status: 'Implemented', priority: 'Medium', description: 'Industry expert guest lectures, industrial visits, and live project collaborations for ECE students.', progress: 100 },
  { id: 'ip5', title: 'MBA Entrepreneurship Cell', department: 'MBA', submittedBy: 'Dr. Neha Gupta', submittedDate: '2024-06-15', status: 'Submitted', priority: 'Low', description: 'Establish an e-cell to nurture startup ideas with mentoring, seed funding, and incubation support.', progress: 5 },
];

// ─── ENROLLMENT TRENDS ─────────────────────────────────────────────────────────
export const enrollmentTrends = [
  { year: '2019-20', total: 1980, ug: 1580, pg: 320, phd: 80 },
  { year: '2020-21', total: 2105, ug: 1680, pg: 340, phd: 85 },
  { year: '2021-22', total: 2240, ug: 1790, pg: 360, phd: 90 },
  { year: '2022-23', total: 2380, ug: 1900, pg: 385, phd: 95 },
  { year: '2023-24', total: 2440, ug: 1940, pg: 400, phd: 100 },
];

// ─── GRADUATION DATA ──────────────────────────────────────────────────────────
export const graduationData = {
  year: 2024,
  date: 'November 15, 2024',
  venue: 'University Auditorium',
  totalGraduates: 612,
  ug: 492,
  pg: 96,
  phd: 24,
  goldMedalists: 8,
  honoraryDegrees: 2,
  chiefGuest: 'Dr. K. Radhakrishnan, Former ISRO Chairman',
};
