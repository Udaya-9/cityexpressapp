import api from '../../API/api';


export const createUser_API = async (userData) => {
  const payload = {
    username: userData.userName,      
    fullname: userData.fullName,       
    department_id: userData.department,
    unit_id: userData.unit,
    roles: userData.roles,
    organizationId:userData.organizationId,
  };
  const response = await api.post("/users", payload);
  return response.data;
}

export const GetAllUsers_API =async(userData)=>{
  const payload={
    sys_user_id:userData.sys_user_id
  };
  const response=await api.post("/user/listuser",payload);
  return response.data;
}

export const updateUserById_API=async(userData)=>{
  const payload={
    sys_user_id:userData.sys_user_id
  };
  const response=await api.put("/user/udpate",payload);
  return response.data;
}

export const ResetPassword_API=async(userData)=>{
  const payload={
    sys_user_id:userData.sys_user_id,
    Password:userData.Password
  };
const response=await api.post("/user/reset-password",payload);
return response;
}