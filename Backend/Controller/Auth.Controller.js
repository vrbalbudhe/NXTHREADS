require("dotenv").config();
const nodemailer = require("nodemailer");

const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const prisma = require("../lib/prisma");
const jwt = require("jsonwebtoken");

const register = asyncHandler(async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({
        message: "All fields are mandatory",
        success: false,
      });
    }

    const hashedPassword = await bcrypt.hashSync(password, 10);
    const NewUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        verified: false,
      },
    });

    if (NewUser) {
      return res.status(201).json({
        message: "User Successfully Created",
        success: true,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(501).json({
      message: "Register Failed",
      success: false,
    });
  }
});
const login = asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        message: "All fields are mandatory",
        success: false,
      });
    }
    const user = await prisma.user.findUnique({
      where: { email: email },
    });
    if (!user) {
      return res.status(401).json({
        message: "User Not Exists",
        success: false,
      });
    }
    const isPasswordMatched = await bcrypt.compareSync(password, user.password);
    if (!isPasswordMatched) {
      return res.status(401).json({
        message: "Password Not Matched",
        success: false,
      });
    }
    // Generating the Token Data
    const tokenData = {
      userId: user.id,
    };

    // Creating a token using the json web token
    const token = await jwt.sign(tokenData, process.env.JWT_SECRET_KEY, {
      expiresIn: "7d",
    });
    const CookieOptions = {
      httpOnly: true,
      maxAge: 1000 * 60 * 105,
      samSite: "Strict",
      secure: true,
    };
    const { password: userPassword, ...userInfo } = user;
    return res.status(200).cookie("token", token, CookieOptions).json({
      message: "Login Successfully Done",
      success: true,
      userInfo: userInfo,
    });
  } catch (error) {
    console.log(error);
    res.status(501).json({
      message: "Login Failed",
      success: false,
    });
  }
});
const logout = asyncHandler(async (req, res) => {
  try {
    res.clearCookie("token");
    return res.status(200).json({
      message: "Logout Successfull",
      success: true,
    });
  } catch (error) {
    console.log(error);
    res.status(501).json({
      message: "Logout Failed",
      success: false,
    });
  }
});

module.exports = { register, login, logout };
