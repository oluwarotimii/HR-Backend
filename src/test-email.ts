import { Resend } from 'resend';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get the API key from environment variables
const apiKey = process.env.RESEND_API_KEY;
console.log('API Key from env:', apiKey); // Debug log

if (!apiKey) {
  console.error('RESEND_API_KEY is not set in environment variables');
  process.exit(1);
}

const resend = new Resend(apiKey);

async function testEmail() {
  try {
    const result = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'oluwarotimiadewumi@gmail.com',
      subject: 'Test Email from HR Management System',
      html: '<p>Congrats on sending your <strong>first email</strong> from the HR Management System!</p>'
    });

    console.log('Email sent successfully!');
    console.log('Response:', result);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

testEmail();