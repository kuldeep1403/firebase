const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;
const admin = require("firebase-admin");
const credentials = require("./key.json");

admin.initializeApp({
  credential: admin.credential.cert(credentials),
});

const db = admin.firestore();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Create a post
app.post("/create", async (req, res) => {
  try {
    const postJson = {
      userId: req.body.userId,
      email: req.body.email,
      name: req.body.name,
      text: req.body.text,
    };
    const response = await db.collection("posts").add(postJson);
    res.send(response);
  } catch (err) {
    console.log(err);
  }
});

//Update a post
app.patch("/update/:userId", async (req, res) => {
  try {
    const posts = await db
      .collection("posts")
      .where("userId", "==", +req.params.userId)
      .get();
    const docs = posts.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    const doc = docs.filter((doc) => doc.id === req.body.id);
    if (doc.length !== 0) {
      await db.collection("posts").doc(req.body.id).update({
        text: req.body.text,
      });
      res.status(200).send("Doc has been updated");
    } else {
      console.log("invalid Id");
    }
  } catch (err) {
    console.log(err);
  }
});

//Delete a post
app.delete("/delete/:userId", async (req, res) => {
  try {
    const posts = await db
      .collection("posts")
      .where("userId", "==", +req.params.userId)
      .get();
    const docs = posts.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    const doc = docs.filter((doc) => doc.id === req.body.id);
    if (doc.length !== 0) {
      await db.collection("posts").doc(req.body.id).delete();
      res.status(200).send("Doc has been Deleted");
    } else {
      console.log("invalid Id");
    }
  } catch (err) {
    console.log(err);
  }
});

//Fetch all posts
app.get("/readAll", async (req, res) => {
  try {
    const posts = await db.collection("posts").get();
    const docs = posts.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(docs);
  } catch (err) {
    console.log(err);
  }
});

//Fetch a post by id
app.get("/read/:id", async (req, res) => {
  try {
    const post = await db.collection("posts").doc(req.params.id).get();
    res.status(200).json(post.data());
  } catch (err) {
    console.log(err);
  }
});

//Fetch all posts of a specific userId
app.get("/readByUserId/:userId", async (req, res) => {
  try {
    const posts = await db
      .collection("posts")
      .where("userId", "==", +req.body.userId)
      .get();
    const docs = posts.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(docs);
  } catch (err) {
    console.log(err);
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
