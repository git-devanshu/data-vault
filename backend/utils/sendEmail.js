const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.USER,
        pass: process.env.PASS,
    },
    tls: {
        rejectUnauthorized: false,
    },
});

const sendSignupMail = (emailid, name) => {
    try{
        const info = transporter.sendMail({
            from: process.env.USER,
            to: emailid,
            subject: 'Welcome to DataVault – Registration Successful',
            html: `
                <div style="font-family: Arial, sans-serif; background-color: #121826; color: #fefefe; padding: 30px; border-radius: 8px;">
                    <div style="max-width: 600px; margin: auto; background-color: #1b2232; padding: 30px; border-radius: 8px;">
                        <h2 style="color: #2daaff;">Welcome, ${name}!</h2>
                        <p style="font-size: 16px; line-height: 1.6;">
                            Your registration at <strong>DataVault</strong> has been successfully completed.
                        </p>
                        <p style="font-size: 16px; line-height: 1.6;">
                            You now have secure access to manage your data in one place. Stay safe and enjoy a seamless experience with us.
                        </p>
                        <hr style="border-color: #2daaff; margin: 20px 0;">
                        <p style="margin-top: 30px; font-size: 14px; color: #fefefe;">
                            Thank you,<br/>
                            <span style="color: orange;">DataVault</span>
                        </p>
                    </div>
                </div>
            `
        });
        console.log("Signup email sent to:", name);
    } 
    catch(error){
        console.log("Error sending signup email", error);
    }
};


const sendVFCodeMail = (emailid, vfcode) => {
    try{
        const info = transporter.sendMail({
            from: process.env.USER,
            to: emailid,
            subject: `${vfcode} – DataVault Password Reset`,
            html: `
                <div style="font-family: Arial, sans-serif; background-color: #121826; color: #fefefe; padding: 30px;">
                    <div style="max-width: 600px; margin: auto; background-color: #1b2232; padding: 30px; border-radius: 8px;">
                        <h2 style="color: #2daaff; margin-bottom: 10px;">Reset Your DataVault Password</h2>
                        <p style="font-size: 16px; line-height: 1.6;">
                            We received a request to reset your password. Use the following one time verification code to proceed:
                        </p>
                        <div style="margin: 20px 0; text-align: center;">
                            <span style="display: inline-block; background-color: #2daaff; color: #121826; font-size: 24px; padding: 12px 24px; border-radius: 6px; font-weight: bold;">
                                ${vfcode}
                            </span>
                        </div>
                        <p style="font-size: 14px; color: #aaa;">
                            This code is valid only once. If you have requested multiple verification codes, only the most recent code is valid.
                        </p>
                        <hr style="border-color: #2daaff; margin: 30px 0;">
                        <b style="font-size: 14px; color: #aaa;">
                            If you haven't requested this code, please do not share this code with anyone.
                        </b>
                        <hr style="border-color: #2daaff; margin: 30px 0;">
                        <p style="font-size: 14px; color: #fefefe;">
                            Thank you,<br/>
                            <span style="color: orange;">DataVault</span>
                        </p>
                    </div>
                </div>
            `
        });
        console.log("Verification code email sent");
    }
    catch(error){
        console.log("Error sending verification email", error);
    }
};

const sendIssueReportEmail = (emailid, name, title, description) => {
    try {
        const info = transporter.sendMail({
            from: process.env.USER,
            to: process.env.USER,
            subject: `DataVault Issue Report`,
            html: `
                <div style="font-family: Arial, sans-serif; background-color: #121826; color: #2daaff; padding: 30px;">
                    <div style="max-width: 600px; margin: auto; background-color: #1b2232; padding: 30px; border-radius: 8px;">
                        <h2 style="color: #2daaff; margin-bottom: 10px;">New Issue Reported</h2>

                        <p style="font-size: 16px; margin-bottom: 5px; color: #ddd;">
                            <b>Title:</b> ${title}
                        </p>

                        <p style="font-size: 15px; line-height: 1.6; margin-top: 10px; color: #ddd;">
                            ${description}
                        </p>

                        <hr style="border-color: #2daaff; margin: 30px 0;">

                        <div style="font-size: 14px; color: #ddd; margin-top: 20px;">
                            <p style="margin: 5px 0;">
                                <b>Reported By:</b> ${name}
                            </p>
                            <p style="margin: 5px 0;">
                                <b>Email:</b> ${emailid}
                            </p>
                        </div>

                        <hr style="border-color: #2daaff; margin: 30px 0;">

                        <p style="font-size: 14px; color: #fefefe;">
                            <span style="color: orange;">DataVault Issue Reporting System</span>
                        </p>
                    </div>
                </div>
            `
        });
        console.log("Issue report email sent");
    } 
    catch(error){
        console.log("Error sending issue report email", error);
    }
};


module.exports = {sendSignupMail, sendVFCodeMail, sendIssueReportEmail};