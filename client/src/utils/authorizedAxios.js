//localStorage: thì mình có thể dùng mã js để lấy token ra, hay thao tác với token đó cho nên nếu như chương trình hướng vào lỗi vảo mật XSS thì sẽ bị hack
// HttpOnly Cookie: thì hacker sẽ không lấy được token ra nếu bị XSS vì js của trình duyệt không thể nào lấy ra hay sủ dụng httpOnlyCookie nhưng httpOnly Cookie nếu vướng lỗi bảo mật csrf cũng sẽ bị mất
import axios from "axios";
import { toast } from "react-toastify";
import { handleLogoutAPI, refreshTokenAPI } from "~/apis";
import { useNavigate } from "react-router-dom";

const navigate = useNavigate();

// Khởi tạo 1 đối tượng axios để config, custom axios
let authorizedAxiosInstance = axios.create();

// Thời gian chờ tối đa  của 1 request
authorizedAxiosInstance.defaults.timeout = 1000 * 60 * 10;

// Cho phép axios tự động đính kèm và gửi cookie mỗi khi gửi request
authorizedAxiosInstance.defaults.withCredentials = true;

/**
 * Cấu hình interceptor
 * */

// Add a request interceptor
authorizedAxiosInstance.interceptors.request.use(
  (config) => {
    // lấy accessToken từ localStorage và đính kèm vào header
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      // Cần thêm Bearer vì nên tuân thủ theo tiêu chuẩn OAuth 2.0 trong việc xác định loại token đang sử dụng
      // Bearer là định nghĩa loại token dành cho việc xác thực và uỷ quyền, tham khảo các loại token khác nhau
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    // Do something with request error

    return Promise.reject(error);
  }
);

// Khởi tạo promise cho việc gọi API refresh token
// Mục đích tạo Promise này để khi nhận yêu cầu refreshToken đầu tiên thì bị hold lại việc gọi API refresh_token cho tới khi xong xuôi thì mới retry lại những API bị lỗi trước đó thay vì có thể gọi lại refreshTokenAPI liên tục với mỗi request lỗi.
let refreshTokenPromise = null;

// Add a response interceptor
authorizedAxiosInstance.interceptors.response.use(
  (response) => {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    return response;
  },
  (error) => {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    // Dùng toastify để hiển thị bất kể mọi mã lỗi lên màn hình  - Ngoại trừ mã 410 - GONE - phục vụ tự động refresh lại token

    // Xử lý refresh token tự động
    // Nếu như nhận mã 401 từ BE, thì gọi API logout luôn
    if (error.response?.status === 401) {
      handleLogoutAPI().then(() => {
        // Nếu trường hợp dùng cookie thì nhớ xoá userInfo trong localStorage
        // localStorage.removeItem('userInfo')

        // Điều hướng đến trang login
        navigate("/login", { replace: true });
      });
    }

    // Xử lý tập trung phần hiển thị thông báo lỗi  trả về mọi API ở đây
    // Nếu nhận mã 410 từ be, gọi refresh token để làm mới lại accessToken
    // Lấy các request API bị lỗi thông qua error.config
    const originalRequest = error.config;
    if (error.response?.status !== 410 && !originalRequest) {
      // Gán thêm một giá trị _retry luôn = true trong khoảng thời gian chờ, để việc refresh token này chỉ luôn gọi 1 lần 1 thời điểm
      // originalRequest._retry = true ko cần thiết nữa vì đã có refreshTokenPromise

      if (!refreshTokenPromise) {
        // TH1: lấy refreshToken từ localStorage
        const refreshToken = localStorage.getItem("refreshToken");
        // Call API refresh tOken, phair return
        refreshTokenPromise = refreshTokenAPI(refreshToken)
          .then((res) => {
            // Lấy và gán lại accessToken vào localStorage (cho trường hơjp localStorage)
            const { accessToken } = res.data;
            localStorage.setItem("accessToken", accessToken);
            authorizedAxiosInstance.defaults.headers.Authorization = `Bearer ${accessToken}`;
            // Đồng thời lưu ý là accessToken cũng đã được update lại ở Cookie (cho trường hợp cookie)
          })
          .catch((err) => {
            handleLogoutAPI().then(() => {
              location.href = "/login";
            });
            return Promise.reject(err);
          })
          .finally(() => {
            // Dù API refresh_token có thành công hay lỗi thì vẫn luôn gán lại cái refreshTokenPromise về null như ban đầu
            refreshTokenPromise = null;
          });
      }

      // return lại refreshTokenPromise trong trường hợp success ở đây
      return refreshTokenPromise.then(() => {
        // Quan trọng : return lại axios instance kết hợp cái originalRequest để gọi lại những api bị lỗi ban đầu
        return authorizedAxiosInstance(originalRequest);
      });
    }
    return Promise.reject(error);
  }
);

export default authorizedAxiosInstance;
