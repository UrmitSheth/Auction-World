import nodemailer from "nodemailer";
import dotenv from "dotenv"
dotenv.config()

let transporter;

const initializeTransporter = async () => {
    if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
        // Use real Gmail if configured
        transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PASSWORD
            }
        });
        console.log("📨 NodeMailer: Using Gmail to send emails.");
    } else {
        // Fallback to ethereal email for testing
        console.log("⚠️ No GMAIL_APP_PASSWORD found in .env! Falling back to test email account...");
        let testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: testAccount.user, // generated ethereal user
                pass: testAccount.pass, // generated ethereal password
            },
        });
        console.log("📨 NodeMailer: Using Ethereal Email (Test Account).");
    }
};

initializeTransporter();

export const handleSendMessage = async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;
        
        // Wait for transporter to be ready if it's still initializing
        if (!transporter) {
             return res.status(500).json({ error: "Email service is still initializing. Try again in a few seconds." });
        }

        const senderEmail = process.env.GMAIL_USER || "test_admin@auctionworld.com";

        const infoAdmin = await transporter.sendMail({
            from: `"Auction World Contact Form" <${senderEmail}>`,
            to: senderEmail,
            replyTo: email,
            subject: `Contact Form: ${subject}`,
            html: adminEmailTemplate(name, email, subject, message)
        });

        const infoUser = await transporter.sendMail({
            from: `"Auction World Community and Support" <${senderEmail}>`,
            to: email,
            subject: `Thank you for your message - Auction World`,
            html: userEmailTemplate(name, email, subject, message)
        });

        if (!process.env.GMAIL_APP_PASSWORD) {
            console.log("==========================================");
            console.log("📨 Test Admin Email Preview: ", nodemailer.getTestMessageUrl(infoAdmin));
            console.log("📨 Test User Reply Preview: ", nodemailer.getTestMessageUrl(infoUser));
            console.log("==========================================");
        }

        res.status(200).json({ message: "Message sent succesfully" });
    } catch (error) {
        console.error("Error sending email:", error);
        return res.status(500).json({ error: `Email Error: ${error.message || "Unknown error"}` })
    }
}
 


const userEmailTemplate = (name, email, subject, message) => `
  <!DOCTYPE html>
  <html lang="en" style="margin: 0; padding: 0;">
    <head>
      <meta charset="UTF-8" />
      <title>Contact Confirmation</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f2f4f6;
          margin: 0;
          padding: 20px;
          color: #333;
        }
        .container {
          max-width: 600px;
          margin: auto;
          background: #ffffff;
          padding: 30px;
          border-radius: 10px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }
        .btn {
          display: inline-block;
          background-color: #007bff;
          color: #fff;
          text-decoration: none;
          padding: 12px 24px;
          border-radius: 6px;
          font-weight: bold;
          margin: 20px 0;
        }
        .footer {
          font-size: 12px;
          color: #888;
          text-align: center;
          margin-top: 30px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <p>Hi <strong>${name}</strong>,</p>

        <p>
          Thank you for contacting us. We’ve received your message and our team will get back to you shortly. Here's a copy of what you submitted:
        </p>

        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>

        <p>
          If this wasn’t you or you need immediate help, feel free to reply directly to this email.
        </p>

        <div class="footer">
          &copy; 2026 Auction World. All rights reserved. <br />
          This is an automated confirmation. Please do not reply.
        </div>
      </div>
    </body>
  </html>
`;

const adminEmailTemplate = (name, email, subject, message) => `
<!DOCTYPE html>
  <html lang="en" style="margin: 0; padding: 0;">
    <head>
      <meta charset="UTF-8" />
      <title>Contact Confirmation</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f2f4f6;
          margin: 0;
          padding: 20px;
          color: #333;
        }
        .container {
          max-width: 600px;
          margin: auto;
          background: #ffffff;
          padding: 30px;
          border-radius: 10px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }
      </style>
    </head>
    <body>
      <div class="container">
      <p>
          New Contact Form Submission from Auction World
        </p>

        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>

      </div>
    </body>
    </html>
`;