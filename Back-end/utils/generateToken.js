import jwt from "jsonwebtoken";

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      tags: Array.isArray(user.tags) ? user.tags : [], // ✅ Ensure tags are always an array
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
};

export default generateToken;
