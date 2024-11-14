import { Router } from "express";
import connectionPool from "../utils/db.mjs";

const questionRouter = Router();

questionRouter.get("/search", async (req, res) => {
  const title = req.query.title || "";
  const category = req.query.category || "";
  try {
    const result = await connectionPool.query(
      `SELECT * FROM questions WHERE (title ILIKE $1 OR $1 = '') AND (category ILIKE $2 OR $2 = '')`,
      [`%${title}%`, `%${category}%`]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "No questions found with the specified title & category.",
      });
    }

    return res.status(200).json({ data: result.rows });
  } catch (error) {
    console.error("Error executing query", error);
    return res.status(500).json({ message: "Unable to fetch questions." });
  }
});

questionRouter.get("/", async (req, res) => {
  try {
    const result = await connectionPool.query("SELECT * FROM questions");
    return res.status(200).json({ data: result.rows });
  } catch (error) {
    console.error("Error executing query", error);
    return res.status(500).json({ message: "Unable to fetch questions." });
  }
});

questionRouter.get("/:questionId", async (req, res) => {
  const questionsIdFromClient = req.params.questionId;
  try {
    const result = await connectionPool.query(
      `SELECT * FROM questions WHERE id = $1`,
      [questionsIdFromClient]
    );
    return res.status(200).json({ data: result.rows });
  } catch (error) {
    console.error("Error executing query", error);
    return res.status(500).json({ message: "Unable to fetch questions." });
  }
});

questionRouter.post("/", async (req, res) => {
  const newPost = {
    ...req.body,
  };

  try {
    await connectionPool.query(
      `insert into questions (title, description, category)values ($1, $2, $3)`,
      [newPost.title, newPost.description, newPost.category]
    );
  } catch (error) {
    return res.status(400).json({
      message: "Invalid request data.",
    });
  }

  return res.status(201).json({ message: "Question created successfully." });
});

questionRouter.delete("/:questionId", async (req, res) => {
  const questionsIdFromClient = req.params.questionId;
  try {
    const result = await connectionPool.query(
      `DELETE FROM questions where id = $1`,
      [questionsIdFromClient]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Question not found." });
    }

    return res
      .status(200)
      .json({ message: "Question post has been deleted successfully." });
  } catch (error) {
    return res.status(500).json({ message: "Unable to delete question." });
  }
});

questionRouter.put("/:questionId", async (req, res) => {
  const newUpdate = {
    ...req.body,
  };
  const questionsIdFromClient = req.params.questionId;

  if (!newUpdate.title || !newUpdate.description || !newUpdate.category) {
    return res.status(400).json({ message: "Invalid request data." });
  }

  try {
    const result = await connectionPool.query(
      `UPDATE questions SET title = $1, description = $2, category = $3 WHERE id = $4`,
      [
        newUpdate.title,
        newUpdate.description,
        newUpdate.category,
        questionsIdFromClient,
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Question not found." });
    }

    return res.status(200).json({ message: "Question updated successfully." });
  } catch (error) {
    return res.status(500).json({
      message: "Unable to fetch questions.",
    });
  }
});

export default questionRouter;
