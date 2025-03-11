const responseHandler = {
     success: (res, message, data = null, statusCode = 200) => {
       return res.status(statusCode).json({
         success: true,
         statusCode,
         message,
         data,
       });
     },
   
     error: (res, message, statusCode = 500) => {
       return res.status(statusCode).json({
         success: false,
         statusCode,
         message,
       });
     },
   
     notFound: (res, message = 'Resource not found') => {
       return res.status(404).json({
         success: false,
         statusCode: 404,
         message,
       });
     },
   
     badRequest: (res, message = 'Bad request') => {
       return res.status(400).json({
         success: false,
         statusCode: 400,
         message,
       });
     },
   
     created: (res, message, data = null) => {
       return res.status(201).json({
         success: true,
         statusCode: 201,
         message,
         data,
       });
     },
   };
   
   export default responseHandler;
   