// dockerfile/generate-sidebar.js
const fs = require('fs');
const path = require('path');

// 脚本假设在 /docs 目录下运行
const docsDir = '.'; // 你的文档根目录，通常是当前目录
const sidebarFile = '_sidebar.md';
let sidebarContent = '';

// 排除列表
const excludeList = [
    '_sidebar.md',       // 排除侧边栏文件本身
    '_media',            // 排除媒体文件
    'index.html',        // 排除主页 HTML 文件
    '.git',              // 排除 .git 目录
    '.gitignore',        // 排除 .gitignore 目录
    'readme.md',         // 排除 readme.md 文件
    'git_listen',      // 排除 git listen 文件夹 (注意这里的名字需要匹配实际目录名)
];

function buildSidebar(currentDir, level) {
  const items = fs.readdirSync(currentDir);

  // 对items进行排序，让侧边栏顺序更可控，例如按字母排序
  // 确保排序时不区分大小写，并处理中文等非英文字符（如果需要更复杂的排序）
  items.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));


  items.forEach(item => {
    // 在处理前检查是否在排除列表中
    // 使用 path.basename 确保只比较文件名/目录名本身
    if (excludeList.includes(item) || item.startsWith('.')) {
        console.log(`Excluding: ${item}`); // 可选：打印排除项
        return; // 跳过当前循环迭代
    }

    const itemPath = path.join(currentDir, item);
    const stat = fs.statSync(itemPath);
    // 使用两个空格作为基本缩进，因为 docsify 对缩进要求可能不同
    const indent = '  '.repeat(level);

    if (stat.isDirectory()) {
      // 在目录名后添加斜杠以便清晰地表示目录
      sidebarContent += `${indent}* **${item}**\n`; // 可以加粗目录名

      // 递归处理子目录，层级加1
      buildSidebar(itemPath, level + 1);
    } else if (stat.isFile() && item.endsWith('.md')) {
      const fileNameWithoutExt = path.parse(item).name;
      // 排除 README.md 文件本身，如果需要链接它，应该在父级目录处特殊处理
       if (fileNameWithoutExt.toLowerCase() === 'readme') {
           console.log(`Excluding README.md file entry: ${item}`);
           return; // 跳过 README.md 的文件条目
       }

      const linkPath = path.relative(docsDir, itemPath).replace(/\\/g, '/'); // 确保路径使用正斜杠
      // 可选：美化链接文本，例如将 "Docker安装+Dockerfile构建" 转为 "Docker 安装 + Dockerfile 构建"
      // 可以使用更复杂的替换规则，这里保持原样
      // const displayFileName = fileNameWithoutExt.replace(/[+-]/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2');
      // sidebarContent += `${indent}* [${displayFileName}](${linkPath})\n`;
      sidebarContent += `${indent}* [${fileNameWithoutExt}](${linkPath})\n`; // 使用原始文件名作为链接文本
    }
  });
}

// 从根目录（/docs，因为脚本会在那里运行）开始构建
buildSidebar(docsDir, 0);

// 在顶部添加一个指向根目录（README.md 或 index.html）的链接
// 这通常是 Docsify 侧边栏的第一项
sidebarContent = `* [首页](/)\n` + sidebarContent;


// 写入 _sidebar.md 文件
fs.writeFileSync(sidebarFile, sidebarContent);

console.log(`${sidebarFile} generated successfully.`);
