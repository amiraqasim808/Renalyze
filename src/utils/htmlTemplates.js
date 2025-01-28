export const signUpTemp = (link) => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Account Confirmation</title>
</head>
<body>
    <div style="max-width: 600px; margin: auto; padding: 20px; text-align: center; font-family: Arial, sans-serif;">
        <h2>Account Confirmation</h2>
        <p>Thank you for signing up! To activate your account, please click the confirmation link below:</p>
        
        <a href="${link}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: #fff; text-decoration: none; border-radius: 5px;">Confirm Account</a>

        <p>If the button above doesn't work, you can also click the following link or copy and paste it into your browser:</p>
        <p><a href="${link}">${link}</a></p>

        <p>This link will expire in 24 hours for security reasons.</p>

        <p>If you did not sign up for an account on our website, please ignore this email.</p>
    </div>
</body>
</html>
`;
