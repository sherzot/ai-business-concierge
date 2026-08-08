import type { LandingLocale } from "./types";

type StatItem = { value: string; label: string };
type WhyItem = { icon: string; title: string; desc: string };
type ProblemItem = { emoji: string; problem: string; before: string; after: string };
type AutomationItem = { icon: string; title: string; desc: string };
type ForWhoItem = { icon: string; title: string; desc: string };

type OnboardingStep = { icon: string; step: string; title: string; desc: string };
type OnboardingFeature = { icon: string; text: string };
type ContactSources = { ads: string; referral: string; search: string; telegram: string; other: string };
type BusinessTypes = { yatt: string; llc: string; jsc: string; other: string };

type FaqItem = { q: string; a: string };

type LandingDict = {
  nav: { login: string; contact: string; features: string; pricing: string; faq: string };
  hero: { badge: string; title: string; subtitle: string; ctaTelegram: string; ctaLogin: string; exploreSystem: string };
  stats: { items: StatItem[] };
  features: {
    title: string; subtitle: string;
    maslahatchi: { title: string; desc: string; bullets: string[] };
    hujjatchi: { title: string; desc: string; bullets: string[] };
    sotuvchi: { title: string; desc: string; bullets: string[] };
    soon: string;
  };
  whyUs: { title: string; subtitle: string; items: WhyItem[] };
  problems: {
    title: string; subtitle: string;
    beforeLabel: string; afterLabel: string;
    items: ProblemItem[];
  };
  automation: { title: string; subtitle: string; items: AutomationItem[] };
  forWho: { title: string; subtitle: string; items: ForWhoItem[] };
  howItWorks: {
    title: string; subtitle: string;
    step1: { title: string; desc: string };
    step2: { title: string; desc: string };
    step3: { title: string; desc: string };
  };
  companyOnboarding: {
    badge: string;
    title: string;
    subtitle: string;
    steps: OnboardingStep[];
    featuresTitle: string;
    features: OnboardingFeature[];
    cta: string;
    ctaNote: string;
    alreadyAccount: string;
  };
  contact: {
    title: string; subtitle: string;
    fullName: string; fullNamePlaceholder: string;
    companyName: string; companyNamePlaceholder: string;
    stir: string; stirPlaceholder: string;
    phone: string; phonePlaceholder: string;
    email: string; emailPlaceholder: string;
    businessType: string; businessTypePlaceholder: string;
    businessTypes: BusinessTypes;
    employeeCount: string; employeeCountPlaceholder: string;
    message: string; messagePlaceholder: string;
    source: string; sourcePlaceholder: string;
    sources: ContactSources;
    submit: string; submitting: string;
    successTitle: string; successDesc: string; successNote: string;
    backToHome: string; required: string;
  };
  register: {
    title: string; subtitle: string;
    loading: string;
    invalidToken: string; tokenExpired: string; alreadyUsed: string;
    companyName: string; companyNamePlaceholder: string;
    legalForm: string; legalFormPlaceholder: string;
    legalForms: { yatt: string; llc: string; jsc: string; other: string };
    stir: string; stirPlaceholder: string;
    legalAddress: string; legalAddressPlaceholder: string;
    password: string; passwordPlaceholder: string;
    confirmPassword: string; confirmPasswordPlaceholder: string;
    passwordMismatch: string;
    submit: string; submitting: string;
    successTitle: string; successDesc: string;
    backToHome: string; goToLogin: string;
  };
  pricing: {
    title: string; subtitle: string;
    free: { name: string; price: string; period: string; cta: string; features: string[] };
    pro: { name: string; price: string; period: string; cta: string; features: string[]; badge: string };
  };
  faq: { title: string; items: FaqItem[] };
  footer: { tagline: string; rights: string; links: { features: string; pricing: string; faq: string; contact: string } };
};

export const landingI18n: Record<LandingLocale, LandingDict> = {
  // ─────────────────────────────── UZ ───────────────────────────────
  uz: {
    nav: { login: "Kirish", contact: "Murojaat", features: "Funksiyalar", pricing: "Narxlar", faq: "Savollar" },
    hero: {
      badge: "Beta — Hozir bepul kirish",
      title: "O'zbekistondagi mahalliy va xalqaro kichik bizneslar uchun AI yordamchi",
      subtitle:
        "Soliq, mehnat kodeksi, shartnomalar, Telegram savdo — 24/7, 5 soniyada, aniq javob. Professional maslahatchi narxining 10 foizida.",
      ctaTelegram: "Telegram botni sinab ko'rish",
      ctaLogin: "Dashboard ga kirish",
      exploreSystem: "Tizimni ko'rish",
    },
    stats: {
      items: [
        { value: "24/7", label: "Doimiy ishlaydi" },
        { value: "< 5s", label: "O'rtacha javob vaqti" },
        { value: "4", label: "Til: uz / ru / en / ja" },
        { value: "3", label: "Kuchli modul" },
      ],
    },
    features: {
      title: "3 ta kuchli modul",
      subtitle: "Web dashboard + Telegram bot — bitta tizim, hamma ehtiyoj",
      maslahatchi: {
        title: "AI Maslahatchi",
        desc: "O'zbekiston 2026 qonunlari asosida darhol maslahat — buxgalter yoki advokat kabi, lekin 24/7 va bepul.",
        bullets: [
          "YaTT / MChJ soliq stavkalari va muddatlari",
          "Mehnat shartnomasi va ishdan bo'shatish",
          "Litsenziya va ruxsatnomalar",
          "QQS, INPS, ijtimoiy to'lovlar",
          "Biznes ro'yxatdan o'tkazish tartibi",
        ],
      },
      hujjatchi: {
        title: "AI Hujjatchi",
        desc: "Shartnoma, ariza, buyruq — shablonlar asosida bir zumda tayyor. Yurist kutmasdan, xato qilmasdan.",
        bullets: [
          "Mehnat shartnomalari (standart va individual)",
          "Xizmat ko'rsatish shartnomalari",
          "Ishdan bo'shatish va tayinlash buyruqlari",
          "Arizalar va ishonchnomalari",
          "PDF / DOCX formatda yuklab olish",
        ],
      },
      sotuvchi: {
        title: "AI Sotuvchi",
        desc: "Telegram orqali savdo — mahsulot katalogi, buyurtma qabul qilish, mijoz bazasi. Barcha avtomatik.",
        bullets: [
          "Mahsulot katalogi va narxlar",
          "Buyurtma qabul qilish va tasdiqlash",
          "Mijozlar bazasi va tarix",
          "Statistika va hisobotlar",
          "To'lov integratsiyasi (Click, Payme)",
        ],
      },
      soon: "Tez kunda",
    },
    whyUs: {
      title: "Nega global bozorda aynan biz?",
      subtitle:
        "ChatGPT emas, SQB emas, 1C emas — biz O'zbekiston biznes amaliyoti uchun maxsus qurilgan yagona AI tizim",
      items: [
        {
          icon: "🇺🇿",
          title: "O'zbekiston qonunlari — 2026",
          desc: "Soliq kodeksi, Mehnat kodeksi, litsenziya qoidalari — barcha yangi o'zgarishlar bilan.",
        },
        {
          icon: "⚡",
          title: "5 soniyada javob",
          desc: "Buxgalter yoki advokatga murojaat qilib 2-3 kun kutish o'rniga — darhol, har qanday vaqtda.",
        },
        {
          icon: "💰",
          title: "Professional xizmat narxining 10%",
          desc: "Bir soat maslahat $50-200. Bizning yillik obuna bu narxdan 10x arzon — cheksiz savollar bilan.",
        },
        {
          icon: "🌐",
          title: "4 tilda — xalqaro kompaniyalar uchun",
          desc: "O'zbek, rus, ingliz, yapon tili. O'zbekistondagi xalqaro kompaniyalar istalgan tilda foydalana oladi.",
        },
        {
          icon: "📱",
          title: "Telegram — alohida ilova shart emas",
          desc: "Xodimlar allaqachon Telegram ishlatadi. Yangi ilova o'rgatish va o'rnatish kerak emas.",
        },
        {
          icon: "🔄",
          title: "Web + Bot — bitta ekosistema",
          desc: "Dashboard da chuqur tahlil, Telegram da tezkor savollar — ikki kanalda bitta ma'lumot bazasi.",
        },
      ],
    },
    problems: {
      title: "Qanday muammolarni hal qilamiz?",
      subtitle: "Kichik biznes egalari har kuni duch keladigan real muammolar",
      beforeLabel: "Oldin",
      afterLabel: "Endi",
      items: [
        {
          emoji: "📊",
          problem: "Soliq savollari",
          before: "Buxgalterni kutish — 1-2 kun, to'lov $20-50 har savol uchun",
          after: "Telegram yoki web da so'rash — 5 soniyada aniq javob, bepul",
        },
        {
          emoji: "📄",
          problem: "Shartnoma tuzish",
          before: "Yuristga boring, 3-5 kun kuting, $100-300 to'lang",
          after: "AI shablondan bir zumda tayyor, PDF yuklab oling",
        },
        {
          emoji: "🛒",
          problem: "Telegram savdo",
          before: "Har bir buyurtmaga qo'lda javob, katalog Excel da, soatlab ish",
          after: "AI bot 24/7 buyurtma qabul qiladi, katalog avtomatik",
        },
        {
          emoji: "🌍",
          problem: "Xalqaro xodimlar",
          before: "Yapon yoki ingliz tilida qoidalarni tushuntirish qiyin",
          after: "Tizim 4 tilda ishlaydi — har kim o'z tilida oladi javob",
        },
      ],
    },
    automation: {
      title: "Nimalар avtomatlashadi?",
      subtitle: "Qo'lda bajarilgan ishlarni AI ga topshiring — vaqtingizni asosiy biznesga sarflang",
      items: [
        { icon: "🧮", title: "Soliq hisoblash", desc: "Har oylik soliq summasini avtomatik hisoblash va eslatma" },
        { icon: "📝", title: "Shartnoma generatsiya", desc: "Ma'lumotlarni kiriting — tayyor shartnoma bir zumda" },
        { icon: "👥", title: "Xodim qabul qilish", desc: "Ariza, shartnoma, buyruq — to'liq paket avtomatik" },
        { icon: "🛒", title: "Telegram buyurtmalar", desc: "Buyurtma qabul, tasdiqlash, xabardor qilish — hammasi bot" },
        { icon: "📅", title: "Muddatlar nazorati", desc: "Hisobot, to'lov, litsenziya muddatlari — oldindan eslatma" },
        { icon: "📊", title: "Biznes hisobotlar", desc: "Oylik savdo, xarajat, foyda — avtomatik hisobot" },
        { icon: "💬", title: "Mijoz xizmati", desc: "Tez-tez so'raladigan savollar — bot 24/7 javob beradi" },
        { icon: "🔍", title: "Qonun yangilanishlari", desc: "O'zbekiston qonunlaridagi o'zgarishlar — darhol xabardorsiz" },
      ],
    },
    forWho: {
      title: "Kim uchun?",
      subtitle: "O'zbekistonda biznes yuritayotgan har bir kishi uchun",
      items: [
        {
          icon: "🧑‍💼",
          title: "Yakka tartibdagi tadbirkorlar (YaTT)",
          desc: "Soliq, hisobot, xodim masalalari — buxgaltersiz, o'zingiz hal qiling",
        },
        {
          icon: "🏢",
          title: "Kichik va o'rta kompaniyalar (MChJ)",
          desc: "Yuridik va moliyaviy savollar — advokat va buxgalter xarajatlarini qisqartiring",
        },
        {
          icon: "💻",
          title: "Frilanserlar va kreativ agentliklar",
          desc: "Shartnoma, hisob-faktura, soliq — hamma narsani tez va to'g'ri bajarish",
        },
        {
          icon: "🌏",
          title: "O'zbekistondagi xalqaro kompaniyalar",
          desc: "Yapon, xitoy, turk, koreys kompaniyalari — 4 tilda lokal qonunlarni tushunish",
        },
        {
          icon: "🛍️",
          title: "Telegram orqali savdo qiluvchilar",
          desc: "Online do'kon, food delivery, xizmat ko'rsatuvchilar — Telegram botni AI ga topshiring",
        },
      ],
    },
    howItWorks: {
      title: "Qanday ishlaydi?",
      subtitle: "3 ta oddiy qadam",
      step1: { title: "Botga yozing yoki web ga kiring", desc: "@ai_business_concierge_bot ga yoki web dashboard ga savolingizni yuboring" },
      step2: { title: "AI tahlil qiladi", desc: "O'zbekiston qonunlari bilimlar bazasi + Claude AI — aniq, ishonchli javob" },
      step3: { title: "Darhol javob oling", desc: "5 soniyada amaliy maslahat, kerak bo'lsa hujjat yoki bot ham yaratib beradi" },
    },
    companyOnboarding: {
      badge: "Kompaniyalar uchun",
      title: "Kompaniyangizni tizimga ulang",
      subtitle: "Biznesingizni bir joyda boshqaring — xodimlar, vazifalar, moliya, hujjatlar va AI maslahat.",
      steps: [
        {
          icon: "📋",
          step: "1-qadam",
          title: "Murojaat qiling",
          desc: "Kompaniya ma'lumotlaringizni yuboring. Biz 24 soat ichida siz bilan bog'lanamiz.",
        },
        {
          icon: "🤝",
          step: "2-qadam",
          title: "Demo va kelishuv",
          desc: "Tizimni ko'rsatamiz, savollarga javob beramiz. Kelishsak — sizga maxsus havola yuboramiz.",
        },
        {
          icon: "🏢",
          step: "3-qadam",
          title: "Kompaniyangizni ro'yxatdan o'tkaring",
          desc: "Havola orqali kompaniya ma'lumotlari va login-parol o'rnating. Tasdiqlanishni kuting.",
        },
        {
          icon: "✅",
          step: "4-qadam",
          title: "Ishga kirishing",
          desc: "Biz tasdiqlaganimizdan so'ng tizimga kirib, xodimlar qo'shishni va boshqaruvni boshlang.",
        },
      ],
      featuresTitle: "Kompaniya dashboardida nimalar bor?",
      features: [
        { icon: "👥", text: "Xodimlar boshqaruvi — HR, rol, lavozim, ma'lumotlar" },
        { icon: "✅", text: "Vazifalar va maqsadlar — butun jamoa uchun" },
        { icon: "💰", text: "Moliya va maosh — daromad, xarajat, hisobotlar" },
        { icon: "📄", text: "Hujjat generatsiya — shartnoma, buyruq, ariza (PDF/DOCX)" },
        { icon: "🤖", text: "AI Maslahatchi — soliq, huquq, HR savollari 24/7" },
        { icon: "🔒", text: "Xavfsizlik — har bir xodim faqat o'z ma'lumotlarini ko'radi" },
      ],
      cta: "Murojaat qilish",
      ctaNote: "Bepul konsultatsiya · 24 soat ichida javob · Majburiyat yo'q",
      alreadyAccount: "Allaqachon accountingiz bormi?",
    },
    contact: {
      title: "Murojaat qilish",
      subtitle: "Ma'lumotlaringizni qoldiring — biz 24 soat ichida bog'lanamiz va tizimni ko'rsatamiz.",
      fullName: "To'liq ism *", fullNamePlaceholder: "Familiya Ism",
      companyName: "Kompaniya nomi", companyNamePlaceholder: "Mas: Jahongir Trade MChJ",
      stir: "STIR (ixtiyoriy)", stirPlaceholder: "123456789",
      phone: "Telefon *", phonePlaceholder: "+998 90 123 45 67",
      email: "Email *", emailPlaceholder: "email@company.com",
      businessType: "Biznes turi", businessTypePlaceholder: "Tanlang",
      businessTypes: { yatt: "YaTT (Yakka tartibdagi tadbirkor)", llc: "MChJ (Mas'uliyati cheklangan jamiyat)", jsc: "AJ (Aksiyadorlik jamiyati)", other: "Boshqa" },
      employeeCount: "Xodimlar soni (taxminan)", employeeCountPlaceholder: "Tanlang",
      message: "Savol yoki muammo (ixtiyoriy)", messagePlaceholder: "Tizimdan qanday foydalanmoqchisiz? Asosiy muammolaringiz nima?",
      source: "Bizni qayerdan bildingiz?", sourcePlaceholder: "Tanlang",
      sources: { ads: "Reklama", referral: "Do'st tavsiyasi", search: "Internet qidiruv", telegram: "Telegram", other: "Boshqa" },
      submit: "Murojaat yuborish", submitting: "Yuborilmoqda...",
      successTitle: "Murojaatingiz qabul qilindi!",
      successDesc: "Siz bilan 24 soat ichida bog'lanamiz va tizimni ko'rsatamiz.",
      successNote: "To'g'ridan-to'g'ri aloqa:",
      backToHome: "Bosh sahifaga qaytish",
      required: "* — majburiy maydonlar",
    },
    register: {
      title: "Kompaniyangizni ro'yxatdan o'tkaz",
      subtitle: "Admin taklifi asosida kompaniyangizni tizimga qo'shing",
      loading: "Yuklanmoqda...",
      invalidToken: "Havola yaroqsiz yoki noto'g'ri. Iltimos admin bilan bog'laning.",
      tokenExpired: "Havolaning muddati o'tgan (48 soat). Admin bilan bog'laning.",
      alreadyUsed: "Bu havola allaqachon ishlatilgan. Login sahifasiga o'ting.",
      companyName: "Kompaniya nomi",
      companyNamePlaceholder: "Rasmiy kompaniya nomi",
      legalForm: "Yuridik shakl",
      legalFormPlaceholder: "Tanlang",
      legalForms: { yatt: "YATT", llc: "MChJ", jsc: "AJ", other: "Boshqa" },
      stir: "STIR",
      stirPlaceholder: "9 raqamli STIR",
      legalAddress: "Yuridik manzil",
      legalAddressPlaceholder: "Ro'yxatdan o'tish manzili",
      password: "Parol",
      passwordPlaceholder: "Kamida 8 belgi",
      confirmPassword: "Parolni tasdiqlang",
      confirmPasswordPlaceholder: "Parolni qayta kiriting",
      passwordMismatch: "Parollar mos emas.",
      submit: "Ro'yxatdan o'tish",
      submitting: "Saqlanmoqda...",
      successTitle: "Muvaffaqiyatli ro'yxatdan o'tdingi!",
      successDesc: "Kompaniyangiz tizimga qo'shildi. Admin tasdiqlagach kirish imkoniyatiga ega bo'lasiz.",
      backToHome: "Bosh sahifaga qaytish",
      goToLogin: "Login sahifasiga o'tish",
    },
    pricing: {
      title: "Narxlar",
      subtitle: "Beta davrida bepul. Tez kunda Pro plan.",
      free: {
        name: "Bepul",
        price: "$0",
        period: "/ oy",
        cta: "Hoziroq boshlash",
        features: [
          "5 ta so'rov / kun",
          "AI Maslahatchi (barcha savollar)",
          "4 til: uz / ru / en / ja",
          "Telegram bot + Web dashboard",
          "Bilimlar bazasi: 2026 qonunlari",
        ],
      },
      pro: {
        name: "Pro",
        price: "$9.99",
        period: "/ oy",
        cta: "Tez kunda",
        badge: "Kelmoqda",
        features: [
          "50 ta so'rov / kun (cheksiz rejalar ham)",
          "AI Maslahatchi + Hujjatchi",
          "AI Sotuvchi Telegram bot",
          "PDF / DOCX hujjat generatsiya",
          "Ustuvor qo'llab-quvvatlash",
        ],
      },
    },
    faq: {
      title: "Ko'p so'raladigan savollar",
      items: [
        {
          q: "AI Maslahatchi noto'g'ri javob bersachi?",
          a: "Har bir javobda ishonch darajasi ko'rsatiladi va 'Bu AI maslahat, mutaxassis bilan maslahatlashing' eslatmasi qo'yiladi. Kritik qarorlar uchun professional maslahat olishni tavsiya qilamiz.",
        },
        {
          q: "Bepul rejada necha savol bersa bo'ladi?",
          a: "Bepul rejada 5 ta savol/kun. Telegram bot orqali istalgan vaqt savollaringizni yuboring — limitdan ortiqchasi avtomatik keyingi kunga o'tkazilmaydi.",
        },
        {
          q: "Ma'lumotlarim xavfsizmi?",
          a: "Ha. Har bir kompaniya ma'lumotlari to'liq ajratilgan (multi-tenant arxitektura). Supabase PostgreSQL + Row Level Security — boshqa kompaniya ma'lumotlaringizni ko'ra olmaydi.",
        },
        {
          q: "O'zbek tilida qanchalik yaxshi javob beradi?",
          a: "AI O'zbekiston 2026-yil soliq qonunlari, Mehnat kodeksi va biznes qoidalari asosida javob beradi. Javoblar o'zbek, rus, ingliz va yapon tillarida — foydalanuvchi tilida.",
        },
        {
          q: "Telegram bot bilan web dashboard farqi nima?",
          a: "Telegram bot — tez savol-javob uchun (maslahat, hujjat so'rash). Web dashboard — keng funksionallik: xodimlar boshqaruvi, vazifalar, hisobotlar, AI sozlamalari.",
        },
        {
          q: "To'lov tizimi qachon ishga tushadi?",
          a: "Pro tarif Click va Payme orqali to'lov 2026 Q3 da ishga tushadi. Hozir beta davri — barcha funksiyalar bepul.",
        },
      ],
    },
    footer: {
      tagline: "O'zbekiston biznes uchun AI yordamchi — mahalliy va xalqaro",
      rights: "© 2026 AI Business Concierge. Barcha huquqlar himoyalangan.",
      links: { features: "Funksiyalar", pricing: "Narxlar", faq: "Savollar", contact: "Murojaat" },
    },
  },

  // ─────────────────────────────── RU ───────────────────────────────
  ru: {
    nav: { login: "Войти", contact: "Связаться", features: "Функции", pricing: "Цены", faq: "FAQ" },
    hero: {
      badge: "Бета — Бесплатный доступ",
      title: "AI-помощник для местного и международного малого бизнеса в Узбекистане",
      subtitle:
        "Налоги, трудовой кодекс, договоры, Telegram-продажи — 24/7, за 5 секунд, точный ответ. За 10% от стоимости профессиональной консультации.",
      ctaTelegram: "Попробовать Telegram бот",
      ctaLogin: "Открыть дашборд",
      exploreSystem: "Посмотреть систему",
    },
    stats: {
      items: [
        { value: "24/7", label: "Работает всегда" },
        { value: "< 5s", label: "Среднее время ответа" },
        { value: "4", label: "Языка: uz / ru / en / ja" },
        { value: "3", label: "Мощных модуля" },
      ],
    },
    features: {
      title: "3 мощных модуля",
      subtitle: "Веб-дашборд + Telegram бот — одна система, все потребности",
      maslahatchi: {
        title: "AI Консультант",
        desc: "Мгновенные консультации по законодательству Узбекистана 2026 года — как бухгалтер или юрист, но 24/7 и бесплатно.",
        bullets: [
          "Налоговые ставки и сроки для ИП / ООО",
          "Трудовой договор и увольнение",
          "Лицензии и разрешения",
          "НДС, ИНПС, социальные взносы",
          "Порядок регистрации бизнеса",
        ],
      },
      hujjatchi: {
        title: "AI Документовед",
        desc: "Договоры, заявления, приказы — мгновенно по шаблонам. Без юриста, без ошибок.",
        bullets: [
          "Трудовые договоры (стандартные и индивидуальные)",
          "Договоры оказания услуг",
          "Приказы об увольнении и назначении",
          "Заявления и доверенности",
          "Скачать в PDF / DOCX",
        ],
      },
      sotuvchi: {
        title: "AI Продавец",
        desc: "Продажи в Telegram — каталог, приём заказов, база клиентов. Всё автоматически.",
        bullets: [
          "Каталог товаров и цены",
          "Приём и подтверждение заказов",
          "База клиентов и история",
          "Статистика и отчёты",
          "Интеграция с Click и Payme",
        ],
      },
      soon: "Скоро",
    },
    whyUs: {
      title: "Почему именно мы на глобальном рынке?",
      subtitle:
        "Не ChatGPT, не СКБ, не 1С — единственная AI-система, созданная специально для бизнес-практики Узбекистана",
      items: [
        {
          icon: "🇺🇿",
          title: "Законодательство Узбекистана — 2026",
          desc: "Налоговый кодекс, Трудовой кодекс, правила лицензирования — со всеми последними изменениями.",
        },
        {
          icon: "⚡",
          title: "Ответ за 5 секунд",
          desc: "Вместо ожидания бухгалтера или юриста 2-3 дня — мгновенно, в любое время суток.",
        },
        {
          icon: "💰",
          title: "10% от стоимости профессиональных услуг",
          desc: "Один час консультации $50-200. Наша годовая подписка в 10 раз дешевле — с неограниченными вопросами.",
        },
        {
          icon: "🌐",
          title: "4 языка — для международных компаний",
          desc: "Узбекский, русский, английский, японский. Международные компании в Узбекистане работают на удобном языке.",
        },
        {
          icon: "📱",
          title: "Telegram — отдельное приложение не нужно",
          desc: "Сотрудники уже используют Telegram. Не нужно обучать и устанавливать новые приложения.",
        },
        {
          icon: "🔄",
          title: "Web + Bot — единая экосистема",
          desc: "Глубокий анализ в дашборде, быстрые вопросы в Telegram — два канала, одна база знаний.",
        },
      ],
    },
    problems: {
      title: "Какие проблемы мы решаем?",
      subtitle: "Реальные проблемы, с которыми владельцы малого бизнеса сталкиваются каждый день",
      beforeLabel: "Раньше",
      afterLabel: "Теперь",
      items: [
        {
          emoji: "📊",
          problem: "Налоговые вопросы",
          before: "Ждать бухгалтера 1-2 дня, платить $20-50 за каждый вопрос",
          after: "Спросить в Telegram или на сайте — точный ответ за 5 секунд, бесплатно",
        },
        {
          emoji: "📄",
          problem: "Составление договора",
          before: "К юристу, ждать 3-5 дней, платить $100-300",
          after: "AI по шаблону готов мгновенно, скачать PDF",
        },
        {
          emoji: "🛒",
          problem: "Продажи в Telegram",
          before: "Ручные ответы на каждый заказ, каталог в Excel, часы работы",
          after: "AI-бот принимает заказы 24/7, каталог обновляется автоматически",
        },
        {
          emoji: "🌍",
          problem: "Международные сотрудники",
          before: "Объяснять правила на японском или английском — сложно",
          after: "Система работает на 4 языках — каждый получает ответ на своём",
        },
      ],
    },
    automation: {
      title: "Что автоматизируется?",
      subtitle: "Передайте рутинные задачи AI — тратьте время на развитие бизнеса",
      items: [
        { icon: "🧮", title: "Расчёт налогов", desc: "Автоматический расчёт ежемесячных налогов и напоминания" },
        { icon: "📝", title: "Генерация договоров", desc: "Введите данные — готовый договор за секунды" },
        { icon: "👥", title: "Приём сотрудника", desc: "Заявление, договор, приказ — полный пакет автоматически" },
        { icon: "🛒", title: "Заказы в Telegram", desc: "Приём, подтверждение, уведомление — всё через бота" },
        { icon: "📅", title: "Контроль дедлайнов", desc: "Отчёты, платежи, лицензии — напоминания заранее" },
        { icon: "📊", title: "Бизнес-отчёты", desc: "Ежемесячные продажи, расходы, прибыль — отчёт автоматически" },
        { icon: "💬", title: "Обслуживание клиентов", desc: "Часто задаваемые вопросы — бот отвечает 24/7" },
        { icon: "🔍", title: "Обновления законов", desc: "Изменения в законодательстве Узбекистана — мгновенное уведомление" },
      ],
    },
    forWho: {
      title: "Для кого?",
      subtitle: "Для всех, кто ведёт бизнес в Узбекистане",
      items: [
        {
          icon: "🧑‍💼",
          title: "Индивидуальные предприниматели (ИП)",
          desc: "Налоги, отчёты, кадровые вопросы — без бухгалтера, решайте сами",
        },
        {
          icon: "🏢",
          title: "Малый и средний бизнес (ООО)",
          desc: "Юридические и финансовые вопросы — сократите расходы на юриста и бухгалтера",
        },
        {
          icon: "💻",
          title: "Фрилансеры и креативные агентства",
          desc: "Договоры, счета, налоги — быстро и правильно",
        },
        {
          icon: "🌏",
          title: "Международные компании в Узбекистане",
          desc: "Японские, китайские, турецкие, корейские компании — местные законы на родном языке",
        },
        {
          icon: "🛍️",
          title: "Торгующие через Telegram",
          desc: "Интернет-магазины, доставка еды, сервисы — Telegram-бот с AI на автопилоте",
        },
      ],
    },
    howItWorks: {
      title: "Как это работает?",
      subtitle: "3 простых шага",
      step1: { title: "Напишите боту или зайдите на сайт", desc: "Отправьте вопрос в @ai_business_concierge_bot или через веб-дашборд" },
      step2: { title: "AI анализирует", desc: "База знаний по законам Узбекистана + Claude AI — точный, надёжный ответ" },
      step3: { title: "Получите ответ мгновенно", desc: "За 5 секунд практический совет, при необходимости — документ или бот" },
    },
    companyOnboarding: {
      badge: "Для компаний",
      title: "Подключите вашу компанию",
      subtitle: "Управляйте бизнесом в одном месте — сотрудники, задачи, финансы, документы и AI-консультант.",
      steps: [
        {
          icon: "📋",
          step: "Шаг 1",
          title: "Оставьте заявку",
          desc: "Отправьте данные вашей компании. Мы свяжемся с вами в течение 24 часов.",
        },
        {
          icon: "🤝",
          step: "Шаг 2",
          title: "Демо и договорённость",
          desc: "Покажем систему, ответим на вопросы. При достижении договорённости — отправим вам персональную ссылку.",
        },
        {
          icon: "🏢",
          step: "Шаг 3",
          title: "Зарегистрируйте компанию",
          desc: "По ссылке введите данные компании и создайте логин-пароль. Ожидайте подтверждения.",
        },
        {
          icon: "✅",
          step: "Шаг 4",
          title: "Начните работу",
          desc: "После нашего подтверждения войдите в систему, добавьте сотрудников и начните управлять.",
        },
      ],
      featuresTitle: "Что есть в дашборде компании?",
      features: [
        { icon: "👥", text: "Управление сотрудниками — HR, роли, должности, данные" },
        { icon: "✅", text: "Задачи и цели — для всей команды" },
        { icon: "💰", text: "Финансы и зарплата — доходы, расходы, отчёты" },
        { icon: "📄", text: "Генерация документов — договор, приказ, заявление (PDF/DOCX)" },
        { icon: "🤖", text: "AI-консультант — налоги, право, HR-вопросы 24/7" },
        { icon: "🔒", text: "Безопасность — каждый сотрудник видит только свои данные" },
      ],
      cta: "Оставить заявку",
      ctaNote: "Бесплатная консультация · Ответ за 24 часа · Без обязательств",
      alreadyAccount: "Уже есть аккаунт?",
    },
    contact: {
      title: "Оставить заявку",
      subtitle: "Оставьте ваши данные — мы свяжемся в течение 24 часов и покажем систему.",
      fullName: "Полное имя *", fullNamePlaceholder: "Фамилия Имя",
      companyName: "Название компании", companyNamePlaceholder: "Напр: Jahongir Trade ООО",
      stir: "STIR (необязательно)", stirPlaceholder: "123456789",
      phone: "Телефон *", phonePlaceholder: "+998 90 123 45 67",
      email: "Email *", emailPlaceholder: "email@company.com",
      businessType: "Тип бизнеса", businessTypePlaceholder: "Выберите",
      businessTypes: { yatt: "ИП (Индивидуальный предприниматель)", llc: "ООО (Общество с ограниченной ответственностью)", jsc: "АО (Акционерное общество)", other: "Другое" },
      employeeCount: "Кол-во сотрудников (примерно)", employeeCountPlaceholder: "Выберите",
      message: "Вопрос или проблема (необязательно)", messagePlaceholder: "Как планируете использовать систему? Какие основные задачи?",
      source: "Откуда узнали о нас?", sourcePlaceholder: "Выберите",
      sources: { ads: "Реклама", referral: "Рекомендация друга", search: "Интернет-поиск", telegram: "Telegram", other: "Другое" },
      submit: "Отправить заявку", submitting: "Отправляется...",
      successTitle: "Заявка принята!",
      successDesc: "Мы свяжемся с вами в течение 24 часов и покажем систему.",
      successNote: "Прямая связь:",
      backToHome: "Вернуться на главную",
      required: "* — обязательные поля",
    },
    register: {
      title: "Зарегистрируйте компанию",
      subtitle: "Добавьте вашу компанию в систему по приглашению администратора",
      loading: "Загрузка...",
      invalidToken: "Ссылка недействительна или некорректна. Обратитесь к администратору.",
      tokenExpired: "Срок действия ссылки истёк (48 часов). Обратитесь к администратору.",
      alreadyUsed: "Эта ссылка уже использована. Перейдите на страницу входа.",
      companyName: "Название компании",
      companyNamePlaceholder: "Официальное название компании",
      legalForm: "Правовая форма",
      legalFormPlaceholder: "Выберите",
      legalForms: { yatt: "ИП", llc: "ООО", jsc: "АО", other: "Другое" },
      stir: "ИНН",
      stirPlaceholder: "9-значный ИНН",
      legalAddress: "Юридический адрес",
      legalAddressPlaceholder: "Адрес регистрации",
      password: "Пароль",
      passwordPlaceholder: "Минимум 8 символов",
      confirmPassword: "Подтвердите пароль",
      confirmPasswordPlaceholder: "Повторите пароль",
      passwordMismatch: "Пароли не совпадают.",
      submit: "Зарегистрироваться",
      submitting: "Сохранение...",
      successTitle: "Регистрация прошла успешно!",
      successDesc: "Компания добавлена в систему. После подтверждения администратора вы получите доступ.",
      backToHome: "Вернуться на главную",
      goToLogin: "Перейти на страницу входа",
    },
    pricing: {
      title: "Тарифы",
      subtitle: "Бесплатно в период бета. Pro план скоро.",
      free: {
        name: "Бесплатно",
        price: "$0",
        period: "/ мес",
        cta: "Начать прямо сейчас",
        features: [
          "5 запросов / день",
          "AI Консультант (все вопросы)",
          "4 языка: uz / ru / en / ja",
          "Telegram бот + Веб-дашборд",
          "База знаний: законы 2026",
        ],
      },
      pro: {
        name: "Pro",
        price: "$9.99",
        period: "/ мес",
        cta: "Скоро",
        badge: "Скоро",
        features: [
          "50 запросов / день (и безлимитные планы)",
          "AI Консультант + Документовед",
          "AI Продавец Telegram-бот",
          "Генерация PDF / DOCX документов",
          "Приоритетная поддержка",
        ],
      },
    },
    faq: {
      title: "Часто задаваемые вопросы",
      items: [
        {
          q: "Что если AI Консультант даст неверный ответ?",
          a: "Каждый ответ сопровождается уровнем уверенности и пометкой «Это AI-консультация, обратитесь к специалисту». Для критических решений рекомендуем консультацию с профессионалом.",
        },
        {
          q: "Сколько вопросов можно задать на бесплатном тарифе?",
          a: "На бесплатном тарифе — 5 вопросов/день. Через Telegram бот в любое время. Лимит не переносится на следующий день автоматически.",
        },
        {
          q: "Мои данные в безопасности?",
          a: "Да. Данные каждой компании полностью изолированы (мультитенантная архитектура). Supabase PostgreSQL + Row Level Security — другая компания не увидит ваши данные.",
        },
        {
          q: "Насколько хорошо система знает законодательство Узбекистана?",
          a: "AI отвечает на основе налогового законодательства Узбекистана 2026 года, Трудового кодекса и бизнес-правил. Ответы доступны на узбекском, русском, английском и японском языках.",
        },
        {
          q: "Чем Telegram бот отличается от веб-дашборда?",
          a: "Telegram бот — для быстрых вопросов (консультации, запрос документов). Веб-дашборд — расширенный функционал: управление сотрудниками, задачи, отчёты, настройки AI.",
        },
        {
          q: "Когда заработает платёжная система?",
          a: "Оплата Pro-тарифа через Click и Payme появится в Q3 2026. Сейчас бета-период — все функции бесплатны.",
        },
      ],
    },
    footer: {
      tagline: "AI-помощник для бизнеса в Узбекистане — местного и международного",
      rights: "© 2026 AI Business Concierge. Все права защищены.",
      links: { features: "Функции", pricing: "Цены", faq: "FAQ", contact: "Связаться" },
    },
  },

  // ─────────────────────────────── EN ───────────────────────────────
  en: {
    nav: { login: "Sign In", contact: "Contact Us", features: "Features", pricing: "Pricing", faq: "FAQ" },
    hero: {
      badge: "Beta — Free access now",
      title: "AI Assistant for Local and International Small Businesses in Uzbekistan",
      subtitle:
        "Tax, labor code, contracts, Telegram sales — 24/7, in 5 seconds, accurate answers. At 10% of the cost of professional consultation.",
      ctaTelegram: "Try Telegram Bot",
      ctaLogin: "Open Dashboard",
      exploreSystem: "Explore system",
    },
    stats: {
      items: [
        { value: "24/7", label: "Always available" },
        { value: "< 5s", label: "Average response time" },
        { value: "4", label: "Languages: uz / ru / en / ja" },
        { value: "3", label: "Powerful modules" },
      ],
    },
    features: {
      title: "3 Powerful Modules",
      subtitle: "Web dashboard + Telegram bot — one system, every need",
      maslahatchi: {
        title: "AI Advisor",
        desc: "Instant advice based on Uzbekistan's 2026 laws — like an accountant or lawyer, but 24/7 and free.",
        bullets: [
          "Tax rates and deadlines for sole traders / LLCs",
          "Employment contracts and termination",
          "Licenses and permits",
          "VAT, INPS, social contributions",
          "Business registration procedure",
        ],
      },
      hujjatchi: {
        title: "AI Document Maker",
        desc: "Contracts, applications, orders — instantly from templates. No lawyer needed, no mistakes.",
        bullets: [
          "Employment contracts (standard and individual)",
          "Service agreements",
          "Dismissal and appointment orders",
          "Applications and powers of attorney",
          "Download as PDF / DOCX",
        ],
      },
      sotuvchi: {
        title: "AI Sales Bot",
        desc: "Telegram sales — product catalogue, order taking, customer database. All automated.",
        bullets: [
          "Product catalogue and prices",
          "Order acceptance and confirmation",
          "Customer database and history",
          "Statistics and reports",
          "Click and Payme payment integration",
        ],
      },
      soon: "Coming soon",
    },
    whyUs: {
      title: "Why choose us on the global market?",
      subtitle:
        "Not ChatGPT, not a government portal, not 1C — the only AI system built specifically for business practice in Uzbekistan",
      items: [
        {
          icon: "🇺🇿",
          title: "Uzbekistan Law — 2026",
          desc: "Tax Code, Labor Code, licensing rules — with all recent changes.",
        },
        {
          icon: "⚡",
          title: "Answer in 5 seconds",
          desc: "Instead of waiting 2-3 days for an accountant or lawyer — instant, at any time of day.",
        },
        {
          icon: "💰",
          title: "10% of professional service cost",
          desc: "One hour consultation $50-200. Our annual subscription is 10x cheaper — with unlimited questions.",
        },
        {
          icon: "🌐",
          title: "4 languages — for international companies",
          desc: "Uzbek, Russian, English, Japanese. International companies in Uzbekistan work in their preferred language.",
        },
        {
          icon: "📱",
          title: "Telegram — no separate app needed",
          desc: "Employees already use Telegram. No need to train or install new applications.",
        },
        {
          icon: "🔄",
          title: "Web + Bot — one ecosystem",
          desc: "Deep analysis in the dashboard, quick questions in Telegram — two channels, one knowledge base.",
        },
      ],
    },
    problems: {
      title: "What problems do we solve?",
      subtitle: "Real problems that small business owners face every day",
      beforeLabel: "Before",
      afterLabel: "Now",
      items: [
        {
          emoji: "📊",
          problem: "Tax questions",
          before: "Wait for accountant 1-2 days, pay $20-50 per question",
          after: "Ask in Telegram or on the web — accurate answer in 5 seconds, free",
        },
        {
          emoji: "📄",
          problem: "Drafting a contract",
          before: "Go to a lawyer, wait 3-5 days, pay $100-300",
          after: "AI template ready instantly, download PDF",
        },
        {
          emoji: "🛒",
          problem: "Telegram sales",
          before: "Manual reply to each order, catalogue in Excel, hours of work",
          after: "AI bot takes orders 24/7, catalogue updates automatically",
        },
        {
          emoji: "🌍",
          problem: "International employees",
          before: "Explaining rules in Japanese or English is difficult",
          after: "System works in 4 languages — everyone gets answers in their own",
        },
      ],
    },
    automation: {
      title: "What gets automated?",
      subtitle: "Hand routine tasks to AI — spend your time growing the business",
      items: [
        { icon: "🧮", title: "Tax calculation", desc: "Automatic monthly tax calculation and reminders" },
        { icon: "📝", title: "Contract generation", desc: "Enter details — ready contract in seconds" },
        { icon: "👥", title: "Employee onboarding", desc: "Application, contract, order — full package automatically" },
        { icon: "🛒", title: "Telegram orders", desc: "Acceptance, confirmation, notification — all via bot" },
        { icon: "📅", title: "Deadline tracking", desc: "Reports, payments, licenses — advance reminders" },
        { icon: "📊", title: "Business reports", desc: "Monthly sales, expenses, profit — automatic report" },
        { icon: "💬", title: "Customer service", desc: "Frequently asked questions — bot answers 24/7" },
        { icon: "🔍", title: "Law updates", desc: "Changes in Uzbekistan legislation — instant notification" },
      ],
    },
    forWho: {
      title: "Who is it for?",
      subtitle: "For everyone doing business in Uzbekistan",
      items: [
        {
          icon: "🧑‍💼",
          title: "Sole traders (YaTT / IP)",
          desc: "Tax, reporting, HR issues — without an accountant, handle it yourself",
        },
        {
          icon: "🏢",
          title: "Small and medium businesses (LLC)",
          desc: "Legal and financial questions — reduce accountant and lawyer costs",
        },
        {
          icon: "💻",
          title: "Freelancers and creative agencies",
          desc: "Contracts, invoices, taxes — done quickly and correctly",
        },
        {
          icon: "🌏",
          title: "International companies in Uzbekistan",
          desc: "Japanese, Chinese, Turkish, Korean companies — local laws in your own language",
        },
        {
          icon: "🛍️",
          title: "Telegram sellers",
          desc: "Online shops, food delivery, services — AI-powered Telegram bot on autopilot",
        },
      ],
    },
    howItWorks: {
      title: "How does it work?",
      subtitle: "3 simple steps",
      step1: { title: "Message the bot or open the web", desc: "Send your question to @ai_business_concierge_bot or via the web dashboard" },
      step2: { title: "AI analyses", desc: "Uzbekistan law knowledge base + Claude AI — accurate, reliable answer" },
      step3: { title: "Get your answer instantly", desc: "Practical advice in 5 seconds, documents or a bot if needed" },
    },
    companyOnboarding: {
      badge: "For Companies",
      title: "Connect Your Company",
      subtitle: "Manage your business in one place — employees, tasks, finance, documents and AI consulting.",
      steps: [
        {
          icon: "📋",
          step: "Step 1",
          title: "Submit a Request",
          desc: "Send your company details. We will get in touch within 24 hours.",
        },
        {
          icon: "🤝",
          step: "Step 2",
          title: "Demo & Agreement",
          desc: "We show you the system and answer your questions. Once agreed — we send you a personal invite link.",
        },
        {
          icon: "🏢",
          step: "Step 3",
          title: "Register Your Company",
          desc: "Via the invite link, fill in your company info and set your login credentials. Wait for approval.",
        },
        {
          icon: "✅",
          step: "Step 4",
          title: "Start Working",
          desc: "After our approval, sign in, add your employees and start managing everything.",
        },
      ],
      featuresTitle: "What's in the Company Dashboard?",
      features: [
        { icon: "👥", text: "Employee management — HR, roles, positions, full data" },
        { icon: "✅", text: "Tasks & goals — for the entire team" },
        { icon: "💰", text: "Finance & payroll — income, expenses, reports" },
        { icon: "📄", text: "Document generation — contracts, orders, applications (PDF/DOCX)" },
        { icon: "🤖", text: "AI Advisor — tax, legal, HR questions 24/7" },
        { icon: "🔒", text: "Security — each employee sees only their own data" },
      ],
      cta: "Submit a Request",
      ctaNote: "Free consultation · 24-hour response · No commitment",
      alreadyAccount: "Already have an account?",
    },
    contact: {
      title: "Contact Us",
      subtitle: "Fill in your details — we'll get in touch within 24 hours and show you the system.",
      fullName: "Full name *", fullNamePlaceholder: "Last name First name",
      companyName: "Company name", companyNamePlaceholder: "e.g. Jahongir Trade LLC",
      stir: "Tax ID (optional)", stirPlaceholder: "123456789",
      phone: "Phone *", phonePlaceholder: "+998 90 123 45 67",
      email: "Email *", emailPlaceholder: "email@company.com",
      businessType: "Business type", businessTypePlaceholder: "Select",
      businessTypes: { yatt: "Sole trader (YaTT)", llc: "LLC (Limited liability company)", jsc: "JSC (Joint stock company)", other: "Other" },
      employeeCount: "Number of employees (approx)", employeeCountPlaceholder: "Select",
      message: "Question or problem (optional)", messagePlaceholder: "How do you plan to use the system? What are your main challenges?",
      source: "How did you hear about us?", sourcePlaceholder: "Select",
      sources: { ads: "Advertisement", referral: "Friend's recommendation", search: "Internet search", telegram: "Telegram", other: "Other" },
      submit: "Submit request", submitting: "Submitting...",
      successTitle: "Request received!",
      successDesc: "We will contact you within 24 hours and show you the system.",
      successNote: "Direct contact:",
      backToHome: "Back to home",
      required: "* — required fields",
    },
    register: {
      title: "Register Your Company",
      subtitle: "Add your company to the system using an admin invitation",
      loading: "Loading...",
      invalidToken: "This link is invalid or incorrect. Please contact the administrator.",
      tokenExpired: "This link has expired (48 hours). Please contact the administrator.",
      alreadyUsed: "This link has already been used. Go to the login page.",
      companyName: "Company name",
      companyNamePlaceholder: "Official company name",
      legalForm: "Legal form",
      legalFormPlaceholder: "Select",
      legalForms: { yatt: "Sole proprietor", llc: "LLC", jsc: "JSC", other: "Other" },
      stir: "Tax ID (STIR)",
      stirPlaceholder: "9-digit tax ID",
      legalAddress: "Legal address",
      legalAddressPlaceholder: "Registered address",
      password: "Password",
      passwordPlaceholder: "At least 8 characters",
      confirmPassword: "Confirm password",
      confirmPasswordPlaceholder: "Repeat password",
      passwordMismatch: "Passwords do not match.",
      submit: "Register",
      submitting: "Saving...",
      successTitle: "Successfully registered!",
      successDesc: "Your company has been added to the system. You will get access once the admin approves it.",
      backToHome: "Back to home",
      goToLogin: "Go to login",
    },
    pricing: {
      title: "Pricing",
      subtitle: "Free during beta. Pro plan coming soon.",
      free: {
        name: "Free",
        price: "$0",
        period: "/ month",
        cta: "Get Started Now",
        features: [
          "5 requests / day",
          "AI Advisor (all questions)",
          "4 languages: uz / ru / en / ja",
          "Telegram bot + Web dashboard",
          "Knowledge base: 2026 laws",
        ],
      },
      pro: {
        name: "Pro",
        price: "$9.99",
        period: "/ month",
        cta: "Coming soon",
        badge: "Coming soon",
        features: [
          "50 requests / day (unlimited plans too)",
          "AI Advisor + Document Maker",
          "AI Sales Telegram bot",
          "PDF / DOCX document generation",
          "Priority support",
        ],
      },
    },
    faq: {
      title: "Frequently Asked Questions",
      items: [
        {
          q: "What if the AI Advisor gives a wrong answer?",
          a: "Every response includes a confidence score and a disclaimer: 'This is AI advice — consult a professional for critical decisions.' We recommend professional consultation for high-stakes matters.",
        },
        {
          q: "How many questions can I ask on the free plan?",
          a: "5 questions per day on the free plan, via Telegram bot anytime. The limit resets daily and does not roll over.",
        },
        {
          q: "Is my data secure?",
          a: "Yes. Each company's data is fully isolated (multi-tenant architecture). Supabase PostgreSQL + Row Level Security — no other company can see your data.",
        },
        {
          q: "How well does the AI know Uzbekistan law?",
          a: "The AI answers based on Uzbekistan's 2026 tax legislation, Labour Code, and business regulations. Responses are available in Uzbek, Russian, English, and Japanese.",
        },
        {
          q: "What's the difference between the Telegram bot and the web dashboard?",
          a: "Telegram bot — for quick questions (advice, document requests). Web dashboard — full functionality: employee management, tasks, reports, AI settings.",
        },
        {
          q: "When will payments go live?",
          a: "Pro plan payments via Click and Payme launch in Q3 2026. Currently in beta — all features are free.",
        },
      ],
    },
    footer: {
      tagline: "AI assistant for business in Uzbekistan — local and international",
      rights: "© 2026 AI Business Concierge. All rights reserved.",
      links: { features: "Features", pricing: "Pricing", faq: "FAQ", contact: "Contact" },
    },
  },

  // ─────────────────────────────── JA ───────────────────────────────
  ja: {
    nav: { login: "ログイン", contact: "お問い合わせ", features: "機能", pricing: "料金", faq: "よくある質問" },
    hero: {
      badge: "ベータ版 — 無料アクセス中",
      title: "ウズベキスタンの国内・外資中小企業向けAIアシスタント",
      subtitle:
        "税務・労働法・契約・Telegram販売 — 24時間365日、5秒で正確な回答。専門家相談費用の10%で利用可能。",
      ctaTelegram: "Telegramボットを試す",
      ctaLogin: "ダッシュボードを開く",
      exploreSystem: "システムを見る",
    },
    stats: {
      items: [
        { value: "24/7", label: "常時稼働" },
        { value: "< 5s", label: "平均応答時間" },
        { value: "4", label: "言語: uz / ru / en / ja" },
        { value: "3", label: "強力なモジュール" },
      ],
    },
    features: {
      title: "3つの強力なモジュール",
      subtitle: "Webダッシュボード + Telegramボット — 一つのシステム、すべてのニーズ",
      maslahatchi: {
        title: "AIアドバイザー",
        desc: "2026年ウズベキスタン法律に基づく即座のアドバイス — 会計士や弁護士のように、24時間無料で。",
        bullets: [
          "個人事業主・LLC の税率と期限",
          "雇用契約と解雇手続き",
          "ライセンスと許認可",
          "VAT・INPS・社会保険料",
          "ビジネス登録手続き",
        ],
      },
      hujjatchi: {
        title: "AI書類作成",
        desc: "契約書・申請書・指示書 — テンプレートから即座に作成。弁護士不要、ミスなし。",
        bullets: [
          "雇用契約書（標準・個別）",
          "サービス契約書",
          "解雇・任命指示書",
          "申請書・委任状",
          "PDF / DOCX でダウンロード",
        ],
      },
      sotuvchi: {
        title: "AI販売ボット",
        desc: "Telegram販売 — 商品カタログ、注文受付、顧客データベース。すべて自動化。",
        bullets: [
          "商品カタログと価格",
          "注文受付と確認",
          "顧客データベースと履歴",
          "統計とレポート",
          "Click・Payme決済連携",
        ],
      },
      soon: "近日公開",
    },
    whyUs: {
      title: "グローバル市場でなぜ私たちを選ぶのか？",
      subtitle:
        "ChatGPTでも政府ポータルでも1Cでもない — ウズベキスタンのビジネス実務専用に構築された唯一のAIシステム",
      items: [
        {
          icon: "🇺🇿",
          title: "ウズベキスタン法律 — 2026年版",
          desc: "税法・労働法・ライセンス規則 — 最新の変更点を含む。",
        },
        {
          icon: "⚡",
          title: "5秒で回答",
          desc: "会計士や弁護士を2-3日待つ代わりに — 即座に、いつでも。",
        },
        {
          icon: "💰",
          title: "専門サービスの10%のコスト",
          desc: "1時間のコンサルティング$50-200。年間サブスクリプションは10倍安く、無制限の質問。",
        },
        {
          icon: "🌐",
          title: "4言語 — 外資企業向け",
          desc: "ウズベク語・ロシア語・英語・日本語。ウズベキスタンの外資企業が希望言語でご利用いただけます。",
        },
        {
          icon: "📱",
          title: "Telegram — 別アプリ不要",
          desc: "従業員はすでにTelegramを使用。新しいアプリのインストールやトレーニング不要。",
        },
        {
          icon: "🔄",
          title: "Web + Bot — 統合エコシステム",
          desc: "ダッシュボードで詳細分析、Telegramで素早い質問 — 2チャンネル、1つのナレッジベース。",
        },
      ],
    },
    problems: {
      title: "どんな問題を解決するか？",
      subtitle: "中小企業のオーナーが毎日直面する実際の問題",
      beforeLabel: "以前",
      afterLabel: "今",
      items: [
        {
          emoji: "📊",
          problem: "税務の質問",
          before: "会計士を1-2日待ち、質問ごとに$20-50支払う",
          after: "TelegramまたはWebで質問 — 5秒で正確な回答、無料",
        },
        {
          emoji: "📄",
          problem: "契約書の作成",
          before: "弁護士に依頼、3-5日待ち、$100-300支払う",
          after: "AIテンプレートで即座に完成、PDFダウンロード",
        },
        {
          emoji: "🛒",
          problem: "Telegram販売",
          before: "各注文に手動返信、ExcelのカタログⅡ、何時間もの作業",
          after: "AIボットが24/7注文受付、カタログ自動更新",
        },
        {
          emoji: "🌍",
          problem: "外国人従業員",
          before: "日本語や英語で規則を説明するのは難しい",
          after: "4言語対応 — 全員が自国語で回答を得られる",
        },
      ],
    },
    automation: {
      title: "何が自動化されるか？",
      subtitle: "ルーティン業務をAIに任せ、ビジネス成長に集中を",
      items: [
        { icon: "🧮", title: "税金計算", desc: "毎月の税金自動計算とリマインダー" },
        { icon: "📝", title: "契約書生成", desc: "情報を入力するだけ — 数秒で完成した契約書" },
        { icon: "👥", title: "従業員採用", desc: "申請書・契約書・指示書 — フルパッケージ自動作成" },
        { icon: "🛒", title: "Telegram注文", desc: "受付・確認・通知 — すべてボット経由" },
        { icon: "📅", title: "期限管理", desc: "報告書・支払い・ライセンス — 事前リマインダー" },
        { icon: "📊", title: "ビジネスレポート", desc: "月次売上・経費・利益 — 自動レポート" },
        { icon: "💬", title: "顧客サービス", desc: "よくある質問 — ボットが24時間対応" },
        { icon: "🔍", title: "法律更新情報", desc: "ウズベキスタン法改正 — 即時通知" },
      ],
    },
    forWho: {
      title: "誰のためのサービスか？",
      subtitle: "ウズベキスタンでビジネスをするすべての人のために",
      items: [
        {
          icon: "🧑‍💼",
          title: "個人事業主（YaTT）",
          desc: "税金・申告・人事 — 会計士なしで自分で解決",
        },
        {
          icon: "🏢",
          title: "中小企業（LLC）",
          desc: "法務・財務の質問 — 弁護士・会計士のコスト削減",
        },
        {
          icon: "💻",
          title: "フリーランサーとクリエイティブ事務所",
          desc: "契約書・請求書・税金 — 迅速かつ正確に",
        },
        {
          icon: "🌏",
          title: "ウズベキスタンの外資企業",
          desc: "日本・中国・トルコ・韓国企業 — 母国語でローカル法を理解",
        },
        {
          icon: "🛍️",
          title: "Telegram販売者",
          desc: "ネットショップ・フードデリバリー・サービス — AIボットで自動化",
        },
      ],
    },
    howItWorks: {
      title: "使い方",
      subtitle: "3つの簡単なステップ",
      step1: { title: "ボットかWebにアクセス", desc: "@ai_business_concierge_botへ、またはWebダッシュボードから質問を送信" },
      step2: { title: "AIが分析", desc: "ウズベキスタン法ナレッジベース + Claude AI — 正確で信頼性の高い回答" },
      step3: { title: "即座に回答を受け取る", desc: "5秒で実用的なアドバイス、必要に応じて書類やボットも作成" },
    },
    companyOnboarding: {
      badge: "企業向け",
      title: "貴社をシステムに接続する",
      subtitle: "ビジネスを一か所で管理 — 従業員・タスク・財務・書類・AIコンサルティング。",
      steps: [
        {
          icon: "📋",
          step: "ステップ1",
          title: "お問い合わせ",
          desc: "会社情報をお送りください。24時間以内にご連絡いたします。",
        },
        {
          icon: "🤝",
          step: "ステップ2",
          title: "デモと合意",
          desc: "システムをご案内し、ご質問にお答えします。合意後、専用の招待リンクをお送りします。",
        },
        {
          icon: "🏢",
          step: "ステップ3",
          title: "会社を登録する",
          desc: "招待リンクから会社情報を入力し、ログイン情報を設定します。承認をお待ちください。",
        },
        {
          icon: "✅",
          step: "ステップ4",
          title: "業務開始",
          desc: "承認後、ログインして従業員を追加し、すべての管理を始めてください。",
        },
      ],
      featuresTitle: "企業ダッシュボードで何ができる？",
      features: [
        { icon: "👥", text: "従業員管理 — HR・役割・役職・全データ" },
        { icon: "✅", text: "タスクと目標 — チーム全体向け" },
        { icon: "💰", text: "財務と給与 — 収入・支出・レポート" },
        { icon: "📄", text: "書類生成 — 契約書・命令書・申請書（PDF/DOCX）" },
        { icon: "🤖", text: "AIアドバイザー — 税務・法律・HRの質問に24時間対応" },
        { icon: "🔒", text: "セキュリティ — 各従業員は自分のデータのみ閲覧可能" },
      ],
      cta: "お問い合わせ",
      ctaNote: "無料相談 · 24時間以内に回答 · 義務なし",
      alreadyAccount: "すでにアカウントをお持ちですか？",
    },
    contact: {
      title: "お問い合わせ",
      subtitle: "情報をご入力ください — 24時間以内にご連絡し、システムをご案内します。",
      fullName: "氏名 *", fullNamePlaceholder: "姓 名",
      companyName: "会社名", companyNamePlaceholder: "例: Jahongir Trade LLC",
      stir: "税務番号（任意）", stirPlaceholder: "123456789",
      phone: "電話番号 *", phonePlaceholder: "+998 90 123 45 67",
      email: "メール *", emailPlaceholder: "email@company.com",
      businessType: "事業形態", businessTypePlaceholder: "選択してください",
      businessTypes: { yatt: "個人事業主", llc: "合同会社（LLC）", jsc: "株式会社（JSC）", other: "その他" },
      employeeCount: "従業員数（概算）", employeeCountPlaceholder: "選択してください",
      message: "質問や課題（任意）", messagePlaceholder: "システムをどのように活用したいですか？主な課題は何ですか？",
      source: "どこで知りましたか？", sourcePlaceholder: "選択してください",
      sources: { ads: "広告", referral: "友人の紹介", search: "インターネット検索", telegram: "Telegram", other: "その他" },
      submit: "送信する", submitting: "送信中...",
      successTitle: "お問い合わせを受け付けました！",
      successDesc: "24時間以内にご連絡し、システムをご案内します。",
      successNote: "直接お問い合わせ:",
      backToHome: "ホームへ戻る",
      required: "* — 必須項目",
    },
    register: {
      title: "会社を登録する",
      subtitle: "管理者の招待を使用してシステムに会社を追加してください",
      loading: "読み込み中...",
      invalidToken: "このリンクは無効または不正です。管理者にお問い合わせください。",
      tokenExpired: "このリンクの有効期限が切れました（48時間）。管理者にお問い合わせください。",
      alreadyUsed: "このリンクはすでに使用されています。ログインページへ移動してください。",
      companyName: "会社名",
      companyNamePlaceholder: "正式な会社名",
      legalForm: "法人形態",
      legalFormPlaceholder: "選択してください",
      legalForms: { yatt: "個人事業主", llc: "合同会社", jsc: "株式会社", other: "その他" },
      stir: "税務番号",
      stirPlaceholder: "9桁の税務番号",
      legalAddress: "法人住所",
      legalAddressPlaceholder: "登記住所",
      password: "パスワード",
      passwordPlaceholder: "8文字以上",
      confirmPassword: "パスワードの確認",
      confirmPasswordPlaceholder: "パスワードを再入力",
      passwordMismatch: "パスワードが一致しません。",
      submit: "登録する",
      submitting: "保存中...",
      successTitle: "登録が完了しました！",
      successDesc: "会社がシステムに追加されました。管理者が承認すると、アクセスできるようになります。",
      backToHome: "ホームへ戻る",
      goToLogin: "ログインページへ",
    },
    pricing: {
      title: "料金プラン",
      subtitle: "ベータ期間中は無料。Proプランは近日公開。",
      free: {
        name: "無料",
        price: "$0",
        period: "/ 月",
        cta: "今すぐ始める",
        features: [
          "5リクエスト / 日",
          "AIアドバイザー（全質問対応）",
          "4言語: uz / ru / en / ja",
          "Telegramボット + Webダッシュボード",
          "ナレッジベース: 2026年法律",
        ],
      },
      pro: {
        name: "Pro",
        price: "$9.99",
        period: "/ 月",
        cta: "近日公開",
        badge: "近日公開",
        features: [
          "50リクエスト / 日（無制限プランも）",
          "AIアドバイザー + 書類作成",
          "AI販売Telegramボット",
          "PDF / DOCX書類生成",
          "優先サポート",
        ],
      },
    },
    faq: {
      title: "よくある質問",
      items: [
        {
          q: "AIアドバイザーが誤った回答をした場合は？",
          a: "すべての回答には信頼スコアと「これはAIアドバイスです — 重要な決定には専門家にご相談ください」という免責事項が含まれます。",
        },
        {
          q: "無料プランでは何問まで質問できますか？",
          a: "無料プランはTelegramボット経由で1日5問まで。制限は毎日リセットされ、翌日への繰り越しはありません。",
        },
        {
          q: "データは安全ですか？",
          a: "はい。各企業のデータは完全に分離されています（マルチテナントアーキテクチャ）。Supabase PostgreSQL + Row Level Security — 他社があなたのデータを見ることはできません。",
        },
        {
          q: "ウズベキスタンの法律にどれほど精通していますか？",
          a: "AIは2026年のウズベキスタン税法、労働法典、ビジネス規制に基づいて回答します。ウズベク語、ロシア語、英語、日本語で対応しています。",
        },
        {
          q: "TelegramボットとWebダッシュボードの違いは？",
          a: "Telegramボット — 迅速な質問向け（アドバイス、書類リクエスト）。Webダッシュボード — 全機能：従業員管理、タスク、レポート、AI設定。",
        },
        {
          q: "決済機能はいつ開始しますか？",
          a: "ClickとPaymeによるProプランの支払いは2026年Q3に開始予定です。現在はベータ期間 — すべての機能が無料です。",
        },
      ],
    },
    footer: {
      tagline: "ウズベキスタンのビジネス向けAIアシスタント — 国内・外資企業向け",
      rights: "© 2026 AI Business Concierge. All rights reserved.",
      links: { features: "機能", pricing: "料金", faq: "よくある質問", contact: "お問い合わせ" },
    },
  },
};
