const express = require("express");
const {
  userRegistration,
  userLogin,
  userLogout,
  createUser,
  studentUpdate,
  studentDelete,
  getOneStudent,
  forgotPassword,
  resetPassword,
} = require("../../controllers/auth/registerUserCrtl");
const {
  verifyUserToken,
  verifyTokenandAdmin,
} = require("../../controllers/auth/protectedRoute");

const router = express.Router();

//user regsitration
router.post("/register", userRegistration);
router.post("/login", userLogin);
router.post("/logout", userLogout);
router.post("/forgot", forgotPassword);
router.post("/password/reset/:token", resetPassword);

//testing
router.get("/pro", verifyTokenandAdmin, (req, res) => {
  return res.status(200).json("Hello procted");
});

router.get("/get/:id", getOneStudent);

//for creating user by admin
router.post("/create/users", verifyTokenandAdmin, createUser);
//for updating user by admin
router.put("/update/student/:id", verifyTokenandAdmin, studentUpdate);
router.delete("/delete/student/:id", verifyTokenandAdmin, studentDelete);

module.exports = router;
