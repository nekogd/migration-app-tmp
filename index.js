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

const OFSFindClientByEmail = async (email) => {
  try {
    //const correctEmail = 'i.luczko@bioniq.com'
    //const incorrectEmail = 'i.luczko+1@bioniq.com'
    await sequelize.authenticate();
    const result = await sequelize.query(
      `SELECT * from clients WHERE email='${email}'`
    );
    if (Array.isArray(result[0]) && Array.isArray(result[0])) {
      return result[0][0];
    } else return null;
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

const OFSFindOrdersByClientID = async (clientID) => {
  try {
    //const correctEmail = 'i.luczko@bioniq.com'
    //const incorrectEmail = 'i.luczko+1@bioniq.com'
    await sequelize.authenticate();
    const result = await sequelize.query(
      `SELECT * from orders WHERE client_id='${clientID}'`
    );
    if (Array.isArray(result[0])) {
      return result[0];
    } else return null;
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

const OFSFindBloodTestsByOrderID = async (orderID) => {
  try {
    await sequelize.authenticate();
    const result = await sequelize.query(
      `SELECT * from blood_tests WHERE order_id='${orderID}'`
    );
    return result[0];
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

const OFSFindFormulasByOrderID = async (orderID) => {
  try {
    await sequelize.authenticate();
    const result = await sequelize.query(
      `SELECT * from formulas WHERE order_id='${orderID}'`
    );
    return result[0];
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

const OFSFindFormulaRecipeByFormulaID = async (formulaID) => {
  try {
    await sequelize.authenticate();

    const result = await sequelize.query(
      `select * from formula_recipes AS Recipes INNER JOIN components AS Compo ON Recipes.component_id=Compo.id INNER JOIN dosages as Dosa ON Recipes.dosage_id=Dosa.id WHERE formula_id='${formulaID}'`
    );

    return result[0];
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

const OFSFindFormulaIntakeByFormulaID = async (formulaID) => {
  try {
    //const correctEmail = 'i.luczko@bioniq.com'
    //const incorrectEmail = 'i.luczko+1@bioniq.com'
    await sequelize.authenticate();

    const result = await sequelize.query(
      `select * from formula_intakes as Intakes INNER JOIN micronutrients as Micro On Intakes.micronutrient_id=Micro.id where formula_id='${formulaID}'`
    );

    return result[0];
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

const OFSFindQuestionarrySheetsByFormulaID = async (orderID) => {
  try {
    //const correctEmail = 'i.luczko@bioniq.com'
    //const incorrectEmail = 'i.luczko+1@bioniq.com'
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
    const result = await sequelize.query(
      `SELECT * FROM public.questionary_answer_sheets WHERE order_id='${orderID}'`
    );
    return result[0];
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

const OFSFindQuestionarrySheetsBySheetID = async (sheetID) => {
  try {
    //const correctEmail = 'i.luczko@bioniq.com'
    //const incorrectEmail = 'i.luczko+1@bioniq.com'
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
    const result = await sequelize.query(
      `SELECT * FROM questionary_answers as Answers INNER JOIN questionary_question_variants AS QuestionsVariants on Answers.variant_id=QuestionsVariants.id INNER JOIN questionary_questions as Questions on QuestionsVariants.question_id=Questions.id
      WHERE sheet_id='${sheetID}'`
    );
    return result[0];
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

const OFSFindBloodTestsResultsByBloodTestID = async (bloodtestID) => {
  try {
    //const correctEmail = 'i.luczko@bioniq.com'
    //const incorrectEmail = 'i.luczko+1@bioniq.com'
    await sequelize.authenticate();

    const result = await sequelize.query(
      `SELECT * from blood_test_results WHERE blood_test_id='${bloodtestID}'`
    );

    return result[0];
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

app.post("/users/search-by-email", async (req, res) => {
  try {
    const email = req.body.email;
    const user = await OFSFindUserByEmail(email);

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

app.post("/clients/search-by-email", async (req, res) => {
  try {
    const email = req.body.email;
    const client = await OFSFindClientByEmail(email);

    if (client != null) {
      res.status(200).send({ data: client, message: "OK" });
    } else {
      // here check Loewi
      res.status(404).send({ message: "Client not found in OFS" });
    }
  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }
});

app.post("/orders/search-by-client-id", async (req, res) => {
  try {
    const clientID = req.body.clientID;
    const orders = await OFSFindOrdersByClientID(clientID);

    if (orders != null) {
      res.status(200).send({ data: client, message: "OK" });
    } else {
      // here check Loewi
      res.status(404).send({ message: "Client not found in OFS" });
    }
  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }
});

app.post("/clients/all-data-by-email", async (req, res) => {
  try {
    const email = req.body.email;
    const client = await OFSFindClientByEmail(email);
    if (client != null && client.id != null) {
      const orders = await OFSFindOrdersByClientID(client.id);

      for (let i = 0; i < orders.length; i++) {
        const order = orders[i];

        if (order.id != null) {
          // questionaires
          const questionairesSheets =
            await OFSFindQuestionarrySheetsByFormulaID(order.id);
          order.questionaires_sheets = questionairesSheets;

          if (
            Array.isArray(order.questionaires_sheets) &&
            order.questionaires_sheets.length > 0
          ) {
            for (let m = 0; m < order.questionaires_sheets.length; m++) {
              const sheet = order.questionaires_sheets[m];
              const sheetData = await OFSFindQuestionarrySheetsBySheetID(
                sheet.id
              );
              order.questionaires_sheets[m].results = sheetData;
            }
          }

          // bloodtests
          const bloodtestData = await OFSFindBloodTestsByOrderID(order.id);
          order.bloodtest_data = bloodtestData;

          if (
            Array.isArray(order.bloodtest_data) &&
            order.bloodtest_data.length > 0
          ) {
            for (let j = 0; j < order.bloodtest_data.length; j++) {
              const bloodTest = order.bloodtest_data[j];
              const bloodTestResults =
                await OFSFindBloodTestsResultsByBloodTestID(bloodTest.id);
              order.bloodtest_data[j].results = bloodTestResults;
            }
          }

          // formulas
          const formulasIDS = await OFSFindFormulasByOrderID(order.id);
          order.formulas = formulasIDS;
          if (Array.isArray(order.formulas) && order.formulas.length > 0) {
            for (let k = 0; k < order.formulas.length; k++) {
              const formula = order.formulas[k];
              order.formulas_recipes = await OFSFindFormulaRecipeByFormulaID(
                formula.id
              );
              order.formulas_intakes = await OFSFindFormulaIntakeByFormulaID(
                formula.id
              );
            }
          }
        }

        client.orders = orders;
      }
    }
    if (client != null) {
      res.status(200).send({ data: client, message: "OK" });
    } else {
      // here check Loewi
      res.status(404).send({ message: "Client not found in OFS" });
    }
  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }
});

app.listen(port, () => console.log(`migration app listening on port ${port}`));
