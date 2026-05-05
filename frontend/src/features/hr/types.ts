export type HrCaseStatus = 'open' | 'in_review' | 'resolved';
export type HrCasePriority = 'high' | 'medium' | 'low';
export type EmployeeStatus = 'active' | 'on_leave' | 'terminated';

export type HrCase = {
  id: string;
  title: string;
  employee: string;
  status: HrCaseStatus;
  priority: HrCasePriority;
  summary: string;
  createdAt: string;
};

export type HrSurvey = {
  id: string;
  employeeId: string;
  employeeName: string;
  score: number;
  comment?: string;
  createdAt: string;
};

export type Employee = {
  id: string;
  fullName: string;
  email: string;
  role: string;
  department?: string;
  status: EmployeeStatus;
  joinedAt: string;
  deletedAt?: string | null;
};

export type CreateHrCaseInput = {
  title: string;
  employee: string;
  priority?: HrCasePriority;
  summary?: string;
};

export type SubmitSurveyInput = {
  score: number;
  comment?: string;
};

/** Kechiktirilgan holat: review da turgan case */
export function isUrgentCase(c: Pick<HrCase, 'status' | 'priority'>): boolean {
  return c.status !== 'resolved' && c.priority === 'high';
}
