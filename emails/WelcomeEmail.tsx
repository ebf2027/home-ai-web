export const getWelcomeEmailHtml = (firstName: string) => {
    return `
    <div style="background-color: #0A0A0A; color: #ffffff; font-family: sans-serif; padding: 40px; border-radius: 8px; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #D4AF37; font-size: 24px; font-weight: bold;">
        Home<span style="color: #3B82F6;">RenovAi</span> ✨
      </h1>
      <p style="font-size: 18px; line-height: 1.6;">
        Hi ${firstName}, welcome to the future of interior design!
      </p>
      <p style="font-size: 16px; color: #a1a1aa;">
        We are thrilled to have you with us. Your account is now active, and you have 3 free credits to start transforming your home today.
      </p>
      <div style="margin-top: 30px;">
        <a href="https://homerenovai.com" style="background-color: #D4AF37; color: #000000; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">
          Start Creating Now
        </a>
      </div>
      <p style="margin-top: 40px; font-size: 12px; color: #52525b;">
        Best regards,<br />
        The HomeRenovAi Team
      </p>
    </div>
  `;
};