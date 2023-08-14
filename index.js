const express = require("express");
const app = express();
const mongoose = require("mongoose");
const authRouter = require("./routes/auth/verifyemailRoute");
const userRouter = require("./routes/auth/userRoute");
const filterRouter = require("./routes/filterUser/userFilter");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const multer = require("multer");
const path = require("path");
const User = require("./models/userByAdmin/userStdModel");
// const uplaod = require('./public/upload/')

dotenv.config();

//middlware
app.use(express.json());
app.use(cors({ origin: true }));
app.use(cookieParser({ httpOnly: true }));
app.use("/user/auth", authRouter);
app.use("/user", userRouter);
app.use("/", filterRouter);
app.use("/public", express.static("public"));
//port 
const PORT = process.env.PORT || 8800;
//testing purpose
app.get("/", () => {
  console.log("hello");
});

//db connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("DB connected");
  })
  .catch((err) => {
    console.log(err);
  });

// image upload

const stroage = multer.diskStorage({
  destination: "public/upload",
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const fileExtenstion = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueName + fileExtenstion);
  },
});

const upload = multer({ storage: stroage });

//upload route

app.post("/upload", upload.single("image"), async (req, res) => {
  if (!req.file) {
    return res.status(404).json("Image is not found");
  }

  try {
    const imagePath = req.file.path;

    const stdId = req.body.id;
    await User.findByIdAndUpdate(stdId, { img: imagePath });
    return res.status(200).json({
      message: "Image uploaded succesfully",
      imagePath,
    });
  } catch (error) {
    return res.status(500).json(error);
  }
});

app.listen(PORT, () => {
  console.log("Server is running");
});
