// validation/userValidation.js

import Joi from 'joi';

const validateUser = (data) => {
  const schema = Joi.object({
    username: Joi.string()
      .alphanum() 
      .min(3)
      .max(30)
      .required()
      .messages({
        "string.base": "Username should be a text.",
        "string.alphanum": "Username can only contain letters and numbers. And No Spacing Is Allowed FOR User Name",
        "string.empty": "Username cannot be empty.",
        "string.min": "Username should have at least 3 characters.",
        "string.max": "Username should have at most 30 characters.",
        "any.required": "Username is a required ."
      }),
      
    email: Joi.string().email().required().messages({
      "string.email": "Please enter a valid email address. For Example - vanshkushwaha34@gmail.com",
      "any.required": "Email is a required ."
    }),
    
    password: Joi.string().alphanum()
     .min(8).max(20).required().messages({
      "string.alphanum": "No Spacing Is Allowed FOR Password",
      "string.min": "Password should have at least 8 characters.",
      "string.max": "email should have at most 20 characters.",
      "any.required": "Password is a required ."
    }),
    
    role: Joi.string().valid('user', 'retailer', 'admin').required()
  });

  return schema.validate(data);
};

export default validateUser;
