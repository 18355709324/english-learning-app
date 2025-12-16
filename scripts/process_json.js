const fs = require('fs');
const path = require('path');

// 读取输入文件路径
const inputFile = process.argv[2] || path.join(__dirname, '../data/s01e01.json');
const outputFile = inputFile.replace('.json', '_fixed.json');

console.log(`读取文件: ${inputFile}`);
console.log(`输出文件: ${outputFile}`);

// 读取原始数据
const rawData = JSON.parse(fs.readFileSync(inputFile, 'utf-8'));

// 判断是否以标点符号结尾
function endsWithPunctuation(text) {
  if (!text || text.trim() === '') return false;
  const trimmed = text.trim();
  return /[.!?"]$/.test(trimmed);
}

// 判断下一句是否应该合并到当前句
// 返回 true 表示应该合并，false 表示应该分开
function shouldMergeNext(currentEn, nextEn) {
  if (!nextEn || nextEn.trim() === '') return false;
  
  const currentTrimmed = currentEn.trim();
  const nextTrimmed = nextEn.trim();
  
  // 如果下一句首字母是大写，说明是新句子，不合并
  if (/^[A-Z]/.test(nextTrimmed)) {
    return false;
  }
  
  // 如果当前句子以某些词结尾，说明句子可能完整，不合并
  const endingWords = ['said', 'asked', 'replied', 'thought', 'knew', 'saw', 'went', 'came', 'left', 'told', 'wanted', 'needed', 'decided', 'killed', 'died', 'found', 'got', 'made', 'brought', 'took', 'gave', 'put', 'did', 'was', 'were', 'is', 'are', 'had', 'have', 'has'];
  const lastWord = currentTrimmed.split(/\s+/).pop().toLowerCase().replace(/[.,!?;:"]/g, '');
  if (endingWords.includes(lastWord)) {
    return false;
  }
  
  // 如果下一句以某些词开头，可能是新句子，不合并
  const nextFirstWord = nextTrimmed.split(/\s+/)[0].toLowerCase();
  const newSentenceStarters = ['i', 'he', 'she', 'they', 'we', 'you', 'it', 'this', 'that', 'there', 'here', 'then', 'now', 'so', 'but', 'and', 'or', 'if', 'when', 'where', 'who', 'what', 'why', 'how'];
  if (newSentenceStarters.includes(nextFirstWord) && currentTrimmed.length > 20) {
    // 如果当前句已经比较长，且下一句以这些词开头，可能是新句子
    return false;
  }
  
  // 默认合并（如果下一句是小写开头，且当前句没有明显结束标志）
  return true;
}

// 清洗中文：移除所有英文字母，只保留中文字符和中文标点
function cleanChinese(text) {
  if (!text) return '';
  // 保留中文字符、中文标点、数字、空格
  return text.replace(/[a-zA-Z]/g, '').trim();
}

// 格式化英文：首字母大写
function formatEnglish(text) {
  if (!text) return '';
  const trimmed = text.trim();
  if (trimmed.length === 0) return '';
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

// 生成 words 数组：按空格拆分，标点符号单独拆分
function generateWords(english) {
  if (!english) return [];
  
  const words = [];
  // 使用正则表达式匹配单词和标点符号
  const tokens = english.match(/\w+|[.,!?;:"]/g) || [];
  
  for (const token of tokens) {
    if (/[.,!?;:"]/.test(token)) {
      // 标点符号直接添加
      words.push(token);
    } else {
      // 单词：首字母大写，其余小写
      const capitalized = token.charAt(0).toUpperCase() + token.slice(1).toLowerCase();
      words.push(capitalized);
    }
  }
  
  return words;
}

// 合并断句
function mergeSentences(data) {
  const merged = [];
  let i = 0;
  
  while (i < data.length) {
    let currentEn = data[i].en || '';
    let currentCn = data[i].cn || '';
    
    // 如果当前句子不以标点符号结尾，尝试合并下一句
    // 但要根据语义判断是否应该合并
    while (i + 1 < data.length) {
      const nextItem = data[i + 1];
      const nextEn = nextItem.en || '';
      
      // 如果当前句子以标点符号结尾，停止合并
      if (endsWithPunctuation(currentEn)) {
        break;
      }
      
      // 判断是否应该合并下一句
      if (!shouldMergeNext(currentEn, nextEn)) {
        break;
      }
      
      // 合并下一句
      i++;
      const nextCn = nextItem.cn || '';
      
      // 合并英文（添加空格）
      currentEn = (currentEn.trim() + ' ' + nextEn.trim()).trim();
      
      // 合并中文（添加空格）
      currentCn = (currentCn.trim() + ' ' + nextCn.trim()).trim();
    }
    
    // 清洗和格式化
    const cleanedCn = cleanChinese(currentCn);
    const formattedEn = formatEnglish(currentEn);
    
    // 生成 words 数组
    const words = generateWords(formattedEn);
    
    // 添加到结果数组
    merged.push({
      id: merged.length + 1,
      en: formattedEn,
      cn: cleanedCn,
      words: words
    });
    
    i++;
  }
  
  return merged;
}

// 处理数据
console.log('开始处理数据...');
const processedData = mergeSentences(rawData);

// 保存结果
fs.writeFileSync(outputFile, JSON.stringify(processedData, null, 2), 'utf-8');

console.log(`处理完成！`);
console.log(`原始条目数: ${rawData.length}`);
console.log(`处理后条目数: ${processedData.length}`);
console.log(`结果已保存到: ${outputFile}`);

