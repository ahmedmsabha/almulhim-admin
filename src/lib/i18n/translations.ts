export type TranslationKey = string;

export const translations = {
  en: {
    common: {
      appName: "Mulhim Admin",
      subName: "Tawjihi Admin",
      admin: "Admin",
      teacherAdmin: "Teacher Administrator",
      searchPlaceholder: "Search students, subscriptions, or content...",
      searchLabel: "Search dashboard",
      openNavigation: "Open navigation",
      closeNavigation: "Close navigation",
      toggleLanguage: "العربية",
      signOut: "Sign Out",
    },
    nav: {
      dashboard: "Dashboard",
      students: "Students",
      plans: "Plans",
      subscriptions: "Subscriptions",
      content: "Content",
      announcements: "Announcements",
      support: "Support",
      testCheckout: "Test checkout",
    },
    dashboard: {
      eyebrow: "Overview",
      title: "Analytics Dashboard",
      range30Days: "Last 30 Days",
      kpis: {
        totalStudents: "Total Students",
        activeSubscriptions: "Active Subscriptions",
        pendingApprovals: "Pending Approvals",
        openSupport: "Open Support Tickets",
        urgentHint: "Requires immediate review",
      },
      charts: {
        subscriptionGrowth: "Subscription Growth",
        regionDistribution: "Region Distribution",
      },
      recentActivity: "Recent Activity",
    },
    students: {
      eyebrow: "Students",
      title: "Students & Devices",
      description: "Manage enrollment and open a student for device bindings.",
    },
    plans: {
      eyebrow: "Plans",
      title: "Subscription Plans",
      description: "Manage pricing tiers students can subscribe to.",
    },
    subscriptions: {
      eyebrow: "Subscriptions",
      title: "Approval Queue",
      description: "Review pending receipts before students unlock paid lessons.",
    },
    content: {
      eyebrow: "Curriculum",
      title: "Course Structure",
      description: "Browse the Unit → Chapter → Lesson tree, publish levels, and inspect lesson media.",
    },
    announcements: {
      eyebrow: "Announcements",
      title: "Announcements",
      description: "Create and manage regional broadcast messages.",
    },
    support: {
      eyebrow: "Support",
      title: "Support Inbox",
      description: "Review student tickets, reply by email, and close resolved requests.",
    },
  },
  ar: {
    common: {
      appName: "ملهم للمشرفين",
      subName: "مشرف التوجيهي",
      admin: "المشرف",
      teacherAdmin: "مدير المعلمين",
      searchPlaceholder: "ابحث عن الطلاب، الاشتراكات، أو المحتوى...",
      searchLabel: "البحث في لوحة التحكم",
      openNavigation: "افتح القائمة",
      closeNavigation: "إغلاق القائمة",
      toggleLanguage: "English",
      signOut: "تسجيل الخروج",
    },
    nav: {
      dashboard: "لوحة التحكم",
      students: "الطلاب",
      plans: "الخطط",
      subscriptions: "الاشتراكات",
      content: "المحتوى الدراسي",
      announcements: "الإعلانات",
      support: "الدعم الفني",
      testCheckout: "تجربة الدفع",
    },
    dashboard: {
      eyebrow: "نظرة عامة",
      title: "لوحة تحليلات البيانات",
      range30Days: "آخر ٣٠ يوماً",
      kpis: {
        totalStudents: "إجمالي الطلاب",
        activeSubscriptions: "الاشتراكات النشطة",
        pendingApprovals: "بانتظار الموافقة",
        openSupport: "تذاكر الدعم المفتوحة",
        urgentHint: "يتطلب مراجعة فورية",
      },
      charts: {
        subscriptionGrowth: "نمو الاشتراكات",
        regionDistribution: "توزيع المناطق الجغرافية",
      },
      recentActivity: "النشاط الأخير",
    },
    students: {
      eyebrow: "الطلاب",
      title: "الطلاب والأجهزة",
      description: "إدارة التسجيل وعرض وتعديل قيود الأجهزة المرتبطة بالطلاب.",
    },
    plans: {
      eyebrow: "الخطط",
      title: "خطط الاشتراك",
      description: "إدارة فئات الأسعار التي يمكن للطلاب الاشتراك فيها.",
    },
    subscriptions: {
      eyebrow: "الاشتراكات",
      title: "طابور الاعتماد والمراجعة",
      description: "مراجعة واعتماد إيصالات الطلاب المرفوعة لتفعيل الاشتراكات يدوياً.",
    },
    content: {
      eyebrow: "المنهج الدراسي",
      title: "بنية المنهج والدورات",
      description: "تصفح الوحدات، الفصول، والدروس، وتعديل حالة النشر وإدارة وسائط الدروس.",
    },
    announcements: {
      eyebrow: "الإعلانات",
      title: "الإعلانات والأخبار",
      description: "إنشاء وإدارة رسائل البث الإعلاني الموجهة للمناطق الجغرافية للمنصة.",
    },
    support: {
      eyebrow: "الدعم الفني",
      title: "صندوق الوارد للدعم",
      description: "مراجعة تذاكر الطلاب، والرد عن طريق البريد الإلكتروني، وإغلاق الطلبات التي تم حلها.",
    },
  },
} as const;

export type Language = keyof typeof translations;
