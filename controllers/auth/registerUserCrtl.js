const User = require("../../models/verify/userModel");
const Student = require("../../models/userByAdmin/userStdModel");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userModel = require("../../models/verify/userModel");
const nodemailer = require("nodemailer");

const userRegistration = async (req, res) => {
  const { name, email, password, img } = req.body;

  //alreday exists user
  try {
    const userExist = await User.findOne({ email: email });
    if (userExist)
      return res.status(401).json({
        message: "User already exists",
      });

    //hash password
    const salt = bcryptjs.genSaltSync(10);
    const hashPassword = bcryptjs.hashSync(password, salt);
    //new user save
    const newUser = new User({
      name: name,
      email: email,
      password: hashPassword,
    });

    await newUser.save();

    // const { passwordd, ...others } = newUser;

    return res.status(200).json({
      message: "Sucess",
      newUser,
    });
  } catch (error) {
    return res.status(500).json("Error in Regsitration");
  }
};

const userLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await userModel.findOne({ email });
    if (!user) return res.status(404).json("User not found");

    const checkPassword = await bcryptjs.compare(password, user.password);
    if (!checkPassword) {
      return res.status(401).json("Incorrect password or email");
    }

    //if everything is correct

    const token = jwt.sign(
      {
        id: user._id,
        isAdmin: user.isAdmin,
        email: user.email,
      },
      process.env.JWT_KEY
    );

    //STORE IN COOKIE
    res.cookie("token", token, { httpOnly: true });

    return res.status(200).json({
      message: "Login Succesfully",
      user,
      token,
    });
  } catch (error) {
    console.log(error);
  }
};

//logout 

const userLogout = (req, res) => {
  res.clearCookie("token");

  res.status(200).json({
    message: "Logout succesfully",
  });
};

//create user by admin

const createUser = async (req, res) => {
  try {
    const {
      name,
      rollNumber,
      age,
      gender,
      email,
      phoneNumber,
      address,
      course,
      batch,
      department,
      gpa,
      attendance,
      dob,
      parentName,
      parentContact,
      courseEnroll,
      courseComplete,
      currentSemester,
      job,
      img,
    } = req.body;

    const student = new Student({
      name: name,
      rollNumber: rollNumber,
      age: age,
      gender: gender,
      email: email,
      phoneNumber: phoneNumber,
      address: address,
      course: course,
      batch: batch,
      department: department,
      gpa: gpa,
      attendance: attendance,
      dob: dob,
      parentName: parentName,
      parentContact: parentContact,
      courseEnroll: courseEnroll,
      courseComplete: courseComplete,
      currentSemester: currentSemester,
      job: job,
      img: img,
    });

    await student.save();

    return res.status(200).json({
      message: "Success",
      student,
    });
  } catch (error) {
    res.status(500).json(error);
  }
};

//get one student
const getOneStudent = async (req, res) => {
  const id = req.params.id;

  const student = await Student.findById(id);

  if (!student) {
    return res.status(404).json("Student no found");
  }

  return res.status(200).json(student);
};

//student update
const studentUpdate = async (req, res) => {
  try {
    const userId = req.params.id;
    const student = await Student.findByIdAndUpdate(userId, req.body, {
      new: true,
    });

    return res.status(200).json({
      message: "Succefully",
      student,
    });
  } catch (error) {
    return res.status(500).json(error);
  }
};

//student delete by admin

const studentDelete = async (req, res) => {
  try {
    const studentId = req.params.id;

    await Student.findByIdAndDelete(studentId);
    return res.status(200).json({
      message: "Deleted succesfully",
    });
  } catch (error) {
    console.log(error);
  }
};

//forgot password

const forgotPassword = async (req, res) => {
  const email = req.body.email;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json("User not found");

    //token
    const token = await bcryptjs.hash(email + Date.now().toString(), 10);
    const tokenEncode = encodeURIComponent(token);
    user.resetToken = tokenEncode;
    user.resetTime = Date.now() + 3600000;
    await user.save();

    //send link through email

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: "mylearn9101@gmail.com",
        pass: "fksoibvpbgvjitym",
      },
    });

    //send mail

    await transporter.sendMail({
      to: user.email.toString(),
      html: `<p>Password reset link :Click  <a href="https://master--monumental-baklava-4e8cb4.netlify.app/user/password/reset/${tokenEncode}"> the link</a></p>`,
      subject: "Password reset link",
    });

    res.status(200).json("Reset email is sent");
  } catch (error) {
    console.log("something went wrong with email sent", error);
  }
};

//reset password

const resetPassword = async (req, res) => {
  const { password, confirmPassword } = req.body;

  const token = req.params.token;
  const tokenEnc = encodeURIComponent(token);

  try {
    const user = await User.findOne({
      resetToken: tokenEnc,
      resetTime: { $gt: Date.now() },
    });

    if (!user) return res.status(404).json("Link is expired");

    //check password
    if (password != confirmPassword)
      return res.status(403).json("Passowrd is not match");

    //hash the password
    const newHashPassword = await bcryptjs.hash(password, 10);

    //update the password
    user.password = newHashPassword;
    user.resetToken = null;
    user.resetTime = null;
    await user.save();

    return res.status(200).json("Password updated succesfully");
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  userRegistration,
  userLogin,
  userLogout,
  createUser,
  resetPassword,
  studentUpdate,
  studentDelete,
  getOneStudent,
  forgotPassword,
};
