-- 默认分类和账户类型数据
-- 注意：这些数据需要在用户注册后手动插入，或者通过应用程序逻辑自动创建

-- 默认收入分类
-- INSERT INTO public.categories (user_id, name, type, icon, color) VALUES
-- ('{USER_ID}', '工资', 'income', '💰', '#4CAF50'),
-- ('{USER_ID}', '奖金', 'income', '🎁', '#8BC34A'),
-- ('{USER_ID}', '投资收益', 'income', '📈', '#2196F3'),
-- ('{USER_ID}', '兼职收入', 'income', '💼', '#FF9800'),
-- ('{USER_ID}', '其他收入', 'income', '💵', '#9C27B0');

-- 默认支出分类
-- INSERT INTO public.categories (user_id, name, type, icon, color) VALUES
-- ('{USER_ID}', '餐饮', 'expense', '🍽️', '#F44336'),
-- ('{USER_ID}', '交通', 'expense', '🚗', '#FF5722'),
-- ('{USER_ID}', '购物', 'expense', '🛍️', '#E91E63'),
-- ('{USER_ID}', '娱乐', 'expense', '🎮', '#9C27B0'),
-- ('{USER_ID}', '医疗', 'expense', '🏥', '#607D8B'),
-- ('{USER_ID}', '教育', 'expense', '📚', '#3F51B5'),
-- ('{USER_ID}', '住房', 'expense', '🏠', '#795548'),
-- ('{USER_ID}', '通讯', 'expense', '📱', '#009688'),
-- ('{USER_ID}', '水电费', 'expense', '💡', '#FFC107'),
-- ('{USER_ID}', '其他支出', 'expense', '💸', '#757575');

-- 默认账户类型
-- INSERT INTO public.accounts (user_id, name, type, balance) VALUES
-- ('{USER_ID}', '现金', '现金', 0.00),
-- ('{USER_ID}', '银行卡', '银行卡', 0.00),
-- ('{USER_ID}', '支付宝', '电子钱包', 0.00),
-- ('{USER_ID}', '微信钱包', '电子钱包', 0.00),
-- ('{USER_ID}', '信用卡', '信用卡', 0.00);

-- 为特定用户创建默认数据的函数
CREATE OR REPLACE FUNCTION create_default_user_data(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
    -- 创建默认收入分类
    INSERT INTO public.categories (user_id, name, type, icon, color) VALUES
    (p_user_id, '工资', 'income', '💰', '#4CAF50'),
    (p_user_id, '奖金', 'income', '🎁', '#8BC34A'),
    (p_user_id, '投资收益', 'income', '📈', '#2196F3'),
    (p_user_id, '兼职收入', 'income', '💼', '#FF9800'),
    (p_user_id, '其他收入', 'income', '💵', '#9C27B0');
    
    -- 创建默认支出分类
    INSERT INTO public.categories (user_id, name, type, icon, color) VALUES
    (p_user_id, '餐饮', 'expense', '🍽️', '#F44336'),
    (p_user_id, '交通', 'expense', '🚗', '#FF5722'),
    (p_user_id, '购物', 'expense', '🛍️', '#E91E63'),
    (p_user_id, '娱乐', 'expense', '🎮', '#9C27B0'),
    (p_user_id, '医疗', 'expense', '🏥', '#607D8B'),
    (p_user_id, '教育', 'expense', '📚', '#3F51B5'),
    (p_user_id, '住房', 'expense', '🏠', '#795548'),
    (p_user_id, '通讯', 'expense', '📱', '#009688'),
    (p_user_id, '水电费', 'expense', '💡', '#FFC107'),
    (p_user_id, '其他支出', 'expense', '💸', '#757575');
    
    -- 创建默认账户
    INSERT INTO public.accounts (user_id, name, type, balance) VALUES
    (p_user_id, '现金', '现金', 0.00),
    (p_user_id, '银行卡', '银行卡', 0.00),
    (p_user_id, '支付宝', '电子钱包', 0.00),
    (p_user_id, '微信钱包', '电子钱包', 0.00),
    (p_user_id, '信用卡', '信用卡', 0.00);
END;
$$ LANGUAGE plpgsql;

-- 使用示例：
-- SELECT create_default_user_data('your-user-id-here');

-- 为现有用户创建默认数据（如果需要）
-- 注意：请将 'your-user-id' 替换为实际的用户ID
-- SELECT create_default_user_data('3cb90853-b1da-4999-8b5a-1234567890ab');