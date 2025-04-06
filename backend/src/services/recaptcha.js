import fetch from 'node-fetch';

export async function verifyRecaptcha(captchaToken) {
  if (!captchaToken) return false;
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${captchaToken}`;

  try {
    const resp = await fetch(verifyUrl, { method: 'POST' });
    const json = await resp.json();
    return json.success === true;
  } catch (err) {
    console.error('reCAPTCHA verification error:', err);
    return false;
  }
}
