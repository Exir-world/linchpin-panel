// FORMS

export type LoginFormData = {
  phoneNumber: string;
  password: string;
};

export type RegisterFormType = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export type AddUserFormData = {
  organizationId: number;
  name: string;
  profileImage: string;
  lastname: string;
  phoneNumber: string;
  password: string;
  role: number;
  settings: {
    teamId: number;
    shiftId: number;
    salary: number;
    needToLocation: boolean;
  };
  firstname: string;
  nationalCode: string;
  personnelCode: string;
  isDelete: boolean;
};

type Role = {
  name: string;
  permissions: string[]; // Assuming the permissions array will contain strings
  id: number;
};

export type User = {
  organizationId: number;
  firstname: string;
  name: string;
  profileImage: string | null;
  lastname: string;
  phoneNumber: string;
  password: string;
  role: Role;
  nationalCode: string | null;
  personnelCode: string | null;
  isDeleted: boolean;
  id: number;
};

interface Person {
  id: number;
  firstname: string;
  lastname: string;
  name: string;
  personnelCode: string | null;
  phoneNumber: string;
}

export type RequestItem = {
  id: number;
  type: string; // type is a string with a specific value or a generic string
  status: string;
  description: string | null; // description can be a string or null
  adminComment: string | null; // adminComment can be a string or null
  userId: number; // userId is a number
  startTime: string; // startTime is a string, assuming it's a date string in ISO format
  endTime: string | null; // endTime is a string or null
  reviewedById: number | null; // reviewedById is a number or null
  reviewedAt: string | null; // reviewedAt is a string (ISO date) or null
  createdAt: string; // createdAt is a string (ISO date)
  updatedAt: string; // updatedAt is a string (ISO date)
  user: Person; // user is an object of type Person
};

interface Organization {
  id: number;
  creatorId: number;
  name: string;
  address: string;
  description: string | null;
}

interface Team {
  id: number;
  departmentId: number;
  supervisorId: number | null;
  title: string;
  color: string;
  description: string | null;
}

export interface PropertyItem {
  id: number;
  organizationId: number;
  supervisorId: number | null;
  title: string;
  description: string | null;
  organization: Organization;
  teams: Team[];
}

export interface PropertyDetail {
  id: number;
  title: string;
  code: string;
  status: string; // You could change this to a union type if the possible statuses are known, e.g., 'good' | 'bad'
  createdAt: string; // ISO date string (or use Date if you plan to convert it)
  organizationId: number;
  departmentId: number | null;
}


