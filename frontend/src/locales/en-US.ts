export default {
  // Common
  common: {
    confirm: 'Confirm',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    search: 'Search',
    loading: 'Loading...',
    noData: 'No Data',
    success: 'Success',
    error: 'Error',
    back: 'Back'
  },

  // Navigation
  nav: {
    home: 'Home',
    records: 'Records',
    statistics: 'Statistics',
    settings: 'Settings'
  },

  // Settings Page
  settings: {
    title: 'Settings',
    appSettings: 'App Settings',
    theme: 'Theme',
    currency: 'Currency',
    language: 'Language',
    functionSettings: 'Function Settings',
    autoBackup: 'Auto Backup',
    budgetAlert: 'Budget Alert',
    dataManagement: 'Data Management',
    exportData: 'Export Data',
    importData: 'Import Data',
    clearData: 'Clear Data',
    accountManagement: 'Account Management',
    categoryManagement: 'Category Management',
    about: 'About',
    logout: 'Logout'
  },

  // Theme Options
  theme: {
    auto: 'Follow System',
    light: 'Light Mode',
    dark: 'Dark Mode'
  },

  // Language Options
  language: {
    'zh-CN': '简体中文',
    'en-US': 'English'
  },

  // Currency Options
  currency: {
    cny: 'Chinese Yuan (¥)',
    usd: 'US Dollar ($)',
    eur: 'Euro (€)',
    gbp: 'British Pound (£)'
  },

  // Records Page
  records: {
    title: 'Records',
    addRecord: 'Add Record',
    income: 'Income',
    expense: 'Expense',
    amount: 'Amount',
    category: 'Category',
    account: 'Account',
    note: 'Note',
    date: 'Date',
    selectCategory: 'Select Category',
    selectAccount: 'Select Account',
    enterAmount: 'Enter Amount',
    enterNote: 'Enter Note'
  },

  // Statistics Page
  statistics: {
    title: 'Statistics',
    overview: 'Overview',
    thisMonth: 'This Month',
    totalIncome: 'Total Income',
    totalExpense: 'Total Expense',
    balance: 'Balance',
    categoryStats: 'Category Statistics',
    trendChart: 'Trend Chart'
  },

  // Category Management
  categories: {
    title: 'Category Management',
    addCategory: 'Add Category',
    editCategory: 'Edit Category',
    categoryName: 'Category Name',
    categoryIcon: 'Category Icon',
    categoryColor: 'Category Color',
    selectIcon: 'Select Icon',
    selectColor: 'Select Color',
    deleteConfirm: 'After deleting the category, the category of related records will be cleared. Are you sure you want to delete?'
  },

  // Account Management
  accounts: {
    title: 'Account Management',
    addAccount: 'Add Account',
    editAccount: 'Edit Account',
    accountName: 'Account Name',
    accountType: 'Account Type',
    accountBalance: 'Account Balance',
    cash: 'Cash',
    bank: 'Bank Card',
    digital: 'Digital Wallet'
  },

  // Messages
  messages: {
    themeUpdated: 'Theme updated',
    currencyUpdated: 'Currency updated',
    languageUpdated: 'Language updated',
    autoBackupEnabled: 'Auto backup enabled',
    autoBackupDisabled: 'Auto backup disabled',
    budgetAlertEnabled: 'Budget alert enabled',
    budgetAlertDisabled: 'Budget alert disabled',
    dataExported: 'Data exported successfully',
    dataImported: 'Data imported successfully',
    exportFailed: 'Export failed, please try again',
    importFailed: 'Import failed, please try again',
    invalidFileType: 'Please select a JSON file',
    recordAdded: 'Record added successfully',
    recordUpdated: 'Record updated successfully',
    recordDeleted: 'Record deleted successfully',
    categoryAdded: 'Category added successfully',
    categoryUpdated: 'Category updated successfully',
    categoryDeleted: 'Category deleted successfully',
    accountAdded: 'Account added successfully',
    accountUpdated: 'Account updated successfully',
    accountDeleted: 'Account deleted successfully'
  },

  // Dialogs
  dialogs: {
    clearDataTitle: 'Clear Data',
    clearDataMessage: 'This operation will delete all record data and cannot be recovered. Are you sure you want to continue?',
    deleteRecordTitle: 'Confirm Delete',
    deleteRecordMessage: 'Are you sure you want to delete this record?',
    deleteCategoryTitle: 'Confirm Delete',
    deleteCategoryMessage: 'After deleting the category, the category of related records will be cleared. Are you sure you want to delete?',
    deleteAccountTitle: 'Confirm Delete',
    deleteAccountMessage: 'After deleting the account, the account of related records will be cleared. Are you sure you want to delete?'
  },

  // Help Page
  help: {
    title: 'Help',
    searchPlaceholder: 'Search help content',
    quickNav: 'Quick Navigation',
    basicFeatures: 'Basic Features',
    advancedFeatures: 'Advanced Features',
    faq: 'FAQ',
    contact: 'Contact Us',
    
    // Quick Navigation
    quickStart: 'Quick Start',
    recordManagement: 'Record Management',
    categorySettings: 'Category Settings',
    accountSettings: 'Account Settings',
    dataBackup: 'Data Backup',
    
    // Basic Features
    addRecord: 'Add Record',
    addRecordDesc: 'Click the "+" button to add income or expense records, select category, account, enter amount and notes.',
    viewRecords: 'View Records',
    viewRecordsDesc: 'View all transaction records on the home page, support filtering by date, category and account.',
    editRecord: 'Edit Record',
    editRecordDesc: 'Click on any record to view details and edit, or swipe left to delete.',
    statistics: 'Statistics',
    statisticsDesc: 'View income and expense statistics, category distribution charts and trend analysis.',
    
    // Advanced Features
    categoryManage: 'Category Management',
    categoryManageDesc: 'Create custom categories, set icons and colors to better organize your records.',
    accountManage: 'Account Management',
    accountManageDesc: 'Manage multiple accounts like cash, bank cards, digital wallets, track balances.',
    cloudSync: 'Cloud Sync',
    cloudSyncDesc: 'Data automatically syncs to cloud, supports multi-device access, offline caching, and auto-sync when online.',
    dataExport: 'Data Export',
    dataExportDesc: 'Export cloud data as JSON file for backup or data analysis.',
    dataImport: 'Data Import',
    dataImportDesc: 'Import data files to cloud account, supports data migration and recovery.',
    themeSettings: 'Theme Settings',
    themeSettingsDesc: 'Choose light mode, dark mode, or follow system theme.',
    languageSettings: 'Language Settings',
    languageSettingsDesc: 'Switch between Chinese and English interface languages.',
    
    // FAQ
    faqDataSafety: 'Is my data safe?',
    faqDataSafetyAnswer: 'Your data is securely stored in Supabase cloud database with enterprise-grade security standards, supporting data encryption and user isolation.',
    faqDataLoss: 'What if I lose my data?',
    faqDataLossAnswer: 'Data is stored in the cloud with automatic backup functionality. You can also export data for local backup anytime.',
    faqMultiDevice: 'Can I sync across multiple devices?',
    faqMultiDeviceAnswer: 'Yes, supports real-time multi-device sync. Login with the same account to automatically sync all data across different devices.',
    faqBugReport: 'How to report bugs?',
    faqBugReportAnswer: 'You can submit feedback through the "Feedback" page in settings, or contact us via email.',
    
    // Contact
    email: 'Email',
    emailDesc: 'Send us an email for technical support',
    github: 'GitHub',
    githubDesc: 'Submit issues or feature requests',
    feedback: 'Feedback',
    feedbackDesc: 'Use the in-app feedback feature'
  },

  // Feedback Page
  feedback: {
    title: 'Feedback',
    feedbackType: 'Feedback Type',
    bugReport: 'Bug Report',
    featureRequest: 'Feature Request',
    improvement: 'Improvement Suggestion',
    other: 'Other',
    
    // Form
    feedbackTitle: 'Title',
    titlePlaceholder: 'Please briefly describe the issue or suggestion',
    description: 'Description',
    descriptionPlaceholder: 'Please describe in detail, including steps to reproduce (for bugs) or specific requirements (for features)',
    contact: 'Contact (Optional)',
    contactPlaceholder: 'Email or other contact information for follow-up',
    deviceInfo: 'Device Information',
    
    // Device Info
    browser: 'Browser',
    os: 'Operating System',
    screenSize: 'Screen Resolution',
    language: 'Language',
    
    // Actions
    submit: 'Submit Feedback',
    reset: 'Reset Form',
    
    // Other Contact
    otherContact: 'Other Contact Methods',
    emailSupport: 'Email Support',
    emailSupportDesc: 'Send email directly for technical support',
    githubIssues: 'GitHub Issues',
    githubIssuesDesc: 'Submit issues or view development progress',
    
    // History
    feedbackHistory: 'Feedback History',
    noHistory: 'No feedback history',
    viewHistory: 'View History',
    statusPending: 'Pending',
    statusInProgress: 'In Progress',
    statusResolved: 'Resolved',
    statusClosed: 'Closed',
    
    // Messages
    submitSuccess: 'Feedback submitted successfully, thank you for your suggestion!',
    submitError: 'Submission failed, please try again later',
    formInvalid: 'Please fill in all required fields',
    titleRequired: 'Please enter feedback title',
    descriptionRequired: 'Please enter detailed description',
    copied: 'Copied to clipboard',
    copyError: 'Copy failed'
  }
}