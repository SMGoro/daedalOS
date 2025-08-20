const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const OUTPUT_DIR = path.join(__dirname, "../out");
const MAX_SIZE = 25 * 1024 * 1024; // 25MB

// 压缩文件
async function compressFile(filePath) {
  try {
    const content = fs.readFileSync(filePath);
    const compressedContent = zlib.gzipSync(content, { level: 9 }); // 最高压缩级别

    // 创建压缩文件
    const compressedPath = `${filePath}.gz`;
    fs.writeFileSync(compressedPath, compressedContent);

    // 如果压缩成功且大小合适，替换原文件
    const compressedSize = fs.statSync(compressedPath).size;
    if (compressedSize <= MAX_SIZE) {
      fs.unlinkSync(filePath);
      fs.renameSync(compressedPath, filePath);
      console.log(
        `已压缩文件: ${filePath} (${(compressedSize / 1024 / 1024).toFixed(2)}MB)`
      );
      return true;
    } else {
      // 压缩后仍然过大，删除压缩文件
      fs.unlinkSync(compressedPath);
      return false;
    }
  } catch (error) {
    console.error(`压缩文件失败: ${filePath}`, error);
    return false;
  }
}

// 处理大文件
async function handleLargeFiles(dir) {
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const itemPath = path.join(dir, item);
    const stat = fs.statSync(itemPath);

    if (stat.isDirectory()) {
      await handleLargeFiles(itemPath);
    } else if (stat.size > MAX_SIZE) {
      console.log(
        `发现大文件: ${itemPath} (${(stat.size / 1024 / 1024).toFixed(2)}MB)`
      );

      // 步骤1: 尝试压缩
      const compressSuccess = await compressFile(itemPath);
      if (compressSuccess) continue;

      // 步骤2: 压缩失败，直接删除文件
      fs.unlinkSync(itemPath);
      console.log(
        `已删除大文件: ${itemPath} (${(stat.size / 1024 / 1024).toFixed(2)}MB)`
      );
    }
  }
}

// 执行主函数
(async () => {
  console.log("开始处理大文件...");
  await handleLargeFiles(OUTPUT_DIR);
  console.log("构建后大文件处理完成。");
})();
