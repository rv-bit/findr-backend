import nodemailer from "nodemailer";
import logger from "../utils/logger.js";

if (!process.env.EMAIL_SMPT_HOST) throw new Error('EMAIL_SMPT_HOST is not defined');
if (!process.env.EMAIL_SMPT_PORT) throw new Error('EMAIL_SMPT_PORT is not defined');
if (!process.env.EMAIL_SMPT_USER) throw new Error('EMAIL_SMPT_USER is not defined');
if (!process.env.EMAIL_SMPT_PASSWORD) throw new Error('EMAIL_SMPT_PASSWORD is not defined');
if (!process.env.EMAIL_FROM) throw new Error('EMAIL_FROM is not defined');

interface EmailProps {
    to: string; 
    subject: string;
    text?: string;
    html?: string;
}

const transport = nodemailer.createTransport({
    host: process.env.EMAIL_SMPT_HOST,
    port: parseInt(process.env.EMAIL_SMPT_PORT),
    auth: {
        user: process.env.EMAIL_SMPT_USER,
        pass: process.env.EMAIL_SMPT_PASSWORD
    },
    secure: true,
    tls: {
        rejectUnauthorized: false
    },
});

if (process.env.NODE_ENV !== 'test') {
    transport
        .verify()
        .then(() => logger.info('Connected to email server'))
        .catch(() =>
            logger.warn(
                'Unable to connect to email server. Make sure you have configured the SMTP options in .env'
            )
        );
}

/**
 * Send an email
    * @param {EmailProps} options - The email options
    * @param {string} options.to - The email address to send the email to
    * @param {string} options.subject - The subject of the email
    * @param {string} [options.text] - The text version of the email
    * @param {string} [options.html] - The HTML version of the email
    * @returns {Promise}
*/
export const sendEmail = async (options: EmailProps) => {
    await transport.sendMail({
        ...options,
        from: process.env.EMAIL_FROM,
    });
};