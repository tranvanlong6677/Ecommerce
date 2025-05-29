import { Injectable } from '@nestjs/common'
import React from 'react'
import { Resend } from 'resend'
import { SendOTPFailedException } from 'src/routes/auth/error.model'
import envConfig from '../config'
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
      react: React.createElement(PlaidVerifyIdentityEmail, {
        validationCode: payload.code,
      }),
    })

    if (error) {
      throw SendOTPFailedException
    }

    return { data, error }
  }
}
