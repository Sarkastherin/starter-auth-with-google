import nodemailer from "nodemailer";

// 1. Inicializamos el transportador con las variables del .env
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "2525"),
  secure: false, // Mailtrap no requiere SSL directo en este puerto
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

// 2. Exportamos la función encargada de despachar los correos
export const sendEmail = async ({ to, subject, html }: SendEmailOptions) => {
  const mailOptions = {
    from: '"Stack Base Auth" <no-reply@tuapp.com>',
    to,
    subject,
    html,
  };

  return await transporter.sendMail(mailOptions);
};