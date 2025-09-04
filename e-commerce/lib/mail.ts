import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

export const sendVerificationEmail = async (email: string, token: string) => {
    const confirmationLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/new-verification?token=${token}`;
    
    const htmlTemplate = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email - StackPilot</title>
        <!--[if mso]>
        <noscript>
        <xml>
        <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
        </o:OfficeDocumentSettings>
        </xml>
        </noscript>
        <![endif]-->
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333333; background-color: #f8fafc;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f8fafc;">
            <tr>
                <td align="center" style="padding: 40px 20px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1); overflow: hidden;">
                        <!-- Header with gradient -->
                        <tr>
                            <td style="background: linear-gradient(135deg, #833ab4 0%, #fd1d1d 50%, #fcb045 100%); padding: 40px 30px; text-align: center;">
                                <h1 style="margin: 0; font-size: 36px; font-weight: 800; color: #ffffff; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);">
                                    StackPilot
                                </h1>
                                <p style="margin: 8px 0 0 0; font-size: 14px; color: rgba(255, 255, 255, 0.9); font-weight: 500;">
                                    Production-Ready Next.js Scaffolding
                                </p>
                            </td>
                        </tr>
                        
                        <!-- Main content -->
                        <tr>
                            <td style="padding: 40px 30px;">
                                <h2 style="margin: 0 0 20px 0; font-size: 24px; font-weight: 700; color: #1e293b;">
                                    Welcome to StackPilot! 🚀
                                </h2>
                                
                                <p style="margin: 0 0 20px 0; font-size: 16px; color: #475569; line-height: 1.6;">
                                    Thank you for joining StackPilot! We're excited to help you scaffold modern, production-ready Next.js applications in seconds.
                                </p>
                                
                                <p style="margin: 0 0 30px 0; font-size: 16px; color: #475569; line-height: 1.6;">
                                    To get started and access all features including AI-inspired gradients, theming, payments, and deployments, please verify your email address by clicking the button below:
                                </p>
                                
                                <!-- CTA Button -->
                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                    <tr>
                                        <td align="center" style="padding: 0 0 30px 0;">
                                            <a href="${confirmationLink}" 
                                               style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #833ab4 0%, #fd1d1d 50%, #fcb045 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; border: none; cursor: pointer; box-shadow: 0 4px 12px rgba(131, 58, 180, 0.3); transition: all 0.2s ease;"
                                               target="_blank">
                                                ✅ Verify Email Address
                                            </a>
                                        </td>
                                    </tr>
                                </table>
                                
                                <p style="margin: 0 0 20px 0; font-size: 14px; color: #64748b; line-height: 1.5;">
                                    If the button doesn't work, you can also copy and paste this link into your browser:
                                </p>
                                
                                <p style="margin: 0 0 30px 0; font-size: 12px; color: #64748b; word-break: break-all; background-color: #f1f5f9; padding: 12px; border-radius: 6px; border-left: 4px solid #833ab4;">
                                    ${confirmationLink}
                                </p>
                                
                                <!-- Features highlight -->
                                <div style="background-color: #f8fafc; border-radius: 12px; padding: 25px; margin: 30px 0; border: 1px solid #e2e8f0;">
                                    <h3 style="margin: 0 0 15px 0; font-size: 18px; font-weight: 600; color: #1e293b;">
                                        What you'll get with StackPilot:
                                    </h3>
                                    <ul style="margin: 0; padding-left: 20px; color: #475569; font-size: 14px; line-height: 1.6;">
                                        <li style="margin-bottom: 8px;"><strong>🔐 Production Auth:</strong> Email, Google, GitHub auth out of the box with NextAuth</li>
                                        <li style="margin-bottom: 8px;"><strong>💳 Payments Ready:</strong> Stripe & Razorpay for subscriptions or one-time payments</li>
                                        <li style="margin-bottom: 8px;"><strong>🎨 Theming Built-in:</strong> Dark/light mode, Tailwind v4 tokens, CLI color picker</li>
                                    </ul>
                                </div>
                                
                                <p style="margin: 0 0 10px 0; font-size: 14px; color: #64748b;">
                                    This verification link will expire in 24 hours for security reasons.
                                </p>
                                
                                <p style="margin: 0; font-size: 14px; color: #64748b;">
                                    If you didn't create an account with StackPilot, you can safely ignore this email.
                                </p>
                            </td>
                        </tr>
                        
                        <!-- Footer -->
                        <tr>
                            <td style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                                <p style="margin: 0 0 10px 0; font-size: 14px; font-weight: 600; color: #1e293b;">
                                    StackPilot Team
                                </p>
                                <p style="margin: 0 0 15px 0; font-size: 12px; color: #64748b;">
                                    Scaffold modern, production-ready Next.js apps in seconds
                                </p>
                                <p style="margin: 0; font-size: 11px; color: #94a3b8;">
                                    © 2024 StackPilot. All rights reserved.
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `;

    const response = await resend.emails.send({
        from: "StackPilot <noreply@techmorphers.com>",
        to: email,
        subject: "🚀 Verify your email - Welcome to StackPilot!",
        html: htmlTemplate,
        headers: {
            'X-Priority': '1',
            'X-MSMail-Priority': 'High',
            'List-Unsubscribe': '<mailto:unsubscribe@techmorphers.com>',
        },
    });
    
    return response;
};

export const sendPasswordResetEmail = async (email: string, token: string) => {
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/new-password?token=${token}`;

    const htmlTemplate = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password - StackPilot</title>
        <!--[if mso]>
        <noscript>
        <xml>
        <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
        </o:OfficeDocumentSettings>
        </xml>
        </noscript>
        <![endif]-->
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333333; background-color: #f8fafc;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f8fafc;">
            <tr>
                <td align="center" style="padding: 40px 20px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1); overflow: hidden;">
                        <!-- Header with gradient -->
                        <tr>
                            <td style="background: linear-gradient(135deg, #833ab4 0%, #fd1d1d 50%, #fcb045 100%); padding: 40px 30px; text-align: center;">
                                <h1 style="margin: 0; font-size: 36px; font-weight: 800; color: #ffffff; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);">
                                    StackPilot
                                </h1>
                                <p style="margin: 8px 0 0 0; font-size: 14px; color: rgba(255, 255, 255, 0.9); font-weight: 500;">
                                    Production-Ready Next.js Scaffolding
                                </p>
                            </td>
                        </tr>
                        
                        <!-- Main content -->
                        <tr>
                            <td style="padding: 40px 30px;">
                                <h2 style="margin: 0 0 20px 0; font-size: 24px; font-weight: 700; color: #1e293b;">
                                    Reset Your Password 🔒
                                </h2>
                                
                                <p style="margin: 0 0 20px 0; font-size: 16px; color: #475569; line-height: 1.6;">
                                    We received a request to reset your password for your StackPilot account. If you made this request, click the button below to create a new password.
                                </p>
                                
                                <p style="margin: 0 0 30px 0; font-size: 16px; color: #475569; line-height: 1.6;">
                                    If you didn't request a password reset, you can safely ignore this email. Your account remains secure.
                                </p>
                                
                                <!-- CTA Button -->
                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                    <tr>
                                        <td align="center" style="padding: 0 0 30px 0;">
                                            <a href="${resetLink}" 
                                               style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #833ab4 0%, #fd1d1d 50%, #fcb045 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; border: none; cursor: pointer; box-shadow: 0 4px 12px rgba(131, 58, 180, 0.3); transition: all 0.2s ease;"
                                               target="_blank">
                                                🔒 Reset My Password
                                            </a>
                                        </td>
                                    </tr>
                                </table>
                                
                                <p style="margin: 0 0 20px 0; font-size: 14px; color: #64748b; line-height: 1.5;">
                                    If the button doesn't work, you can also copy and paste this link into your browser:
                                </p>
                                
                                <p style="margin: 0 0 30px 0; font-size: 12px; color: #64748b; word-break: break-all; background-color: #f1f5f9; padding: 12px; border-radius: 6px; border-left: 4px solid #833ab4;">
                                    ${resetLink}
                                </p>
                                
                                <!-- Security notice -->
                                <div style="background-color: #fef2f2; border-radius: 12px; padding: 20px; margin: 30px 0; border: 1px solid #fecaca; border-left: 4px solid #dc2626;">
                                    <h3 style="margin: 0 0 10px 0; font-size: 16px; font-weight: 600; color: #dc2626; display: flex; align-items: center;">
                                        ⚠️ Security Notice
                                    </h3>
                                    <ul style="margin: 0; padding-left: 20px; color: #7f1d1d; font-size: 14px; line-height: 1.6;">
                                        <li style="margin-bottom: 8px;">This reset link will expire in <strong>1 hour</strong> for security</li>
                                        <li style="margin-bottom: 8px;">Only use this link if you requested the password reset</li>
                                        <li style="margin-bottom: 8px;">Never share this link with anyone else</li>
                                        <li>Contact support if you didn't request this reset</li>
                                    </ul>
                                </div>
                                
                                <p style="margin: 0 0 10px 0; font-size: 14px; color: #64748b;">
                                    For your security, this link can only be used once and will expire soon.
                                </p>
                                
                                <p style="margin: 0; font-size: 14px; color: #64748b;">
                                    If you continue to have trouble accessing your account, please contact our support team.
                                </p>
                            </td>
                        </tr>
                        
                        <!-- Footer -->
                        <tr>
                            <td style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                                <p style="margin: 0 0 10px 0; font-size: 14px; font-weight: 600; color: #1e293b;">
                                    StackPilot Team
                                </p>
                                <p style="margin: 0 0 15px 0; font-size: 12px; color: #64748b;">
                                    Scaffold modern, production-ready Next.js apps in seconds
                                </p>
                                <p style="margin: 0; font-size: 11px; color: #94a3b8;">
                                    © 2024 StackPilot. All rights reserved.
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `;

    const response = await resend.emails.send({
        from: "StackPilot <noreply@techmorphers.com>",
        to: email,
        subject: "🔒 Reset Your Password - StackPilot",
        html: htmlTemplate,
        headers: {
            'X-Priority': '1',
            'X-MSMail-Priority': 'High',
            'List-Unsubscribe': '<mailto:unsubscribe@techmorphers.com>',
        },
    });
    
    return response;
}   


export const sendTwoFactorTokenEmail = async (email: string, token: string) => {
    const htmlTemplate = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Two-Factor Authentication Code - StackPilot</title>
        <!--[if mso]>
        <noscript>
        <xml>
        <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
        </o:OfficeDocumentSettings>
        </xml>
        </noscript>
        <![endif]-->
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333333; background-color: #f8fafc;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f8fafc;">
            <tr>
                <td align="center" style="padding: 40px 20px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1); overflow: hidden;">
                        <!-- Header with gradient -->
                        <tr>
                            <td style="background: linear-gradient(135deg, #833ab4 0%, #fd1d1d 50%, #fcb045 100%); padding: 40px 30px; text-align: center;">
                                <h1 style="margin: 0; font-size: 36px; font-weight: 800; color: #ffffff; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);">
                                    StackPilot
                                </h1>
                                <p style="margin: 8px 0 0 0; font-size: 14px; color: rgba(255, 255, 255, 0.9); font-weight: 500;">
                                    Production-Ready Next.js Scaffolding
                                </p>
                            </td>
                        </tr>
                        
                        <!-- Main content -->
                        <tr>
                            <td style="padding: 40px 30px;">
                                <h2 style="margin: 0 0 20px 0; font-size: 24px; font-weight: 700; color: #1e293b;">
                                    Two-Factor Authentication 🔐
                                </h2>
                                
                                <p style="margin: 0 0 20px 0; font-size: 16px; color: #475569; line-height: 1.6;">
                                    You're signing in to your StackPilot account. For added security, please enter the verification code below:
                                </p>
                                
                                <!-- Token Display -->
                                <div style="text-align: center; margin: 30px 0;">
                                    <div style="display: inline-block; background: linear-gradient(135deg, #833ab4 0%, #fd1d1d 50%, #fcb045 100%); padding: 20px 40px; border-radius: 12px; margin: 20px 0;">
                                        <p style="margin: 0; font-size: 32px; font-weight: 800; color: #ffffff; letter-spacing: 8px; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);">
                                            ${token}
                                        </p>
                                    </div>
                                </div>
                                
                                <p style="margin: 0 0 30px 0; font-size: 16px; color: #475569; line-height: 1.6; text-align: center;">
                                    Enter this code in your browser to complete the sign-in process.
                                </p>
                                
                                <!-- Security notice -->
                                <div style="background-color: #f0f9ff; border-radius: 12px; padding: 20px; margin: 30px 0; border: 1px solid #bae6fd; border-left: 4px solid #0ea5e9;">
                                    <h3 style="margin: 0 0 10px 0; font-size: 16px; font-weight: 600; color: #0369a1; display: flex; align-items: center;">
                                        🛡️ Security Information
                                    </h3>
                                    <ul style="margin: 0; padding-left: 20px; color: #075985; font-size: 14px; line-height: 1.6;">
                                        <li style="margin-bottom: 8px;">This code will expire in <strong>5 minutes</strong></li>
                                        <li style="margin-bottom: 8px;">Never share this code with anyone else</li>
                                        <li style="margin-bottom: 8px;">Only enter this code on the official StackPilot website</li>
                                        <li>If you didn't try to sign in, please secure your account immediately</li>
                                    </ul>
                                </div>
                                
                                <p style="margin: 0 0 10px 0; font-size: 14px; color: #64748b; text-align: center;">
                                    Having trouble? Make sure you're entering the code within 5 minutes of receiving this email.
                                </p>
                                
                                <p style="margin: 0; font-size: 14px; color: #64748b; text-align: center;">
                                    If you didn't request this code, please contact our support team immediately.
                                </p>
                            </td>
                        </tr>
                        
                        <!-- Footer -->
                        <tr>
                            <td style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                                <p style="margin: 0 0 10px 0; font-size: 14px; font-weight: 600; color: #1e293b;">
                                    StackPilot Team
                                </p>
                                <p style="margin: 0 0 15px 0; font-size: 12px; color: #64748b;">
                                    Scaffold modern, production-ready Next.js apps in seconds
                                </p>
                                <p style="margin: 0; font-size: 11px; color: #94a3b8;">
                                    © 2024 StackPilot. All rights reserved.
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `;

    const response = await resend.emails.send({
        from: "StackPilot <noreply@techmorphers.com>",
        to: email,
        subject: "🔒 Two-Factor Authentication Code - StackPilot",
        html: htmlTemplate,
        headers: {
            'X-Priority': '1',
            'X-MSMail-Priority': 'High',
            'List-Unsubscribe': '<mailto:unsubscribe@techmorphers.com>',
        },
    });
    
    return response;
}