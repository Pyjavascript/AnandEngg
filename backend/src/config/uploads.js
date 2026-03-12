const path = require("path");
const fs = require("fs");

const uploadRoot = process.env.UPLOAD_ROOT
  ? path.resolve(process.env.UPLOAD_ROOT)
  : path.resolve(__dirname, "../../uploads");

const diagramsDir = path.join(uploadRoot, "diagrams");
const exportsDir = path.join(uploadRoot, "exports");

function ensureUploadDirs() {
  fs.mkdirSync(diagramsDir, { recursive: true });
  fs.mkdirSync(exportsDir, { recursive: true });
}

module.exports = {
  uploadRoot,
  diagramsDir,
  exportsDir,
  ensureUploadDirs,
};
