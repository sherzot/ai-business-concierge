import type { LandingLocale } from "./types";

type LandingDict = {
  nav: { login: string; getStarted: string };
  hero: { badge: string; title: string; subtitle: string; ctaTelegram: string; ctaLogin: string };
  features: {
    title: string; subtitle: string;
    maslahatchi: { title: string; desc: string };
    hujjatchi: { title: string; desc: string };
    sotuvchi: { title: string; desc: string };
    soon: string;
  };
  howItWorks: {
    title: string; subtitle: string;
    step1: { title: string; desc: string };
    step2: { title: string; desc: string };
    step3: { title: string; desc: string };
  };
  pricing: {
    title: string; subtitle: string;
    free: { name: string; price: string; period: string; cta: string; features: string[] };
    pro: { name: string; price: string; period: string; cta: string; features: string[]; badge: string };
  };
  footer: { tagline: string; rights: string };
};

export const landingI18n: Record<LandingLocale, LandingDict> = {
  uz: {
    nav: {
      login: "Kirish",
      getStarted: "Boshlash",
    },
    hero: {
      badge: "Beta — Hozir bepul kirish",
      title: "O'zbekistondagi mahalliy va xalqaro kichik bizneslar uchun AI yordamchi",
      subtitle: "Soliq, mehnat kodeksi, biznes savollari — 24/7, darhol, aniq. Telegram bot yoki web dashboard orqali.",
      ctaTelegram: "Telegram botni sinab ko'rish",
      ctaLogin: "Dashboard ga kirish",
    },
    features: {
      title: "Nima qila olamiz?",
      subtitle: "Uchta modul — biznеsingizning har bir ehtiyoji uchun",
      maslahatchi: {
        title: "AI Maslahatchi",
        desc: "YaTT/MChJ soliqlari, mehnat shartnomasi, litsenziya, hisobot muddatlari — istalgan vaqt tezkor maslahat.",
      },
      hujjatchi: {
        title: "AI Hujjatchi",
        desc: "Shartnoma, ariza, buyruq, ishdan bo'shatish xati — shablonlar asosida bir zumda tayyor.",
      },
      sotuvchi: {
        title: "AI Sotuvchi",
        desc: "Telegram savdo bot yaratish va boshqarish — mahsulot katalog, buyurtma qabul qilish, mijoz bazasi.",
      },
      soon: "Tez kunda",
    },
    howItWorks: {
      title: "Qanday ishlaydi?",
      subtitle: "3 ta oddiy qadam",
      step1: { title: "Botga yozing", desc: "Telegram da @ai_business_concierge_bot ga savolingizni yuboring" },
      step2: { title: "AI tahlil qiladi", desc: "Bilimlar bazasi va Claude AI yordamida aniq javob tayyorlanadi" },
      step3: { title: "Javob oling", desc: "Bir necha soniyada O'zbekiston qonunlariga asoslangan amaliy maslahat" },
    },
    pricing: {
      title: "Narxlar",
      subtitle: "Beta davrida bepul. Tez kunda Pro plan.",
      free: {
        name: "Bepul",
        price: "$0",
        period: "/ oy",
        cta: "Boshlash",
        features: ["5 ta so'rov / kun", "AI Maslahatchi", "4 til: uz/ru/en/ja", "Telegram bot"],
      },
      pro: {
        name: "Pro",
        price: "$9.99",
        period: "/ oy",
        cta: "Tez kunda",
        badge: "Kelmoqda",
        features: ["50 ta so'rov / kun", "AI Maslahatchi + Hujjatchi", "AI Sotuvchi bot", "Ustuvor qo'llab-quvvatlash"],
      },
    },
    footer: {
      tagline: "O'zbekiston biznesi uchun AI yordamchi",
      rights: "© 2026 AI Business Concierge. Barcha huquqlar himoyalangan.",
    },
  },

  ru: {
    nav: {
      login: "Войти",
      getStarted: "Начать",
    },
    hero: {
      badge: "Beta — Бесплатный доступ",
      title: "AI-помощник для местного и международного малого бизнеса в Узбекистане",
      subtitle: "Налоги, трудовой кодекс, вопросы бизнеса — 24/7, мгновенно, точно. Через Telegram бот или веб-дашборд.",
      ctaTelegram: "Попробовать Telegram бот",
      ctaLogin: "Войти в дашборд",
    },
    features: {
      title: "Что мы умеем?",
      subtitle: "Три модуля для каждой потребности бизнеса",
      maslahatchi: {
        title: "AI Консультант",
        desc: "Налоги ИП/ООО, трудовой договор, лицензии, сроки отчётности — быстрая консультация в любое время.",
      },
      hujjatchi: {
        title: "AI Документовед",
        desc: "Договор, заявление, приказ, письмо об увольнении — готово за секунды по шаблонам.",
      },
      sotuvchi: {
        title: "AI Продавец",
        desc: "Создание и управление Telegram-ботом продаж — каталог товаров, приём заказов, база клиентов.",
      },
      soon: "Скоро",
    },
    howItWorks: {
      title: "Как это работает?",
      subtitle: "3 простых шага",
      step1: { title: "Напишите боту", desc: "Отправьте вопрос в @ai_business_concierge_bot в Telegram" },
      step2: { title: "AI анализирует", desc: "Ответ готовится на основе базы знаний и Claude AI" },
      step3: { title: "Получите ответ", desc: "Практичный совет на основе законодательства Узбекистана" },
    },
    pricing: {
      title: "Тарифы",
      subtitle: "Бесплатно в период бета. Pro план скоро.",
      free: {
        name: "Бесплатно",
        price: "$0",
        period: "/ мес",
        cta: "Начать",
        features: ["5 запросов / день", "AI Консультант", "4 языка: uz/ru/en/ja", "Telegram бот"],
      },
      pro: {
        name: "Pro",
        price: "$9.99",
        period: "/ мес",
        cta: "Скоро",
        badge: "Скоро",
        features: ["50 запросов / день", "AI Консультант + Документовед", "AI бот продаж", "Приоритетная поддержка"],
      },
    },
    footer: {
      tagline: "AI-помощник для бизнеса Узбекистана",
      rights: "© 2026 AI Business Concierge. Все права защищены.",
    },
  },

  en: {
    nav: {
      login: "Sign In",
      getStarted: "Get Started",
    },
    hero: {
      badge: "Beta — Free access now",
      title: "AI Assistant for Local and International Small Businesses in Uzbekistan",
      subtitle: "Tax, labor code, business questions — answered 24/7, instantly, accurately. Via Telegram bot or web dashboard.",
      ctaTelegram: "Try Telegram Bot",
      ctaLogin: "Open Dashboard",
    },
    features: {
      title: "What can we do?",
      subtitle: "Three modules for every business need",
      maslahatchi: {
        title: "AI Advisor",
        desc: "Sole trader / LLC taxes, employment contracts, licenses, reporting deadlines — instant advice anytime.",
      },
      hujjatchi: {
        title: "AI Document Maker",
        desc: "Contracts, applications, orders, termination letters — ready in seconds from templates.",
      },
      sotuvchi: {
        title: "AI Sales Bot",
        desc: "Create and manage a Telegram sales bot — product catalogue, order taking, customer base.",
      },
      soon: "Coming soon",
    },
    howItWorks: {
      title: "How does it work?",
      subtitle: "3 simple steps",
      step1: { title: "Message the bot", desc: "Send your question to @ai_business_concierge_bot on Telegram" },
      step2: { title: "AI analyses", desc: "An accurate answer is prepared using the knowledge base and Claude AI" },
      step3: { title: "Get your answer", desc: "Practical advice based on Uzbekistan legislation in seconds" },
    },
    pricing: {
      title: "Pricing",
      subtitle: "Free during beta. Pro plan coming soon.",
      free: {
        name: "Free",
        price: "$0",
        period: "/ month",
        cta: "Get Started",
        features: ["5 requests / day", "AI Advisor", "4 languages: uz/ru/en/ja", "Telegram bot"],
      },
      pro: {
        name: "Pro",
        price: "$9.99",
        period: "/ month",
        cta: "Coming soon",
        badge: "Coming soon",
        features: ["50 requests / day", "AI Advisor + Document Maker", "AI Sales bot", "Priority support"],
      },
    },
    footer: {
      tagline: "AI assistant for businesses in Uzbekistan",
      rights: "© 2026 AI Business Concierge. All rights reserved.",
    },
  },

  ja: {
    nav: {
      login: "ログイン",
      getStarted: "はじめる",
    },
    hero: {
      badge: "ベータ版 — 無料アクセス中",
      title: "ウズベキスタンの国内・外資中小企業向けAIアシスタント",
      subtitle: "税務・労働法・ビジネス相談を24時間即座に正確に回答。TelegramボットまたはWebダッシュボードから。",
      ctaTelegram: "Telegramボットを試す",
      ctaLogin: "ダッシュボードを開く",
    },
    features: {
      title: "できること",
      subtitle: "ビジネスのすべてのニーズに対応する3つのモジュール",
      maslahatchi: {
        title: "AIアドバイザー",
        desc: "個人事業主/LLC税務、雇用契約、ライセンス、申告期限 — いつでも即座にアドバイス。",
      },
      hujjatchi: {
        title: "AI書類作成",
        desc: "契約書、申請書、指示書、解雇通知書 — テンプレートから数秒で作成。",
      },
      sotuvchi: {
        title: "AI販売ボット",
        desc: "Telegram販売ボットの作成・管理 — 商品カタログ、注文受付、顧客データベース。",
      },
      soon: "近日公開",
    },
    howItWorks: {
      title: "使い方",
      subtitle: "3つの簡単なステップ",
      step1: { title: "ボットにメッセージ", desc: "TelegramでBOT_USERNAME に質問を送ってください" },
      step2: { title: "AIが分析", desc: "ナレッジベースとClaude AIを使って正確な回答を準備します" },
      step3: { title: "回答を受け取る", desc: "ウズベキスタンの法律に基づいた実用的なアドバイスが数秒で届きます" },
    },
    pricing: {
      title: "料金プラン",
      subtitle: "ベータ期間中は無料。Proプランは近日公開。",
      free: {
        name: "無料",
        price: "$0",
        period: "/ 月",
        cta: "はじめる",
        features: ["5リクエスト / 日", "AIアドバイザー", "4言語: uz/ru/en/ja", "Telegramボット"],
      },
      pro: {
        name: "Pro",
        price: "$9.99",
        period: "/ 月",
        cta: "近日公開",
        badge: "近日公開",
        features: ["50リクエスト / 日", "AIアドバイザー + 書類作成", "AI販売ボット", "優先サポート"],
      },
    },
    footer: {
      tagline: "ウズベキスタンのビジネス向けAIアシスタント",
      rights: "© 2026 AI Business Concierge. All rights reserved.",
    },
  },
};
