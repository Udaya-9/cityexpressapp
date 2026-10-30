import api from '../../API/api';

export const createuserAPI=async(userdate)=>{
    try{
        const response=await api.post("/user/new",userdate);  
        return response.data;
    }
    catch(error){
        throw error.response?.data||error;
    }
}
