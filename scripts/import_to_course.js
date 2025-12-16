const fs = require('fs');
const path = require('path');

// 读取处理后的JSON文件
const inputFile = process.argv[2] || path.join(__dirname, '../网站搭建/GitHub_HTML/english-practice/data/s01e01_fixed.json');
const outputFile = path.join(__dirname, '../public/import-course.json');

console.log(`读取文件: ${inputFile}`);

// 读取数据
const questions = JSON.parse(fs.readFileSync(inputFile, 'utf-8'));

// 转换为课程格式
const course = {
  title: "绝望的主妇 S01E01",
  description: "美剧《绝望的主妇》第一季第一集字幕学习",
  icon: "📺",
  color: "from-purple-500 to-pink-500",
  level: "intermediate",
  questions: questions.map((q, idx) => ({
    id: q.id || idx + 1,
    chinese: q.cn || "",
    english: q.en || "",
    words: q.words || []
  }))
};

// 生成导入格式（包装成 courses 数组）
const importData = {
  courses: [course]
};

// 保存为导入文件
fs.writeFileSync(outputFile, JSON.stringify(importData, null, 2), 'utf-8');

console.log(`\n转换完成！`);
console.log(`课程标题: ${course.title}`);
console.log(`题目数量: ${course.questions.length}`);
console.log(`输出文件: ${outputFile}`);
console.log(`\n你可以在词库管理页面使用"批量导入"功能导入此文件。`);

