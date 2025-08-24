export default {
  // 通用
  common: {
    confirm: '确定',
    cancel: '取消',
    save: '保存',
    delete: '删除',
    edit: '编辑',
    add: '添加',
    search: '搜索',
    loading: '加载中...',
    noData: '暂无数据',
    success: '操作成功',
    error: '操作失败',
    back: '返回'
  },

  // 导航
  nav: {
    home: '首页',
    records: '记录',
    statistics: '统计',
    settings: '设置'
  },

  // 设置页面
  settings: {
    title: '设置',
    appSettings: '应用设置',
    theme: '主题',
    currency: '货币单位',
    language: '语言',
    functionSettings: '功能设置',
    autoBackup: '自动备份',
    budgetAlert: '预算提醒',
    dataManagement: '数据管理',
    exportData: '导出数据',
    importData: '导入数据',
    clearData: '清空数据',
    accountManagement: '账户管理',
    categoryManagement: '分类管理',
    about: '关于',
    logout: '退出登录'
  },

  // 主题选项
  theme: {
    auto: '跟随系统',
    light: '浅色模式',
    dark: '深色模式'
  },

  // 语言选项
  language: {
    'zh-CN': '简体中文',
    'en-US': 'English'
  },

  // 货币选项
  currency: {
    cny: '人民币 (¥)',
    usd: '美元 ($)',
    eur: '欧元 (€)',
    gbp: '英镑 (£)'
  },

  // 记录页面
  records: {
    title: '记录',
    addRecord: '添加记录',
    income: '收入',
    expense: '支出',
    amount: '金额',
    category: '分类',
    account: '账户',
    note: '备注',
    date: '日期',
    selectCategory: '选择分类',
    selectAccount: '选择账户',
    enterAmount: '请输入金额',
    enterNote: '请输入备注'
  },

  // 统计页面
  statistics: {
    title: '统计',
    overview: '概览',
    thisMonth: '本月',
    totalIncome: '总收入',
    totalExpense: '总支出',
    balance: '结余',
    categoryStats: '分类统计',
    trendChart: '趋势图表'
  },

  // 分类管理
  categories: {
    title: '分类管理',
    addCategory: '添加分类',
    editCategory: '编辑分类',
    categoryName: '分类名称',
    categoryIcon: '分类图标',
    categoryColor: '分类颜色',
    selectIcon: '选择图标',
    selectColor: '选择颜色',
    deleteConfirm: '删除分类后，相关记录的分类将被清空，确定要删除吗？'
  },

  // 账户管理
  accounts: {
    title: '账户管理',
    addAccount: '添加账户',
    editAccount: '编辑账户',
    accountName: '账户名称',
    accountType: '账户类型',
    accountBalance: '账户余额',
    cash: '现金',
    bank: '银行卡',
    digital: '数字钱包'
  },

  // 消息提示
  messages: {
    themeUpdated: '主题已更新',
    currencyUpdated: '货币单位已更新',
    languageUpdated: '语言已更新',
    autoBackupEnabled: '已开启自动备份',
    autoBackupDisabled: '已关闭自动备份',
    budgetAlertEnabled: '已开启预算提醒',
    budgetAlertDisabled: '已关闭预算提醒',
    dataExported: '数据导出成功',
    dataImported: '数据导入成功',
    exportFailed: '导出失败，请重试',
    importFailed: '导入失败，请重试',
    invalidFileType: '请选择JSON格式的文件',
    recordAdded: '记录添加成功',
    recordUpdated: '记录更新成功',
    recordDeleted: '记录删除成功',
    categoryAdded: '分类添加成功',
    categoryUpdated: '分类更新成功',
    categoryDeleted: '分类删除成功',
    accountAdded: '账户添加成功',
    accountUpdated: '账户更新成功',
    accountDeleted: '账户删除成功'
  },

  // 对话框
  dialogs: {
    clearDataTitle: '清空数据',
    clearDataMessage: '此操作将删除所有记录数据，且无法恢复。确定要继续吗？',
    deleteRecordTitle: '确认删除',
    deleteRecordMessage: '确定要删除这条记录吗？',
    deleteCategoryTitle: '确认删除',
    deleteCategoryMessage: '删除分类后，相关记录的分类将被清空，确定要删除吗？',
    deleteAccountTitle: '确认删除',
    deleteAccountMessage: '删除账户后，相关记录的账户将被清空，确定要删除吗？'
  },

  // 帮助页面
  help: {
    title: '使用帮助',
    searchPlaceholder: '搜索帮助内容',
    quickNav: '快速导航',
    basicFeatures: '基础功能',
    advancedFeatures: '高级功能',
    faq: '常见问题',
    contact: '联系我们',
    
    // 基础功能
    addRecord: '添加记录',
    addRecordDesc: '记录您的收入和支出，轻松管理财务。',
    addRecordStep1: '点击首页的"+"按钮或底部导航的"记账"',
    addRecordStep2: '选择收入或支出类型',
    addRecordStep3: '输入金额、选择分类和账户',
    addRecordStep4: '添加备注并保存记录',
    
    viewRecords: '查看记录',
    viewRecordsDesc: '查看和管理您的所有财务记录。',
    viewRecordsFeature1: '按日期、分类、账户筛选记录',
    viewRecordsFeature2: '点击记录查看详细信息',
    viewRecordsFeature3: '长按记录进行编辑或删除',
    
    statistics: '统计分析',
    statisticsDesc: '通过图表和数据分析您的财务状况。',
    statisticsFeature1: '查看收支趋势图表',
    statisticsFeature2: '分析各分类的支出占比',
    statisticsFeature3: '设置和跟踪预算目标',
    
    // 高级功能
    categoryManagement: '分类管理',
    categoryManagementDesc: '自定义收支分类，让记账更精准。',
    categoryFeature1: '添加、编辑、删除分类',
    categoryFeature2: '设置分类图标和颜色',
    categoryFeature3: '区分收入和支出分类',
    
    accountManagement: '账户管理',
    accountManagementDesc: '管理您的各种账户，如现金、银行卡等。',
    accountFeature1: '添加多个账户（现金、银行卡、数字钱包）',
    accountFeature2: '设置账户初始余额',
    accountFeature3: '查看各账户余额变化',
    
    dataManagement: '数据管理',
    dataManagementDesc: '管理云端数据，支持导出备份和数据迁移。',
    dataFeature1: '云端数据自动同步和备份',
    dataFeature2: '导出云端数据到本地文件',
    dataFeature3: '从文件导入数据到云端账户',
    
    // Advanced Features
    categoryManage: '分类管理',
    categoryManageDesc: '创建自定义分类，设置图标和颜色，更好地组织您的记录。',
    accountManage: '账户管理',
    accountManageDesc: '管理多个账户，如现金、银行卡、数字钱包等，跟踪余额变化。',
    cloudSync: '云端同步',
    cloudSyncDesc: '数据自动同步到云端，支持多设备访问，离线时本地缓存，联网后自动同步。',
    dataExport: '数据导出',
    dataExportDesc: '将云端数据导出为JSON文件，用于备份或数据分析。',
    dataImport: '数据导入',
    dataImportDesc: '导入数据文件到云端账户，支持数据迁移和恢复。',
    themeSettings: '主题设置',
    themeSettingsDesc: '选择浅色模式、深色模式或跟随系统主题。',
    languageSettings: '语言设置',
    languageSettingsDesc: '切换中文和英文界面语言。',
    
    // 常见问题
    faqQ1: '如何修改已添加的记录？',
    faqA1: '在记录列表中点击要修改的记录，进入详情页面后点击编辑按钮即可修改。',
    
    faqQ2: '数据会自动同步到云端吗？',
    faqA2: '是的，数据会自动同步到Supabase云数据库，支持多设备实时同步。',
    
    faqQ3: '如何设置预算提醒？',
    faqA3: '在设置页面开启预算提醒功能，然后在统计页面设置各分类的预算金额。',
    
    faqQ4: '忘记密码怎么办？',
    faqA4: '请联系客服或通过意见反馈功能获取帮助。',
    
    // FAQ
    faqDataSafety: '我的数据安全吗？',
    faqDataSafetyAnswer: '您的数据安全存储在Supabase云数据库中，采用企业级安全标准，支持数据加密和用户隔离。',
    faqDataLoss: '如果数据丢失怎么办？',
    faqDataLossAnswer: '数据存储在云端，具备自动备份功能。您也可以随时导出数据进行本地备份。',
    faqMultiDevice: '可以多设备同步吗？',
    faqMultiDeviceAnswer: '支持多设备实时同步。登录同一账户即可在不同设备间自动同步所有数据。',
    
    // 联系方式
    feedback: '意见反馈',
    submitFeedback: '提交反馈'
  },

  // 反馈页面
  feedback: {
    title: '意见反馈',
    type: '反馈类型',
    details: '反馈详情',
    
    // 反馈类型
    bugReport: 'Bug反馈',
    featureRequest: '功能建议',
    improvement: '体验改进',
    other: '其他',
    
    // 表单字段
    titleLabel: '标题',
    titlePlaceholder: '请简要描述问题或建议',
    titleRequired: '请输入标题',
    
    descriptionLabel: '详细描述',
    descriptionPlaceholder: '请详细描述您遇到的问题或建议...',
    descriptionRequired: '请输入详细描述',
    
    contactLabel: '联系方式',
    contactPlaceholder: '邮箱或微信号（可选）',
    
    deviceInfo: '设备信息',
    deviceInfoTitle: '设备信息详情',
    browser: '浏览器',
    screen: '屏幕分辨率',
    timestamp: '时间戳',
    
    // 其他联系方式
    otherContact: '其他联系方式',
    email: '邮箱联系',
    github: 'GitHub Issues',
    githubIssuesDesc: '在GitHub上提交问题或查看开发进度',
    
    // 反馈历史
    history: '反馈历史',
    viewHistory: '查看历史反馈',
    historyTitle: '历史反馈记录',
    records: '条记录',
    noRecords: '暂无记录',
    noHistoryRecords: '暂无历史反馈记录',
    detailTitle: '反馈详情',
    statusPending: '待处理',
    statusInProgress: '处理中',
    statusResolved: '已解决',
    statusClosed: '已关闭',
    
    // 反馈详情页面
    status: '状态',
    submitTime: '提交时间',
    updateTime: '更新时间',
    contactInfo: '联系方式',
    language: '语言',
    notFound: '反馈不存在',
    loadError: '加载失败',
    invalidId: '无效的反馈ID',
    
    // 操作
    submit: '提交反馈',
    copy: '复制',
    copied: '已复制到剪贴板',
    copyError: '复制失败',
    
    // 消息
    formInvalid: '请填写完整信息',
    submitSuccess: '反馈提交成功，感谢您的建议！',
    submitError: '提交失败，请稍后重试'
  }
}