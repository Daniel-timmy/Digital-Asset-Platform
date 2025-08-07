import { GOOGLE_MAIL_PASSWORD, GOOGLE_MAIL_USER } from "../config/env";
import { UserService } from "../services/user.service";
import nodemailer from 'nodemailer';

// For other email providers, use their SMTP settings (host, port, auth).

async function sendEmail(userId: string, subject: string, message: string) {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail', // Use your email provider
      auth: {
        user: GOOGLE_MAIL_USER, // Your email
        pass: GOOGLE_MAIL_PASSWORD, // Your email password or app-specific password
      },
    });
    const userService = new UserService();
    const user = await userService.findOne(userId);
    if (!user) {
        throw new Error("User not found");
    }

    const mailOptions = {
      from: GOOGLE_MAIL_USER,
      to: user.email,
      subject: subject,
      text: message, // Plain text body
      // html: `<p>${message}</p>`, // Optional: HTML body
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
}

export default sendEmail;
