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


const Joi = require('joi');

const bannerValidationSchema = Joi.object({
    title: Joi.string()
        .min(3)
        .max(100)
        .required()
        .messages({
            'string.base': 'Title should be a type of text.',
            'string.empty': 'Title is required.',
            'string.min': 'Title must be at least 3 characters long.',
            'string.max': 'Title cannot exceed 100 characters.'
        }),

    discount: Joi.string()
        .pattern(/^\d+%$/)
        .required()
        .messages({
            'string.empty': 'Discount is required.',
            'string.pattern.base': 'Discount must be a percentage, e.g., "20%".'
        }),

    imageURL: Joi.string()
        .uri()
        .pattern(/^https?:\/\/.*\.(jpeg|jpg|png|gif|webp)$/i)
        .messages({
            'string.uri': 'Image URL must be a valid URL.',
            'string.pattern.base': 'Please provide a valid image URL ending with jpeg, jpg, png, gif, or webp.'
        })
});

module.exports = { bannerValidationSchema };



const { bannerValidationSchema } = require('./banner.validation');
const Banner = require('./banner.model');

const createBanner = async (req, res) => {
    try {
        // Validate the incoming data
        const { error } = bannerValidationSchema.validate(req.body);

        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        // Save the validated data to the database
        const banner = new Banner(req.body);
        await banner.save();
        res.status(201).json({ message: 'Banner created successfully.', banner });
    } catch (err) {
        res.status(500).json({ message: 'Internal server error.', error: err.message });
    }
};

module.exports = { createBanner };
