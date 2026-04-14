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