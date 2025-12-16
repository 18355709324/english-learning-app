const fs = require('fs');
const path = require('path');

// 读取导入文件
const importFile = path.join(__dirname, '../public/import-course.json');
const courseData = JSON.parse(fs.readFileSync(importFile, 'utf-8'));

const course = courseData.courses[0];

console.log('📚 课程导入验证\n');
console.log('='.repeat(50));
console.log('课程信息:');
console.log(`  标题: ${course.title}`);
console.log(`  描述: ${course.description}`);
console.log(`  图标: ${course.icon}`);
console.log(`  颜色: ${course.color}`);
console.log(`  难度: ${course.level}`);
console.log(`  题目数量: ${course.questions.length}`);
console.log('='.repeat(50));

// 验证数据完整性
console.log('\n✅ 数据验证:');

let validCount = 0;
let invalidCount = 0;
const errors = [];

course.questions.forEach((q, idx) => {
  const hasChinese = q.chinese && q.chinese.trim() !== '';
  const hasEnglish = q.english && q.english.trim() !== '';
  const hasWords = q.words && q.words.length > 0;
  
  if (hasChinese && hasEnglish && hasWords) {
    validCount++;
  } else {
    invalidCount++;
    errors.push({
      id: q.id || idx + 1,
      chinese: hasChinese,
      english: hasEnglish,
      words: hasWords
    });
  }
});

console.log(`  有效题目: ${validCount}/${course.questions.length}`);
console.log(`  无效题目: ${invalidCount}`);

if (invalidCount > 0) {
  console.log('\n⚠️  无效题目详情:');
  errors.slice(0, 5).forEach(err => {
    console.log(`    题目 ${err.id}: 中文=${err.chinese}, 英文=${err.english}, 单词=${err.words}`);
  });
  if (errors.length > 5) {
    console.log(`    ... 还有 ${errors.length - 5} 个无效题目`);
  }
}

// 检查前几条数据
console.log('\n📝 前3题示例:');
course.questions.slice(0, 3).forEach((q, i) => {
  console.log(`\n  题目 ${i + 1} (ID: ${q.id}):`);
  console.log(`    中文: ${(q.chinese || '').substring(0, 50)}${(q.chinese || '').length > 50 ? '...' : ''}`);
  console.log(`    英文: ${(q.english || '').substring(0, 50)}${(q.english || '').length > 50 ? '...' : ''}`);
  console.log(`    单词数: ${(q.words || []).length}`);
});

console.log('\n' + '='.repeat(50));
console.log('✅ 数据验证完成！');
console.log('\n📌 下一步操作:');
console.log('1. 打开浏览器访问: http://localhost:3000/import-test.html');
console.log('2. 页面会自动导入课程');
console.log('3. 导入成功后，返回首页查看课程');
console.log('='.repeat(50));

