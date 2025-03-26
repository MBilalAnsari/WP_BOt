
import jwt from 'jsonwebtoken';

// const authMiddleware = (req, res, next) => {
//     const token = req.header('authenticate');
//     console.log(token,"token before key")
//     // console.log(token)
//     if (!token) {
//         return res.status(401).json({ message: "Unauthorized access" });
//     }
//     try {
//         const verified = jwt.verify(token, process.env.SECRET_KEY);
//         console.log(verified, "token after key")
//         req.user = { id: verified.id }
//         next();
//     } catch (error) {
//         res.status(400).json({ message: "Invalid token" });
//     }
// }
const authMiddleware = (req, res, next) => {
    const token = req.cookies.access_token;
    console.log(token,"cookie")
    if (!token) {
      return res.status(401).json({ message: "Unauthorized access" });
    }
    try {
      const verified = jwt.verify(token, process.env.SECRET_KEY);
      console.log(verified,"verified")
      req.user = verified;
      next();
    } catch (error) {
      res.status(400).json({ message: "Invalid token" });
    }
  };
export default authMiddleware;

