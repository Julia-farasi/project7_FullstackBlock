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
      "SELECT id, author, title, content, cover, date from posts"
    );
    console.log({rows});
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
app.get("/posts/:id", async (req, res) => {
  const { id } = req.params;  // ✅ richtig klein
  console.log("params:", req.params);  // sollte z. B. { id: '1' } ausgeben

  try {
    const { rows } = await query(
      "SELECT id, author, title, content, cover, date FROM posts WHERE id = $1;",
      [id]
    );

    console.log("Gefundener Post:", rows[0]);

    if (!rows[0]) {
      return res.status(404).json({ message: "Post nicht gefunden" });
    }

    res.json({ data: rows[0] });
  } catch (error) {
    console.log("Fehler im GET /posts/:id", error);
    res.status(500).json({ message: "Server error" });
  }
});




////PUT Methode from Table Posts //noch in Arbeit
app.put("/posts/:id", async (req, res) => {
  const { id } = req.params;
  const { author, title, content, cover, date } = req.body;
  console.log(req.body);
  if (!author) return res.status(400).json({ message: "Author required" });
  try {
    const { rows, rowCount } = await query(
      `UPDATE posts
      Set
     author = COALESCE($1, author), 
     title = COALESCE($2, title), 
     content = COALESCE($3, content), 
     cover = COALESCE($4, cover), 
     date = COALESCE($5, date)
     WHERE id = $6
     RETURNING author, title, content, cover, date;`,
      [author, title, content, cover, date, id]
    );
    if (rowCount === 0) {
      res.status(404).json({ message: "Post not found" });
    }
    res.json({ data: rows });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
});
////DELETE MEthode from Table Posts
app.delete("/posts/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const { rows, rowCount } = await query(
      "DELETE FROM posts WHERE id = $1 RETURNING *;",
      [id]
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
