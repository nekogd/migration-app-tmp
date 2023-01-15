const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const app = express();
const port = 5005;

// set security HTTP headers
app.use(helmet());

// parse json request body
app.use(express.json());

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// enable cors
app.use(cors());
app.options("*", cors());

app.use(function (req, res, next) {
  if (!req.headers.authorization) {
    return res.status(403).json({ error: "No credentials sent!" });
  }
  next();
});

const { Sequelize } = require("sequelize");

const sequelize = new Sequelize({
  database: "ofs_db_prod",
  username: "bq_bi",
  password: "wdxRDjWh9ZXwSdnmhqzU2wx3FLVtFQQ7",
  host: "rpm-postgres.postgres.database.azure.com",
  port: 5432,
  dialect: "postgres",
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
      trustServerCertificate: true,
    },
  },
});

const findUserByEmail = async (email) => {
  try {
    //const email = 'v.valikova@bioniq.com'
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
    const result = await sequelize.query(
      `SELECT * from users WHERE email='${email}'`
    );
    console.log(result);
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

app.post("/users/:email", async (req, res) => {
  try {
    const email = req.body;

    const user = await findUserByEmail(email);
    console.log(user);
    res.status(200).json({ user });
  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }
});

app.listen(port,() => console.log("started"));
