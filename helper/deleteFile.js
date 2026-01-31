const fs = require("fs").promises;

const deleteFile = async (filePath) => {
  try {
    await fs.unlink(filePath);
    // console.log("File deleted successfully:", filePath);
  } catch (err) {
    // console.error("Error deleting file:", err);
  }
};

module.exports = deleteFile;
