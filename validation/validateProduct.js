
import Joi from 'joi';

const validateProduct = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(100).required().messages({
      "string.base": "Product name must be a string.",
      "string.empty": "Product name cannot be empty.",
      "string.min": "Product name should have at least 3 characters.",
      "string.max": "Product name should have at most 100 characters.",
      "any.required": "Product name is required."
    }),
    
    price: Joi.number().positive().required().messages({
      "number.base": "Price must be a number.",
      "number.positive": "Price must be a positive number.",
      "any.required": "Price is required."
    }),
    
    stock: Joi.number().integer().min(0).required().messages({
      "number.base": "Stock must be a number.",
      "number.integer": "Stock must be an integer.",
      "number.min": "Stock cannot be negative.",
      "any.required": "Stock is required."
    }),
    
    retailer: Joi.string().regex(/^[0-9a-fA-F]{24}$/).optional().messages({
      "string.pattern.base": "Retailer ID must be a valid MongoDB ObjectId.",
      "any.required": "Retailer ID is required."
    }),
    
    status: Joi.string().valid('available', 'sold').optional().messages({
      "any.only": "Status must be either 'available' or 'sold'."
    })
  });

  return schema.validate(data);
};

export default validateProduct;
