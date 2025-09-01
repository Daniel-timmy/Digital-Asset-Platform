import { GOOGLE_MAIL_USER, GOOGLE_MAIL_PASSWORD } from "../config/env";
import { UserService } from "../services/user.service";
import nodemailer from 'nodemailer';
import logger from "../logger/app.logger";

// For other email providers, use their SMTP settings (host, port, auth).

export async function sendEmail(userId: string, subject: string, message: string) {
  try {
    logger.info(`Sending email to user ID: ${userId}, subject: ${subject}`);

    if (!userId) {
      logger.warn(`Email sending failed: Missing userId`);
      throw new Error("User ID required");
    }

    if (!subject || typeof subject !== "string" || subject.trim() === "") {
      logger.warn(`Email sending failed for user ID: ${userId}: Invalid or missing subject`);
      throw new Error("Subject is required");
    }

    if (!message || typeof message !== "string" || message.trim() === "") {
      logger.warn(`Email sending failed for user ID: ${userId}: Invalid or missing message`);
      throw new Error("Message content is required");
    }

    if (!GOOGLE_MAIL_USER || !GOOGLE_MAIL_PASSWORD) {
      logger.error(`Email sending failed for user ID: ${userId}: Missing GOOGLE_MAIL_USER or GOOGLE_MAIL_PASSWORD`);
      throw new Error("Email configuration is missing");
    }

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      auth: {
        user: GOOGLE_MAIL_USER,
        pass: GOOGLE_MAIL_PASSWORD,
      },
    });

    const userService = new UserService();
    const user = await userService.findOne(userId);
    if (!user) {
      logger.warn(`Email sending failed: User not found for ID: ${userId}`);
      throw new Error("User not found");
    }

    if (!user.email || !/\S+@\S+\.\S+/.test(user.email)) {
      logger.warn(`Email sending failed: Invalid or missing email for user ID: ${userId}`);
      throw new Error("Valid user email required");
    }

    const mailOptions = {
      from: GOOGLE_MAIL_USER,
      to: user.email,
      subject: subject,
      text: message,
      // html: `<p>${message}</p>`, // Optional: HTML body
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email sent successfully to ${user.email} for user ID: ${userId}, message ID: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error(`Error sending email to user ID: ${userId}: ${error}`);
    throw new Error('Failed to send email');
  }
}

export async function sendEmailGeneric(email: string, subject: string, message: string) {
  try {
    logger.info(`Sending booking email to: ${email}, subject: ${subject}`);

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      logger.warn(`Booking email sending failed: Invalid or missing email: ${email}`);
      throw new Error("Valid email address required");
    }

    if (!subject || typeof subject !== "string" || subject.trim() === "") {
      logger.warn(`Booking email sending failed for email: ${email}: Invalid or missing subject`);
      throw new Error("Subject is required");
    }

    if (!message || typeof message !== "string" || message.trim() === "") {
      logger.warn(`Booking email sending failed for email: ${email}: Invalid or missing message`);
      throw new Error("Message content is required");
    }

    if (!GOOGLE_MAIL_USER || !GOOGLE_MAIL_PASSWORD) {
      logger.error(`Booking email sending failed for email: ${email}: Missing GOOGLE_MAIL_USER or GOOGLE_MAIL_PASSWORD`);
      throw new Error("Email configuration is missing");
    }

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      auth: {
        user: GOOGLE_MAIL_USER,
        pass: GOOGLE_MAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: GOOGLE_MAIL_USER,
      to: email,
      subject: subject,
      text: message,
      // html: `<p>${message}</p>`, // Optional: HTML body
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Booking email sent successfully to: ${email}, message ID: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error(`Error sending booking email to: ${email || 'unknown'}: ${error}`);
    throw new Error('Failed to send email');
  }
}

export async function sendVerificationEmail(toEmail: string, code: string) {
  try {
    logger.info(`Sending verification email to: ${toEmail}, code: ${code}`);

    if (!toEmail || !/\S+@\S+\.\S+/.test(toEmail)) {
      logger.warn(`Verification email sending failed: Invalid or missing email: ${toEmail}`);
      throw new Error("Valid email address required");
    }

    if (!code || typeof code !== "string" || code.trim() === "") {
      logger.warn(`Verification email sending failed for email: ${toEmail}: Invalid or missing code`);
      throw new Error("Verification code is required");
    }

    if (!GOOGLE_MAIL_USER || !GOOGLE_MAIL_PASSWORD) {
      logger.error(`Verification email sending failed for email: ${toEmail}: Missing GOOGLE_MAIL_USER or GOOGLE_MAIL_PASSWORD`);
      throw new Error("Email configuration is missing");
    }

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      auth: {
        user: GOOGLE_MAIL_USER,
        pass: GOOGLE_MAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: GOOGLE_MAIL_USER,
      to: toEmail,
      subject: "Email Verification",
      text: `Welcome to BDA! Your verification code is ${code}. This code is valid for 5 minutes.`,
      // html: `<p>Welcome to BDA! Your verification code is <strong>${code}</strong>. This code is valid for 5 minutes.</p>`, // Optional: HTML body
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Verification email sent successfully to: ${toEmail}, message ID: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error(`Error sending verification email to: ${toEmail || 'unknown'}: ${error}`);
    throw new Error('Failed to send email');
  }
}

export default sendEmail;