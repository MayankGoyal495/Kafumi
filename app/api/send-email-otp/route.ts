import { NextResponse } from 'next/server'
import { Resend } from 'resend'

export async function POST(request: Request) {
  try {
    const { email, otp } = await request.json()

    if (!email || !otp) {
      return NextResponse.json(
        { error: 'Email and OTP are required' },
        { status: 400 }
      )
    }

    // Check if API key exists
    if (!process.env.RESEND_API_KEY) {
      console.error('❌ RESEND_API_KEY not found in environment variables')
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 500 }
      )
    }

    console.log('📧 Sending email to:', email)
    console.log('🔑 API Key exists:', process.env.RESEND_API_KEY?.substring(0, 10) + '...')

    const resend = new Resend(process.env.RESEND_API_KEY)

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: 'Kafumi <onboarding@resend.dev>',
      to: [email],
      subject: 'Your Kafumi Login OTP',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .container {
                background: #ffffff;
                border-radius: 8px;
                padding: 40px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              }
              .logo {
                text-align: center;
                margin-bottom: 30px;
              }
              .logo h1 {
                color: #6366f1;
                font-size: 32px;
                margin: 0;
                font-weight: 700;
              }
              .otp-box {
                background: #f8f9fa;
                border: 2px dashed #6366f1;
                border-radius: 8px;
                padding: 30px;
                text-align: center;
                margin: 30px 0;
              }
              .otp-code {
                font-size: 36px;
                font-weight: bold;
                letter-spacing: 8px;
                color: #6366f1;
                margin: 10px 0;
              }
              .message {
                text-align: center;
                color: #666;
                margin: 20px 0;
              }
              .footer {
                text-align: center;
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
                color: #9ca3af;
                font-size: 14px;
              }
              .warning {
                background: #fef3c7;
                border-left: 4px solid #f59e0b;
                padding: 15px;
                margin: 20px 0;
                border-radius: 4px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="logo">
                <h1>☕ Kafumi</h1>
                <p style="color: #666; margin-top: 10px;">Your Perfect Café Experience</p>
              </div>
              
              <h2 style="color: #333; text-align: center;">Your Login Code</h2>
              
              <p class="message">
                Enter this code to complete your sign in to Kafumi:
              </p>
              
              <div class="otp-box">
                <p style="margin: 0; color: #666; font-size: 14px;">YOUR OTP CODE</p>
                <div class="otp-code">${otp}</div>
                <p style="margin: 0; color: #666; font-size: 14px;">Valid for 10 minutes</p>
              </div>
              
              <div class="warning">
                <strong>⚠️ Security Notice:</strong> Never share this code with anyone. Kafumi will never ask for your OTP via phone or email.
              </div>
              
              <p class="message">
                If you didn't request this code, you can safely ignore this email.
              </p>
              
              <div class="footer">
                <p>This is an automated email from Kafumi.</p>
                <p>© ${new Date().getFullYear()} Kafumi. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `
    })

    if (error) {
      console.error('❌ Resend API error:', error)
      return NextResponse.json(
        { error: 'Failed to send email', details: error },
        { status: 500 }
      )
    }

    console.log('✅ Email sent successfully:', data?.id)
    return NextResponse.json({ success: true, messageId: data?.id })
  } catch (error: any) {
    console.error('❌ Email OTP error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
