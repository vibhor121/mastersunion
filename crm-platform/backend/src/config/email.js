import nodemailer from 'nodemailer';
import logger from './logger.js';

// Create email transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_PORT === '465', // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Verify email configuration
transporter.verify((error, success) => {
  if (error) {
    logger.error('Email configuration error:', error);
  } else {
    logger.info('Email server is ready to send messages');
  }
});

/**
 * Send email function
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text content
 * @param {string} options.html - HTML content
 */
export const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const info = await transporter.sendMail({
      from: `"CRM Platform" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    });

    logger.info(`Email sent: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Email templates
 */
export const emailTemplates = {
  leadAssigned: (leadName, ownerName) => ({
    subject: 'New Lead Assigned',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>New Lead Assigned</h2>
        <p>Hi ${ownerName},</p>
        <p>A new lead <strong>${leadName}</strong> has been assigned to you.</p>
        <p>Please log in to the CRM platform to view details and take action.</p>
        <br>
        <p>Best regards,<br>CRM Team</p>
      </div>
    `,
    text: `Hi ${ownerName}, A new lead ${leadName} has been assigned to you.`,
  }),

  leadStatusChanged: (leadName, oldStatus, newStatus) => ({
    subject: 'Lead Status Updated',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Lead Status Changed</h2>
        <p>The status of lead <strong>${leadName}</strong> has been updated.</p>
        <p>Old Status: <span style="color: #666;">${oldStatus}</span></p>
        <p>New Status: <span style="color: #28a745;">${newStatus}</span></p>
        <br>
        <p>Best regards,<br>CRM Team</p>
      </div>
    `,
    text: `Lead ${leadName} status changed from ${oldStatus} to ${newStatus}.`,
  }),

  activityReminder: (activityTitle, leadName, scheduledTime) => ({
    subject: 'Activity Reminder',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Activity Reminder</h2>
        <p>You have an upcoming activity:</p>
        <p><strong>${activityTitle}</strong></p>
        <p>Lead: ${leadName}</p>
        <p>Scheduled: ${scheduledTime}</p>
        <br>
        <p>Best regards,<br>CRM Team</p>
      </div>
    `,
    text: `Activity Reminder: ${activityTitle} for ${leadName} at ${scheduledTime}`,
  }),
};

export default transporter;

