const testLoggedInFeedback = async () => {
  const baseUrl = 'https://backend.lanbito.asia/api';
  
  try {
    // 1. 注册测试用户
    console.log('1. 注册测试用户...');
    const registerResponse = await fetch(`${baseUrl}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        identifier: `test_${Date.now()}@example.com`,
        username: 'testuser_' + Date.now(),
        password: 'testpassword123'
      })
    });
    
    const registerResult = await registerResponse.json();
    console.log('注册结果:', registerResult);
    
    if (!registerResponse.ok) {
      throw new Error('注册失败: ' + (registerResult.error?.message || registerResult.message));
    }
    
    // 2. 登录获取token
    console.log('\n2. 登录获取token...');
    const loginResponse = await fetch(`${baseUrl}/auth/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        identifier: registerResult.data.user.email,
        password: 'testpassword123'
      })
    });
    
    const loginResult = await loginResponse.json();
    console.log('登录结果:', loginResult);
    
    if (!loginResponse.ok) {
      throw new Error('登录失败: ' + (loginResult.error?.message || loginResult.message));
    }
    
    const token = loginResult.data.token;
    const userId = loginResult.data.user.id;
    console.log('获取到token:', token.substring(0, 20) + '...');
    console.log('用户ID:', userId);
    
    // 3. 使用token提交反馈
    console.log('\n3. 使用token提交反馈...');
    const feedbackResponse = await fetch(`${baseUrl}/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        type: 'bug_report',
        title: '已登录用户测试反馈',
        description: '这是一个测试反馈，用于验证用户ID是否正确保存',
        contact: 'test@example.com'
      })
    });
    
    const feedbackResult = await feedbackResponse.json();
    console.log('反馈提交结果:', feedbackResult);
    
    if (!feedbackResponse.ok) {
      throw new Error('提交反馈失败: ' + feedbackResult.message);
    }
    
    // 检查返回的反馈数据中是否包含用户ID
    if (feedbackResult.data && feedbackResult.data.user_id) {
      console.log('✅ 成功：反馈中包含用户ID:', feedbackResult.data.user_id);
      console.log('✅ 用户ID匹配:', feedbackResult.data.user_id === userId ? '是' : '否');
    } else {
      console.log('❌ 错误：反馈中没有用户ID');
      console.log('反馈数据:', feedbackResult.data);
    }
    
  } catch (error) {
    console.error('测试失败:', error.message);
  }
};

testLoggedInFeedback();