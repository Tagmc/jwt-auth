
import { StatusCodes } from 'http-status-codes'
import ms from 'ms'
import { JwtProvider } from '~/providers/JwtProvider'

const MOCK_DATABASE = {
  USER: {
    ID: 'EmHuyTapCode-sample-id-12345678',
    EMAIL: 'emhuytapcode@gmail.com',
    PASSWORD: 'EmHuyTapCode@123'
  }
}

const ACCESS_TOKEN_SECRET_SIGNATURE = 'KBgJwUETt4HeVD05WaXXI9V3JnwCVP'
const REFRESH_TOKEN_SECRET_SIGNATURE = 'fcCjhnpeopVn2Hg1jG75MUi62051yL'

const login = async (req, res) => {
  try {
    if (req.body.email !== MOCK_DATABASE.USER.EMAIL || req.body.password !== MOCK_DATABASE.USER.PASSWORD) {
      res.status(StatusCodes.FORBIDDEN).json({ message: 'Your email or password is incorrect!' })
      return
    }

    // Trường hợp nhập đúng thông tin tài khoản, tạo token và trả về cho phía Client
    //Tạo thông tin payload để đính kèm trong JWT token
    const userInfo = {
      id: MOCK_DATABASE.USER.ID,
      email: MOCK_DATABASE.USER.EMAIL
    }

    // Tạo 2 loại token
    const accessToken = await JwtProvider.generateToken(userInfo, ACCESS_TOKEN_SECRET_SIGNATURE, '1h')
    const refreshToken = await JwtProvider.generateToken(userInfo, REFRESH_TOKEN_SECRET_SIGNATURE, '14 days')
    /**
     * Xử lý trường hợp trả về http only cookie cho phía trình duyệt
     * Về cái maxAge và thự viện ms: https://expressjs.com/en/api.html
     * Đối với các maxAge - thời gian sống của cookie thì chúng ta sẽ để tối đa 14 ngày. thời gian sống cookie != thời gian sống token
    */
    console.log(accessToken)
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none', // domain fe != domain be,
      maxAge: ms('14 days')
    })

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none', // domain fe != domain be,
      maxAge: ms('14 days')
    })

    // Trả về thông tin user cũng như sẽ trả về Tokens cho trường hợp phía FE cần lưu token vào localStorage

    res.status(StatusCodes.OK).json({ 
      ...userInfo,
      accessToken,
      refreshToken
     })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error)
  }
}

const logout = async (req, res) => {
  try {
    // Do something
    res.status(StatusCodes.OK).json({ message: 'Logout API success!' })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error)
  }
}

const refreshToken = async (req, res) => {
  try {
    // Do something
    res.status(StatusCodes.OK).json({ message: ' Refresh Token API success.' })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error)
  }
}

export const userController = {
  login,
  logout,
  refreshToken
}
