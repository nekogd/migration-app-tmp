const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const app = express();
require("dotenv").config();

const port = process.env.PORT || 5005;

// set security HTTP headers
app.use(helmet());

// parse json request body
app.use(express.json());

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// enable cors
app.use(cors());
app.options("*", cors());

app.get("/health-check", async (req, res) => {
  try {
    res.status(200).json({ status: "ok" });
  } catch (e) {
    res.status(500).json(e);
  }
});

app.use(function (req, res, next) {
  if (req.headers.authorization !== process.env.AUTHORIZATION_TOKEN) {
    return res.status(403).json({ error: "No credentials sent!" });
  }
  next();
});

const { Sequelize } = require("sequelize");

const sequelize = new Sequelize({
  database: process.env.OFS_DATABASE_NAME,
  username: process.env.OFS_DATABASE_USERNAME,
  password: process.env.OFS_DATABASE_PASSWORD,
  host: process.env.OFS_DATABASE_HOST,
  port: process.env.OFS_DATABASE_PORT,
  dialect: "postgres",
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
      trustServerCertificate: true,
    },
  },
});

const OFSFindUserByEmail = async (email) => {
  try {
    //const correctEmail = 'i.luczko@bioniq.com'
    //const incorrectEmail = 'i.luczko+1@bioniq.com'
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
    const result = await sequelize.query(
      `SELECT * from users WHERE email='${email}'`
    );
    if (Array.isArray(result[0]) && Array.isArray(result[0])) {
      return result[0][0];
    } else return null;
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

app.post("/users/search-by-email", async (req, res) => {
  try {
    const email = req.body.email;
    const user = await OFSFindUserByEmail(email);
    console.log(user);
    if (user != null) {
      res.status(200).send({ data: user, message: "OK" });
    } else {
      // here check Loewi
      res.status(404).send({ message: "User not found in OFS" });
    }
  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }
});

app.listen(port, () => console.log(`migration app listening on port ${port}`));
