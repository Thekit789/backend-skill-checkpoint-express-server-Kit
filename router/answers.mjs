import { Router } from "express";
import connectionPool from "../utils/db.mjs";

const answersRouter = Router();

export default answersRouter;

answersRouter.post("/:questionId/answers", async (req, res) => {
  const { content } = req.body;
  const maxLength = 300;
  const questionsIdFromClient = req.params.questionId;

  if (!content || content.length > maxLength) {
    return res.status(400).json({
      message: `Answer text is required and should not exceed ${maxLength} characters.`,
    });
  }

  try {
    await connectionPool.query(
      `INSERT INTO answers(question_id, content)values ($1, $2)`,
      [questionsIdFromClient, content]
    );
  } catch (error) {
    return res.status(400).json({
      message: "Invalid request data.",
    });
  }

  return res.status(201).json({ message: "Answer created successfully." });
});

answersRouter.get("/:questionId/answers", async (req, res) => {
  const questionsIdFromClient = req.params.questionId;

  try {
    const result = await connectionPool.query(
      `SELECT 
        questions.id AS question_id, 
        questions.title, 
        questions.description, 
        questions.category, 
        answers.id AS answer_id, 
        answers.content
      FROM 
        questions 
      LEFT JOIN 
        answers 
      ON 
        questions.id = answers.question_id 
      WHERE 
        questions.id = $1`,
      [questionsIdFromClient]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Question not found." });
    }
    return res.status(200).json({ data: result.rows });
  } catch (error) {
    return res.status(500).json({
      message: "Unable to fetch questions.",
    });
  }
});

answersRouter.delete("/:questionId/answers", async (req, res) => {
  const questionsIdFromClient = req.params.questionId;

  try {
    const result = await connectionPool.query(
      `DELETE FROM answers USING questions 
        WHERE questions.id = answers.question_id 
        AND answers.question_id = $1;`,
      [questionsIdFromClient]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Question not found." });
    }
    return res.status(200).json({
      message: "All answers for the question have been deleted successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Unable to delete answers.",
    });
  }
});
