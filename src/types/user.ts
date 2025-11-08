export interface User {
  id: string;
  name: string;
  email: string;
  userType: number;
  lastLogin?: string;
  avatar?: string;
  created_at?: string;
  updated_at?: string;
  phone?: string;
  roleId: number;
  role_name?: string;
  isActive: boolean;
  status: number;
  user_type: number;
  branchId: number;
  lastLoginAt?: Date;
}

export interface UserData {
  id: string;
  name: string;
  email: string;
  user_type: number;
  role_id: string;
  last_login?: string; 
  avatar?: string; 
  created_at?: string; 
  updated_at?: string; 
  branch_id?: number;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  user_type: number;
  role_id: string;
  permissions?: string[];
  isActive?: boolean;
}

export interface UpdateUserRequest {
  id: string;
  name?: string;
  email?: string;
  user_type?: number;
  role_id?: string;
}