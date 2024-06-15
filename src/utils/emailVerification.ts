import nodemailer from 'nodemailer';
import config from '../infrastructure/config';
import fs from 'fs';
import path from 'path';


const logoPath = path.resolve(__dirname, '../assets/HireHub.png');
const logoBase64 = fs.readFileSync(logoPath, { encoding: 'base64' });

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: config.EMAIL,
        pass: config.EMAIL_PASSWORD,
    },
});

export const sendOtpEmail = async (to: string, otp: string): Promise<void> => {
    const mailOptions = {
        from: config.EMAIL,
        to,
        subject: "Your OTP Code",
        text: `Your OTP code is ${otp}`,
        html: `
        <div style="font-family: Arial, sans-serif; text-align: center;">
            <div style="background-color: #f7f7f7; padding: 20px;">
                <img src="data:image/png;base64,${logoBase64}" alt="Hire Hub" style="width: 150px; height: auto;">
            </div>
            <div style="padding: 20px;">
                <h1 style="color: #333;">Your OTP Code</h1>
                <p style="font-size: 16px; color: #555;">Dear user,</p>
                <p style="font-size: 16px; color: #555;">Your OTP code is <strong style="font-size: 24px;">${otp}</strong></p>
                <p style="font-size: 16px; color: #555;">Please use this code to complete your verification process.</p>
                <p style="font-size: 16px; color: #555;">Thank you,</p>
                <p style="font-size: 16px; color: #555;">The HireHub</p>
            </div>
            <div style="background-color: #f7f7f7; padding: 20px;">
                <p style="font-size: 14px; color: #999;">&copy; 2024 Your Company. All rights reserved.</p>
                <p style="font-size: 14px; color: #999;"><a href="sreeharisree105@gmail.com" style="color: #0073e6;">www.yourcompany.com</a></p>
            </div>
        </div>
    `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log("Mail sent to ", to);
    } catch (error) {
        console.error("Error sending OTP", error);
        throw new Error("Failed to send OTP email");
    }
};
