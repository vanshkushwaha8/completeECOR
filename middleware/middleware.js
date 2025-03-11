import jwt from 'jsonwebtoken';


export default  authenticate = (allowedRoles = []) => {
  return (req, res, next) => {
    const token = req.header('Authorization')?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded; // contains { id, role }
      if (allowedRoles.length && !allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Access forbidden: Insufficient permissions' });
      }
      next();
    } catch (error) {
      res.status(401).json({ message: 'Token is not valid' });
    }
  };
};



// Add this for named export
export const authorize = (roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Access denied' });
  }
  next();
};
