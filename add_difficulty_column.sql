-- 为 sentences 表添加 difficulty 字段
-- 在 Supabase Dashboard → SQL Editor 中执行此脚本

-- 添加 difficulty 字段（可选，允许为 null，以便兼容已有数据）
ALTER TABLE public.sentences
ADD COLUMN IF NOT EXISTS difficulty TEXT;

-- 为已有数据设置默认难度（可选，如果需要的话）
-- UPDATE public.sentences
-- SET difficulty = '中等'
-- WHERE difficulty IS NULL;

-- 验证：查看字段是否添加成功
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'sentences'
  AND column_name = 'difficulty';

