import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import generateToken from '../helpers/helper.js';
import validateUser from '../validation/validation.js';
import responseHandler from '../helpers/response.js';

export const registerUser = async (req, res) => {
  const { error } = validateUser(req.body);
  if (error) {
    return responseHandler.badRequest(res, error.details[0].message);
  }

  const { username, email, password, role } = req.body;

  if (!['user', 'retailer'].includes(role)) {
    return responseHandler.badRequest(res, 'Invalid role');
  }

  try {
    let user = await User.findOne({ email });
    if (user) return responseHandler.badRequest(res, 'User already exists');

    const hashedPassword = await bcrypt.hash(password, 10);
    user = new User({ username, email, password: hashedPassword, role });
    await user.save();

    return responseHandler.created(res, `${role} registered successfully`, user);
  } catch (error) {
    return responseHandler.error(res, 'Server error');
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return responseHandler.badRequest(res, 'Invalid credentials');

    // Admin Login Logic
    if (user.role === 'admin') {
      const adminEmail = process.env.ADMIN_EMAIL;
      const adminPassword = process.env.ADMIN_PASSWORD;
      const hashedAdminPassword = await bcrypt.hash(adminPassword, 10);

      if (email !== adminEmail) {
        return responseHandler.badRequest(res, 'Invalid Credentials');
      }

      const isMatch = await bcrypt.compare(password, hashedAdminPassword);
      if (!isMatch) {
        return responseHandler.badRequest(res, 'Invalid Password Credentials');
      }
    } else {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return responseHandler.badRequest(res, 'Invalid credentials');
    }

    const token = generateToken(user._id, user.role);

    return responseHandler.success(res, 'Login Successfully', {
      token,
      role: user.role,
    });
  } catch (error) {
    return responseHandler.error(res, 'Server error');
  }
};

export const logoutController = async (req, res) => {
  try {
    const { authorization } = req.headers;
    if (!authorization) {
      return responseHandler.error(res, 'Unauthorized', 401);
    }

    const token = authorization.replace('Bearer', '').trim();
    if (!token) {
      return responseHandler.error(res, 'Token not provided', 401);
    }

    return responseHandler.success(res, 'Logout successful');
  } catch (error) {
    return responseHandler.error(res, 'Failed to log out');
  }
};
