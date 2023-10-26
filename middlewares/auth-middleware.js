const jwt = require("jsonwebtoken");

const { Users } = require("../models");

module.exports = async (req, res, next) => {
  try {
    const { authorization } = req.cookies;

    if (!authorization) {
      return res.status(401).json({ message: "Please log in." });
    }

    const [tokenType, token] = authorization.split(" ");

    if (tokenType !== "Bearer") {
      return res.status(401).json({ message: "Token type does not match." });
    }

    const decodedToken = jwt.verify(token, "customized_secret_key");
    const userId = decodedToken.userId;

    const user = await Users.findOne({ where: userId });
    console.log({ user });
    if (!user) {
      res.clearCookie("authorization");
      return res.status(401).json({ message: "Token user does not exist." });
    }

    res.locals.user = user;

    next();
  } catch (error) {
    console.error(error);

    if (error instanceof jwt.TokenExpiredError) {
      res.clearCookie("authorization");
      return res.status(401).json({ message: "Token expired." });
    } else if (error instanceof jwt.JsonWebTokenError) {
      res.clearCookie("authorization");
      return res.status(401).json({ message: "Invalid token." });
    } else if (error instanceof jwt.NotBeforeError) {
      return res.status(401).json({ message: "Token not active yet." });
    } else {
      // If the error is due to something else
      console.log("");
      console.log("error: ", error.message);

      return res
        .status(500)
        .json({ message: "An internal server error occurred." });
    }
  }
};
