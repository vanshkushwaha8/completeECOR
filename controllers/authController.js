import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import generateToken from '../helpers/helper.js'; 
import validateUser from '../validation/validation.js';


export const registerUser = async (req, res) => {
  const { error } = validateUser(req.body);
  if (error) {
    return res.status(400).json({ success: false, message: error.details[0].message });
  }
  const { username, email, password, role } = req.body;
  
  if (!['user', 'retailer'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }

  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    user = new User({ username, email, password: hashedPassword, role });
    await user.save();

    res.status(201).json({success:true, message: `${role} registered successfully`, user});
  } catch (error) {
    res.status(500).json({success:false, message: 'Server error' });
  }
};

export const loginUser = async (req, res) => {
  const { email, password, } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({success:false, message: 'Invalid credentials' });
    //for admin login 

    if(user.role ==='admin'){
      
      const adminEmail = process.env.ADMIN_EMAIL;
      const adminPassword = process.env.ADMIN_PASSWORD;
      const hasdedAdminPassword = await bcrypt.hash(adminPassword,10);

      if(email !== adminEmail){
     return res.status(400).json({success:false, message:"Invalid Credentials"});
      }
      const isMatch = await bcrypt.compare(password,hasdedAdminPassword);
      if(!isMatch){
      return res.status(400).json({success:false,message:"Invalid Password Credentails"})
      }
    }else{
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({success:false, message: 'Invalid credentials' });
    }

    const token = generateToken(user._id, user.role);

    return res.status(200).json({
      success: true,
      message: 'Login Successfully',
      token: token,
      role: user.role, 
    });

  } catch (error) {
    res.status(500).json({success:false, message: 'Server error' });
  }
};

export const logoutController = async (req, res) => {
  try {
      const { authorization } = req.headers;
      if (!authorization) {
          return res.status(401).json({success:false, message: 'Unauthorized' });
      }

      const token = authorization.replace('Bearer', '').trim();
      if (!token) {
          return res.status(401).json({ success:false, message: 'Token not provided' });
      }

      
    //  res.clearCookie('token');
      res.status(200).send({success:true, message: 'Logout successful' });
  } catch (error) {
      console.error(error);
      res.status(500).send({success:false, message: 'Failed to log out' });
  }
};


