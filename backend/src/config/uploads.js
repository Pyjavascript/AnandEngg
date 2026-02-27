const path = require("path");
const fs = require("fs");

const uploadRoot = process.env.UPLOAD_ROOT
  ? path.resolve(process.env.UPLOAD_ROOT)
  : path.resolve(__dirname, "../../uploads");

const diagramsDir = path.join(uploadRoot, "diagrams");

function ensureUploadDirs() {
  fs.mkdirSync(diagramsDir, { recursive: true });
}

module.exports = {
  uploadRoot,
  diagramsDir,
  ensureUploadDirs,
};
