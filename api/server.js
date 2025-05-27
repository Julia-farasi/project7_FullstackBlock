import express from "express";
import chalk from "chalk";
import cors from "cors";
import { query } from "./db/index.js";

// CREATE TABLE "public"."posts" (
//   "id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
//   "author" varchar(500),
//   "title" varchar(500),
//   "content" text,
//   "cover" varchar(255),
//   "date" date
// )
const port = process.env.PORT || 3000;

const app = express();

app.use(express.json(), cors());

////Get-Methode für Posts
app.get("/posts", async (req, res) => {
  try {
    const { rows } = await query(
      "SELECT author, title, content, cover, date from posts"
    );
    res.json({ data: rows });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
});

////Post-Methode für Table Posts
app.post("/posts", async (req, res) => {
  console.log(req.body);
  const { author, title, content, cover, date } = req.body;
  if (!author) return res.status(400).json({ message: "Author required" });

  try {
    const { rows } = await query(
      "INSERT INTO posts (author, title, content, cover, date)VALUES ($1,$2,$3,$4,$5) RETURNING *;",
      [author, title, content, cover, date]
    );
    res.status(201).json({ data: rows });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
});

////GET by Id Methode
app.get("/posts/:Id", async (req, res) => {
  const { Id } = req.params;
  try {
    const { rows, rowCount } = await query(
      "SELECT author, title, content, cover, date from posts WHERE id = $1;",
      [Id]
    );
    if (rowCount === 0) {
      res.status(404).json({ message: "Product not found" });
    }
    res.json({ data: rows[0] });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
});
////PUT Methode from Table Posts //noch in Arbeit

////DELETE MEthode from Table Posts
app.delete("/posts/:Id", async (req, res) => {
  const { Id } = req.params;
  try {
    const { rows, rowCount } = await query(
      "DELETE FROM posts WHERE id = $1 RETURNING *;",
      [Id]
    );
    if (rowCount === 0) {
      res.status(404).json({ message: "Product not found" });
    }
    res.json({ msg: "Delete successfully", data: rows[0] });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
});
/////////
app.listen(port, () =>
  console.log(chalk.bgGreen(`Server läuft auf port ${port}`))
);
