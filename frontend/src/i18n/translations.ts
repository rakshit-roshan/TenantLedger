export type Language = 'en' | 'hi' | 'mr';

export const translations = {
  en: {
    appName: 'Gharkhata',
    appSubtitle: 'Multi-Tenant Rent Management Platform',
    // Navigation
    navDashboard: 'Dashboard',
    navBuildings: 'Buildings & Units',
    navTenants: 'Tenants & KYC',
    navLeases: 'Leases & Agreements',
    navRent: 'Rent & Payments',
    navReminders: 'Reminder Automation',
    navBrokerage: 'Broker Pipeline',
    navTickets: 'Maintenance & SLA',
    navReports: 'Financial Reports',
    navSettings: 'Settings & Profile',
    navAudit: 'Audit & Activity Log',
    navNotifications: 'Notifications',
    navOnboarding: 'Add New Building',
    
    // Header & Filter
    allBuildings: 'All Buildings',
    searchPlaceholder: 'Search unit, tenant, phone, lease...',
    switchOrg: 'Switch Organisation',
    roleLabel: 'Role',
    buildingScope: 'Scope',
    
    // Top tiles
    tileCollectedVsBilled: 'Collected vs Billed',
    tileStillToCollect: 'Still to Collect',
    tileOccupancy: 'Occupancy Rate',
    tileDepositsHeld: 'Security Deposits Held',
    tileOverdue: 'Overdue Rent',
    tileDueSoon: 'Due in 7 Days',
    tileVacancyLoss: 'Vacancy Loss / mo',
    
    // Unit statuses
    statusPaid: 'PAID',
    statusDue: 'DUE',
    statusOverdue: 'OVERDUE',
    statusNotice: 'NOTICE',
    statusVacant: 'VACANT',
    statusMaintenance: 'MAINTENANCE',
    statusReserved: 'RESERVED',
    
    // Common Actions
    recordPayment: 'Record Payment',
    sendReminder: 'Send Reminder',
    viewDetails: 'View Details',
    exportPdf: 'Export PDF',
    exportExcel: 'Export Excel',
    addNewUnit: 'Add Unit',
    bulkAdd: 'Bulk Add Units',
    copyFloor: 'Copy Floor',
    importCsv: 'Import CSV',
    generateDraft: 'Generate Draft PDF',
    renewLease: 'Renew Lease (+Increase)',
    moveOutChecklist: 'Move-out Settlement',
    revealSensitive: 'Reveal (Logged)',
    maskNumber: 'Mask Number',
    
    // Roles
    role_OWNER: 'Owner',
    role_CO_OWNER: 'Co-Owner',
    role_PROPERTY_MANAGER: 'Property Manager',
    role_ACCOUNTANT: 'Accountant',
    role_CARETAKER: 'Caretaker',
    role_BROKER: 'Broker',
    role_BROKER_STAFF: 'Broker Staff',
    role_TENANT: 'Tenant',
    role_VENDOR: 'Vendor',
    role_PLATFORM_ADMIN: 'Platform Admin',

    // Reminder channels
    channelWhatsapp: 'WhatsApp Business',
    channelSms: 'SMS Gateway',
    channelEmail: 'Email',
    channelVoice: 'Automated Voice Call',
    
    // Financial & Ledger
    ledgerTitle: 'Append-Only Ledger',
    reversePayment: 'Reverse Entry',
    reversalReason: 'Reason for Reversal',
    receiptNumber: 'Receipt #',
    financialYear: 'Financial Year',
    
    // Currency
    rupees: '₹',
    paise: 'Paise',
  },
  hi: {
    appName: 'घरखाता',
    appSubtitle: 'बहु-किराया प्रबंधन प्रणाली',
    // Navigation
    navDashboard: 'डैशबोर्ड',
    navBuildings: 'इमारतें और इकाइयां',
    navTenants: 'किरायेदार और केवाईसी',
    navLeases: 'अनुबंध और लीज़',
    navRent: 'किराया और भुगतान',
    navReminders: 'रिमाइंडर ऑटोमेशन',
    navBrokerage: 'दलाल पाइपलाइन',
    navTickets: 'रखरखाव और टिकट',
    navReports: 'वित्तीय रिपोर्ट',
    navSettings: 'सेटिंग्स और प्रोफाइल',
    navAudit: 'ऑडिट और एक्टिविटी लॉग',
    navNotifications: 'सूचनाएं',
    navOnboarding: 'नई इमारत जोड़ें',
    
    // Header & Filter
    allBuildings: 'सभी इमारतें',
    searchPlaceholder: 'इकाई, किरायेदार, फोन खोजें...',
    switchOrg: 'संस्था बदलें',
    roleLabel: 'भूमिका',
    buildingScope: 'दायरा',
    
    // Top tiles
    tileCollectedVsBilled: 'वसूला गया / कुल बिल',
    tileStillToCollect: 'बकाया राशि',
    tileOccupancy: 'कब्ज़ा दर (ऑक्यूपेंसी)',
    tileDepositsHeld: 'जमा अमानत राशि (डिपॉज़िट)',
    tileOverdue: 'अतिदेय किराया (ओवरड्यू)',
    tileDueSoon: '7 दिनों में देय',
    tileVacancyLoss: 'खाली इकाई नुकसान / माह',
    
    // Unit statuses
    statusPaid: 'भुगतान पूर्ण',
    statusDue: 'देय',
    statusOverdue: 'अतिदेय (ओवरड्यू)',
    statusNotice: 'नोटिस पर',
    statusVacant: 'रिक्त',
    statusMaintenance: 'रखरखाव कार्य',
    statusReserved: 'आरक्षित',
    
    // Common Actions
    recordPayment: 'भुगतान दर्ज करें',
    sendReminder: 'रिमाइंडर भेजें',
    viewDetails: 'विवरण देखें',
    exportPdf: 'पीडीएफ डाउनलोड',
    exportExcel: 'एक्सेल डाउनलोड',
    addNewUnit: 'नई इकाई जोड़ें',
    bulkAdd: 'थोक इकाइयां जोड़ें',
    copyFloor: 'मंजिल कॉपी करें',
    importCsv: 'सीएसवी आयात करें',
    generateDraft: 'ड्राफ्ट अनुबंध बनाएं',
    renewLease: 'अनुबंध नवीनीकरण (+वृद्धि)',
    moveOutChecklist: 'निकासी व जमा निपटान',
    revealSensitive: 'गोपनीय देखें (ऑडिट)',
    maskNumber: 'मास्क करें',
    
    // Roles
    role_OWNER: 'मालिक (Owner)',
    role_CO_OWNER: 'सह-मालिक (Co-Owner)',
    role_PROPERTY_MANAGER: 'प्रॉपर्टी मैनेजर',
    role_ACCOUNTANT: 'मुनीम / एकाउंटेंट',
    role_CARETAKER: 'केयरटेकर / चौकीदार',
    role_BROKER: 'दलाल / ब्रोकर',
    role_BROKER_STAFF: 'ब्रोकर कर्मचारी',
    role_TENANT: 'किरायेदार',
    role_VENDOR: 'विक्रेता / कारीगर',
    role_PLATFORM_ADMIN: 'प्लेटफॉर्म एडमिन',

    // Reminder channels
    channelWhatsapp: 'व्हाट्सएप',
    channelSms: 'एसएमएस',
    channelEmail: 'ईमेल',
    channelVoice: 'ऑटोमेटेड वॉइस कॉल',
    
    // Financial & Ledger
    ledgerTitle: 'लेखा बही (खाता)',
    reversePayment: 'प्रविष्टि उलटें (रिवर्सल)',
    reversalReason: 'उलटने का कारण',
    receiptNumber: 'रसीद संख्या',
    financialYear: 'वित्तीय वर्ष',
    
    // Currency
    rupees: '₹',
    paise: 'पैसे',
  },
  mr: {
    appName: 'घरखाते',
    appSubtitle: 'भाडे व्यवस्थापन व्यासपीठ',
    // Navigation
    navDashboard: 'डॅशबोर्ड',
    navBuildings: 'इमारती आणि युनिट्स',
    navTenants: 'भाडेकरू आणि केवायसी',
    navLeases: 'भाडे करार',
    navRent: 'भाडे आणि पावती',
    navReminders: 'स्मरणपत्र (रिमाइंडर्स)',
    navBrokerage: 'दलाली व नूतनीकरण',
    navTickets: 'दुरुस्ती आणि तक्रारी',
    navReports: 'आर्थिक अहवाल',
    navSettings: 'सेटिंग्ज आणि प्रोफाइल',
    navAudit: 'ऑडिट आणि ॲक्टिव्हिटी लॉग',
    navNotifications: 'सूचना',
    navOnboarding: 'नवीन इमारत जोडा',
    
    // Header & Filter
    allBuildings: 'सर्व इमारती',
    searchPlaceholder: 'युनिट, भाडेकरू, फोन शोधा...',
    switchOrg: 'संस्था बदला',
    roleLabel: 'भूमिका',
    buildingScope: 'मर्यादा',
    
    // Top tiles
    tileCollectedVsBilled: 'वसूल / एकूण बिल',
    tileStillToCollect: 'येणे बाकी रक्कम',
    tileOccupancy: 'व्याप्ती दर',
    tileDepositsHeld: 'ठेव ठेव रक्कम (डिपॉझिट)',
    tileOverdue: 'थकबाकी (ओव्हरड्यू)',
    tileDueSoon: '७ दिवसांत देय',
    tileVacancyLoss: 'रिक्त नुकसान / महिना',
    
    // Unit statuses
    statusPaid: 'भरले',
    statusDue: 'देय',
    statusOverdue: 'थकबाकी',
    statusNotice: 'नोटीसवर',
    statusVacant: 'रिक्त',
    statusMaintenance: 'दुरुस्ती चालू',
    statusReserved: 'आरक्षित',
    
    // Common Actions
    recordPayment: 'भाडे पावती नोंदवा',
    sendReminder: 'स्मरणपत्र पाठवा',
    viewDetails: 'तपशील पहा',
    exportPdf: 'पीडीएफ प्रत',
    exportExcel: 'एक्सेल प्रत',
    addNewUnit: 'नवीन युनिट जोडा',
    bulkAdd: 'एकत्रित युनिट्स जोडा',
    copyFloor: 'मजला कॉपी करा',
    importCsv: 'सीएसव्ही आयात करा',
    generateDraft: 'मसुदा करार बनवा',
    renewLease: 'करार नूतनीकरण (+वाढ)',
    moveOutChecklist: 'घर सोडणे व हिशोब',
    revealSensitive: 'गोपनीय पहा (ऑडिट नोंद)',
    maskNumber: 'लपवा',
    
    // Roles
    role_OWNER: 'घरमालक',
    role_CO_OWNER: 'सह-मालक',
    role_PROPERTY_MANAGER: 'व्यवस्थापक',
    role_ACCOUNTANT: 'हिशोबनीस / मुनीम',
    role_CARETAKER: 'केअरटेकर / रक्षक',
    role_BROKER: 'दलाल / ब्रोकर',
    role_BROKER_STAFF: 'ब्रोकर कर्मचारी',
    role_TENANT: 'भाडेकरू',
    role_VENDOR: 'कारागीर / व्हेंडर',
    role_PLATFORM_ADMIN: 'प्रशासक',

    // Reminder channels
    channelWhatsapp: 'व्हॉट्सअ‍ॅप',
    channelSms: 'एसएमएस',
    channelEmail: 'ईमेल',
    channelVoice: 'व्हॉइस कॉल',
    
    // Financial & Ledger
    ledgerTitle: 'खतावणी (खातेवही)',
    reversePayment: 'नोंद रद्द करा (रिव्हर्सल)',
    reversalReason: 'नोंद रद्द करण्याचे कारण',
    receiptNumber: 'पावती क्रमांक',
    financialYear: 'आर्थिक वर्ष',
    
    // Currency
    rupees: '₹',
    paise: 'पैसे',
  }
};

