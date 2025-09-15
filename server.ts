const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ===== MongoDB Connection =====
mongoose.connect("mongodb://localhost:27017/studentDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

// ===== Models =====
const Student = mongoose.model("Student", new mongoose.Schema({
  username: { type: String, unique: true },
  registeredCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }]
}));

const Course = mongoose.model("Course", new mongoose.Schema({
  name: String,
  seats: Number,
  availableSeats: Number
}));

// ===== Routes =====

// Add a course (admin)
app.post("/courses", async (req, res) => {
  const { name, seats } = req.body;
  const course = new Course({ name, seats, availableSeats: seats });
  await course.save();
  res.json(course);
});

// Get all courses
app.get("/courses", async (req, res) => {
  const courses = await Course.find();
  res.json(courses);
});

// Register a student (login/signup by username only)
app.post("/student", async (req, res) => {
  let student = await Student.findOne({ username: req.body.username });
  if (!student) {
    student = new Student({ username: req.body.username, registeredCourses: [] });
    await student.save();
  }
  res.json(student);
});

// Register for a course
app.post("/register/:studentId/:courseId", async (req, res) => {
  try {
    const student = await Student.findById(req.params.studentId);
    const course = await Course.findById(req.params.courseId);

    if (!student || !course) return res.status(404).json({ error: "Not found" });

    if (course.availableSeats > 0) {
      course.availableSeats -= 1;
      await course.save();

      student.registeredCourses.push(course._id);
      await student.save();

      res.json({ message: "Course registered successfully!" });
    } else {
      res.json({ message: "Sorry, no seats available." });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get student's registered courses
app.get("/student/:id/courses", async (req, res) => {
  const student = await Student.findById(req.params.id).populate("registeredCourses");
  res.json(student.registeredCourses);
});

// Start server
app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});