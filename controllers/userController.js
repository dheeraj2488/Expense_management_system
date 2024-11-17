const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken")
const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Please provide email and password.",
        });
    }
    
    const user = await User.findOne({ email });
    
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials." });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_KEY, { expiresIn: '1h' });
    return res.status(200).json({
      success: true,
      message: "Logged in successfully",
      token,
      user: { id:user._id , name:user.name , email: user.email}
    });
  } catch (error) {
    console.log(error)
    res.status(400).json({ success: false, error });
  }
};

const registerController = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Please enter all required fields." });
  }

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res
        .status(409)
        .json({ success: false, message: "Email already registered." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    const savedUser = await newUser.save();

    res.status(201).json({
      success: true,
      message: "Registration successful.",
      userId: savedUser._id,
    });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};
const verify = async(req, res) => {
  return res.status(200).json({ success: true, user: req.user})
}

module.exports = { loginController, registerController ,verify };
