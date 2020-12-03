
const functions = require("firebase-functions");
const firebase = require("firebase");
const admin = require("firebase-admin");

const app = require("express")();

admin.initializeApp();
firebase.initializeApp();

const db = admin.firestore();

// Function to check if string is empty

const isEmpty = (string) => {
  if (string.trim() === "") return true;
  else return false;
};

// Get all tasks

app.get("/tasks", (req, res) => {
  db.collection("tasks")
    .orderBy("createdAt", "desc")
    .get()
    .then((data) => {
      let tasks = [];
      data.forEach((doc) => {
        tasks.push({
          taskId: doc.id,
          body: doc.data().body,
          status: doc.data().status,
          label: doc.data().label,
          createdAt: doc.data().createdAt,
        });
      });
      return res.json(tasks);
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
});

// Get a single task

app.get("/task/:taskId", (req, res) => {
  db.doc(`/tasks/${req.params.taskId}`)
    .get()
    .then((doc) => {
      if (!doc.exists) {
        return res.status(404).json({ error: "Task not found" });
      }
      let taskData = {};
      taskData = doc.data();
      taskData.taskId = req.params.taskId;
      return res.json(taskData);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: err.code });
    });
});

// Create and post a task

app.post("/posttask", (req, res) => {
  let newTask = {
    body: req.body.body,
    createdAt: new Date().toISOString(),
    label: req.body.label,
    status: req.body.status,
  };

  let errors = {};
  if (isEmpty(newTask.body)) errors.body = "Cannot be empty";
  if (isEmpty(newTask.label)) errors.label = "Cannot be empty";
  if (isEmpty(newTask.status)) errors.status = "Cannot be empty";

  if (Object.keys(errors).length > 0) return res.status(400).json(errors);

  db.collection("tasks")
    .add(newTask)
    .then((doc) => {
      newTask.taskId = doc.id;
      return res.json(newTask);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: err.code });
    });
});

// Update Task details

app.post("/updatetask/:taskId", (req, res) => {
  let editTask = {
    body: req.body.body,
    label: req.body.label,
    status: req.body.status,
  };

  db.doc(`/tasks/${req.params.taskId}`)
    .get()
    .then((doc) => {
      if (!doc.exists) {
        return res.status(404).json({ error: "Task not found" });
      }

      if (isEmpty(editTask.body)) editTask.body = doc.data().body;
      if (isEmpty(editTask.label)) editTask.label = doc.data().label;
      if (isEmpty(editTask.status)) editTask.status = doc.data().status;

      doc.ref.update({
        label: editTask.label,
        status: editTask.status,
        body: editTask.body,
      });
      editTask.taskId = req.params.taskId;
      return res.json(editTask);
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
});

// Delete a task

app.delete("/task/:taskId", (req, res) => {
  const document = db.doc(`/tasks/${req.params.taskId}`);
  document
    .get()
    .then((doc) => {
      if (!doc.exists) {
        return res.status(404).json({ error: "Task not found" });
      }
      return document.delete();
    })
    .then(() => {
      return res.json({ success: "Task deleted successfully" });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: err.code });
    });
});

exports.api = functions.https.onRequest(app);
