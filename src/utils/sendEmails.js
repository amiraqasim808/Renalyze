import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

export const sendEmail = async ({ subject, to, html, attachments = [] }) => {
  //sender
  const transporter = nodemailer.createTransport({
    host: "localhost",
    service: "gmail",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASS,
    },
  });
  //receiver
  if (html) {
    const info = await transporter.sendMail({
      from: `"AmiraCommerce" <${process.env.EMAIL}>`,
      to,
      subject,
      html,
    });

    if (info.rejected.length > 0) return false;
    return true;
  } else {
    const info = await transporter.sendMail({
      from: `"AmiraCommerce" <${process.env.EMAIL}>`,
      to,
      subject,
      attachments,
    });

    if (info.rejected.length > 0) return false;
    return true;
  }
};
