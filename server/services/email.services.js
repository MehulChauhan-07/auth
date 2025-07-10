import transporter from "../config/nodemailer.config.js";
import { SERVER_ERRORS } from "../constants/error.constants.js";

export const sendEmail = async (options) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.SENDER_EMAIL,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });

    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error(SERVER_ERRORS.EMAIL_SENDING_FAILED);
  }
};
// Enhanced email templates with professional styling and better UX

export const sendWelcomeEmail = async (user) => {
  const mailOptions = {
    to: user.email,
    subject: "🎉 Welcome to Our Platform - Let's Get Started!",
    text: `Hello ${user.name},

Welcome to our platform! We're thrilled to have you join our community.

Your account has been successfully created with the email: ${user.email}

What's next?
- Complete your profile setup
- Explore our features
- Connect with other users

If you have any questions, our support team is here to help.

Best regards,
The Team

---
Need help? Contact us at support@yourcompany.com`,

    html: `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">Welcome to Our Platform!</h1>
                <p style="color: #ffffff; margin: 10px 0 0 0; opacity: 0.9; font-size: 16px;">We're excited to have you on board</p>
            </div>
            
            <!-- Content -->
            <div style="padding: 40px 30px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                        <span style="color: white; font-size: 36px;">🎉</span>
                    </div>
                </div>
                
                <h2 style="color: #333; margin: 0 0 20px 0; font-size: 24px; text-align: center;">Hello ${user.name}!</h2>
                
                <p style="color: #666; line-height: 1.6; font-size: 16px; margin-bottom: 25px; text-align: center;">
                    Thank you for joining our community! Your account has been successfully created with the email:
                </p>
                
                <div style="background-color: #f8f9fa; border-left: 4px solid #667eea; padding: 15px 20px; margin: 25px 0; border-radius: 4px;">
                    <p style="margin: 0; color: #333; font-weight: 600; font-size: 16px;">📧 ${user.email}</p>
                </div>
                
                <div style="margin: 30px 0;">
                    <h3 style="color: #333; margin-bottom: 15px; font-size: 18px;">What's next?</h3>
                    <ul style="color: #666; line-height: 1.8; padding-left: 20px;">
                        <li>Complete your profile setup</li>
                        <li>Explore our amazing features</li>
                        <li>Connect with other users</li>
                        <li>Start your journey with us</li>
                    </ul>
                </div>
                
                <div style="text-align: center; margin: 35px 0;">
                    <a href="#" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block; font-size: 16px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);">
                        Get Started Now
                    </a>
                </div>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
                <p style="color: #666; margin: 0 0 10px 0; font-size: 14px;">Need help? We're here for you!</p>
                <p style="color: #666; margin: 0; font-size: 14px;">
                    Contact us at <a href="mailto:support@yourcompany.com" style="color: #667eea; text-decoration: none;">support@yourcompany.com</a>
                </p>
                <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e9ecef;">
                    <p style="color: #999; margin: 0; font-size: 12px;">© 2025 Your Company. All rights reserved.</p>
                </div>
            </div>
        </div>
    </body>
    </html>`,
  };

  return await sendEmail(mailOptions);
};

export const sendOTPEmail = async (user, otp, type = "verification") => {
  const isVerification = type === "verification";

  const config = {
    verification: {
      subject: "🔐 Verify Your Account - OTP Code Inside",
      title: "Account Verification",
      subtitle: "Secure your account with this verification code",
      message: "Please use the following OTP to verify your account:",
      icon: "🔐",
      color: "#10b981", // Green
    },
    reset: {
      subject: "🔑 Password Reset - OTP Code Inside",
      title: "Password Reset",
      subtitle: "Reset your password securely",
      message: "Please use the following OTP to reset your password:",
      icon: "🔑",
      color: "#f59e0b", // Orange
    },
  };

  const emailConfig = config[isVerification ? "verification" : "reset"];

  const text = `Hello ${user.name},

${emailConfig.message}

Your OTP Code: ${otp}

⏰ This code is valid for 10 minutes only.
🔒 For security reasons, please do not share this code with anyone.

If you didn't request this, please ignore this email or contact our support team.

Best regards,
The Team

---
Need help? Contact us at support@yourcompany.com`;

  const html = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${emailConfig.title}</title>
  </head>
  <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, ${emailConfig.color} 0%, ${emailConfig.color}dd 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">${emailConfig.title}</h1>
              <p style="color: #ffffff; margin: 10px 0 0 0; opacity: 0.9; font-size: 16px;">${emailConfig.subtitle}</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 40px 30px;">
              <div style="text-align: center; margin-bottom: 30px;">
                  <div style="width: 80px; height: 80px; background: linear-gradient(135deg, ${emailConfig.color} 0%, ${emailConfig.color}dd 100%); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                      <span style="color: white; font-size: 36px;">${emailConfig.icon}</span>
                  </div>
              </div>
              
              <h2 style="color: #333; margin: 0 0 20px 0; font-size: 24px; text-align: center;">Hello ${user.name}!</h2>
              
              <p style="color: #666; line-height: 1.6; font-size: 16px; margin-bottom: 25px; text-align: center;">
                  ${emailConfig.message}
              </p>
              
              <!-- OTP Display -->
            <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            border: 2px dashed ${emailConfig.color}; padding: 30px; 
            margin: 30px 0; border-radius: 12px; text-align: center;">
  <p style="margin: 0 0 15px 0; color: #333; font-size: 16px; font-weight: 600;">
    Your OTP Code
  </p>
  <div onclick="navigator.clipboard.writeText('${otp}')" 
       style="background-color: #ffffff; padding: 20px; border-radius: 8px;
              margin: 10px 0; box-shadow: 0 2px 8px rgba(0,0,0,0.1);
              font-size: 32px; font-weight: 700; color: ${emailConfig.color};
              letter-spacing: 8px; font-family: 'Courier New', monospace;
              cursor: pointer; user-select: all;">
    ${otp}
  </div>
  <p style="margin: 15px 0 0 0; color: #666; font-size: 14px;">
    Click the code above to copy it
  </p>
</div>

              
              <!-- Security Info -->
              <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px 20px; margin: 25px 0; border-radius: 4px;">
                  <div style="display: flex; align-items: flex-start;">
                      <span style="font-size: 20px; margin-right: 10px;">⚠️</span>
                      <div>
                          <p style="margin: 0 0 8px 0; color: #856404; font-weight: 600; font-size: 14px;">Security Notice</p>
                          <p style="margin: 0; color: #856404; font-size: 14px; line-height: 1.4;">
                              This code expires in <strong>10 minutes</strong>. Never share it with anyone.
                          </p>
                      </div>
                  </div>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                  <p style="color: #666; font-size: 14px; margin: 0;">
                      Didn't request this code? 
                      <a href="mailto:support@yourcompany.com" style="color: ${emailConfig.color}; text-decoration: none; font-weight: 600;">Contact Support</a>
                  </p>
              </div>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
              <p style="color: #666; margin: 0 0 10px 0; font-size: 14px;">Need help? We're here for you!</p>
              <p style="color: #666; margin: 0; font-size: 14px;">
                  Contact us at <a href="mailto:support@yourcompany.com" style="color: ${emailConfig.color}; text-decoration: none;">support@yourcompany.com</a>
              </p>
              <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e9ecef;">
                  <p style="color: #999; margin: 0; font-size: 12px;">© 2025 Your Company. All rights reserved.</p>
              </div>
          </div>
      </div>
  </body>
  </html>`;

  const mailOptions = {
    to: user.email,
    subject: emailConfig.subject,
    text,
    html,
  };

  return await sendEmail(mailOptions);
};
