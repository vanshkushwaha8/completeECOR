

import Joi from 'joi';

const validateOrder = (data) => {
  const schema = Joi.object({
    user: Joi.string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .optional()
      .messages({
        "string.pattern.base": "User ID must be a valid MongoDB ObjectId.",
        "any.required": "User ID is required."
      }),

    items: Joi.array()
      .items(
        Joi.object({
          product: Joi.string()
            .regex(/^[0-9a-fA-F]{24}$/)
            .optional()
            .messages({
              "string.pattern.base": "Product ID must be a valid MongoDB ObjectId.",
              "any.required": "Product ID is required."
            }),

          quantity: Joi.number()
            .integer()
            .min(1)
            .optional()
            .messages({
              "number.base": "Quantity must be a number.",
              "number.integer": "Quantity must be an integer.",
              "number.min": "Quantity must be at least 1.",
              "any.required": "Quantity is required."
            })
        })
      )
      .min(1)
      .optional()
      .messages({
        "array.min": "At least one item is required in the order.",
        "any.required": "Items are required."
      }),

    totalPrice: Joi.number()
      .positive()
      .optional()
      .messages({
        "number.base": "Total price must be a number.",
        "number.positive": "Total price must be a positive number.",
        "any.required": "Total price is required."
      }),

    status: Joi.string()
      .valid('pending', 'completed')
      .optional()
      .messages({
        "any.only": "Status must be either 'pending' or 'completed'."
      })
  });

  return schema.validate(data);
};

export default validateOrder;
