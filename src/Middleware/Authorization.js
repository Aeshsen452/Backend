import jwt from "jsonwebtoken";

const Authorization = (req, res, next) => {
  try {
    const authorization = req.headers.authorization;

    if (!authorization) {
      return res.status(400).send("Bad Request: Missing Authorization header");
    }

    const [code, token] = authorization.split(" ");

    if (!code || !token) {
      return res.status(400).send("Bad Request: Invalid Authorization format");
    }

    if (code !== "Bearer") {
      return res.status(400).send("Bad Request: Authorization must use Bearer scheme");
    }

    const verifyToken = jwt.verify(token, process.env.SECREATE_KEY);

    if (!verifyToken) {
      return res.status(401).send("Unauthorized: Invalid Token");
    }

    req.user = verifyToken;
    next();
  } catch (error) {
    console.log("error in Middleware/Authorization.js", error);
    return res.status(401).send("Unauthorized");
  }
};

export default Authorization;
