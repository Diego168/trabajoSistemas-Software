const fs = require("fs");
const path = require("path");
const LEVELS = { DEBUG: 10, INFO: 20, WARN: 30, ERROR: 40 };
const SENSITIVE = /^(authorization|token|password|clave|secret)$/i;

class Logger {
  constructor({ level = process.env.LOG_LEVEL || "info", dir = process.env.LOG_DIR, sink, console: toConsole = true } = {}) {
    this.min = LEVELS[String(level).toUpperCase()] ?? LEVELS.INFO;
    this.dir = dir; this.sink = sink; this.toConsole = toConsole;
    if (dir) fs.mkdirSync(dir, { recursive: true });
  }
  #write(level, msg, extra = {}) {
    if (LEVELS[level] < this.min) return;
    const safe = {};
    for (const [k, v] of Object.entries(extra)) safe[k] = SENSITIVE.test(k) ? "***" : v;
    const now = new Date();
    const line = JSON.stringify({ ts: now.toISOString(), level, msg, ...safe });
    if (this.sink) this.sink(line);
    if (this.dir) fs.appendFileSync(path.join(this.dir, `app-${now.toISOString().slice(0, 10)}.log`), line + "\n");
    if (this.toConsole && !this.sink) (level === "ERROR" ? console.error : console.log)(line);
  }
  debug(m, e) { this.#write("DEBUG", m, e); }
  info(m, e) { this.#write("INFO", m, e); }
  warn(m, e) { this.#write("WARN", m, e); }
  error(m, e) { this.#write("ERROR", m, e); }
}
module.exports = { Logger };
