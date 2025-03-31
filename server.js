const express = require("express");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3000;

// Hardcoded users
const users = [
  { username: "admin", email: "admin@example.com", password: "password123", activity: [], stats: { weeklyHours: 0, monthlyHours: 0, earnings: 0 }, isClockedIn: false },
  { username: "prabhjotdhillon", email: "prabh@example.com", password: "mypassword", activity: [], stats: { weeklyHours: 0, monthlyHours: 0, earnings: 0 }, isClockedIn: false }
];

let loggedInUser = null;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "public", "login.html")));
app.get("/login", (req, res) => res.sendFile(path.join(__dirname, "public", "login.html")));
app.get("/dashboard", (req, res) => {
  if (!loggedInUser) return res.redirect("/login");
  res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

// Serve the rest of the files
app.get("/profile", (req, res) => res.sendFile(path.join(__dirname, "public", "profile.html")));
app.get("/settings", (req, res) => res.sendFile(path.join(__dirname, "public", "settings.html")));

// Handle login
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const user = users.find(user => user.username === username && user.password === password);

  if (user) {
    loggedInUser = user;
    res.redirect("/dashboard");
  } else {
    res.send("Invalid username or password. <a href='/login'>Try Again</a>");
  }
});

// Handle logout
app.post("/logout", (req, res) => {
  loggedInUser = null;
  res.json({ success: true });
});

// Fetch user data (AJAX request)
app.get('/getUserData', (req, res) => {
  if (!loggedInUser) return res.status(401).json({ error: "Not authenticated" });
  res.json(loggedInUser);
});

// Check clock-in status
app.get("/clock-status", (req, res) => {
    if (!loggedInUser) return res.status(401).json({ error: "Not authenticated" });
  
    res.json({ 
      isClockedIn: !!loggedInUser.isClockedIn,
      username: loggedInUser.username  // Include username in the response
    });
  });

// Handle clock in
app.post("/clockin", (req, res) => {
  if (!loggedInUser) return res.status(401).json({ error: "Not authenticated" });

  if (loggedInUser.isClockedIn) {
    return res.json({ success: false, error: "You are already clocked in." });
  }

  loggedInUser.isClockedIn = true;
  const time = new Date().toLocaleString();

  if (!loggedInUser.activity) loggedInUser.activity = [];
  loggedInUser.activity.push({ action: "Clocked In", time });

  loggedInUser.stats.weeklyHours += 8;  
  loggedInUser.stats.monthlyHours += 8;
  loggedInUser.stats.earnings += 100;  

  res.json({ success: true });
});

// Handle clock out
app.post("/clockout", (req, res) => {
  if (!loggedInUser) return res.status(401).json({ error: "Not authenticated" });

  if (!loggedInUser.isClockedIn) {
    return res.json({ success: false, error: "You are not clocked in." });
  }

  loggedInUser.isClockedIn = false;
  const time = new Date().toLocaleString();

  if (!loggedInUser.activity) loggedInUser.activity = [];
  loggedInUser.activity.push({ action: "Clocked Out", time });

  res.json({ success: true });
});

// Handle taking a break
app.post('/break', (req, res) => {
  if (!loggedInUser) return res.status(401).json({ error: "Not authenticated" });

  const time = new Date().toLocaleString();
  if (!loggedInUser.activity) loggedInUser.activity = [];
  loggedInUser.activity.push({ action: "Break Taken", time });

  res.json({ success: true });
});

// Handle progress
app.post('/progress', (req, res) => {
  if (!loggedInUser) return res.status(401).json({ error: "Not authenticated" });

  const time = new Date().toLocaleString();
  if (!loggedInUser.activity) loggedInUser.activity = [];
  loggedInUser.activity.push({ action: "Viewed Progress", time });

  res.json({ success: true });
});

// Start the server
app.listen(PORT, () => console.log(`OwlTime server running at http://localhost:${PORT}`));
