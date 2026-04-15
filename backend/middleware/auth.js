import jwt from 'jsonwebtoken';

export default function auth(req, res, next) {
    try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ success:false, message: 'No token' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { _id: decoded.userId };
    req.userId = decoded.userId;


    next();
  }  catch (err) {
        return res.status(401).json({
            success: false,
            message: 'Token is not valid'
        });
    }
}

export const adminAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: 'No token' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) return res.status(401).json({ message: 'User not found' });
    if (!user.isAdmin) return res.status(403).json({ message: 'Admin access required' });

    req.user = user;
    req.userId = user._id;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}