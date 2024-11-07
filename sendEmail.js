const nodemailer = require("nodemailer");

module.exports = async (req, res) => {
  if (req.method === "POST") {
    const { name, email, phone, message } = req.body;

    // Log received data (for debugging purposes)
    console.log("Received form data:", req.body);

    // Set up nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // Your email from environment variable
        pass: process.env.EMAIL_PASS, // Your app password from environment variable
      },
    });

    // Mail options to send to the site owner
    const mailOptions = {
      from: email,
      to: process.env.EMAIL_USER, // The site owner's email
      subject: "New Contact Form Submission",
      text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nMessage: ${message}`,
    };

    try {
      // Send email to the site owner
      await transporter.sendMail(mailOptions);

      // Optionally send a thank you email to the user
      const userMailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Thank You for Contacting Us",
        text: `Dear ${name},\n\nThank you for reaching out! We have received your message and will get back to you shortly.\n\nBest regards,\nYour Company Name`,
      };

      await transporter.sendMail(userMailOptions);

      res.status(200).send("Emails sent successfully");
    } catch (error) {
      console.error("Error sending email:", error);
      res.status(500).send("Failed to send email");
    }
  } else {
    res.status(405).send("Method Not Allowed"); // Handle non-POST methods
  }
};
