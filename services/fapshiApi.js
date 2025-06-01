import axios from "axios";
import { ENV_VARS } from "../config/envVars.js";

const baseUrl = " https://sandbox.fapshi.com";
const headers = {
  apiuser: "8e8747a9-7a90-4172-b57f-b3fdeaa71f05",
  apikey: 'FAK_TEST_64f0ad5e98c34607380f', 
};

export const initiatePay = async (data) => {
  try {
    const response = await axios.post(`${baseUrl}/initiate-pay`, data, {
      headers,
    });
    return response.data;
  } catch (error) {
    return error.response
      ? error.response.data
      : { message: "API request failed", statusCode: 500 };
  }
};

export const paymentStatus = async (transId) => {
  try {
    const response = await axios.get(`${baseUrl}/payment-status/${transId}`, {
      headers,
    });
    return response.data;
  } catch (error) {
    return error.response
      ? error.response.data
      : { message: "API request failed", statusCode: 500 };
  }
};

 export const directPay=async (data)=>{
  console.log('Incoming payment initiation request:', data);
        return new Promise(async function(resolve){
            try {

                if(!data?.amount)
                    resolve(error('amount required', 400))
                if(!Number.isInteger(data.amount))
                    resolve(error('amount must be of type integer', 400))
                if(data.amount<100)
                    resolve(error('amount cannot be less than 100 XAF', 400))
                if(!data?.phone)
                    resolve(error('phone number required', 400))
                if(typeof data.phone !== 'string')
                    resolve(error('phone must be of type string', 400))
                if(!/^6[\d]{8}$/.test(data.phone))
                    resolve(error('invalid phone number', 400))

                const config = {
                    method: 'post',
                    url: baseUrl+'/direct-pay',
                    headers: headers,
                    data: data
                }
                const response = await axios(config)
                response.data.statusCode = response.status
                resolve(response.data)
                console.log(response.data)
              }catch(e){
                console.log(e.response.data)
                e.response.data.statusCode = e?.response?.status
                resolve(e.response.data)
            }
        })
    }
