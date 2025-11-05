import dotenv from "dotenv";
import nodemailer from "nodemailer";
dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env["SMTP_HOST"],
  port: Number(process.env["SMTP_PORT"]),
  secure: false,
  auth: {
    user: process.env["SMTP_USER"],
    pass: process.env["SMTP_PASS"],
  },
});

export async function sendAlertEmail(subject: string, message: string) {
  await transporter.sendMail({
    from: `"API Monitor" <${process.env["SMTP_USER"]}>`,
    to: process.env["ALERT_RECIPIENT"],
    subject,
    text: message,
  });
}
