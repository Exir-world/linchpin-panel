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
  brand: string;
  model: string;
  code: string;
  description: string | null;
  status: string;
  createdAt: string;
  organizationId: number;
  departmentId: number | null;
  categoryId: number | null;
  imageUrl: string | null;
  features: {
    id: number;
    title: string;
  }[];
}

// The nested category object on each feature
export interface CategoryItem {
  id: number;
  title: string;
}

// Each feature, which includes its own category
export interface Feature {
  id: number;
  title: string;
  category: CategoryItem;
}

// Top‑level category object, which holds an array of features
export interface CategoryWithFeatures {
  id: number;
  title: string;
  features: Feature[];
}

export type PropertiesCategory = CategoryWithFeatures[];

// Type for the Category object
interface Category {
  id: number;
  title: string;
}

// Type for the Property object
interface Property {
  id: number;
  code: string;
  brand: string;
  model: string;
  description: string;
  status: string;
  createdAt: string; // Use a string for ISO date format or Date if you want to convert it
  organizationId: number;
  departmentId: number;
  imageUrl: string;
  category: Category;
}

// Type for the PropertyReport object
export interface PropertyReport {
  id: number;
  userId: number;
  propertyId: number;
  report: string;
  status: string;
  createdAt: string; // Use a string for ISO date format or Date if you want to convert it
  property: Property;
}

export interface CategoryFeature {
  id: number;
  title: string;
  category: {
    id: number;
    title: string;
  };
}
