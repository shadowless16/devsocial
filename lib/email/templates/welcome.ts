
export const getWelcomeEmailTemplate = (username: string, verificationLink: string) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Inter', sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #000; color: #fff; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { padding: 30px 20px; border: 1px solid #eee; border-top: none; border-radius: 0 0 8px 8px; }
    .button { display: inline-block; padding: 12px 24px; background-color: #2563eb; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
    .footer { text-align: center; font-size: 12px; color: #666; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to DevSocial! 🚀</h1>
    </div>
    <div class="content">
      <p>Hi ${username},</p>
      <p>Thanks for joining the community of ambitious developers. We're excited to have you on board!</p>
      <p>To get full access to all features, including posting and connecting with others, please verify your email address:</p>
      
      <div style="text-align: center;">
        <a href="${verificationLink}" class="button">Verify Email Address</a>
      </div>
      
      <p>If the button doesn't work, copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: #666;">${verificationLink}</p>
      
      <p>Happy coding,<br>The DevSocial Team</p>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} DevSocial. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;
