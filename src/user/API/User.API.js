import api from "../../API/api";

export const createUser_API = async (userData) => {
  const payload = {
    emailaddress: userData.emailaddress,
    fullname: userData.fullName,
    DepartmentId: userData.department,
    Unit: userData.Unit,
    sys_user_id: userData.sys_user_id,
    roles: userData.roles,
  };

  const response = await api.post("/user/new", payload);
  return response.data;
};

export const GetAllUsers_API = async (userData) => {
  const payload = {
    sys_user_id: userData.sys_user_id,
  };
  const response = await api.post("/user/listuser", payload);
  return response.data;
};

export const updateUserById_API = async (userData) => {
  const payload = {
    emailaddress: userData.emailaddress,
    fullname: userData.fullname,
    DepartmentId: userData.DepartmentId,
    Unit: userData.Unit,
    roles: userData.roles,
    sys_user_id: userData.sys_user_id,
    IsBlocked: userData.IsBlocked,
  };
  const response = await api.put("/user/update", payload);
  return response.data;
};

export const ResetPassword_API = async (userData) => {
  const payload = {
    sys_user_id: userData.sys_user_id,
    Password: userData.Password,
  };
  const response = await api.post("/user/reset-password", payload);
  return response;
};
