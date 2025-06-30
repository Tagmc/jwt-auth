import axios from "axios";
import { toast } from "react-toastify";

// Khởi tạo 1 đối tượng axios để config, custom axios

let authorizedAxiosInstance = axios.create()

// Thời gian chờ tối đa  của 1 request
authorizedAxiosInstance.defaults.timeout = 1000 * 60 * 10

// Cho phép axios tự động đính kèm và gửi cookie mỗi khi gửi request
authorizedAxiosInstance.defaults.withCredentials = true 

/**
 * Cấu hình interceptor
 * */ 

// Add a request interceptor
authorizedAxiosInstance.interceptors.request.use((config) => {
    // Do something before request is sent
    return config;
  }, (error) => {
    // Do something with request error


    return Promise.reject(error);
  });

// Add a response interceptor
authorizedAxiosInstance.interceptors.response.use((response) => {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    return response;
  }, (error) => {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    // Dùng toastify để hiển thị bất kể mọi mã lỗi lên màn hình  - Ngoại trừ mã 410 - GONE - phục vụ tự động refresh lại token
    if (error.response?.status !== 410) {
        toast.error(error.response?.data?.message || error?.message)
    }
    return Promise.reject(error);
  });

export default authorizedAxiosInstance