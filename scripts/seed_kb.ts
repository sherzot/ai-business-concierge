/**
 * Knowledge Base Seed Script
 * Run: deno run --allow-net --allow-env scripts/seed_kb.ts
 *
 * Kerakli env vars:
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   OPENAI_API_KEY
 */

import { createClient } from "npm:@supabase/supabase-js@2.49.8";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY") ?? "";

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !OPENAI_API_KEY) {
  console.error("❌ SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY kerak");
  Deno.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

type KbEntry = {
  locale: "uz" | "ru" | "en";
  category: "soliq" | "kadrlar" | "biznes" | "hujjat" | "boshqa";
  question: string;
  answer: string;
  tags: string[];
};

// ---------------------------------------------------------------------------
// SAVOL-JAVOBLAR
// ---------------------------------------------------------------------------

const entries: KbEntry[] = [
  // ===================== O'ZBEK — SOLIQ =====================
  {
    locale: "uz", category: "soliq",
    question: "O'zbekistonda QQS (QoShilgan Qiymat Solig'i) stavkasi qancha?",
    answer: "2026 yilda O'zbekistonda QQS stavkasi 12% ni tashkil etadi. QQS to'lovchisi bo'lish uchun yillik aylanma 1 mlrd so'mdan oshishi kerak. Har oyning 20-sanasiga qadar QQS hisoboti topshiriladi.",
    tags: ["qqs", "qqs", "nds", "soliq stavkasi", "vat"],
  },
  {
    locale: "uz", category: "soliq",
    question: "Soddalashtirilgan soliq tizimida qancha soliq to'lanadi?",
    answer: "Soddalashtirilgan soliq tizimida (SST) savdo va xizmat ko'rsatish uchun 4%, ishlab chiqarish uchun 1% soliq to'lanadi. Yillik daromad 1 mlrd so'mgacha bo'lgan kichik korxonalar SST dan foydalanishi mumkin.",
    tags: ["sst", "soddalashtirilgan", "kichik biznes", "soliq"],
  },
  {
    locale: "uz", category: "soliq",
    question: "Foyda solig'i stavkasi qancha?",
    answer: "2026 yilda korporativ foyda solig'i (foyda solig'i) stavkasi 15% ni tashkil etadi. Bank va moliya tashkilotlari uchun 20%, ayrim imtiyozli sohalarda pasaytirilgan stavkalar qo'llanilishi mumkin.",
    tags: ["foyda solig'i", "korporativ soliq", "15%"],
  },
  {
    locale: "uz", category: "soliq",
    question: "Jismoniy shaxslardan olinadigan daromad solig'i qancha?",
    answer: "Jismoniy shaxslar daromad solig'i 12% ni tashkil etadi. Ish haqi, dividendlar, mulk ijarasi va boshqa daromadlarga qo'llaniladi. Dividend uchun 5% imtiyozli stavka mavjud.",
    tags: ["daromad solig'i", "jismoniy shaxs", "12%", "ish haqi solig'i"],
  },
  {
    locale: "uz", category: "soliq",
    question: "Yagona ijtimoiy to'lov (YIT) qancha?",
    answer: "Yagona ijtimoiy to'lov (YIT) ish beruvchi tomonidan ish haqidan 12% miqdorida to'lanadi. Xodimlar esa 1% pensiya jamg'armasi ulushini o'zlari to'laydi. YIT har oyning 15-sanasiga qadar to'lanishi kerak.",
    tags: ["yit", "ijtimoiy to'lov", "pensiya", "ish beruvchi"],
  },
  {
    locale: "uz", category: "soliq",
    question: "Patent tizimi qanday ishlaydi?",
    answer: "Patent tizimi yakka tartibdagi tadbirkorlar uchun. Belgilangan to'lov oyiga yoki yiliga to'lanadi, faoliyat turiga qarab farq qiladi. Savdo, xizmat ko'rsatish va hunarmandchilikda qo'llaniladi. Patent miqdori viloyat va shahar bo'yicha farq qiladi.",
    tags: ["patent", "yakka tadbirkor", "ip", "patent tizimi"],
  },
  {
    locale: "uz", category: "soliq",
    question: "Soliq hisobotlari qachon topshiriladi?",
    answer: "Asosiy muddatlar: QQS hisoboti — har oyning 20-si; Foyda solig'i dastlabki to'lov — chorak oxiridan 15 kun ichida; Yillik soliq deklaratsiyasi — 1 mart gacha. YIT — har oyning 15-si. Kechikish uchun jarimalar qo'llaniladi.",
    tags: ["soliq muddati", "hisobot", "deklaratsiya", "muddatlar"],
  },
  {
    locale: "uz", category: "soliq",
    question: "Kichik biznes uchun soliq imtiyozlari bormi?",
    answer: "Ha, bir qator imtiyozlar mavjud: IT parkidagi kompaniyalar uchun maxsus rejim; yangi ochilgan korxonalarga 2 yillik soliq ta'tillari; ishlab chiqarish sohasida pasaytirilgan stavkalar; eksport faoliyati uchun QQS 0%. Aniq imtiyozlar faoliyat turiga bog'liq.",
    tags: ["imtiyoz", "soliq ta'tili", "it park", "eksport"],
  },
  {
    locale: "uz", category: "soliq",
    question: "Kassa apparati majburiymi?",
    answer: "Ha, 2026 yilda naqd pul bilan ishlaydigan barcha tadbirkorlar uchun kassa apparati majburiy. Onlayn kassa (OKO) ishlatilishi va soliq organlariga real vaqtda ulangan bo'lishi kerak. Mavjud bo'lmagan taqdirda 5-50 BHM miqdorida jarima.",
    tags: ["kassa", "kassa apparati", "oko", "naqd pul"],
  },
  {
    locale: "uz", category: "soliq",
    question: "Import qilganda qanday soliq va bojlar to'lanadi?",
    answer: "Import qilishda: QQS 12%, bojxona boji (tovar turiga qarab 0-30%), aksiz solig'i (ba'zi tovarlarga). Hisob-kitob bojxona qiymatidan amalga oshiriladi. Ba'zi tovar guruhlari uchun imtiyozlar mavjud.",
    tags: ["import", "bojxona", "boj", "qqs"],
  },

  // ===================== O'ZBEK — KADRLAR =====================
  {
    locale: "uz", category: "kadrlar",
    question: "2026 yilda O'zbekistonda minimal ish haqi qancha?",
    answer: "2026 yilda O'zbekistonda minimal ish haqi oyiga 1 050 000 so'mni tashkil etadi. Bu miqdor har yili Prezident farmoni bilan belgilanadi. Ish beruvchi qonuniy minimal ish haqidan past to'lay olmaydi.",
    tags: ["minimal ish haqi", "mih", "ish haqi", "2026"],
  },
  {
    locale: "uz", category: "kadrlar",
    question: "Mehnat shartnomasini qanday rasmiylashtiriladi?",
    answer: "Mehnat shartnomasi yozma shaklda tuziladi. Xodim ishga qabul qilingan kundan 3 kun ichida shartnoma imzolanishi shart. Shartnomada ish joyi, lavozim, ish haqi, ish vaqti, majburiyatlar ko'rsatiladi. Bir nusxasi xodimda qoladi.",
    tags: ["mehnat shartnomasi", "ishga qabul", "shartnoma", "kadrlar"],
  },
  {
    locale: "uz", category: "kadrlar",
    question: "Yillik ta'til necha kun?",
    answer: "Asosiy yillik ta'til kamida 15 ish kuni. Og'ir va zararli mehnat sharoitida 30 ish kunigacha. Ta'til ish staji to'ldirganidan keyin foydalaniladi. Ta'til davomida o'rtacha ish haqi saqlanadi.",
    tags: ["ta'til", "yillik ta'til", "dam olish", "ish kuni"],
  },
  {
    locale: "uz", category: "kadrlar",
    question: "Homiladorlik va tug'ruq ta'tili necha kun?",
    answer: "Homiladorlik va tug'ruq ta'tili jami 126 kun (18 hafta): tug'ruqdan oldin 70 kun, keyin 56 kun. Murakkab tug'ruqda 70 kun. Ta'til davomida davlat tomonidan nafaqa to'lanadi. Bola 3 yoshgacha bo'lguncha qo'shimcha parvarishlash ta'tili beriladi.",
    tags: ["homiladorlik", "tug'ruq", "dekret", "nafaqa", "ta'til"],
  },
  {
    locale: "uz", category: "kadrlar",
    question: "Ish haftasi necha soat?",
    answer: "Normal ish vaqti haftasiga 40 soat (kuniga 8 soat). Yengil mehnat sharoitida 35 soat. Ortiqcha ish (overtime) — yozma rozi bo'lish talab qilinadi, ikki baravar haq to'lanadi. Tunda ishlash ham qo'shimcha haq to'lanadi.",
    tags: ["ish vaqti", "ish soati", "40 soat", "overtime"],
  },
  {
    locale: "uz", category: "kadrlar",
    question: "Xodimni ishdan bo'shatish tartibi qanday?",
    answer: "Ishdan bo'shatishda: kamida 2 hafta oldindan ogohlantirish (ba'zi holatlarda 1 oy); o'rtacha ish haqidan to'lov; mehnat kitobchasiga yozuv kiritish. Sababsiz ishdan bo'shatish taqiqlangan. Homilador ayol va bolali onalarni ishdan bo'shatish cheklangan.",
    tags: ["ishdan bo'shatish", "kompensatsiya", "ogohlantirish", "mehnat"],
  },
  {
    locale: "uz", category: "kadrlar",
    question: "Xodimlar uchun majburiy sug'urta bormi?",
    answer: "Ha, barcha rasmiy xodimlar uchun majburiy: ijtimoiy sug'urta (kasallik, nogironlik); pensiya sug'urtasi; mehnat jarohati sug'urtasi. Bularning barchasi YIT doirasida to'lanadi. Ish beruvchi barcha sug'urta to'lovlarini amalga oshiradi.",
    tags: ["sug'urta", "ijtimoiy sug'urta", "pensiya", "kadrlar"],
  },
  {
    locale: "uz", category: "kadrlar",
    question: "Sinov muddati qancha bo'lishi mumkin?",
    answer: "Sinov muddati (probatsiya) odatda 3 oygacha, rahbarlar uchun 6 oygacha. Sinov davrida xodim barcha huquqlarga ega. Sinov davomida shartnomani bekor qilish uchun 3 kun oldindan ogohlantirish kerak. Homilador ayollar uchun sinov muddati belgilanmaydi.",
    tags: ["sinov muddati", "probatsiya", "ishga qabul"],
  },

  // ===================== O'ZBEK — BIZNES =====================
  {
    locale: "uz", category: "biznes",
    question: "MChJ (Mas'uliyati Cheklangan Jamiyat) qanday ochiladi?",
    answer: "MChJ ochish uchun: 1) Ustav kapitali minimal 400 000 so'm; 2) Nizom (ustav) tayyorlash; 3) my.gov.uz orqali elektron ro'yxatdan o'tish yoki MFY ga borib; 4) STIR olish; 5) Bank hisob ochish. Jarayon 1-3 ish kunida amalga oshiriladi.",
    tags: ["mchj", "ro'yxatdan o'tish", "llc", "kompaniya ochish", "ustav"],
  },
  {
    locale: "uz", category: "biznes",
    question: "Yakka tartibdagi tadbirkor (YaTT) bo'lish uchun nima kerak?",
    answer: "YaTT bo'lish uchun: my.gov.uz orqali ariza topshirish, STIR olish. Ustav kapitali talab qilinmaydi. Soliq tizimini tanlash (patent yoki SST). Faoliyatni boshlash uchun ko'p hujjat talab qilinmaydi. Qayta ro'yxatdan o'tish kerak emas.",
    tags: ["yatt", "ip", "yakka tadbirkor", "ro'yxat"],
  },
  {
    locale: "uz", category: "biznes",
    question: "Qanday faoliyat uchun litsenziya kerak?",
    answer: "Litsenziya talab qiladigan asosiy faoliyatlar: tibbiyot va farmatsevtika; ta'lim xizmatlari; qurilish va arxitektura; moliya va sug'urta; transport (yo'lovchi tashish); alkogol va tamaki savdosi; telekommunikatsiya. Ro'yxat o'zgarishi mumkin — license.gov.uz saytida tekshiring.",
    tags: ["litsenziya", "ruxsatnoma", "faoliyat", "biznes"],
  },
  {
    locale: "uz", category: "biznes",
    question: "Yangi korxona uchun bank hisob raqami qanday ochiladi?",
    answer: "Bank hisobi ochish uchun: ro'yxatdan o'tish guvohnomasi; STIR; rahbar pasporti; ustav nusxasi. Ko'pchilik banklar hisob ochishni 1-3 kun ichida amalga oshiradi. Internet banking va terminal xizmatlari bilan birga ochish mumkin.",
    tags: ["bank hisob", "hisob raqami", "bank", "biznes"],
  },
  {
    locale: "uz", category: "biznes",
    question: "Buxgalteriya hisobini kim yuritishi mumkin?",
    answer: "Kichik korxonalar: direktor o'zi yuritishi yoki xodim tayinlashi mumkin. Yirik korxonalar uchun bosh buxgalter majburiy. Autsorsingga (tashqi buxgalterliya firmasiga) topshirish ham mumkin va ko'p hollarda tejamli. Soliq hisobotini elektron shaklda topshirish talab qilinadi.",
    tags: ["buxgalteriya", "buxgalter", "hisobchilik", "autsorsing"],
  },

  // ===================== O'ZBEK — HUJJAT =====================
  {
    locale: "uz", category: "hujjat",
    question: "Shartnoma tuzishda qanday asosiy shartlar bo'lishi kerak?",
    answer: "Biznes shartnomada majburiy elementlar: tomonlarning to'liq rekvizitlari (STIR, manzil); xizmat/tovar tavsifi; narx va to'lov shartlari; bajarish muddati; mas'uliyat va jarimalar; nizolarni hal qilish tartibi; imzo va muhr. Elektron imzo (UKEY) ham qonuniy kuchga ega.",
    tags: ["shartnoma", "kontrakt", "hujjat", "imzo"],
  },
  {
    locale: "uz", category: "hujjat",
    question: "Hisob-faktura (invoice) to'g'ri rasmiylashtirilishi uchun nima kerak?",
    answer: "Hisob-fakturada: sana va raqam; sotuvchi va xaridor rekvizitlari (STIR); tovar/xizmat nomi va miqdori; birlik narxi va jami summa; QQS summasi (agar QQS to'lovchi bo'lsa); imzo va muhr. Elektron hisob-faktura (e-faktura) tizimi ham ishlatilishi mumkin.",
    tags: ["hisob-faktura", "invoice", "faktura", "qqs"],
  },

  // ===================== RUSSIAN — НАЛОГ =====================
  {
    locale: "ru", category: "soliq",
    question: "Какова ставка НДС в Узбекистане в 2026 году?",
    answer: "Ставка НДС в Узбекистане в 2026 году составляет 12%. Обязательная регистрация плательщиком НДС требуется при годовом обороте свыше 1 млрд сумов. Отчётность подаётся до 20 числа каждого месяца.",
    tags: ["ндс", "nds", "qqs", "налог", "ставка"],
  },
  {
    locale: "ru", category: "soliq",
    question: "Что такое упрощённая система налогообложения (УСН)?",
    answer: "УСН применяется для малого бизнеса с годовым доходом до 1 млрд сумов. Ставка: 4% для торговли и услуг, 1% для производства. Заменяет НДС, налог на прибыль и другие налоги. Отчётность ежеквартальная.",
    tags: ["усн", "упрощённая система", "малый бизнес"],
  },
  {
    locale: "ru", category: "soliq",
    question: "Какой налог на прибыль для компаний?",
    answer: "Налог на прибыль составляет 15%. Для банков и финансовых организаций — 20%. Некоторые отрасли (IT-парк, производство) могут иметь льготные ставки. Авансовые платежи вносятся ежеквартально.",
    tags: ["налог на прибыль", "корпоративный налог", "15%"],
  },
  {
    locale: "ru", category: "soliq",
    question: "Какой размер единого социального платежа (ЕСП)?",
    answer: "ЕСП составляет 12% от фонда оплаты труда, уплачивается работодателем. Сотрудники дополнительно вносят 1% в накопительный пенсионный фонд. Уплата — до 15 числа каждого месяца.",
    tags: ["есп", "социальный платёж", "пенсия", "зарплата"],
  },
  {
    locale: "ru", category: "soliq",
    question: "Нужен ли кассовый аппарат?",
    answer: "Да, в 2026 году онлайн-кассовый аппарат обязателен для всех, кто принимает наличные. Касса должна быть подключена к налоговым органам в режиме реального времени. Штраф за отсутствие — от 5 до 50 БРВ.",
    tags: ["касса", "кассовый аппарат", "ккт", "наличные"],
  },
  {
    locale: "ru", category: "soliq",
    question: "Когда подавать налоговую отчётность?",
    answer: "Основные сроки: НДС — до 20 числа каждого месяца; авансовые платежи по налогу на прибыль — в течение 15 дней после окончания квартала; годовая декларация — до 1 марта; ЕСП — до 15 числа каждого месяца. Просрочка влечёт штрафы.",
    tags: ["сроки", "отчётность", "декларация", "налоги"],
  },

  // ===================== RUSSIAN — КАДРЫ =====================
  {
    locale: "ru", category: "kadrlar",
    question: "Какой минимальный размер оплаты труда в 2026 году?",
    answer: "Минимальная заработная плата в Узбекистане в 2026 году составляет 1 050 000 сумов в месяц. Устанавливается указом Президента ежегодно. Работодатель не вправе выплачивать зарплату ниже установленного минимума.",
    tags: ["мрот", "минималка", "минимальная зарплата", "2026"],
  },
  {
    locale: "ru", category: "kadrlar",
    question: "Сколько дней оплачиваемого отпуска положено?",
    answer: "Основной ежегодный оплачиваемый отпуск — не менее 15 рабочих дней. При вредных условиях труда — до 30 рабочих дней. В период отпуска сохраняется средняя заработная плата. Отпуск предоставляется после года работы.",
    tags: ["отпуск", "ежегодный отпуск", "рабочие дни", "зарплата"],
  },
  {
    locale: "ru", category: "kadrlar",
    question: "Как оформить трудовой договор?",
    answer: "Трудовой договор заключается в письменной форме в течение 3 дней с момента приёма на работу. Должен содержать: место работы, должность, размер оплаты, режим труда, обязанности. Один экземпляр хранится у работника.",
    tags: ["трудовой договор", "оформление", "приём на работу"],
  },
  {
    locale: "ru", category: "kadrlar",
    question: "Какой порядок увольнения сотрудника?",
    answer: "При увольнении: уведомление не менее чем за 2 недели (в ряде случаев — месяц); выплата компенсации; внесение записи в трудовую книжку. Увольнение беременных женщин и матерей с детьми ограничено законом. Необоснованное увольнение запрещено.",
    tags: ["увольнение", "компенсация", "уведомление", "трудовое право"],
  },
  {
    locale: "ru", category: "kadrlar",
    question: "Сколько часов в неделю должен работать сотрудник?",
    answer: "Нормальная продолжительность рабочего времени — 40 часов в неделю (8 часов в день). При лёгких условиях труда — 35 часов. Сверхурочная работа допускается только с письменного согласия и оплачивается в двойном размере.",
    tags: ["рабочее время", "40 часов", "сверхурочные"],
  },

  // ===================== RUSSIAN — БИЗНЕС =====================
  {
    locale: "ru", category: "biznes",
    question: "Как открыть ООО в Узбекистане?",
    answer: "Для открытия ООО: 1) Минимальный уставной капитал — 400 000 сумов; 2) Подготовить устав; 3) Зарегистрироваться через my.gov.uz или МФЦ; 4) Получить ИНН; 5) Открыть расчётный счёт. Процесс занимает 1–3 рабочих дня.",
    tags: ["ооо", "регистрация", "открыть бизнес", "уставной капитал"],
  },
  {
    locale: "ru", category: "biznes",
    question: "Что такое ИП и как его зарегистрировать?",
    answer: "Индивидуальный предприниматель (ИП) — простейшая форма ведения бизнеса. Регистрация через my.gov.uz, уставной капитал не требуется. Необходимо выбрать систему налогообложения (патент или УСН). Регистрация занимает 1 рабочий день.",
    tags: ["ип", "индивидуальный предприниматель", "регистрация"],
  },
  {
    locale: "ru", category: "biznes",
    question: "Какие виды деятельности требуют лицензии?",
    answer: "Лицензирование обязательно для: медицины и фармацевтики; образовательных услуг; строительства и архитектуры; финансов и страхования; пассажирских перевозок; продажи алкоголя и табака; телекоммуникаций. Актуальный список — на license.gov.uz.",
    tags: ["лицензия", "разрешение", "виды деятельности"],
  },

  // ===================== ENGLISH — TAX =====================
  {
    locale: "en", category: "soliq",
    question: "What is the VAT rate in Uzbekistan in 2026?",
    answer: "The VAT rate in Uzbekistan is 12% in 2026. VAT registration is required when annual turnover exceeds 1 billion UZS. Monthly VAT returns must be filed by the 20th of each month.",
    tags: ["vat", "tax", "qqs", "uzbekistan"],
  },
  {
    locale: "en", category: "soliq",
    question: "What taxes does a small business pay in Uzbekistan?",
    answer: "Small businesses (turnover under 1 billion UZS) can use the Simplified Tax System (STS): 4% on revenue for trade/services, 1% for manufacturing. This replaces VAT and profit tax. Larger companies pay standard rates: 15% profit tax, 12% VAT, 12% unified social payment.",
    tags: ["small business", "simplified tax", "sts", "uzbekistan"],
  },
  {
    locale: "en", category: "soliq",
    question: "What is the corporate income tax rate?",
    answer: "Corporate income tax in Uzbekistan is 15% for most companies. Banks and financial institutions pay 20%. IT Park residents and some manufacturers may have preferential rates. Advance payments are made quarterly.",
    tags: ["corporate tax", "income tax", "15%", "profit tax"],
  },

  // ===================== ENGLISH — HR =====================
  {
    locale: "en", category: "kadrlar",
    question: "What is the minimum wage in Uzbekistan 2026?",
    answer: "The minimum wage in Uzbekistan is 1,050,000 UZS (approximately $85–90) per month in 2026. It is set annually by Presidential decree. Employers cannot pay below this amount for any registered employee.",
    tags: ["minimum wage", "salary", "uzbekistan", "2026"],
  },
  {
    locale: "en", category: "kadrlar",
    question: "How many days of paid annual leave are employees entitled to?",
    answer: "Employees in Uzbekistan are entitled to a minimum of 15 working days of paid annual leave. Workers in hazardous conditions receive up to 30 working days. Leave is paid at the average daily wage and is available after completing one year of service.",
    tags: ["annual leave", "vacation", "paid leave", "labor law"],
  },

  // ===================== ENGLISH — BUSINESS =====================
  {
    locale: "en", category: "biznes",
    question: "How do I register a company (LLC) in Uzbekistan?",
    answer: "To register an LLC in Uzbekistan: 1) Minimum charter capital of 400,000 UZS; 2) Prepare the company charter; 3) Submit application via my.gov.uz or visit a MFC office; 4) Obtain a tax ID (STIR); 5) Open a business bank account. The process takes 1–3 business days.",
    tags: ["llc", "company registration", "uzbekistan", "business"],
  },
  {
    locale: "en", category: "biznes",
    question: "What activities require a license in Uzbekistan?",
    answer: "Licensed activities in Uzbekistan include: medical and pharmaceutical services; educational institutions; construction and architecture; financial services and insurance; passenger transportation; alcohol and tobacco retail; telecommunications. Check the current list at license.gov.uz.",
    tags: ["license", "permit", "business", "uzbekistan"],
  },

  // ===================== O'ZBEK — QO'SHIMCHA =====================
  {
    locale: "uz", category: "soliq",
    question: "Dividendlarga qanday soliq to'lanadi?",
    answer: "Dividendlarga 5% soliq qo'llaniladi (2026). Bu daromad solig'ining imtiyozli stavkasi. Xorijiy investorlar uchun ikki tomonlama soliqdan saqlanish shartnomalari amal qilishi mumkin. Dividendlarni to'lashda soliqni manba bo'yicha ushlab qolish talab qilinadi.",
    tags: ["dividendlar", "soliq", "5%", "investorlar"],
  },
  {
    locale: "uz", category: "kadrlar",
    question: "Xodim kasallansa nima bo'ladi?",
    answer: "Kasallik varag'i (byulletenь) bo'yicha to'lov: birinchi 5 kun ish beruvchi tomonidan, keyingi kunlar ijtimoiy sug'urta fondi tomonidan to'lanadi. To'lov miqdori ish stajiga bog'liq: 8 yilgacha — 60%, 8-15 yil — 80%, 15 yildan ortiq — 100%.",
    tags: ["kasallik", "byulleten", "vaqtinchalik nogironlik", "sug'urta"],
  },
  {
    locale: "uz", category: "biznes",
    question: "IT Park rezidenti bo'lishning afzalliklari nimada?",
    answer: "IT Park rezidentlari uchun maxsus imtiyozlar: foyda solig'i 0% (7,5% o'rniga); YIT 7,5% (12% o'rniga); QQS 0%; bojxona imtiyozlari. Shart: dasturiy mahsulot yoki IT xizmatlar ishlab chiqarish. Ariza it-park.uz saytida topshiriladi.",
    tags: ["it park", "imtiyoz", "soliq 0%", "it kompaniya"],
  },
  {
    locale: "uz", category: "hujjat",
    question: "Elektron raqamli imzo (ERI) qanday olinadi?",
    answer: "ERI (UKEY) olish uchun: e-imzo.uz saytiga kirish yoki MFYga borish; pasport bilan shaxsni tasdiqlash; ERI kaliti USB yoki smart-kartaga yoziladi. Narxi taxminan 50 000-100 000 so'm. Muddati 1-3 yil. ERI huquqiy kuchga ega va barcha elektron hujjatlarda ishlatiladi.",
    tags: ["eri", "elektron imzo", "ukey", "raqamli imzo", "ecp"],
  },
  {
    locale: "uz", category: "biznes",
    question: "my.gov.uz orqali qanday xizmatlar mavjud?",
    answer: "my.gov.uz orqali: korxona ro'yxatdan o'tkazish va tugatish; soliq ro'yxatiga olish; litsenziya va ruxsatnomalar; ijtimoiy to'lovlar hisoboti; davlat zakupalari; mulk ro'yxati; STIR olish. Ko'pgina xizmatlar 1 ish kunida bajariladi.",
    tags: ["my.gov.uz", "davlat xizmatlari", "elektron hukumat", "portal"],
  },
  {
    locale: "ru", category: "biznes",
    question: "Что такое my.gov.uz и какие услуги доступны?",
    answer: "my.gov.uz — единый портал государственных услуг. Через него доступны: регистрация и ликвидация компаний; постановка на налоговый учёт; получение лицензий и разрешений; подача отчётности по социальным платежам; регистрация имущества; получение ИНН. Большинство услуг оказывается за 1 рабочий день.",
    tags: ["my.gov.uz", "госуслуги", "электронное правительство"],
  },
  {
    locale: "ru", category: "kadrlar",
    question: "Что делать если сотрудник заболел?",
    answer: "По больничному листу: первые 5 дней оплачивает работодатель, последующие — Фонд социального страхования. Размер пособия зависит от стажа: до 8 лет — 60%, 8–15 лет — 80%, свыше 15 лет — 100% от среднего заработка.",
    tags: ["больничный", "временная нетрудоспособность", "страхование"],
  },
];

// ---------------------------------------------------------------------------
// Embedding + Insert
// ---------------------------------------------------------------------------

async function getEmbedding(text: string): Promise<number[]> {
  const res = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({ model: "text-embedding-3-small", input: text.slice(0, 8000) }),
  });
  if (!res.ok) throw new Error(`OpenAI error: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data.data[0].embedding;
}

async function insertEntry(entry: KbEntry): Promise<void> {
  const textForEmbedding = `${entry.question}\n${entry.answer}`;
  const embedding = await getEmbedding(textForEmbedding);

  const { error } = await supabase.from("knowledge_base").insert({
    tenant_id: null,
    locale: entry.locale,
    category: entry.category,
    question: entry.question,
    answer: entry.answer,
    tags: entry.tags,
    embedding,
    is_active: true,
  });

  if (error) throw new Error(`DB error: ${error.message}`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

console.log(`\n🚀 KB Seed — ${entries.length} ta yozuv qo'shiladi...\n`);

let ok = 0, fail = 0;

for (const [i, entry] of entries.entries()) {
  const num = String(i + 1).padStart(2, "0");
  try {
    await insertEntry(entry);
    console.log(`  ✅ [${num}/${entries.length}] [${entry.locale}/${entry.category}] ${entry.question.slice(0, 60)}`);
    ok++;
  } catch (e) {
    console.error(`  ❌ [${num}/${entries.length}] ${entry.question.slice(0, 60)} — ${(e as Error).message}`);
    fail++;
  }
  // Rate limit uchun kichik pauza
  await new Promise((r) => setTimeout(r, 200));
}

console.log(`\n✅ Muvaffaqiyatli: ${ok} | ❌ Xato: ${fail} | Jami: ${entries.length}\n`);
