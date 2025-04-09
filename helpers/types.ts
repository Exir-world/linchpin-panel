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
