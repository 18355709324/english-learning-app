-- 为所有课程设置 app_course_id 字段
-- 在 Supabase Dashboard → SQL Editor 中执行此脚本

-- 1. 日常对话
UPDATE public.courses
SET app_course_id = 'daily-conversation'
WHERE title = '日常对话' OR title LIKE '%日常对话%';

-- 2. 购物场景
UPDATE public.courses
SET app_course_id = 'shopping'
WHERE title = '购物场景' OR title LIKE '%购物场景%';

-- 3. 餐厅场景
UPDATE public.courses
SET app_course_id = 'restaurant'
WHERE title = '餐厅场景' OR title LIKE '%餐厅场景%';

-- 4. 旅行场景
UPDATE public.courses
SET app_course_id = 'travel'
WHERE title = '旅行场景' OR title LIKE '%旅行场景%';

-- 5. 工作场景
UPDATE public.courses
SET app_course_id = 'work'
WHERE title = '工作场景' OR title LIKE '%工作场景%';

-- 6. 学习场景
UPDATE public.courses
SET app_course_id = 'learning'
WHERE title = '学习场景' OR title LIKE '%学习场景%';

-- 7. 交通场景
UPDATE public.courses
SET app_course_id = 'transportation'
WHERE title = '交通场景' OR title LIKE '%交通场景%';

-- 8. 健康场景
UPDATE public.courses
SET app_course_id = 'health'
WHERE title = '健康场景' OR title LIKE '%健康场景%';

-- 9. 时间表达
UPDATE public.courses
SET app_course_id = 'time'
WHERE title = '时间表达' OR title LIKE '%时间表达%';

-- 10. 情感表达
UPDATE public.courses
SET app_course_id = 'emotion'
WHERE title = '情感表达' OR title LIKE '%情感表达%';

-- 验证：查看所有已设置的课程
SELECT id, title, app_course_id, created_at
FROM public.courses
WHERE app_course_id IS NOT NULL
ORDER BY created_at;

