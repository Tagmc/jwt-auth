// Middleware đảm nhiệm việc quan trọng: lấy và xác thực cái JWT accessToken nhận được từ phía FE có hợp lệ hay không

import { StatusCodes } from "http-status-codes";
import { ACCESS_TOKEN_SECRET_SIGNATURE, JwtProvider } from "~/providers/JwtProvider";

const isAuthorized = async (req, res, next) => {
  // Cách 1: Lấy accessToken nằm trong request cookie phía client gửi lên - withCredentials trong file authorizedAxios và credentials trong CORS
  const accessTokenFromCookie = req.cookies?.accessToken;
  if (!accessTokenFromCookie) {
    res.status(StatusCodes.UNAUTHORIZED).json({message: 'Unauthorized!: (Token not found)'})
    return
  }  
  // Cách 2: Lấy accessToken trong trường hợp phía FE lưu localStorage và gửi lên server thông qua header Authorization
  const accessTokenFromHeader = req.headers.authorization;
  if (!accessTokenFromHeader) {
    res.status(StatusCodes.UNAUTHORIZED).json({message: 'Unauthorized!: (Token not found)'})
    return
  }  

  try {
    //  Bước 1: Thực hiện giải mã token có hợp lệ không
    const accessTokenDecoded = await JwtProvider.verifyToken(
        //accessTokenFromCookie, //token cach 1
        accessTokenFromHeader.substring('Bearer '.length), // token cach 2
        ACCESS_TOKEN_SECRET_SIGNATURE)
    // Bước 2: Quan trọng: nếu như cái token hợp lệ, thì sẽ cần phải lưu thông tin giải mã được vào cái req.jwtDecoded, để xử dụng cho các tầng cần xử lý tiếp, co id, email
    req.jwtDecoded = accessTokenDecoded
    // Bước 3: next request
    next()
  } catch (error) {
    console.log('Error from middleware', error)
    // Trường hợp lỗi 01: Nếu cái accessToken nó bị lỗi hết hạn thì mình cần trả về lỗi GONE - 410 cho phía FE để biết gọi api refreshToken
    if (error.message?.includes('jwt expired')) {
        res.status(StatusCodes.GONE).json({message: 'Need to refresh token'})
        return
    }

    // Trường hợp lỗi 02: Nếu như cái accessToken nó không hợp lệ do bất kì trường hợp nào khác thì cứ trả về 401
    res.status(StatusCodes.UNAUTHORIZED).json({message: 'Unauthorized! Please Login'})
  }
};

export const authMiddleware = {
  isAuthorized,
};
