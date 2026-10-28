import type { Role } from '../data/types';

export interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface MenuGroup {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

import {
  BookOpen, Users, GraduationCap, CheckSquare, DollarSign, Users2, Link2,
  Layers, ClipboardCheck, Award, FileText, FlaskConical, BarChart3,
  Building2, Wrench, Calendar, CalendarDays, ClipboardList, FileCheck, TrendingUp, UserCheck,
  Monitor, SquarePen, UserSquare2, TestTube2, FlaskConical as Flask,
  Send, FolderOpen, Cpu, Beaker, Clock, Mail, ShieldCheck, ScrollText,
} from 'lucide-react';

export const menus: Record<Role, MenuItem[]> = {
principal: [
      { id: 'p-curriculum', label: 'Curriculum Overview', icon: BookOpen },
      { id: 'p-tt-approval', label: 'Timetable Approval', icon: Clock },
      { id: 'p-performance', label: 'Faculty Performance', icon: Award },
      { id: 'p-workload', label: 'Workload', icon: BarChart3 },
      { id: 'p-daily-ops', label: 'Daily Operations', icon: ClipboardList },
      { id: 'p-students', label: 'Student Directory', icon: GraduationCap },
      { id: 'p-academic', label: 'Academic Performance', icon: TrendingUp },
      { id: 'p-discipline', label: 'Discipline Cases', icon: ShieldCheck },
      { id: 'p-approvals', label: 'Pending Approvals', icon: CheckSquare },
      { id: 'p-exam-approvals', label: 'Examination Approvals', icon: CalendarDays },
      { id: 'p-council', label: 'College Council', icon: Users2 },
      { id: 'p-admission', label: 'Admission Committee', icon: UserCheck },
      { id: 'p-grievance-c', label: 'Grievance Committee', icon: ScrollText },
      { id: 'p-iqac', label: 'IQAC', icon: FileCheck },
      { id: 'p-university', label: 'University Communication', icon: Mail },
      { id: 'p-govt', label: 'Government Compliance', icon: ShieldCheck },
      { id: 'p-naac', label: 'Accreditation (NAAC/NBA)', icon: Award },
      { id: 'p-parent', label: 'Parent Communication', icon: Users2 },
      { id: 'p-apply-leave', label: 'Apply for Leave', icon: Calendar },
  ],
dean: [
      { id: 'd-curriculum', label: 'Curriculum Oversight', icon: BookOpen },
      { id: 'd-faculty-recruitment', label: 'Faculty Recruitment', icon: UserCheck },
      { id: 'd-teaching-q', label: 'Teaching Standards', icon: Award },
      { id: 'd-results', label: 'Result Analysis', icon: BarChart3 },
      { id: 'd-accred', label: 'Accreditation Readiness', icon: FileCheck },
      { id: 'd-research', label: 'Research Management', icon: FlaskConical },
      { id: 'd-dept-reports', label: 'Department Reports', icon: BarChart3 },
      { id: 'd-hod-mgmt', label: 'HOD Management', icon: Users2 },
      { id: 'd-exam-approvals', label: 'Examination Approvals', icon: CheckSquare },
      { id: 'd-apply-leave', label: 'Apply for Leave', icon: Calendar },
  ],
hod: [
       { id: 'h-dashboard', label: 'Dashboard', icon: BarChart3 },
       { id: 'h-faculty', label: 'Faculty', icon: Users },
       { id: 'h-student-mgmt', label: 'Student', icon: GraduationCap },
      { id: 'h-resource-management', label: 'Resource', icon: Wrench },
      { id: 'h-academic-management', label: 'Examination', icon: BookOpen },
      { id: 'h-apply-leave', label: 'Apply for Leave', icon: Calendar },
  ],
professor: [
      { id: 'pf-teaching', label: 'Advanced Teaching', icon: BookOpen },
      { id: 'pf-phd', label: 'PhD Guidance', icon: GraduationCap },
      { id: 'pf-research', label: 'Research Leadership', icon: FlaskConical },
      { id: 'pf-policy', label: 'Policy Input', icon: ScrollText },
       { id: 'pf-timetable', label: 'My Timetable', icon: Calendar },
       { id: 'pf-class', label: 'My Class', icon: Users },
       { id: 'pf-resources', label: 'My Resources', icon: Wrench },
       { id: 'pf-tasks', label: 'Assigned Tasks', icon: ClipboardList },
       { id: 'pf-complaint', label: 'Register Complaint', icon: ShieldCheck },
       { id: 'pf-apply-leave', label: 'Apply for Leave', icon: Calendar },
   ],
'associate-professor': [
      { id: 'ap-teaching', label: 'Teaching', icon: BookOpen },
      { id: 'ap-research', label: 'Research', icon: FlaskConical },
      { id: 'ap-committee', label: 'Committee Work', icon: Users2 },
      { id: 'ap-timetable', label: 'My Timetable', icon: Calendar },
      { id: 'ap-class', label: 'My Class', icon: Users },
      { id: 'ap-resources', label: 'My Resources', icon: Wrench },
      { id: 'ap-tasks', label: 'Assigned Tasks', icon: ClipboardList },
      { id: 'ap-complaint', label: 'Register Complaint', icon: ShieldCheck },
      { id: 'ap-apply-leave', label: 'Apply for Leave', icon: Calendar },
  ],
'assistant-professor': [
      { id: 'as-teaching', label: 'Core Teaching Load', icon: BookOpen },
      { id: 'as-mentoring', label: 'Mentoring', icon: UserSquare2 },
      { id: 'as-research', label: 'Research', icon: FlaskConical },
      { id: 'as-timetable', label: 'My Timetable', icon: Calendar },
      { id: 'as-class', label: 'My Class', icon: Users },
      { id: 'as-resources', label: 'My Resources', icon: Wrench },
      { id: 'as-tasks', label: 'Assigned Tasks', icon: ClipboardList },
      { id: 'as-complaint', label: 'Register Complaint', icon: ShieldCheck },
      { id: 'as-apply-leave', label: 'Apply for Leave', icon: Calendar },
  ],
lecturer: [
      { id: 'lc-teaching', label: 'Undergraduate Teaching', icon: BookOpen },
      { id: 'lc-lab', label: 'Lab Supervision', icon: Beaker },
      { id: 'lc-timetable', label: 'My Timetable', icon: Calendar },
      { id: 'lc-class', label: 'My Class', icon: Users },
      { id: 'lc-resources', label: 'My Resources', icon: Wrench },
      { id: 'lc-tasks', label: 'Assigned Tasks', icon: ClipboardList },
      { id: 'lc-complaint', label: 'Register Complaint', icon: ShieldCheck },
      { id: 'lc-apply-leave', label: 'Apply for Leave', icon: Calendar },
  ],
'teaching-assistant': [
      { id: 'ta-lab', label: 'Lab', icon: Beaker },
      { id: 'ta-tutorial', label: 'Tutorials', icon: BookOpen },
      { id: 'ta-grading', label: 'Grading', icon: FileCheck },
      { id: 'ta-research', label: 'Research Support', icon: FlaskConical },
      { id: 'ta-timetable', label: 'My Timetable', icon: Calendar },
      { id: 'ta-class', label: 'My Class', icon: Users },
      { id: 'ta-resources', label: 'My Resources', icon: Wrench },
      { id: 'ta-tasks', label: 'Assigned Tasks', icon: ClipboardList },
      { id: 'ta-complaint', label: 'Register Complaint', icon: ShieldCheck },
      { id: 'ta-apply-leave', label: 'Apply for Leave', icon: Calendar },
  ],
'office-superintendent': [
      { id: 'os-directory', label: 'Staff Directory', icon: Users },
      { id: 'os-letters', label: 'Receive Official Letters', icon: Mail },
      { id: 'os-send', label: 'Send Communications', icon: Send },
      { id: 'os-complaint', label: 'Register Complaint', icon: ShieldCheck },
      { id: 'os-docs', label: 'Upload Official Documents', icon: FileText },
      { id: 'os-files', label: 'Department Files', icon: FolderOpen },
      { id: 'os-apply-leave', label: 'Apply for Leave', icon: Calendar },
  ],
'lab-assistant': [
       { id: 'la-equipment', label: 'Laboratory Equipment', icon: Cpu },
       { id: 'la-session', label: 'Session Assistance', icon: Beaker },
       { id: 'la-maintenance', label: 'Maintenance Requests', icon: ClipboardCheck },
       { id: 'la-complaint', label: 'Register Complaint', icon: ShieldCheck },
      { id: 'la-apply-leave', label: 'Apply for Leave', icon: Calendar },
  ],
};
