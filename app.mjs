import express from "express";
import questionRouter from "./router/questions.mjs";
import answersRouter from "./router/answers.mjs";

const app = express();
const port = 4000;

app.use(express.json());

app.use("/questions", questionRouter);
app.use("/questions", answersRouter);

app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});
