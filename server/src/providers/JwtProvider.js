import JWT from "jsonwebtoken";

/**
 * Function tạo mới một token - cần 3 tham số đầu vào
 * userInfo
 * secretSignature: Chữ kí bí mật
 * Tokenlife: Thời gian sống của token
 */
const generateToken = async (userInfo, secretSignature, tokenLife) => {
  try {
    return JWT.sign(userInfo, secretSignature, {
      algorithm: "HS256",
      expiresIn: tokenLife,
    });
  } catch (error) {
    throw new Error(error);
  }
};

/**
 * Function kiểm tra token có hợp lệ hay không
 * Hợp lệ ở đây hiểu đơn giản là cái token được tạo ra có đúng với cái chữ kí bí mật không
 */ 
const verifyToken = async (token, secretSignature) => {
  try {
    return JWT.verify(token, secretSignature);
  } catch (error) {
    throw new Error(error);
  }
};

export const ACCESS_TOKEN_SECRET_SIGNATURE = 'KBgJwUETt4HeVD05WaXXI9V3JnwCVP'
export const REFRESH_TOKEN_SECRET_SIGNATURE = 'fcCjhnpeopVn2Hg1jG75MUi62051yL'

export const JwtProvider = {
  generateToken,
  verifyToken,
};

