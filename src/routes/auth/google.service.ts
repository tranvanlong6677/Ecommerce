import { Injectable } from '@nestjs/common'
import { OAuth2Client } from 'google-auth-library'
import { google } from 'googleapis'
import envConfig from 'src/shared/config'
import { GoogleAuthStateType } from './auth.model'
import { AuthRepository } from './auth.repo'
import { HashingService } from 'src/shared/services/hashing.service'
import { RoleService } from './roles.service'
import { v4 as uuidv4 } from 'uuid'
import { AuthService } from './auth.service'

@Injectable()
export class GoogleService {
  private oauth2Client: OAuth2Client
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly hashingService: HashingService,
    private readonly authService: AuthService,
    private readonly roleService: RoleService,
  ) {
    this.oauth2Client = new google.auth.OAuth2(
      envConfig.GOOGLE_CLIENT_ID,
      envConfig.GOOGLE_CLIENT_SECRET,
      envConfig.GOOGLE_REDIRECT_URL,
    )
  }
  getAuthorizationUrl({ userAgent, ip }: GoogleAuthStateType) {
    const scope = ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email']

    // Chuyển object sang string base64 an toàn để cho vào url
    const stateString = Buffer.from(
      JSON.stringify({
        userAgent,
        ip,
      }),
    ).toString('base64')

    const url = this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope,
      include_granted_scopes: true,
      state: stateString,
    })

    return { url }
  }

  async googleCallback({ code, state }: { code: string; state: string }) {
    try {
      // 1:Lấy state từ url
      let userAgent = 'Unknown'
      let ip = 'Unknown'
      try {
        if (state) {
          const clientInfo = JSON.parse(Buffer.from(state, 'base64').toString()) as GoogleAuthStateType
          console.log('>> check client info', clientInfo)
          userAgent = clientInfo.userAgent
          ip = clientInfo.ip
        }
      } catch (error) {
        console.log('error', error)
      }

      // 2: Dùng code lấy token
      const { tokens } = await this.oauth2Client.getToken(code)
      this.oauth2Client.setCredentials(tokens)

      // 3: Lấy thông tin user
      const oauth2 = google.oauth2({
        auth: this.oauth2Client,
        version: 'v2',
      })
      const { data } = await oauth2.userinfo.get()
      console.log('>>> check data', data)
      if (!data.email) {
        throw new Error('Không thể lấy thông tin email từ google')
      }

      let user = await this.authRepository.findUniqueUserIncludeRole({
        email: data.email,
      })

      // Nếu không có user tức là người dùng mới, tiến hành đăng ký
      if (!user) {
        const clientRoleId = await this.roleService.getClientRoleId()
        const randomPassword = uuidv4()
        const hashedPassword = await this.hashingService.hashPassword(randomPassword)
        user = await this.authRepository.createUserIncludeRole({
          email: data.email,
          name: data.name ?? '',
          password: hashedPassword,
          roleId: clientRoleId,
          phoneNumber: '',
          avatar: data.picture ?? null,
        })
      }

      const device = await this.authRepository.createDevice({
        userId: user?.id as number,
        userAgent,
        ip,
      })

      const authTokens = await this.authService.generateTokens({
        userId: user?.id as number,
        deviceId: device.id,
        roleId: user?.roleId as number,
        roleName: user?.role?.name as string,
      })

      return authTokens
    } catch (error) {
      console.log('error', error)
      throw new Error('Đăng nhập với google thất bại')
    }
  }
}
