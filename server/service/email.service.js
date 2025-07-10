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

export const sendWelcomeEmail = async (user) => {
  const mailOptions = {
    to: user.email,
    subject: "Welcome to Our Service",
    text: `Hello ${user.name},\n\nThank you for registering with us using this email: ${user.email}! We're excited to have you on board.\n\nBest regards,\nThe Team`,
    html: `<div style="font-family: Arial, sans-serif; color: #333;">
      <h2>Welcome to Our Service!</h2>
      <p>Hello ${user.name},</p>
      <p>Thank you for registering with us using this email: <strong>${user.email}</strong>!</p>
      <p>We're excited to have you on board.</p>
      <p>Best regards,<br>The Team</p>
    </div>`,
  };

  return await sendEmail(mailOptions);
};

export const sendOTPEmail = async (user, otp, type = "verification") => {
  const isVerification = type === "verification";

  const subject = isVerification
    ? "Account Verification OTP"
    : "Password Reset OTP";

  const text = isVerification
    ? `Your OTP for account verification is: ${otp}. It is valid for 10 minutes.`
    : `Your OTP for resetting your password is: ${otp}. Use this OTP to proceed with resetting your password. It is valid for 10 minutes.`;

  const html = isVerification
    ? `<div style="font-family: Arial, sans-serif; color: #333;">
        <h2>Account Verification</h2>
        <p>Hello ${user.name},</p>
        <p>Your OTP for account verification is: <strong>${otp}</strong></p>
        <p>It is valid for 10 minutes.</p>
        <p>Best regards,<br>The Team</p>
      </div>`
    : `<div style="font-family: Arial, sans-serif; color: #333;">
        <h2>Password Reset</h2>
        <p>Hello ${user.name},</p>
        <p>Your OTP for resetting your password is: <strong>${otp}</strong></p>
        <p>Use this OTP to proceed with resetting your password.</p>
        <p>It is valid for 10 minutes.</p>
        <p>Best regards,<br>The Team</p>
      </div>`;

  const mailOptions = {
    to: user.email,
    subject,
    text,
    html,
  };

  return await sendEmail(mailOptions);
};
