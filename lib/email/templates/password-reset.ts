
export const getPasswordResetTemplate = (username: string, resetLink: string) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Inter', sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #ef4444; color: #fff; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { padding: 30px 20px; border: 1px solid #eee; border-top: none; border-radius: 0 0 8px 8px; }
    .button { display: inline-block; padding: 12px 24px; background-color: #ef4444; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
    .footer { text-align: center; font-size: 12px; color: #666; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Password Reset Request 🔒</h1>
    </div>
    <div class="content">
      <p>Hi ${username},</p>
      <p>We received a request to reset your password for your DevSocial account. If you didn't make this request, you can safely ignore this email.</p>
      
      <div style="text-align: center;">
        <a href="${resetLink}" class="button">Reset Password</a>
      </div>
      
      <p>This link will expire in 1 hour.</p>
      
      <p>Stay secure,<br>The DevSocial Team</p>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} DevSocial. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;
