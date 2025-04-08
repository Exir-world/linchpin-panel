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

