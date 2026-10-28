import type { AppData, Department, Staff, Student, Subject, Resource, Lab, TimetableEntry, ExamSchedule, SubjectAllocation, MentorAllocation, Candidate, ApprovalRequest } from './types';

const ACADEMIC_YEAR = '2026–27';
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;
const SLOT_DETAILS = [
  { number: 1, start: '09:00', end: '10:00' },
  { number: 2, start: '10:00', end: '11:00' },
  { number: 3, start: '11:00', end: '12:00' },
  { number: 4, start: '13:00', end: '14:00' },
  { number: 5, start: '14:00', end: '15:00' },
  { number: 6, start: '15:00', end: '16:00' },
] as const;

const departments: Department[] = [
  { id: 'd1', name: 'Bachelor of Computer Applications', code: 'BCA', hodId: 's3', email: 'hod.bca@college.edu', contact: '9876543210', facultyCount: 8, studentCount: 13, labCount: 2, classroomCount: 3 },
  { id: 'd2', name: 'Bachelor of Commerce', code: 'B.Com.', hodId: 's7', email: 'hod.bcom@college.edu', contact: '9876543220', facultyCount: 8, studentCount: 6, labCount: 1, classroomCount: 2 },
  { id: 'd3', name: 'Bachelor of Science', code: 'B.Sc.', hodId: 's11', email: 'hod.bsc@college.edu', contact: '9876543230', facultyCount: 8, studentCount: 6, labCount: 2, classroomCount: 2 },
  { id: 'd4', name: 'Bachelor of Arts', code: 'B.A.', hodId: 's15', email: 'hod.ba@college.edu', contact: '9876543240', facultyCount: 8, studentCount: 6, labCount: 1, classroomCount: 2 },
];

const facultySeed: Array<[string, string, string, string, string[]]> = [
  ['s3', 'Priyanka', 'Professor & HOD', 'd1', ['Programming in C', 'Python Programming', 'Database Management Systems', 'Data Structures', 'Major Project']],
  ['s4', 'Rahul', 'Associate Professor', 'd1', ['Digital Fundamentals', 'Java Programming', 'Web Development', 'Computer Architecture', 'Mobile Application Development']],
  ['s5', 'Nandini', 'Assistant Professor', 'd1', ['Web Technologies', 'Computer Networks', 'Software Engineering', 'Cloud Computing', 'Artificial Intelligence Fundamentals']],
  ['s6', 'Karthik', 'Lecturer / Instructor', 'd1', ['Mathematics', 'Statistics', 'Project Management', 'Cyber Security', 'Seminar']],
  ['s7', 'Shwetha', 'Professor & HOD', 'd2', ['Financial Accounting', 'Corporate Accounting', 'Cost Accounting', 'Management Accounting', 'Project Work']],
  ['s8', 'Meghana', 'Associate Professor', 'd2', ['Business Economics', 'Business Law', 'Financial Management', 'Strategic Management', 'Corporate Finance']],
  ['s9', 'Rohan', 'Assistant Professor', 'd2', ['Marketing Management', 'Business Statistics', 'Investment Management', 'GST', 'Business Analytics']],
  ['s10', 'Deepa', 'Lecturer / Instructor', 'd2', ['Business Communication', 'Entrepreneurship', 'Business Research', 'Auditing', 'Viva/Seminar']],
  ['s11', 'Varshini', 'Professor & HOD', 'd3', ['Mathematics', 'Physics', 'Chemistry', 'Statistics', 'Project Work']],
  ['s12', 'Anil', 'Associate Professor', 'd3', ['Differential Equations', 'Real Analysis', 'Numerical Methods', 'Quantum Physics', 'Mathematical Modelling']],
  ['s13', 'Kavya', 'Assistant Professor', 'd3', ['Organic Chemistry', 'Physical Chemistry', 'Electronics', 'Advanced Chemistry', 'Applied Physics']],
  ['s14', 'Sandeep', 'Lecturer / Instructor', 'd3', ['Computer Science', 'Data Analysis', 'Computer Applications', 'Research Methodology', 'Seminar']],
  ['s15', 'Sharanya', 'Professor & HOD', 'd4', ['English Literature', 'Kannada Literature', 'History', 'Political Science', 'Dissertation']],
  ['s16', 'Harish', 'Associate Professor', 'd4', ['Economics', 'Sociology', 'Indian Economy', 'Public Policy', 'Contemporary Society']],
  ['s17', 'Aishwarya', 'Assistant Professor', 'd4', ['Psychology', 'Indian Constitution', 'Social Psychology', 'Human Rights', 'Literature Seminar']],
  ['s18', 'Naveen', 'Lecturer / Instructor', 'd4', ['English Communication', 'Public Administration', 'Research Methodology', 'World History', 'Viva/Seminar']],
  ['s19', 'Vivek', 'Assistant Professor', 'd1', ['Python Programming', 'Data Analytics', 'Artificial Intelligence Fundamentals', 'Programming Labs']],
  ['s20', 'Arjun', 'Assistant Professor', 'd1', ['Data Structures', 'Database Management Systems', 'Advanced Java', 'DBMS Lab']],
  ['s21', 'Ananya', 'Teaching Assistant / Research Scholar', 'd1', ['Web Development', 'Computer Networks', 'Software Engineering', 'Web Technologies']],
  ['s22', 'Ritesh', 'Lecturer / Instructor', 'd1', ['Computer Fundamentals', 'Digital Fundamentals', 'Cyber Security', 'Seminar']],
  ['s23', 'Nikhil', 'Assistant Professor', 'd2', ['Financial Accounting', 'Advanced Accounting', 'Auditing', 'Taxation']],
  ['s24', 'Pooja', 'Lecturer / Instructor', 'd2', ['Business Economics', 'Business Environment', 'Entrepreneurship', 'Business Research']],
  ['s25', 'Sanjay', 'Teaching Assistant / Research Scholar', 'd2', ['Business Statistics', 'Business Analytics', 'Investment Management', 'Banking Theory']],
  ['s26', 'Ishita', 'Assistant Professor', 'd2', ['Business Law', 'Marketing Management', 'Human Resource Management', 'E-Commerce']],
  ['s27', 'Meera', 'Assistant Professor', 'd3', ['Mathematics', 'Differential Equations', 'Numerical Methods', 'Advanced Statistics']],
  ['s28', 'Vikram', 'Lecturer / Instructor', 'd3', ['Physics', 'Mechanics', 'Quantum Physics', 'Applied Physics']],
  ['s29', 'Rhea', 'Teaching Assistant / Research Scholar', 'd3', ['Chemistry', 'Organic Chemistry', 'Physical Chemistry', 'Analytical Chemistry']],
  ['s30', 'Joseph', 'Assistant Professor', 'd3', ['Computer Science', 'Programming', 'Computer Applications', 'Data Analysis']],
  ['s31', 'Meenakshi', 'Assistant Professor', 'd4', ['English Literature', 'Modern Literature', 'Literature Seminar', 'English Communication']],
  ['s32', 'Prakash', 'Lecturer / Instructor', 'd4', ['History', 'Indian History', 'World History', 'Public Administration']],
  ['s33', 'Sonia', 'Teaching Assistant / Research Scholar', 'd4', ['Political Science', 'Political Theory', 'Indian Constitution', 'Human Rights']],
  ['s34', 'Farhan', 'Assistant Professor', 'd4', ['Economics', 'Indian Economy', 'Development Economics', 'Sociology']],
];

const staff: Staff[] = [
  { id: 's1', name: 'Bhavesh Suvarna', designation: 'Principal', role: 'principal', departmentId: 'd1', email: 'principal@college.edu', phone: '9876500001', subjects: [], classes: [], status: 'active', attendancePct: 98, feedbackScore: 4.9, performanceRating: 5, pendingWork: 0, weeklyHours: 40, employmentType: 'full-time', joinedOn: '2015-06-01', qualifications: 'Ph.D', publications: 24, researchProjects: 4, address: 'College Campus', gender: 'Male', dob: '1970-03-15', bloodGroup: 'B+' },
  { id: 's2', name: 'Varshitha', designation: 'Dean', role: 'dean', departmentId: 'd1', email: 'dean@college.edu', phone: '9876500002', subjects: [], classes: [], status: 'active', attendancePct: 97, feedbackScore: 4.8, performanceRating: 5, pendingWork: 1, weeklyHours: 38, employmentType: 'full-time', joinedOn: '2016-07-15', qualifications: 'Ph.D', publications: 18, researchProjects: 3, address: 'Faculty Quarters', gender: 'Female', dob: '1974-11-22', bloodGroup: 'O+' },
  ...(facultySeed.map(([id, name, designation, departmentId, subjects], i) => ({
    id,
    name,
    designation,
    role: designation.includes('HOD') ? 'hod' : designation === 'Professor' ? 'professor' : designation.startsWith('Associate') ? 'associate-professor' : designation.startsWith('Assistant') ? 'assistant-professor' : 'lecturer',
    departmentId,
    email: `${name.toLowerCase()}@college.edu`,
    phone: `98765000${String(i + 3).padStart(2, '0')}`,
    subjects,
    classes: [`${departmentId.toUpperCase()}-A`],
    status: 'active' as const,
    attendancePct: 91 + (i % 8),
    feedbackScore: Number((4.2 + (i % 7) / 10).toFixed(1)),
    performanceRating: 4,
    pendingWork: i % 3,
    weeklyHours: 32 + (i % 4) * 2,
    employmentType: 'full-time' as const,
    joinedOn: `20${10 + (i % 12)}-07-01`,
    qualifications: designation.includes('HOD') ? 'Ph.D' : 'M.Com / M.Sc / M.A.',
    publications: 3 + (i % 8),
    researchProjects: i % 3,
    address: 'Faculty Quarters, Campus',
    gender: i % 2 ? 'Female' : 'Male',
    dob: `198${i % 9}-0${(i % 8) + 1}-15`,
    bloodGroup: i % 2 ? 'O+' : 'A+',
  })) as Staff[]),
];

const studentNames: Record<string, string[]> = {
  d1: ['Adila', 'Ajay Raj', 'Hasreena', 'Pallavi', 'Chethan S', 'Chethan A.J.', 'Ananya H', 'Bharathi', 'Kiran', 'Pavan', 'Snigdha', 'Shamitha', 'Shaheed'],
  d2: ['Shaziya', 'Shiyal', 'Shradha', 'Vaishnavi', 'Ziyan', 'Afreen'],
  d3: ['Shreyas', 'Fiona', 'Thejaksha', 'Rakshith', 'Pranav', 'Maya'],
  d4: ['Arun', 'Likith', 'Nikitha', 'Deekshith', 'Sunil', 'Kavana'],
};

const subjectCatalog: Record<string, Record<number, string[]>> = {
  d1: {
    1: ['Programming in C', 'Mathematics', 'Digital Fundamentals', 'Communication Skills', 'Computer Fundamentals'],
    2: ['Python Programming', 'Data Structures', 'Discrete Mathematics', 'Web Technologies', 'Communication Skills'],
    3: ['Database Management Systems', 'Computer Networks', 'Java Programming', 'Operating Systems', 'Statistics'],
    4: ['Software Engineering', 'Advanced Java', 'Web Development', 'Computer Architecture', 'Mathematics'],
    5: ['Python Application Development', 'Data Analytics', 'Cloud Computing', 'Project Management', 'Elective'],
    6: ['Major Project', 'Artificial Intelligence Fundamentals', 'Cyber Security', 'Mobile Application Development', 'Seminar'],
  },
  d2: {
    1: ['Financial Accounting', 'Business Economics', 'Business Communication', 'Business Mathematics', 'Business Environment'],
    2: ['Corporate Accounting', 'Business Law', 'Marketing Management', 'Business Statistics', 'Environmental Studies'],
    3: ['Cost Accounting', 'Income Tax', 'Banking Theory', 'Human Resource Management', 'Entrepreneurship'],
    4: ['Advanced Accounting', 'Financial Management', 'Auditing', 'E-Commerce', 'Business Research'],
    5: ['Management Accounting', 'Investment Management', 'GST', 'Entrepreneurship Development', 'Elective'],
    6: ['Project Work', 'Strategic Management', 'Corporate Finance', 'Business Analytics', 'Viva/Seminar'],
  },
  d3: {
    1: ['Mathematics', 'Physics', 'Chemistry', 'Computer Science', 'Communication Skills'],
    2: ['Differential Equations', 'Mechanics', 'Organic Chemistry', 'Programming', 'Statistics'],
    3: ['Mathematical Methods', 'Electricity and Magnetism', 'Physical Chemistry', 'Data Analysis', 'Statistics'],
    4: ['Real Analysis', 'Quantum Physics', 'Inorganic Chemistry', 'Computer Applications', 'Research Methodology'],
    5: ['Numerical Methods', 'Electronics', 'Analytical Chemistry', 'Advanced Statistics', 'Elective'],
    6: ['Project Work', 'Mathematical Modelling', 'Applied Physics', 'Advanced Chemistry', 'Seminar'],
  },
  d4: {
    1: ['English Literature', 'Kannada Literature', 'History', 'Political Science', 'Economics'],
    2: ['Sociology', 'Psychology', 'Indian Constitution', 'English Communication', 'Economics'],
    3: ['Indian History', 'Political Theory', 'Social Psychology', 'Public Administration', 'Kannada Literature'],
    4: ['Modern Literature', 'Indian Economy', 'Sociology of Education', 'Human Rights', 'Research Methodology'],
    5: ['World History', 'Indian Political System', 'Development Economics', 'Social Research', 'Elective'],
    6: ['Dissertation', 'Public Policy', 'Contemporary Society', 'Literature Seminar', 'Viva/Seminar'],
  },
};

const departmentFaculty: Record<string, string[]> = {
  d1: ['s3', 's4', 's5', 's6', 's19', 's20', 's21', 's22'],
  d2: ['s7', 's8', 's9', 's10', 's23', 's24', 's25', 's26'],
  d3: ['s11', 's12', 's13', 's14', 's27', 's28', 's29', 's30'],
  d4: ['s15', 's16', 's17', 's18', 's31', 's32', 's33', 's34'],
};

const roomList = ['Room 101', 'Room 102', 'Room 103', 'Room 104', 'Room 105', 'Room 106', 'Room 107', 'Room 108', 'Room 109', 'Room 110', 'Room 111', 'Room 112', 'Room 113', 'Room 114', 'Room 115', 'Room 116', 'Room 117', 'Room 118', 'Room 119', 'Room 120'];
const labList = ['Computer Lab 1', 'Computer Lab 2', 'Physics Lab', 'Chemistry Lab', 'Statistics Lab', 'Computer Lab 3', 'Commerce Lab 1', 'Commerce Lab 2', 'Science Computer Lab 1', 'Science Computer Lab 2'];

const roomDepartmentIds = ['d1', 'd1', 'd1', 'd1', 'd1', 'd2', 'd2', 'd2', 'd2', 'd2', 'd3', 'd3', 'd3', 'd3', 'd3', 'd4', 'd4', 'd4', 'd4', 'd4'];
const rooms = roomList.map((name, index) => ({
  id: `room-${index + 1}`,
  name,
  departmentId: roomDepartmentIds[index],
  capacity: 60,
}));

const resources: Resource[] = [
  ...rooms.map((room) => ({
    id: `res-${room.name.toLowerCase().replace(/\s+/g, '-')}`,
    name: room.name,
    category: 'classroom' as const,
    departmentId: room.departmentId,
    location: `Block ${room.name.replace(/\D/g, '')[0] ?? 'A'}`,
    status: 'available' as const,
    isLab: false,
    capacity: 60,
  })),
  ...labList.map((lab, index) => ({
    id: `lab-res-${index + 1}`,
    name: lab,
    category: 'computer' as const,
    departmentId: index < 2 || index === 5 ? 'd1' : index > 7 ? 'd3' : index > 5 ? 'd2' : 'd3',
    location: index < 2 || index === 5 ? 'Computer Block' : index > 7 ? 'Science Block' : index > 5 ? 'Commerce Block' : 'Science Block',
    status: 'available' as const,
    isLab: true,
    capacity: 40,
  })),
];

const labs: Lab[] = [
  { id: 'lab-1', name: 'Computer Lab 1', departmentId: 'd1', capacity: 40, inChargeId: 's4', subjects: ['Programming in C', 'Python Programming', 'Database Management Systems', 'Web Development'], systems: 30, equipment: [{ name: 'Projector', qty: 1, status: 'available' }, { name: 'Desktop', qty: 30, status: 'available' }], maintenanceStatus: 'good' },
  { id: 'lab-2', name: 'Computer Lab 2', departmentId: 'd1', capacity: 40, inChargeId: 's5', subjects: ['Python Programming', 'Java Programming', 'Cloud Computing', 'Mobile Application Development'], systems: 30, equipment: [{ name: 'Projector', qty: 1, status: 'available' }, { name: 'Desktop', qty: 30, status: 'available' }], maintenanceStatus: 'good' },
  { id: 'lab-3', name: 'Physics Lab', departmentId: 'd3', capacity: 35, inChargeId: 's12', subjects: ['Physics', 'Mechanics', 'Electricity and Magnetism', 'Applied Physics'], systems: 18, equipment: [{ name: 'Oscilloscope', qty: 4, status: 'available' }], maintenanceStatus: 'good' },
  { id: 'lab-4', name: 'Chemistry Lab', departmentId: 'd3', capacity: 35, inChargeId: 's13', subjects: ['Chemistry', 'Organic Chemistry', 'Physical Chemistry', 'Advanced Chemistry'], systems: 16, equipment: [{ name: 'Fume Hood', qty: 3, status: 'available' }], maintenanceStatus: 'good' },
  { id: 'lab-5', name: 'Statistics Lab', departmentId: 'd3', capacity: 30, inChargeId: 's14', subjects: ['Statistics', 'Data Analysis', 'Advanced Statistics'], systems: 12, equipment: [{ name: 'Workstation', qty: 12, status: 'available' }], maintenanceStatus: 'good' },
  { id: 'lab-6', name: 'Computer Lab 3', departmentId: 'd1', capacity: 40, inChargeId: 's21', subjects: ['Data Structures', 'Database Management Systems', 'Python Application Development', 'Mobile Application Development'], systems: 30, equipment: [{ name: 'Projector', qty: 1, status: 'available' }, { name: 'Desktop', qty: 30, status: 'available' }], maintenanceStatus: 'good' },
  { id: 'lab-7', name: 'Commerce Lab 1', departmentId: 'd2', capacity: 40, inChargeId: 's25', subjects: ['Business Statistics', 'E-Commerce', 'Business Analytics', 'GST'], systems: 25, equipment: [{ name: 'Projector', qty: 1, status: 'available' }], maintenanceStatus: 'good' },
  { id: 'lab-8', name: 'Commerce Lab 2', departmentId: 'd2', capacity: 40, inChargeId: 's26', subjects: ['Business Statistics', 'E-Commerce', 'Business Analytics', 'GST'], systems: 25, equipment: [{ name: 'Projector', qty: 1, status: 'available' }], maintenanceStatus: 'good' },
  { id: 'lab-9', name: 'Science Computer Lab 1', departmentId: 'd3', capacity: 40, inChargeId: 's30', subjects: ['Programming', 'Computer Science', 'Computer Applications', 'Data Analysis'], systems: 25, equipment: [{ name: 'Projector', qty: 1, status: 'available' }], maintenanceStatus: 'good' },
  { id: 'lab-10', name: 'Science Computer Lab 2', departmentId: 'd3', capacity: 40, inChargeId: 's30', subjects: ['Programming', 'Computer Science', 'Computer Applications', 'Data Analysis'], systems: 25, equipment: [{ name: 'Projector', qty: 1, status: 'available' }], maintenanceStatus: 'good' },
];

const students: Student[] = Object.entries(studentNames).flatMap(([departmentId, names]) =>
  names.map((name, index) => {
    const department = departments.find((d) => d.id === departmentId)!;
    const score = index % 6 === 0 ? 87 : index % 5 === 0 ? 81 : index % 4 === 0 ? 76 : index % 3 === 0 ? 68 : 74;
    const semester = (index % 6) + 1;
    const section = index % 2 === 0 ? 'A' : 'B';
    const rollNo = `${department.code.replace('.', '')}2026${String(index + 1).padStart(3, '0')}`;

    return {
      id: `st${departmentId}${index + 1}`,
      name,
      rollNo,
      program: department.name,
      semester,
      section,
      departmentId,
      email: `${name.toLowerCase().replace(/[^a-z]/g, '.')}@student.edu`,
      phone: `998877${String(6600 + index).slice(-4)}`,
      gender: index % 2 ? 'Female' : 'Male',
      dob: `200${index % 6}-0${(index % 8) + 1}-12`,
      bloodGroup: index % 2 ? 'O+' : 'B+',
      address: 'Bengaluru',
      parentName: `Parent of ${name}`,
      parentPhone: '9988770000',
      parentEmail: 'parent@student.edu',
      admissionDate: '2024-08-01',
      admissionType: index % 3 === 0 ? 'Merit' : 'Management',
      status: 'active',
      attendancePct: 74 + (index % 18),
      gpa: Number((score / 10).toFixed(1)),
      cgpa: Number(((score / 10) - 0.2).toFixed(1)),
      backlogs: score < 70 ? 1 : 0,
      internalMarks: [],
      subjects: subjectCatalog[departmentId][semester] ?? [],
      projectTitle: `${department.code} Capstone Project`,
      projectGuide: department.hodId,
      projectProgress: 60 + (index % 30),
      projectSubject: 'Project Work',
      projectHod: department.hodId,
      projectType: 'Group',
      projectDescription: 'Semester project aligned with the academic timetable and learning outcomes.',
      projectAcademicYear: ACADEMIC_YEAR,
      projectStartDate: '2026-07-15',
      projectDeadline: '2026-11-30',
      projectStatus: index % 3 === 0 ? 'In Progress' : 'Pending',
      projectMarks: 70 + (index % 20),
      projectGrade: 'A',
      projectRemarks: 'On schedule',
      projectMembers: [name],
      grievances: [],
      discipline: [],
    };
  })
);

const subjects: Subject[] = [];
const subjectAllocations: SubjectAllocation[] = [];
const subjectLookup = new Map<string, Subject>();
const roomResourceMap: Record<string, string> = {
  'Room 101': 'res-room-101',
  'Room 102': 'res-room-102',
  'Room 103': 'res-room-103',
  'Room 104': 'res-room-104',
  'Room 105': 'res-room-105',
  'Room 106': 'res-room-106',
  'Room 107': 'res-room-107',
  'Room 108': 'res-room-108',
  'Room 109': 'res-room-109',
  'Room 110': 'res-room-110',
  'Room 111': 'res-room-111',
  'Room 112': 'res-room-112',
  'Room 113': 'res-room-113',
  'Room 114': 'res-room-114',
  'Room 115': 'res-room-115',
  'Room 116': 'res-room-116',
  'Room 117': 'res-room-117',
  'Room 118': 'res-room-118',
  'Room 119': 'res-room-119',
  'Room 120': 'res-room-120',
  'Computer Lab 1': 'lab-res-1',
  'Computer Lab 2': 'lab-res-2',
  'Physics Lab': 'lab-res-3',
  'Chemistry Lab': 'lab-res-4',
  'Statistics Lab': 'lab-res-5',
  'Computer Lab 3': 'lab-res-6',
  'Commerce Lab 1': 'lab-res-7',
  'Commerce Lab 2': 'lab-res-8',
  'Science Computer Lab 1': 'lab-res-9',
  'Science Computer Lab 2': 'lab-res-10',
};

for (const department of departments) {
  const facultyIds = departmentFaculty[department.id] ?? [department.hodId];

  for (let semester = 1; semester <= 6; semester += 1) {
    const deptSubjects = subjectCatalog[department.id][semester] ?? [];

    deptSubjects.forEach((subjectName, index) => {
      const code = `${department.code.replace(/[^A-Z]/g, '')}${semester}${String(index + 1).padStart(2, '0')}`;
      const facultyId = facultyIds[(semester + index) % facultyIds.length] ?? department.hodId;
      const isPractical = ['Programming in C', 'Python Programming', 'Data Structures', 'Database Management Systems', 'Java Programming', 'Web Development', 'Python Application Development', 'Major Project', 'Mobile Application Development', 'Business Statistics', 'E-Commerce', 'Business Analytics', 'GST', 'Management Accounting', 'Programming', 'Data Analysis', 'Computer Applications', 'Electronics', 'Applied Physics', 'Advanced Chemistry', 'Statistics', 'English Communication', 'Research Methodology', 'Literature Seminar'].includes(subjectName);
      const subject: Subject = {
        id: `${department.id}-sub-${semester}-${index + 1}`,
        name: subjectName,
        code,
        departmentId: department.id,
        semester,
        facultyId,
        syllabusCompletion: 68 + ((semester + index) % 25),
        unitsTotal: 5,
        unitsCompleted: 3 + (index % 3),
        classes: [...new Set(students.filter((student) => student.departmentId === department.id && student.semester === semester).map((student) => student.section))],
        type: isPractical ? 'laboratory' : 'theory',
        credits: isPractical ? 2 : 4,
        weeklyHrs: isPractical ? 4 : 4,
        suggestedResources: isPractical ? ['computer'] : ['classroom'],
      };

      subjects.push(subject);
      subjectLookup.set(`${department.id}-${semester}-${subjectName}`, subject);

      const resourceName = isPractical
        ? department.id === 'd1'
          ? index % 2 === 0
            ? 'Computer Lab 1'
            : 'Computer Lab 2'
          : department.id === 'd3' && subjectName.includes('Physics')
            ? 'Physics Lab'
            : department.id === 'd3' && subjectName.includes('Chem')
              ? 'Chemistry Lab'
              : 'Statistics Lab'
        : roomList[(semester + index) % roomList.length];

      const classIds = [...new Set(students.filter((student) => student.departmentId === department.id && student.semester === semester).map((student) => student.section))];
      subjectAllocations.push({
        id: `alloc-${department.id}-${semester}-${index + 1}`,
        subjectId: subject.id,
        departmentId: department.id,
        semester,
        academicYear: ACADEMIC_YEAR,
        classIds: classIds.length ? classIds : ['A'],
        facultyId,
        resourceIds: [roomResourceMap[resourceName]],
        requiredTypes: isPractical ? ['computer'] : ['classroom'],
        status: 'allocated',
        weeklyHours: isPractical ? 4 : 4,
        createdBy: department.hodId,
        createdAt: '2026-08-01',
        updatedAt: '2026-08-01',
      });
    });
  }
}

const timetable: TimetableEntry[] = [];
const usedFacultySlots = new Set<string>();
const usedSectionSlots = new Set<string>();
const usedRoomSlots = new Set<string>();
const practicalSubjects = new Set(['Programming in C', 'Python Programming', 'Data Structures', 'Database Management Systems', 'Java Programming', 'Web Development', 'Python Application Development', 'Major Project', 'Mobile Application Development', 'Business Statistics', 'E-Commerce', 'Business Analytics', 'GST', 'Management Accounting', 'Programming', 'Data Analysis', 'Computer Applications', 'Electronics', 'Applied Physics', 'Advanced Chemistry', 'Statistics', 'English Communication', 'Research Methodology', 'Literature Seminar']);
const weeklySlots = DAYS.flatMap((day) => {
  const slots = day === 'Saturday'
    ? [{ number: 1, start: '09:00', end: '10:00' }, { number: 2, start: '10:00', end: '11:00' }, { number: 3, start: '11:00', end: '12:00' }, { number: 4, start: '12:00', end: '13:00' }]
    : SLOT_DETAILS;
  return slots.map((slot) => ({ day, start: slot.start, end: slot.end, time: `${slot.start}-${slot.end}` }));
});

function roomCandidates(departmentId: string, subjectName: string) {
  if (departmentId === 'd1' && practicalSubjects.has(subjectName)) return ['Computer Lab 1', 'Computer Lab 2', 'Computer Lab 3'];
  if (departmentId === 'd2' && practicalSubjects.has(subjectName)) return ['Commerce Lab 1', 'Commerce Lab 2'];
  if (departmentId === 'd3' && subjectName.includes('Physics')) return ['Physics Lab'];
  if (departmentId === 'd3' && subjectName.includes('Chem')) return ['Chemistry Lab'];
  if (departmentId === 'd3' && ['Programming', 'Computer Science', 'Computer Applications', 'Data Analysis'].includes(subjectName)) return ['Science Computer Lab 1', 'Science Computer Lab 2'];
  if (departmentId === 'd3' && practicalSubjects.has(subjectName)) return ['Statistics Lab'];
  return rooms.filter((room) => room.departmentId === departmentId).map((room) => room.name);
}

let scheduleCursor = 0;
for (const department of departments) {
  for (let semester = 1; semester <= 6; semester += 1) {
    const allocations = subjectAllocations.filter((item) => item.departmentId === department.id && item.semester === semester && item.status === 'allocated');
    allocations.forEach((allocation, allocationIndex) => {
      const subject = subjects.find((item) => item.id === allocation.subjectId);
      if (!subject || !allocation.facultyId) return;
      const isLab = subject.type === 'laboratory';
      const periodsRequired = allocation.weeklyHours || subject.weeklyHrs || (isLab ? 4 : 4);

      for (const section of allocation.classIds) {
        let remaining = periodsRequired;
        let occurrence = 0;
        while (remaining > 0) {
          const blockSize = isLab && remaining >= 2 ? 2 : 1;
          let placed = false;
          const preferredDay = isLab
            ? (allocationIndex + occurrence * 2) % 5
            : (allocationIndex + occurrence * 2) % 5;
          for (let attempt = 0; attempt < weeklySlots.length && !placed; attempt += 1) {
            const preferredStart = weeklySlots.findIndex((slot) => DAYS.indexOf(slot.day) === preferredDay);
            const firstIndex = attempt < SLOT_DETAILS.length
              ? (preferredStart + attempt) % weeklySlots.length
              : (scheduleCursor + attempt - SLOT_DETAILS.length) % weeklySlots.length;
            const first = weeklySlots[firstIndex];
            const second = weeklySlots[firstIndex + 1];
            if (blockSize === 2 && (!second || second.day !== first.day || second.start !== first.end)) continue;

            const block = blockSize === 2 ? [first, second] : [first];
            const facultyFree = block.every((slot) => !usedFacultySlots.has(`${slot.day}|${slot.time}|${allocation.facultyId}`));
            const sectionFree = block.every((slot) => !usedSectionSlots.has(`${slot.day}|${slot.time}|${department.id}|${semester}|${section}`));
            const room = roomCandidates(department.id, subject.name).find((candidate) => block.every((slot) => !usedRoomSlots.has(`${slot.day}|${slot.time}|${candidate}`)));
            if (!facultyFree || !sectionFree || !room) continue;

            block.forEach((slot) => {
              usedFacultySlots.add(`${slot.day}|${slot.time}|${allocation.facultyId}`);
              usedSectionSlots.add(`${slot.day}|${slot.time}|${department.id}|${semester}|${section}`);
              usedRoomSlots.add(`${slot.day}|${slot.time}|${room}`);
              timetable.push({
                id: `tt-${department.id}-s${semester}-${section}-${subject.id}-${occurrence}-${slot.time}`,
                departmentId: department.id,
                section,
                semester,
                day: slot.day,
                slot: slot.time,
                subject: subject.name,
                facultyId: allocation.facultyId!,
                room,
                isLab,
                published: true,
                status: 'approved',
              });
            });
            scheduleCursor = (firstIndex + blockSize) % weeklySlots.length;
            occurrence += 1;
            remaining -= blockSize;
            placed = true;
          }
          if (!placed) break;
        }
      }
    });
  }
}

const timetableValidationKeys = new Set<string>();
for (const entry of timetable) {
  const keys = [
    `faculty|${entry.day}|${entry.slot}|${entry.facultyId}`,
    `section|${entry.day}|${entry.slot}|${entry.departmentId}|${entry.semester}|${entry.section}`,
    `room|${entry.day}|${entry.slot}|${entry.room}`,
  ];
  if (entry.day === 'Sunday' || (entry.day === 'Saturday' && entry.slot > '12:00-13:00') || (entry.day !== 'Saturday' && !['09:00-10:00', '10:00-11:00', '11:00-12:00', '13:00-14:00', '14:00-15:00', '15:00-16:00'].includes(entry.slot))) {
    throw new Error(`Generated timetable entry is outside working hours: ${entry.id}`);
  }
  if (keys.some((key) => timetableValidationKeys.has(key))) throw new Error(`Generated timetable conflict: ${entry.id}`);
  keys.forEach((key) => timetableValidationKeys.add(key));
}

subjectAllocations.forEach((allocation) => {
  allocation.classIds.forEach((section) => {
    const subject = subjects.find((item) => item.id === allocation.subjectId);
    const occurrences = timetable.filter((entry) => entry.departmentId === allocation.departmentId && entry.semester === allocation.semester && entry.section === section && entry.subject === subject?.name);
    if (occurrences.length !== allocation.weeklyHours || new Set(occurrences.map((entry) => entry.day)).size < 2) {
      console.warn(`Weekly schedule could not fully satisfy ${subject?.name ?? allocation.subjectId} ${allocation.semester}${section}.`);
    }
  });
});

staff.forEach((member) => {
  const allocations = subjectAllocations.filter((allocation) => allocation.facultyId === member.id && allocation.status === 'allocated');
  member.subjects = [...new Set(allocations.map((allocation) => subjects.find((subject) => subject.id === allocation.subjectId)?.name).filter((name): name is string => Boolean(name)))];
  member.classes = [...new Set(allocations.flatMap((allocation) => allocation.classIds.map((section) => `${allocation.semester}${section}`)))];
  member.weeklyHours = allocations.reduce((total, allocation) => total + allocation.weeklyHours, 0);
});

const exams: ExamSchedule[] = subjects.map((subject, index) => ({
  id: `ex${index + 1}`,
  departmentId: subject.departmentId,
  examName: 'End Semester Examination',
  semester: subject.semester,
  date: `2026-11-${String((index % 18) + 2).padStart(2, '0')}`,
  timing: '10:00 AM - 01:00 PM',
  duration: '3 hours',
  subject: subject.name,
  hall: subject.departmentId === 'd1' ? 'Room 101' : subject.departmentId === 'd2' ? 'Room 104' : subject.departmentId === 'd3' ? 'Room 107' : 'Room 105',
  invigilatorId: subject.facultyId,
  invigilatorIds: [subject.facultyId],
  status: 'published',
  academicYear: ACADEMIC_YEAR,
  examType: 'End Semester',
  facultyId: subject.facultyId,
  marksEntered: students.filter((student) => student.departmentId === subject.departmentId).length,
  marksSubmitted: true,
}));

const mentorAllocations: MentorAllocation[] = students.map((student, index) => ({
  id: `ma${index + 1}`,
  studentId: student.id,
  mentorId: departmentFaculty[student.departmentId][index % departmentFaculty[student.departmentId].length],
  previousMentorId: null,
  departmentId: student.departmentId,
  semester: student.semester,
  section: student.section,
  academicYear: ACADEMIC_YEAR,
  allocatedBy: departments.find((d) => d.id === student.departmentId)!.hodId,
  date: '2026-08-12',
  status: 'active',
}));

const candidates: Candidate[] = [
  { id: 'cand1', name: 'Dr. Ananya Rao', qualification: 'Ph.D. in Computer Science', experience: '6 years', appliedFor: 'Assistant Professor — Computer Applications', departmentId: 'd1', status: 'interviewed', documents: [{ id: 'cand1-doc', name: 'CV and Research Profile', type: 'PDF', size: '1.2 MB' }], interviewScore: 88, interviewNotes: 'Strong teaching record and relevant applied research.' },
  { id: 'cand2', name: 'Vivek Menon', qualification: 'M.Tech. in Software Engineering', experience: '4 years', appliedFor: 'Assistant Professor — Computer Applications', departmentId: 'd1', status: 'interviewed', documents: [{ id: 'cand2-doc', name: 'Resume', type: 'PDF', size: '860 KB' }], interviewScore: 82, interviewNotes: 'Good industry exposure and practical curriculum experience.' },
  { id: 'cand3', name: 'Meera Kulkarni', qualification: 'M.Com. and NET', experience: '5 years', appliedFor: 'Assistant Professor — Commerce', departmentId: 'd2', status: 'interviewed', documents: [{ id: 'cand3-doc', name: 'Academic Portfolio', type: 'PDF', size: '980 KB' }], interviewScore: 85, interviewNotes: 'Relevant commerce teaching and assessment experience.' },
];

const approvals: ApprovalRequest[] = [{
  id: 'rec1',
  type: 'recruitment',
  title: 'Recruitment Request — Assistant Professor',
  submittedBy: 'Varshitha',
  submittedByRole: 'dean',
  departmentId: 'd1',
  date: '2026-09-05',
  purpose: 'Fill the vacant Assistant Professor position for Computer Applications.',
  status: 'pending',
  deanStatus: 'pending',
  shortlistedCandidateIds: [],
  details: {
    subject: 'Computer Applications',
    designation: 'Assistant Professor',
    qualification: 'Ph.D. / M.Tech. in Computer Science',
    requirements: 'Teaching, curriculum development, and student mentoring.',
    justification: 'Department workload has increased for the current academic year.',
  },
  documents: [],
}];

export const sampleData: AppData = {
  departments,
  staff,
  students,
  subjects,
  timetable,
  approvals,
  labs,
  grievances: [],
  committees: [],
  publications: [],
  researchProjects: [],
  exams,
  notifications: [],
  scholars: [],
  candidates,
  messages: [],
  policies: [],
  examAttendance: [],
  liaison: [],
  rooms,
  complaints: [],
  nonTeachingTasks: [],
  resources,
  resourceAllocations: [],
  maintenanceRequests: [],
  resourceRequests: [],
  resourceHistory: [],
  subjectAllocations,
  allocationHistory: [],
  mentorAllocations,
  mentoringHistory: [],
  assignedTasks: [],
  workloadSettings: {
    dailyCapacity: 8,
    thresholds: { low: 2, moderate: 4, high: 6 },
    mentoringRule: { enabled: true, scheduleDay: 'Monday', studentsPerBatch: 20, hoursPerBatch: 1 },
  },
};
