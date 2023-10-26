const express = require("express");
const cookieParser = require("cookie-parser");

const userRouter = require("./routes/users.route");
const postRouter = require("./routes/posts.route");

const app = express();

const PORT = 3000;

app.use(express.json());
app.use(cookieParser());
app.use(express.static("public"));

app.use("/api", [userRouter, postRouter]);

app.listen(PORT, () => {
  console.log(`http://127.0.0.1:${PORT}`);
});
