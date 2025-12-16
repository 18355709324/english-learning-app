// 自动导入脚本 - 在浏览器控制台运行此脚本
// 或者访问 http://localhost:3000/import-test.html 页面会自动执行

(async function() {
  const CUSTOM_COURSES_KEY = "english-learning-custom-courses";
  
  console.log('🚀 开始导入课程...');
  
  try {
    // 加载课程数据
    const response = await fetch('/import-course.json');
    const data = await response.json();
    const courseData = data.courses[0];
    
    console.log('📚 课程信息:', courseData.title);
    console.log('📝 题目数量:', courseData.questions.length);
    
    // 获取现有课程
    const existingCourses = JSON.parse(localStorage.getItem(CUSTOM_COURSES_KEY) || '[]');
    
    // 检查是否已存在同名课程
    const existingIndex = existingCourses.findIndex(c => c.title === courseData.title);
    
    // 生成课程ID
    const courseId = `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // 计算时长
    const calculateDuration = (questionCount) => {
      const minutes = Math.ceil((questionCount * 30) / 60);
      return `${minutes} min`;
    };
    
    // 规范化课程数据
    const normalizedCourse = {
      id: courseId,
      title: courseData.title,
      description: courseData.description,
      icon: courseData.icon || '📚',
      color: courseData.color || 'from-blue-500 to-cyan-500',
      level: courseData.level || 'beginner',
      questionCount: courseData.questions.length,
      duration: calculateDuration(courseData.questions.length),
      questions: courseData.questions.map((q, idx) => ({
        id: q.id || idx + 1,
        chinese: q.chinese || q.cn || '',
        english: q.english || q.en || '',
        words: q.words || []
      })),
      status: 'in-progress',
      progress: 0
    };

    if (existingIndex >= 0) {
      // 更新现有课程
      existingCourses[existingIndex] = normalizedCourse;
      console.log('✅ 课程已更新！');
    } else {
      // 添加新课程
      existingCourses.push(normalizedCourse);
      console.log('✅ 课程导入成功！');
    }

    // 保存到localStorage
    localStorage.setItem(CUSTOM_COURSES_KEY, JSON.stringify(existingCourses));
    
    console.log('💾 数据已保存到 localStorage');
    console.log('📦 当前课程数量:', existingCourses.length);
    console.log('\n🎉 导入完成！现在可以返回首页查看课程了。');
    console.log('👉 访问: http://localhost:3000');
    
    return {
      success: true,
      courseId,
      courseCount: existingCourses.length
    };
  } catch (error) {
    console.error('❌ 导入失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
})();

