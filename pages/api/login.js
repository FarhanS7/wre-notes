import jwt from 'jsonwebtoken';
import cookie from 'cookie';

const SECRET_KEY = process.env.JWT_SECRET_KEY || 'your-secret-key';
const ADMIN_PINS = (process.env.ADMIN_PINS || '').split(',');
const STUDENT_PINS = (process.env.STUDENT_PINS || '').split(',');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { pin, role } = req.body;

  try {
    let userData;
    
    if (role === 'admin' && ADMIN_PINS.includes(pin)) {
      userData = {
        id: 1,
        role: 'admin',
        name: 'Admin User'
      };
    } else if (role === 'student' && STUDENT_PINS.includes(pin)) {
      userData = {
        id: 2,
        role: 'student',
        name: 'Student User'
      };
    } else {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(userData, SECRET_KEY, { expiresIn: '1h' });

    res.setHeader('Set-Cookie', cookie.serialize('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600,
      path: '/'
    }));

    res.status(200).json({ user: userData });

  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
}
