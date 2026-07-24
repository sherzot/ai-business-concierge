-- Phase 2: AI Hujjatchi uchun dastlabki 15 global shablon.
-- Shablonlar service_role orqali boshqariladi; authenticated userlar faqat
-- is_active=true yozuvlarni RLS orqali o'qiydi.

insert into public.doc_templates (
  slug,
  category,
  title_uz,
  title_ru,
  description_uz,
  description_ru,
  fields,
  template_uz,
  template_ru,
  is_active
)
values
(
  'ijara-turar-joy',
  'shartnoma',
  'Ijara shartnomasi (turar-joy)',
  'Договор аренды жилого помещения',
  'Turar-joyni vaqtincha foydalanishga berish shartnomasi.',
  'Договор временного пользования жилым помещением.',
  '[
    {"name":"city","label_uz":"Shahar/tuman","label_ru":"Город/район","type":"text","required":true},
    {"name":"contract_date","label_uz":"Shartnoma sanasi","label_ru":"Дата договора","type":"date","required":true},
    {"name":"lessor","label_uz":"Ijaraga beruvchi","label_ru":"Арендодатель","type":"text","required":true},
    {"name":"lessee","label_uz":"Ijarachi","label_ru":"Арендатор","type":"text","required":true},
    {"name":"property_address","label_uz":"Uy manzili","label_ru":"Адрес помещения","type":"textarea","required":true},
    {"name":"monthly_rent","label_uz":"Oylik ijara haqi","label_ru":"Месячная арендная плата","type":"text","required":true},
    {"name":"term","label_uz":"Ijara muddati","label_ru":"Срок аренды","type":"text","required":true}
  ]'::jsonb,
  $tpl$
IJARA SHARTNOMASI (TURAR-JOY)

{{city}}                                                     {{contract_date}}

Bir tomondan {{lessor}} (keyingi o'rinlarda "Ijaraga beruvchi"), ikkinchi tomondan {{lessee}} (keyingi o'rinlarda "Ijarachi") ushbu shartnomani quyidagicha tuzdilar:

1. Ijaraga beruvchi {{property_address}} manzilidagi turar-joyni Ijarachiga vaqtincha foydalanish uchun beradi.
2. Oylik ijara haqi: {{monthly_rent}}.
3. Ijara muddati: {{term}}.
4. Tomonlar turar-joyni ehtiyotkorlik bilan saqlash va to'lovlarni o'z vaqtida amalga oshirish majburiyatini oladilar.
5. Nizolar muzokara orqali, kelishuv bo'lmasa O'zbekiston Respublikasi qonunchiligiga muvofiq hal qilinadi.

Ijaraga beruvchi: ____________________ {{lessor}}
Ijarachi:          ____________________ {{lessee}}
$tpl$,
  null,
  true
),
(
  'ijara-tijorat',
  'shartnoma',
  'Ijara shartnomasi (tijorat)',
  'Договор аренды коммерческого помещения',
  'Ofis, do''kon yoki boshqa tijorat joyi uchun ijara shartnomasi.',
  'Договор аренды офиса, магазина или иного коммерческого помещения.',
  '[
    {"name":"city","label_uz":"Shahar/tuman","label_ru":"Город/район","type":"text","required":true},
    {"name":"contract_date","label_uz":"Shartnoma sanasi","label_ru":"Дата договора","type":"date","required":true},
    {"name":"lessor","label_uz":"Ijaraga beruvchi","label_ru":"Арендодатель","type":"text","required":true},
    {"name":"lessee","label_uz":"Ijarachi","label_ru":"Арендатор","type":"text","required":true},
    {"name":"property_address","label_uz":"Obyekt manzili","label_ru":"Адрес объекта","type":"textarea","required":true},
    {"name":"purpose","label_uz":"Foydalanish maqsadi","label_ru":"Цель использования","type":"text","required":true},
    {"name":"monthly_rent","label_uz":"Oylik ijara haqi","label_ru":"Месячная арендная плата","type":"text","required":true},
    {"name":"term","label_uz":"Ijara muddati","label_ru":"Срок аренды","type":"text","required":true}
  ]'::jsonb,
  $tpl$
TIJORAT JOYINI IJARAGA BERISH SHARTNOMASI

{{city}}                                                     {{contract_date}}

{{lessor}} "Ijaraga beruvchi" sifatida va {{lessee}} "Ijarachi" sifatida quyidagilar haqida kelishdilar:

1. {{property_address}} manzilidagi tijorat obyekti {{purpose}} maqsadida foydalanish uchun topshiriladi.
2. Oylik ijara haqi {{monthly_rent}}, ijara muddati {{term}}.
3. Ijarachi obyektni faqat kelishilgan maqsadda ishlatadi va amaldagi xavfsizlik talablariga rioya qiladi.
4. Kommunal va ekspluatatsiya xarajatlari tomonlarning alohida kelishuviga muvofiq to'lanadi.
5. Nizolar O'zbekiston Respublikasi qonunchiligiga muvofiq hal qilinadi.

Ijaraga beruvchi: ____________________ {{lessor}}
Ijarachi:          ____________________ {{lessee}}
$tpl$,
  null,
  true
),
(
  'mehnat-shartnomasi',
  'shartnoma',
  'Mehnat shartnomasi',
  'Трудовой договор',
  'Xodimni ishga qabul qilish uchun bazaviy mehnat shartnomasi.',
  'Базовый трудовой договор для приема сотрудника на работу.',
  '[
    {"name":"contract_date","label_uz":"Shartnoma sanasi","label_ru":"Дата договора","type":"date","required":true},
    {"name":"employer","label_uz":"Ish beruvchi","label_ru":"Работодатель","type":"text","required":true},
    {"name":"employee","label_uz":"Xodim F.I.Sh.","label_ru":"Ф.И.О. сотрудника","type":"text","required":true},
    {"name":"position","label_uz":"Lavozim","label_ru":"Должность","type":"text","required":true},
    {"name":"workplace","label_uz":"Ish joyi","label_ru":"Место работы","type":"text","required":true},
    {"name":"start_date","label_uz":"Ish boshlash sanasi","label_ru":"Дата начала работы","type":"date","required":true},
    {"name":"salary","label_uz":"Oylik ish haqi","label_ru":"Месячная зарплата","type":"text","required":true}
  ]'::jsonb,
  $tpl$
MEHNAT SHARTNOMASI

Shartnoma sanasi: {{contract_date}}

{{employer}} (Ish beruvchi) va {{employee}} (Xodim) quyidagilar haqida kelishdilar:

1. Xodim {{position}} lavozimiga, {{workplace}} ish joyiga qabul qilinadi.
2. Ish boshlash sanasi: {{start_date}}.
3. Oylik ish haqi: {{salary}}.
4. Ish beruvchi xavfsiz mehnat sharoitini yaratadi; Xodim ichki mehnat tartibi va lavozim yo'riqnomasiga rioya qiladi.
5. Shartnoma O'zbekiston Respublikasi Mehnat kodeksiga muvofiq tartibga solinadi.

Ish beruvchi: ____________________ {{employer}}
Xodim:        ____________________ {{employee}}
$tpl$,
  null,
  true
),
(
  'xizmat-korsatish',
  'shartnoma',
  'Xizmat ko''rsatish shartnomasi',
  'Договор оказания услуг',
  'Buyurtmachi va ijrochi o''rtasidagi xizmat shartnomasi.',
  'Договор оказания услуг между заказчиком и исполнителем.',
  '[
    {"name":"contract_date","label_uz":"Shartnoma sanasi","label_ru":"Дата договора","type":"date","required":true},
    {"name":"customer","label_uz":"Buyurtmachi","label_ru":"Заказчик","type":"text","required":true},
    {"name":"provider","label_uz":"Ijrochi","label_ru":"Исполнитель","type":"text","required":true},
    {"name":"service","label_uz":"Xizmat tavsifi","label_ru":"Описание услуги","type":"textarea","required":true},
    {"name":"price","label_uz":"Xizmat narxi","label_ru":"Стоимость услуги","type":"text","required":true},
    {"name":"deadline","label_uz":"Bajarish muddati","label_ru":"Срок выполнения","type":"text","required":true}
  ]'::jsonb,
  $tpl$
XIZMAT KO'RSATISH SHARTNOMASI

Sana: {{contract_date}}

{{customer}} (Buyurtmachi) va {{provider}} (Ijrochi) quyidagilar haqida kelishdilar:

1. Ijrochi quyidagi xizmatni ko'rsatadi: {{service}}.
2. Xizmat narxi: {{price}}.
3. Bajarish muddati: {{deadline}}.
4. Buyurtmachi natijani qabul qiladi va kelishilgan haqni o'z vaqtida to'laydi.
5. Tomonlarning javobgarligi amaldagi qonunchilik va ushbu shartnoma bilan belgilanadi.

Buyurtmachi: ____________________ {{customer}}
Ijrochi:     ____________________ {{provider}}
$tpl$,
  null,
  true
),
(
  'oldi-sotdi',
  'shartnoma',
  'Oldi-sotdi shartnomasi',
  'Договор купли-продажи',
  'Tovar yoki mol-mulkni sotish uchun bazaviy shartnoma.',
  'Базовый договор продажи товара или имущества.',
  '[
    {"name":"contract_date","label_uz":"Shartnoma sanasi","label_ru":"Дата договора","type":"date","required":true},
    {"name":"seller","label_uz":"Sotuvchi","label_ru":"Продавец","type":"text","required":true},
    {"name":"buyer","label_uz":"Xaridor","label_ru":"Покупатель","type":"text","required":true},
    {"name":"item","label_uz":"Tovar/mol-mulk tavsifi","label_ru":"Описание товара/имущества","type":"textarea","required":true},
    {"name":"price","label_uz":"Narxi","label_ru":"Цена","type":"text","required":true},
    {"name":"delivery_date","label_uz":"Topshirish sanasi","label_ru":"Дата передачи","type":"date","required":true}
  ]'::jsonb,
  $tpl$
OLDI-SOTDI SHARTNOMASI

Sana: {{contract_date}}

{{seller}} (Sotuvchi) {{item}}ni {{buyer}}ga (Xaridor) sotadi.

1. Shartnoma narxi: {{price}}.
2. Topshirish sanasi: {{delivery_date}}.
3. Sotuvchi mol-mulkning kelishilgan holatda topshirilishini, Xaridor esa qabul qilish va to'lovni ta'minlaydi.
4. Nizolar muzokara yoki qonunchilikda belgilangan tartibda hal qilinadi.

Sotuvchi: ____________________ {{seller}}
Xaridor:  ____________________ {{buyer}}
$tpl$,
  null,
  true
),
(
  'pudrat',
  'shartnoma',
  'Pudrat shartnomasi',
  'Договор подряда',
  'Muayyan ish natijasini topshirish bo''yicha pudrat shartnomasi.',
  'Договор подряда на выполнение и передачу результата работ.',
  '[
    {"name":"contract_date","label_uz":"Shartnoma sanasi","label_ru":"Дата договора","type":"date","required":true},
    {"name":"customer","label_uz":"Buyurtmachi","label_ru":"Заказчик","type":"text","required":true},
    {"name":"contractor","label_uz":"Pudratchi","label_ru":"Подрядчик","type":"text","required":true},
    {"name":"work","label_uz":"Ish tavsifi","label_ru":"Описание работ","type":"textarea","required":true},
    {"name":"price","label_uz":"Ish narxi","label_ru":"Стоимость работ","type":"text","required":true},
    {"name":"deadline","label_uz":"Topshirish muddati","label_ru":"Срок сдачи","type":"text","required":true}
  ]'::jsonb,
  $tpl$
PUDRAT SHARTNOMASI

Sana: {{contract_date}}

{{customer}} (Buyurtmachi) va {{contractor}} (Pudratchi) quyidagilar haqida kelishdilar:

1. Pudratchi quyidagi ishni bajaradi: {{work}}.
2. Ish narxi: {{price}}.
3. Natijani topshirish muddati: {{deadline}}.
4. Natija qabul qilish-topshirish dalolatnomasi bilan rasmiylashtiriladi.
5. Kamchiliklar aniqlansa, Pudratchi ularni oqilona muddatda bartaraf etadi.

Buyurtmachi: ____________________ {{customer}}
Pudratchi:   ____________________ {{contractor}}
$tpl$,
  null,
  true
),
(
  'qarz-shartnomasi',
  'shartnoma',
  'Qarz shartnomasi',
  'Договор займа',
  'Pul mablag''ini qaytarish sharti bilan berish shartnomasi.',
  'Договор передачи денежных средств с условием возврата.',
  '[
    {"name":"contract_date","label_uz":"Shartnoma sanasi","label_ru":"Дата договора","type":"date","required":true},
    {"name":"lender","label_uz":"Qarz beruvchi","label_ru":"Займодавец","type":"text","required":true},
    {"name":"borrower","label_uz":"Qarz oluvchi","label_ru":"Заемщик","type":"text","required":true},
    {"name":"amount","label_uz":"Qarz summasi","label_ru":"Сумма займа","type":"text","required":true},
    {"name":"due_date","label_uz":"Qaytarish sanasi","label_ru":"Дата возврата","type":"date","required":true},
    {"name":"interest","label_uz":"Foiz sharti","label_ru":"Условие о процентах","type":"text","required":false}
  ]'::jsonb,
  $tpl$
QARZ SHARTNOMASI

Sana: {{contract_date}}

{{lender}} (Qarz beruvchi) {{borrower}}ga (Qarz oluvchi) {{amount}} miqdorida qarz beradi.

1. Qarz {{due_date}} sanasigacha qaytariladi.
2. Foiz sharti: {{interest}}.
3. Mablag' topshirilganligi to'lov hujjati yoki tilxat bilan tasdiqlanadi.
4. Majburiyat bajarilmasa, javobgarlik amaldagi qonunchilikka muvofiq belgilanadi.

Qarz beruvchi: ____________________ {{lender}}
Qarz oluvchi:  ____________________ {{borrower}}
$tpl$,
  null,
  true
),
(
  'hamkorlik',
  'shartnoma',
  'Hamkorlik shartnomasi',
  'Договор о сотрудничестве',
  'Ikki tomonning qo''shma faoliyati uchun bazaviy kelishuv.',
  'Базовое соглашение о совместной деятельности сторон.',
  '[
    {"name":"contract_date","label_uz":"Shartnoma sanasi","label_ru":"Дата договора","type":"date","required":true},
    {"name":"party_one","label_uz":"Birinchi tomon","label_ru":"Первая сторона","type":"text","required":true},
    {"name":"party_two","label_uz":"Ikkinchi tomon","label_ru":"Вторая сторона","type":"text","required":true},
    {"name":"purpose","label_uz":"Hamkorlik maqsadi","label_ru":"Цель сотрудничества","type":"textarea","required":true},
    {"name":"party_one_contribution","label_uz":"Birinchi tomon hissasi","label_ru":"Вклад первой стороны","type":"textarea","required":true},
    {"name":"party_two_contribution","label_uz":"Ikkinchi tomon hissasi","label_ru":"Вклад второй стороны","type":"textarea","required":true},
    {"name":"term","label_uz":"Amal qilish muddati","label_ru":"Срок действия","type":"text","required":true}
  ]'::jsonb,
  $tpl$
HAMKORLIK SHARTNOMASI

Sana: {{contract_date}}

{{party_one}} va {{party_two}} {{purpose}} maqsadida hamkorlik qilishga kelishdilar.

1. Birinchi tomon hissasi: {{party_one_contribution}}.
2. Ikkinchi tomon hissasi: {{party_two_contribution}}.
3. Shartnoma muddati: {{term}}.
4. Har bir tomon o'z majburiyatlarini mustaqil va vijdonan bajaradi.
5. Maxfiy ma'lumotlar uchinchi shaxslarga qonuniy asos yoki yozma roziliksiz berilmaydi.

Birinchi tomon: ____________________ {{party_one}}
Ikkinchi tomon: ____________________ {{party_two}}
$tpl$,
  null,
  true
),
(
  'yatt-royxatdan-otish-arizasi',
  'ariza',
  'YaTT ro''yxatdan o''tish arizasi',
  'Заявление о регистрации ИП',
  'Yakka tartibdagi tadbirkor sifatida ro''yxatdan o''tish uchun qoralama.',
  'Черновик заявления о регистрации индивидуального предпринимателя.',
  '[
    {"name":"full_name","label_uz":"F.I.Sh.","label_ru":"Ф.И.О.","type":"text","required":true},
    {"name":"pinfl","label_uz":"JSHSHIR","label_ru":"ПИНФЛ","type":"text","required":true},
    {"name":"address","label_uz":"Yashash manzili","label_ru":"Адрес проживания","type":"textarea","required":true},
    {"name":"activity","label_uz":"Faoliyat turi","label_ru":"Вид деятельности","type":"text","required":true},
    {"name":"phone","label_uz":"Telefon","label_ru":"Телефон","type":"text","required":true},
    {"name":"application_date","label_uz":"Ariza sanasi","label_ru":"Дата заявления","type":"date","required":true}
  ]'::jsonb,
  $tpl$
YAKKA TARTIBDAGI TADBIRKOR SIFATIDA RO'YXATDAN O'TISH TO'G'RISIDA ARIZA

Arizachi: {{full_name}}
JSHSHIR: {{pinfl}}
Manzil: {{address}}
Telefon: {{phone}}

Meni {{activity}} faoliyat turi bo'yicha yakka tartibdagi tadbirkor sifatida ro'yxatdan o'tkazishingizni so'rayman.

Ilova qilinadigan ma'lumot va hujjatlarning to'g'riligini tasdiqlayman.

Sana: {{application_date}}
Imzo: ____________________ {{full_name}}
$tpl$,
  null,
  true
),
(
  'soliq-organiga-ariza',
  'ariza',
  'Soliq organiga ariza',
  'Заявление в налоговый орган',
  'Soliq organiga erkin mazmundagi rasmiy murojaat.',
  'Официальное обращение в налоговый орган.',
  '[
    {"name":"tax_office","label_uz":"Soliq organi nomi","label_ru":"Наименование налогового органа","type":"text","required":true},
    {"name":"applicant","label_uz":"Arizachi/tashkilot","label_ru":"Заявитель/организация","type":"text","required":true},
    {"name":"stir","label_uz":"STIR","label_ru":"ИНН","type":"text","required":true},
    {"name":"address","label_uz":"Manzil","label_ru":"Адрес","type":"textarea","required":true},
    {"name":"request","label_uz":"Murojaat mazmuni","label_ru":"Содержание обращения","type":"textarea","required":true},
    {"name":"application_date","label_uz":"Ariza sanasi","label_ru":"Дата заявления","type":"date","required":true}
  ]'::jsonb,
  $tpl$
{{tax_office}}ga

Arizachi: {{applicant}}
STIR: {{stir}}
Manzil: {{address}}

ARIZA

{{request}}

Ushbu murojaatni ko'rib chiqib, qonunchilikda belgilangan tartibda javob berishingizni so'rayman.

Sana: {{application_date}}
Imzo: ____________________ {{applicant}}
$tpl$,
  null,
  true
),
(
  'ishga-olish-buyrugi',
  'buyruq',
  'Ishga olish buyrug''i',
  'Приказ о приеме на работу',
  'Xodimni ishga qabul qilish bo''yicha buyruq.',
  'Приказ о приеме сотрудника на работу.',
  '[
    {"name":"company","label_uz":"Tashkilot nomi","label_ru":"Наименование организации","type":"text","required":true},
    {"name":"order_number","label_uz":"Buyruq raqami","label_ru":"Номер приказа","type":"text","required":true},
    {"name":"order_date","label_uz":"Buyruq sanasi","label_ru":"Дата приказа","type":"date","required":true},
    {"name":"employee","label_uz":"Xodim F.I.Sh.","label_ru":"Ф.И.О. сотрудника","type":"text","required":true},
    {"name":"position","label_uz":"Lavozim","label_ru":"Должность","type":"text","required":true},
    {"name":"start_date","label_uz":"Ish boshlash sanasi","label_ru":"Дата начала работы","type":"date","required":true},
    {"name":"salary","label_uz":"Oylik ish haqi","label_ru":"Месячная зарплата","type":"text","required":true}
  ]'::jsonb,
  $tpl$
{{company}}

BUYRUQ № {{order_number}}
Sana: {{order_date}}

ISHGA QABUL QILISH TO'G'RISIDA

{{employee}} {{position}} lavozimiga {{start_date}} sanadan boshlab, {{salary}} oylik ish haqi bilan ishga qabul qilinsin.

Kadrlar bo'limi mehnat shartnomasini rasmiylashtirsin va xodimni ichki hujjatlar bilan tanishtirsin.

Rahbar: ____________________
Buyruq bilan tanishdim: ____________________ {{employee}}
$tpl$,
  null,
  true
),
(
  'ishdan-boshatish-buyrugi',
  'buyruq',
  'Ishdan bo''shatish buyrug''i',
  'Приказ об увольнении',
  'Mehnat munosabatini bekor qilish bo''yicha buyruq.',
  'Приказ о прекращении трудовых отношений.',
  '[
    {"name":"company","label_uz":"Tashkilot nomi","label_ru":"Наименование организации","type":"text","required":true},
    {"name":"order_number","label_uz":"Buyruq raqami","label_ru":"Номер приказа","type":"text","required":true},
    {"name":"order_date","label_uz":"Buyruq sanasi","label_ru":"Дата приказа","type":"date","required":true},
    {"name":"employee","label_uz":"Xodim F.I.Sh.","label_ru":"Ф.И.О. сотрудника","type":"text","required":true},
    {"name":"position","label_uz":"Lavozim","label_ru":"Должность","type":"text","required":true},
    {"name":"end_date","label_uz":"Bo''shatish sanasi","label_ru":"Дата увольнения","type":"date","required":true},
    {"name":"basis","label_uz":"Asos","label_ru":"Основание","type":"textarea","required":true}
  ]'::jsonb,
  $tpl$
{{company}}

BUYRUQ № {{order_number}}
Sana: {{order_date}}

MEHNAT SHARTNOMASINI BEKOR QILISH TO'G'RISIDA

{{employee}}, {{position}} bilan tuzilgan mehnat shartnomasi {{end_date}} sanadan quyidagi asosga ko'ra bekor qilinsin:

{{basis}}

Buxgalteriya yakuniy hisob-kitobni, kadrlar bo'limi tegishli hujjatlarni rasmiylashtirsin.

Rahbar: ____________________
Buyruq bilan tanishdim: ____________________ {{employee}}
$tpl$,
  null,
  true
),
(
  'tatil-buyrugi',
  'buyruq',
  'Ta''til buyrug''i',
  'Приказ об отпуске',
  'Xodimga mehnat ta''tili berish bo''yicha buyruq.',
  'Приказ о предоставлении сотруднику трудового отпуска.',
  '[
    {"name":"company","label_uz":"Tashkilot nomi","label_ru":"Наименование организации","type":"text","required":true},
    {"name":"order_number","label_uz":"Buyruq raqami","label_ru":"Номер приказа","type":"text","required":true},
    {"name":"order_date","label_uz":"Buyruq sanasi","label_ru":"Дата приказа","type":"date","required":true},
    {"name":"employee","label_uz":"Xodim F.I.Sh.","label_ru":"Ф.И.О. сотрудника","type":"text","required":true},
    {"name":"start_date","label_uz":"Ta''til boshlanishi","label_ru":"Начало отпуска","type":"date","required":true},
    {"name":"end_date","label_uz":"Ta''til tugashi","label_ru":"Окончание отпуска","type":"date","required":true},
    {"name":"days","label_uz":"Kalendar kunlar soni","label_ru":"Количество календарных дней","type":"number","required":true}
  ]'::jsonb,
  $tpl$
{{company}}

BUYRUQ № {{order_number}}
Sana: {{order_date}}

TA'TIL BERISH TO'G'RISIDA

{{employee}}ga {{start_date}} sanadan {{end_date}} sanagacha {{days}} kalendar kunidan iborat mehnat ta'tili berilsin.

Buxgalteriya ta'til to'lovlarini qonunchilikda belgilangan muddatda hisoblasin.

Rahbar: ____________________
Buyruq bilan tanishdim: ____________________ {{employee}}
$tpl$,
  null,
  true
),
(
  'ishonchnoma',
  'boshqa',
  'Ishonchnoma',
  'Доверенность',
  'Vakilga muayyan harakatlarni bajarish vakolatini berish hujjati.',
  'Документ о предоставлении представителю определенных полномочий.',
  '[
    {"name":"principal","label_uz":"Ishonch bildiruvchi","label_ru":"Доверитель","type":"text","required":true},
    {"name":"representative","label_uz":"Vakil","label_ru":"Представитель","type":"text","required":true},
    {"name":"representative_id","label_uz":"Vakil pasport/JSHSHIR","label_ru":"Паспорт/ПИНФЛ представителя","type":"text","required":true},
    {"name":"authority","label_uz":"Beriladigan vakolat","label_ru":"Предоставляемые полномочия","type":"textarea","required":true},
    {"name":"valid_until","label_uz":"Amal qilish muddati","label_ru":"Срок действия","type":"date","required":true},
    {"name":"issue_date","label_uz":"Berilgan sana","label_ru":"Дата выдачи","type":"date","required":true}
  ]'::jsonb,
  $tpl$
ISHONCHNOMA

Men, {{principal}}, ushbu ishonchnoma bilan {{representative}}ga (pasport/JSHSHIR: {{representative_id}}) quyidagi vakolatlarni beraman:

{{authority}}

Ishonchnoma {{valid_until}} sanagacha amal qiladi.

Berilgan sana: {{issue_date}}
Ishonch bildiruvchi imzosi: ____________________ {{principal}}
$tpl$,
  null,
  true
),
(
  'tilxat',
  'boshqa',
  'Tilxat',
  'Расписка',
  'Pul yoki mol-mulk qabul qilinganligini tasdiqlovchi hujjat.',
  'Документ, подтверждающий получение денег или имущества.',
  '[
    {"name":"receiver","label_uz":"Qabul qiluvchi","label_ru":"Получатель","type":"text","required":true},
    {"name":"giver","label_uz":"Beruvchi","label_ru":"Передавший","type":"text","required":true},
    {"name":"subject","label_uz":"Pul/mulk tavsifi","label_ru":"Описание денег/имущества","type":"textarea","required":true},
    {"name":"purpose","label_uz":"Berish maqsadi","label_ru":"Цель передачи","type":"textarea","required":true},
    {"name":"return_date","label_uz":"Qaytarish sanasi (bo''lsa)","label_ru":"Дата возврата (если есть)","type":"date","required":false},
    {"name":"receipt_date","label_uz":"Tilxat sanasi","label_ru":"Дата расписки","type":"date","required":true}
  ]'::jsonb,
  $tpl$
TILXAT

Men, {{receiver}}, {{giver}}dan quyidagini qabul qilib oldim:

{{subject}}

Berish maqsadi: {{purpose}}.
Qaytarish sanasi: {{return_date}}.

Ushbu tilxat ma'lumotlari to'g'riligini tasdiqlayman.

Sana: {{receipt_date}}
Qabul qiluvchi imzosi: ____________________ {{receiver}}
$tpl$,
  null,
  true
)
on conflict (slug) do update set
  category = excluded.category,
  title_uz = excluded.title_uz,
  title_ru = excluded.title_ru,
  description_uz = excluded.description_uz,
  description_ru = excluded.description_ru,
  fields = excluded.fields,
  template_uz = excluded.template_uz,
  template_ru = excluded.template_ru,
  is_active = excluded.is_active,
  updated_at = now();
