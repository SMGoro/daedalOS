const fs = require("fs");
const path = require("path");

const OUTPUT_DIR = path.join(__dirname, "../out");
const MAX_SIZE = 25 * 1024 * 1024; // 25MB

function deleteLargeFiles(dir) {
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const itemPath = path.join(dir, item);
    if (fs.statSync(itemPath).isDirectory()) {
      deleteLargeFiles(itemPath);
    } else {
      const stat = fs.statSync(itemPath);
      if (stat.size > MAX_SIZE) {
        fs.unlinkSync(itemPath);
        console.log(
          `已删除大文件: ${itemPath} (${(stat.size / 1024 / 1024).toFixed(2)}MB)`
        );
      }
    }
  }
}

deleteLargeFiles(OUTPUT_DIR);
console.log("构建后大文件清理完成。");
