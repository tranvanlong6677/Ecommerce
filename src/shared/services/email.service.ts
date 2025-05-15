import { Injectable, UnprocessableEntityException } from '@nestjs/common'
import { Resend } from 'resend'
import envConfig from '../config'
import fs from 'fs'
import path from 'path'
import React from 'react' // Quan trọng!
import PlaidVerifyIdentityEmail from '../email-templates/email'

@Injectable()
export class EmailService {
  private resend: Resend
  constructor() {
    this.resend = new Resend(envConfig.RESEND_API_KEY)
  }

  async sendEmailOTP(payload: { email: string; code: number }) {
    const { data, error } = await this.resend.emails.send({
      from: 'NestJS Ecommerce <no-reply@golart.io.vn>',
      to: [payload.email],
      subject: 'Golart Ecommerce',
      // html: otpTemplate.replaceAll('{{code}}', payload.code + ''),
      react: React.createElement(PlaidVerifyIdentityEmail, {
        validationCode: payload.code,
      }),
    })

    if (error) {
      throw new UnprocessableEntityException([
        {
          message: 'Gửi mã OTP thất bại',
          path: 'code',
        },
      ])
    }

    console.log({ data })
    return { data, error }
  }
}
