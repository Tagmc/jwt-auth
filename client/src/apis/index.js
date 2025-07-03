import authorizedAxiosInstance from "~/utils/authorizedAxios";
import { API_ROOT } from "~/utils/constants";

export const handleLogoutAPI = async () => {
    // Với trường hợp số 1: Dùng localStorage => chỉ cần xoá thông tin user trong localStorage phía fe
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('userInfo')
    // Với trường hợp số 2: Dùng HttpOnly Cookies => gọi API để xử lý remove cookies
    return await authorizedAxiosInstance.delete(`${API_ROOT}/v1/users/logout`)
}

export const refreshTokenAPI = async (refreshToken) => {
    return await authorizedAxiosInstance.put(`${API_ROOT}/v1/users/refresh_token`, {refreshToken})
}