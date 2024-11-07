const express = require("express");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const path = require("path");
const cors = require("cors");
const multer = require("multer"); // Import multer
require("dotenv").config(); // Import dotenv to use environment variables
const sendEmail = require('./sendEmail');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "../public")));

// Set up multer storage (for handling form data)
const upload = multer().none();  // Use .none() for handling non-file form data

// Route to serve the main HTML file
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/contact.html"));
});

// Route to handle form submissions
app.post("/send-email", upload, async (req, res) => {
  const { name, email, phone, message } = req.body;

  // Log the received form data to debug
  console.log("Received form data:", req.body);

  // Basic validation
  if (!name || !email || !phone || !message) {
    return res.status(400).send("All fields are required!");
  }

  // Security Validations
  // 1. Phone number should be exactly 10 digits and only contain numbers
  const phoneRegex = /^\d{10}$/;
  if (!phoneRegex.test(phone)) {
    return res.status(400).send("Phone number must be exactly 10 digits and contain only numbers.");
  }

  // 2. Name should not exceed 15 characters and should not contain links or special characters
  const nameRegex = /^[a-zA-Z\s]+$/; // Only letters and spaces
  if (name.length > 15) {
    return res.status(400).send("Name should not exceed 15 characters.");
  }
  if (!nameRegex.test(name)) {
    return res.status(400).send("Name should not contain numbers or special characters.");
  }

  // 3. Message should not exceed 100 characters and should not contain links
  const messageRegex = /http[s]?:\/\/\S+/; // Regular expression to detect links (URLs)
  if (message.length > 100) {
    return res.status(400).send("Message should not exceed 100 characters.");
  }
  if (messageRegex.test(message)) {
    return res.status(400).send("Message should not contain any links.");
  }

  // Set up nodemailer transport using environment variables for credentials
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER, // Use environment variable for email
      pass: process.env.EMAIL_PASS, // Use environment variable for app password
    },
  });

  // Email to site owner
  const ownerMailOptions = {
    from: email,
    to: process.env.EMAIL_USER, // Use environment variable for recipient email
    subject: "New Contact Form Submission",
    text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nMessage: ${message}`,
  };

  // Thank You email to the user
  const userMailOptions = {
    from: process.env.EMAIL_USER, // Your email
    to: email,
    subject: "Thank You for Contacting Us",
    text: `Dear ${name},\n\nThank you for reaching out! We have received your message and will get back to you shortly.\n\nBest regards,\nYour Company Name`,
  };

  try {
    // Send email to site owner
    await transporter.sendMail(ownerMailOptions);

    // Send Thank You email to user
    await transporter.sendMail(userMailOptions);

    res.setHeader("Content-Type", "text/plain");
    res.send("Emails sent successfully!");
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).send("Failed to send email.");
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
