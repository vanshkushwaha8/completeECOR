import jwt from 'jsonwebtoken';

export const authMiddleware = (allowedRoles = []) => {
  return (req, res, next) => {
    const token = req.header('Authorization')?.replace("Bearer ", "");
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      console.log("Decoded Token:", decoded); // Debug: Check what's inside the token

      if (!decoded || !decoded.id || !decoded.role) {
        return res.status(401).json({ message: 'Invalid token structure. Make sure the token contains an ID and role.' });
      }

      req.user = { id: decoded.id, role: decoded.role }; // Attaching properly to req.user

      if (allowedRoles.length && !allowedRoles.includes(decoded.role)) {
        return res.status(403).json({ message: `Access Denied: You Are Not a ${allowedRoles.join(" or ")}` });
      }

      next(); // Proceed to the next middleware or controller
    } catch (error) {
      console.error("JWT Error:", error.message);
      return res.status(401).json({ message: 'Token is not valid' });
    }
  };
};
