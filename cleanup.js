const { exec } = require("child_process");
const process = require("process");

function killPort() {
  // On Unix-like systems (Mac/Linux)
  if (process.platform !== "win32") {
    exec(`lsof -ti :3000 | xargs kill -9`, (err) => {
      if (err && !err.toString().includes("No such process")) {
        console.error("Failed to release port 3000:", err);
      } else {
        console.log("Port 3000 released.");
      }
    });
  } else {
    // On Windows
    exec(`netstat -ano | findstr :3000`, (err, stdout) => {
      if (stdout) {
        const pid = stdout.split(" ").filter(Boolean).pop();
        exec(`taskkill /F /PID ${pid}`, (err) => {
          if (err) {
            console.error("Failed to release port 3000:", err);
          } else {
            console.log("Port 3000 released.");
          }
        });
      }
    });
  }
}

// Handle SIGINT (Ctrl+C or Trash bin button)
process.on("SIGINT", () => {
  console.log("\nShutting down server...");
  killPort();
  process.exit();
});

// Handle normal exit
process.on("exit", () => {
  killPort();
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  killPort();
  process.exit(1);
});
