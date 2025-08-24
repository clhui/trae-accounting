// 使用Node.js 18+内置的fetch API

// 测试反馈功能
async function testFeedback() {
  const API_BASE = 'https://backend.lanbito.asia';
  
  try {
    // 1. 测试匿名用户提交反馈
    console.log('测试1: 匿名用户提交反馈');
    const anonymousResponse = await fetch(`${API_BASE}/api/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: 'bug_report',
        title: '匿名用户测试反馈',
        description: '这是一个匿名用户提交的测试反馈',
        contact: 'anonymous@test.com'
      })
    });
    
    const anonymousResult = await anonymousResponse.json();
    console.log('匿名用户反馈结果:', JSON.stringify(anonymousResult, null, 2));
    console.log('user_id 是否为空:', anonymousResult.data?.user_id === null || anonymousResult.data?.user_id === '');
    
    // 2. 尝试登录获取token（如果有测试用户）
    console.log('\n测试2: 尝试登录获取token');
    const loginResponse = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        identifier: 'test@example.com',
        password: 'test123456'
      })
    });
    
    if (loginResponse.ok) {
      const loginResult = await loginResponse.json();
      console.log('登录成功，获取到token');
      
      // 3. 使用token提交反馈
      console.log('\n测试3: 已登录用户提交反馈');
      const authenticatedResponse = await fetch(`${API_BASE}/api/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${loginResult.token}`
        },
        body: JSON.stringify({
          type: 'feature_request',
          title: '已登录用户测试反馈',
          description: '这是一个已登录用户提交的测试反馈',
          contact: 'user@test.com'
        })
      });
      
      const authenticatedResult = await authenticatedResponse.json();
      console.log('已登录用户反馈结果:', JSON.stringify(authenticatedResult, null, 2));
      console.log('user_id 是否已保存:', authenticatedResult.data?.user_id ? '是' : '否');
    } else {
      const loginError = await loginResponse.json();
      console.log('登录失败:', loginError.error?.message || '未知错误');
      console.log('跳过已登录用户测试');
    }
    
  } catch (error) {
    console.error('测试过程中发生错误:', error.message);
  }
}

testFeedback();