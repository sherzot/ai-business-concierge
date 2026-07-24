-- Phase 2: document templates uchun to'liq uz/ru/en/ja localization.
-- Existing RLS va table grants o'zgarmaydi; faqat localized content qo'shiladi.

alter table public.doc_templates
  add column if not exists title_en text,
  add column if not exists title_ja text,
  add column if not exists description_en text,
  add column if not exists description_ja text,
  add column if not exists template_en text,
  add column if not exists template_ja text;

update public.doc_templates as template
set
  title_en = localized.title_en,
  title_ja = localized.title_ja,
  description_en = localized.description_en,
  description_ja = localized.description_ja
from (
  values
    ('ijara-turar-joy', 'Residential lease agreement', '住宅賃貸借契約書', 'A basic agreement for the temporary use of residential property.', '住宅を一時的に使用するための基本契約書です。'),
    ('ijara-tijorat', 'Commercial lease agreement', '商業施設賃貸借契約書', 'A lease agreement for an office, shop, or other commercial premises.', '事務所、店舗、その他の商業施設向けの賃貸借契約書です。'),
    ('mehnat-shartnomasi', 'Employment agreement', '雇用契約書', 'A basic employment agreement for hiring an employee.', '従業員を採用するための基本的な雇用契約書です。'),
    ('xizmat-korsatish', 'Service agreement', '業務委託契約書', 'A service agreement between a customer and a provider.', '依頼者と受託者の間で締結する業務委託契約書です。'),
    ('oldi-sotdi', 'Sale and purchase agreement', '売買契約書', 'A basic agreement for the sale of goods or property.', '商品または財産を売買するための基本契約書です。'),
    ('pudrat', 'Works contract', '請負契約書', 'A contract for completing and delivering specified work.', '特定の業務を完成し、成果物を引き渡すための契約書です。'),
    ('qarz-shartnomasi', 'Loan agreement', '金銭消費貸借契約書', 'An agreement for lending funds subject to repayment.', '返済を条件として資金を貸し付けるための契約書です。'),
    ('hamkorlik', 'Cooperation agreement', '協力契約書', 'A basic agreement for joint activities between two parties.', '二者間の共同活動に関する基本契約書です。'),
    ('yatt-royxatdan-otish-arizasi', 'Individual entrepreneur registration application', '個人事業主登録申請書', 'A draft application for registration as an individual entrepreneur.', '個人事業主として登録するための申請書案です。'),
    ('soliq-organiga-ariza', 'Application to the tax authority', '税務当局宛申請書', 'A formal free-form application to the tax authority.', '税務当局に提出する自由形式の正式な申請書です。'),
    ('ishga-olish-buyrugi', 'Employment order', '採用命令書', 'An order to hire an employee.', '従業員を採用するための命令書です。'),
    ('ishdan-boshatish-buyrugi', 'Termination order', '退職命令書', 'An order to terminate employment.', '雇用関係を終了するための命令書です。'),
    ('tatil-buyrugi', 'Leave order', '休暇命令書', 'An order granting an employee annual leave.', '従業員に休暇を付与するための命令書です。'),
    ('ishonchnoma', 'Power of attorney', '委任状', 'A document authorizing a representative to perform specified actions.', '代理人に特定の行為を行う権限を付与する書類です。'),
    ('tilxat', 'Receipt', '受領書', 'A document confirming receipt of money or property.', '金銭または財産の受領を確認する書類です。')
) as localized(slug, title_en, title_ja, description_en, description_ja)
where template.slug = localized.slug;

-- Every field receives English and Japanese labels. Names are stable API keys;
-- generic labels are deliberately reused where the same key appears in several
-- templates.
with labels(name, label_en, label_ja) as (
  values
    ('city', 'City / district', '市・地区'),
    ('contract_date', 'Agreement date', '契約日'),
    ('lessor', 'Lessor', '賃貸人'),
    ('lessee', 'Lessee', '賃借人'),
    ('property_address', 'Property address', '物件所在地'),
    ('monthly_rent', 'Monthly rent', '月額賃料'),
    ('term', 'Term', '期間'),
    ('purpose', 'Purpose', '目的'),
    ('employer', 'Employer', '雇用主'),
    ('employee', 'Employee full name', '従業員氏名'),
    ('position', 'Position', '役職'),
    ('workplace', 'Workplace', '勤務場所'),
    ('start_date', 'Start date', '開始日'),
    ('salary', 'Monthly salary', '月給'),
    ('customer', 'Customer', '依頼者'),
    ('provider', 'Service provider', '受託者'),
    ('service', 'Service description', '業務内容'),
    ('price', 'Price', '金額'),
    ('deadline', 'Deadline', '期限'),
    ('seller', 'Seller', '売主'),
    ('buyer', 'Buyer', '買主'),
    ('item', 'Goods / property description', '商品・財産の説明'),
    ('delivery_date', 'Delivery date', '引渡日'),
    ('contractor', 'Contractor', '請負人'),
    ('work', 'Work description', '業務内容'),
    ('lender', 'Lender', '貸主'),
    ('borrower', 'Borrower', '借主'),
    ('amount', 'Loan amount', '貸付金額'),
    ('due_date', 'Repayment date', '返済日'),
    ('interest', 'Interest terms', '利息条件'),
    ('party_one', 'First party', '甲'),
    ('party_two', 'Second party', '乙'),
    ('party_one_contribution', 'First party contribution', '甲の役割・拠出'),
    ('party_two_contribution', 'Second party contribution', '乙の役割・拠出'),
    ('full_name', 'Full name', '氏名'),
    ('pinfl', 'PINFL', 'PINFL'),
    ('address', 'Address', '住所'),
    ('activity', 'Type of activity', '事業内容'),
    ('phone', 'Phone', '電話番号'),
    ('application_date', 'Application date', '申請日'),
    ('tax_office', 'Tax authority name', '税務当局名'),
    ('applicant', 'Applicant / organization', '申請者・組織'),
    ('stir', 'TIN', '納税者番号'),
    ('request', 'Application details', '申請内容'),
    ('company', 'Organization name', '組織名'),
    ('order_number', 'Order number', '命令番号'),
    ('order_date', 'Order date', '命令日'),
    ('end_date', 'End date', '終了日'),
    ('basis', 'Grounds', '根拠'),
    ('days', 'Number of calendar days', '暦日数'),
    ('principal', 'Principal', '委任者'),
    ('representative', 'Representative', '代理人'),
    ('representative_id', 'Representative passport / PINFL', '代理人の旅券・PINFL'),
    ('authority', 'Granted authority', '委任事項'),
    ('valid_until', 'Valid until', '有効期限'),
    ('issue_date', 'Issue date', '発行日'),
    ('receiver', 'Receiver', '受領者'),
    ('giver', 'Provider', '交付者'),
    ('subject', 'Money / property description', '金銭・財産の内容'),
    ('return_date', 'Return date, if applicable', '返還日（該当する場合）'),
    ('receipt_date', 'Receipt date', '受領日')
)
update public.doc_templates as template
set fields = (
  select jsonb_agg(
    field.value ||
    jsonb_build_object(
      'label_en', labels.label_en,
      'label_ja', labels.label_ja
    )
    order by field.ordinality
  )
  from jsonb_array_elements(template.fields)
    with ordinality as field(value, ordinality)
  left join labels on labels.name = field.value ->> 'name'
)
where template.slug in (
  'ijara-turar-joy',
  'ijara-tijorat',
  'mehnat-shartnomasi',
  'xizmat-korsatish',
  'oldi-sotdi',
  'pudrat',
  'qarz-shartnomasi',
  'hamkorlik',
  'yatt-royxatdan-otish-arizasi',
  'soliq-organiga-ariza',
  'ishga-olish-buyrugi',
  'ishdan-boshatish-buyrugi',
  'tatil-buyrugi',
  'ishonchnoma',
  'tilxat'
);

update public.doc_templates as template
set
  template_ru = localized.template_ru,
  template_en = localized.template_en,
  template_ja = localized.template_ja,
  updated_at = now()
from (
  values
  (
    'ijara-turar-joy',
    $ru$ДОГОВОР АРЕНДЫ ЖИЛОГО ПОМЕЩЕНИЯ

{{city}}                                                     {{contract_date}}

{{lessor}} («Арендодатель») и {{lessee}} («Арендатор») заключили настоящий договор:

1. Арендодатель передаёт Арендатору во временное пользование жилое помещение по адресу: {{property_address}}.
2. Ежемесячная арендная плата: {{monthly_rent}}.
3. Срок аренды: {{term}}.
4. Стороны обязуются бережно использовать помещение и своевременно выполнять платежи.
5. Споры разрешаются переговорами, а при недостижении соглашения — по законодательству Республики Узбекистан.

Арендодатель: ____________________ {{lessor}}
Арендатор:    ____________________ {{lessee}}$ru$,
    $en$RESIDENTIAL LEASE AGREEMENT

{{city}}                                                     {{contract_date}}

{{lessor}} (the “Lessor”) and {{lessee}} (the “Lessee”) agree as follows:

1. The Lessor grants the Lessee temporary use of the residential property at {{property_address}}.
2. Monthly rent: {{monthly_rent}}.
3. Lease term: {{term}}.
4. The parties shall maintain the property responsibly and make payments on time.
5. Disputes shall be resolved by negotiation or under the laws of the Republic of Uzbekistan.

Lessor: ____________________ {{lessor}}
Lessee: ____________________ {{lessee}}$en$,
    $ja$住宅賃貸借契約書

{{city}}                                                     {{contract_date}}

{{lessor}}（以下「賃貸人」）と{{lessee}}（以下「賃借人」）は、次のとおり合意します。

1. 賃貸人は、{{property_address}}所在の住宅を賃借人に一時使用させます。
2. 月額賃料：{{monthly_rent}}。
3. 賃貸期間：{{term}}。
4. 当事者は物件を適切に管理し、支払いを期限内に行います。
5. 紛争は協議により解決し、合意できない場合はウズベキスタン共和国法令に従います。

賃貸人：____________________ {{lessor}}
賃借人：____________________ {{lessee}}$ja$
  ),
  (
    'ijara-tijorat',
    $ru$ДОГОВОР АРЕНДЫ КОММЕРЧЕСКОГО ПОМЕЩЕНИЯ

{{city}}                                                     {{contract_date}}

{{lessor}} («Арендодатель») и {{lessee}} («Арендатор») договорились:

1. Объект по адресу {{property_address}} передаётся для использования в целях: {{purpose}}.
2. Арендная плата: {{monthly_rent}}. Срок аренды: {{term}}.
3. Арендатор использует объект только по назначению и соблюдает требования безопасности.
4. Коммунальные и эксплуатационные расходы оплачиваются по отдельному соглашению сторон.
5. Споры разрешаются по законодательству Республики Узбекистан.

Арендодатель: ____________________ {{lessor}}
Арендатор:    ____________________ {{lessee}}$ru$,
    $en$COMMERCIAL LEASE AGREEMENT

{{city}}                                                     {{contract_date}}

{{lessor}} (the “Lessor”) and {{lessee}} (the “Lessee”) agree:

1. The premises at {{property_address}} are provided for: {{purpose}}.
2. Monthly rent: {{monthly_rent}}. Lease term: {{term}}.
3. The Lessee shall use the premises only for the agreed purpose and comply with safety requirements.
4. Utilities and operating costs are paid under a separate agreement.
5. Disputes are governed by the laws of the Republic of Uzbekistan.

Lessor: ____________________ {{lessor}}
Lessee: ____________________ {{lessee}}$en$,
    $ja$商業施設賃貸借契約書

{{city}}                                                     {{contract_date}}

{{lessor}}（賃貸人）と{{lessee}}（賃借人）は、次のとおり合意します。

1. {{property_address}}所在の施設を{{purpose}}の目的で使用させます。
2. 月額賃料：{{monthly_rent}}。賃貸期間：{{term}}。
3. 賃借人は合意した目的に限り施設を使用し、安全要件を遵守します。
4. 光熱費および管理費は当事者の別途合意に従います。
5. 紛争はウズベキスタン共和国法令に従って解決します。

賃貸人：____________________ {{lessor}}
賃借人：____________________ {{lessee}}$ja$
  ),
  (
    'mehnat-shartnomasi',
    $ru$ТРУДОВОЙ ДОГОВОР

Дата договора: {{contract_date}}

{{employer}} («Работодатель») и {{employee}} («Работник») договорились:

1. Работник принимается на должность {{position}} с местом работы {{workplace}}.
2. Дата начала работы: {{start_date}}.
3. Месячная заработная плата: {{salary}}.
4. Работодатель обеспечивает безопасные условия труда; Работник соблюдает внутренние правила и должностную инструкцию.
5. Договор регулируется Трудовым кодексом Республики Узбекистан.

Работодатель: ____________________ {{employer}}
Работник:      ____________________ {{employee}}$ru$,
    $en$EMPLOYMENT AGREEMENT

Agreement date: {{contract_date}}

{{employer}} (the “Employer”) and {{employee}} (the “Employee”) agree:

1. The Employee is hired as {{position}} at {{workplace}}.
2. Start date: {{start_date}}.
3. Monthly salary: {{salary}}.
4. The Employer shall provide safe working conditions; the Employee shall follow internal rules and the job description.
5. This agreement is governed by the Labour Code of the Republic of Uzbekistan.

Employer: ____________________ {{employer}}
Employee: ____________________ {{employee}}$en$,
    $ja$雇用契約書

契約日：{{contract_date}}

{{employer}}（雇用主）と{{employee}}（従業員）は、次のとおり合意します。

1. 従業員を{{workplace}}における{{position}}として採用します。
2. 勤務開始日：{{start_date}}。
3. 月給：{{salary}}。
4. 雇用主は安全な労働環境を整備し、従業員は就業規則および職務記述書を遵守します。
5. 本契約はウズベキスタン共和国労働法典に従います。

雇用主：____________________ {{employer}}
従業員：____________________ {{employee}}$ja$
  ),
  (
    'xizmat-korsatish',
    $ru$ДОГОВОР ОКАЗАНИЯ УСЛУГ

Дата: {{contract_date}}

{{customer}} («Заказчик») и {{provider}} («Исполнитель») договорились:

1. Исполнитель оказывает следующую услугу: {{service}}.
2. Стоимость услуги: {{price}}.
3. Срок выполнения: {{deadline}}.
4. Заказчик принимает результат и своевременно оплачивает согласованную стоимость.
5. Ответственность сторон определяется законодательством и настоящим договором.

Заказчик:   ____________________ {{customer}}
Исполнитель: ____________________ {{provider}}$ru$,
    $en$SERVICE AGREEMENT

Date: {{contract_date}}

{{customer}} (the “Customer”) and {{provider}} (the “Provider”) agree:

1. The Provider shall perform: {{service}}.
2. Service price: {{price}}.
3. Completion deadline: {{deadline}}.
4. The Customer shall accept the result and pay the agreed price on time.
5. The parties’ liability is determined by applicable law and this agreement.

Customer: ____________________ {{customer}}
Provider: ____________________ {{provider}}$en$,
    $ja$業務委託契約書

日付：{{contract_date}}

{{customer}}（依頼者）と{{provider}}（受託者）は、次のとおり合意します。

1. 受託者は次の業務を実施します：{{service}}。
2. 委託料：{{price}}。
3. 完了期限：{{deadline}}。
4. 依頼者は成果物を受領し、合意した委託料を期限内に支払います。
5. 当事者の責任は適用法令および本契約に従います。

依頼者：____________________ {{customer}}
受託者：____________________ {{provider}}$ja$
  ),
  (
    'oldi-sotdi',
    $ru$ДОГОВОР КУПЛИ-ПРОДАЖИ

Дата: {{contract_date}}

{{seller}} («Продавец») продаёт {{item}} покупателю {{buyer}}.

1. Цена договора: {{price}}.
2. Дата передачи: {{delivery_date}}.
3. Продавец передаёт имущество в согласованном состоянии, Покупатель принимает его и производит оплату.
4. Споры разрешаются переговорами или в порядке, установленном законодательством.

Продавец:   ____________________ {{seller}}
Покупатель: ____________________ {{buyer}}$ru$,
    $en$SALE AND PURCHASE AGREEMENT

Date: {{contract_date}}

{{seller}} (the “Seller”) sells {{item}} to {{buyer}} (the “Buyer”).

1. Contract price: {{price}}.
2. Delivery date: {{delivery_date}}.
3. The Seller shall deliver the property in the agreed condition; the Buyer shall accept it and make payment.
4. Disputes shall be resolved by negotiation or as provided by law.

Seller: ____________________ {{seller}}
Buyer:  ____________________ {{buyer}}$en$,
    $ja$売買契約書

日付：{{contract_date}}

{{seller}}（売主）は{{item}}を{{buyer}}（買主）に売り渡します。

1. 契約金額：{{price}}。
2. 引渡日：{{delivery_date}}。
3. 売主は合意した状態で財産を引き渡し、買主はこれを受領して代金を支払います。
4. 紛争は協議または法令に定める手続により解決します。

売主：____________________ {{seller}}
買主：____________________ {{buyer}}$ja$
  ),
  (
    'pudrat',
    $ru$ДОГОВОР ПОДРЯДА

Дата: {{contract_date}}

{{customer}} («Заказчик») и {{contractor}} («Подрядчик») договорились:

1. Подрядчик выполняет следующие работы: {{work}}.
2. Стоимость работ: {{price}}.
3. Срок передачи результата: {{deadline}}.
4. Передача результата оформляется актом приёма-передачи.
5. Выявленные недостатки устраняются Подрядчиком в разумный срок.

Заказчик:  ____________________ {{customer}}
Подрядчик: ____________________ {{contractor}}$ru$,
    $en$WORKS CONTRACT

Date: {{contract_date}}

{{customer}} (the “Customer”) and {{contractor}} (the “Contractor”) agree:

1. The Contractor shall perform: {{work}}.
2. Works price: {{price}}.
3. Delivery deadline: {{deadline}}.
4. Delivery is documented by an acceptance certificate.
5. The Contractor shall remedy identified defects within a reasonable period.

Customer:   ____________________ {{customer}}
Contractor: ____________________ {{contractor}}$en$,
    $ja$請負契約書

日付：{{contract_date}}

{{customer}}（注文者）と{{contractor}}（請負人）は、次のとおり合意します。

1. 請負人は次の業務を実施します：{{work}}。
2. 請負代金：{{price}}。
3. 成果物の引渡期限：{{deadline}}。
4. 成果物の引渡しは受領確認書により記録します。
5. 不備がある場合、請負人は合理的な期間内に是正します。

注文者：____________________ {{customer}}
請負人：____________________ {{contractor}}$ja$
  ),
  (
    'qarz-shartnomasi',
    $ru$ДОГОВОР ЗАЙМА

Дата: {{contract_date}}

{{lender}} («Займодавец») передаёт {{borrower}} («Заемщик») заем в размере {{amount}}.

1. Заем возвращается до {{due_date}}.
2. Условие о процентах: {{interest}}.
3. Передача средств подтверждается платёжным документом или распиской.
4. Ответственность за неисполнение обязательств определяется законодательством.

Займодавец: ____________________ {{lender}}
Заемщик:    ____________________ {{borrower}}$ru$,
    $en$LOAN AGREEMENT

Date: {{contract_date}}

{{lender}} (the “Lender”) lends {{amount}} to {{borrower}} (the “Borrower”).

1. The loan shall be repaid by {{due_date}}.
2. Interest terms: {{interest}}.
3. Transfer of funds is confirmed by a payment document or receipt.
4. Liability for non-performance is determined by applicable law.

Lender:   ____________________ {{lender}}
Borrower: ____________________ {{borrower}}$en$,
    $ja$金銭消費貸借契約書

日付：{{contract_date}}

{{lender}}（貸主）は{{borrower}}（借主）に{{amount}}を貸し付けます。

1. 返済期限：{{due_date}}。
2. 利息条件：{{interest}}。
3. 資金の交付は支払書類または受領書により確認します。
4. 債務不履行の責任は適用法令に従います。

貸主：____________________ {{lender}}
借主：____________________ {{borrower}}$ja$
  ),
  (
    'hamkorlik',
    $ru$ДОГОВОР О СОТРУДНИЧЕСТВЕ

Дата: {{contract_date}}

{{party_one}} и {{party_two}} договорились сотрудничать в целях: {{purpose}}.

1. Вклад первой стороны: {{party_one_contribution}}.
2. Вклад второй стороны: {{party_two_contribution}}.
3. Срок договора: {{term}}.
4. Каждая сторона самостоятельно и добросовестно исполняет свои обязательства.
5. Конфиденциальная информация не передаётся третьим лицам без законного основания или письменного согласия.

Первая сторона: ____________________ {{party_one}}
Вторая сторона: ____________________ {{party_two}}$ru$,
    $en$COOPERATION AGREEMENT

Date: {{contract_date}}

{{party_one}} and {{party_two}} agree to cooperate for: {{purpose}}.

1. First party contribution: {{party_one_contribution}}.
2. Second party contribution: {{party_two_contribution}}.
3. Agreement term: {{term}}.
4. Each party shall perform its obligations independently and in good faith.
5. Confidential information shall not be disclosed without a legal basis or written consent.

First party:  ____________________ {{party_one}}
Second party: ____________________ {{party_two}}$en$,
    $ja$協力契約書

日付：{{contract_date}}

{{party_one}}と{{party_two}}は、{{purpose}}を目的として協力することに合意します。

1. 甲の役割・拠出：{{party_one_contribution}}。
2. 乙の役割・拠出：{{party_two_contribution}}。
3. 契約期間：{{term}}。
4. 各当事者は自己の義務を独立して誠実に履行します。
5. 機密情報は、法的根拠または書面による同意なく第三者に開示しません。

甲：____________________ {{party_one}}
乙：____________________ {{party_two}}$ja$
  ),
  (
    'yatt-royxatdan-otish-arizasi',
    $ru$ЗАЯВЛЕНИЕ О РЕГИСТРАЦИИ В КАЧЕСТВЕ ИНДИВИДУАЛЬНОГО ПРЕДПРИНИМАТЕЛЯ

Заявитель: {{full_name}}
ПИНФЛ: {{pinfl}}
Адрес: {{address}}
Телефон: {{phone}}

Прошу зарегистрировать меня в качестве индивидуального предпринимателя по виду деятельности: {{activity}}.

Подтверждаю достоверность представленных сведений и документов.

Дата: {{application_date}}
Подпись: ____________________ {{full_name}}$ru$,
    $en$APPLICATION FOR REGISTRATION AS AN INDIVIDUAL ENTREPRENEUR

Applicant: {{full_name}}
PINFL: {{pinfl}}
Address: {{address}}
Phone: {{phone}}

I request registration as an individual entrepreneur for the following activity: {{activity}}.

I confirm that the submitted information and documents are accurate.

Date: {{application_date}}
Signature: ____________________ {{full_name}}$en$,
    $ja$個人事業主登録申請書

申請者：{{full_name}}
PINFL：{{pinfl}}
住所：{{address}}
電話：{{phone}}

{{activity}}を事業内容とする個人事業主としての登録を申請します。

提出した情報および書類が正確であることを確認します。

申請日：{{application_date}}
署名：____________________ {{full_name}}$ja$
  ),
  (
    'soliq-organiga-ariza',
    $ru$В {{tax_office}}

Заявитель: {{applicant}}
ИНН: {{stir}}
Адрес: {{address}}

ЗАЯВЛЕНИЕ

{{request}}

Прошу рассмотреть настоящее обращение и предоставить ответ в порядке, установленном законодательством.

Дата: {{application_date}}
Подпись: ____________________ {{applicant}}$ru$,
    $en$To: {{tax_office}}

Applicant: {{applicant}}
TIN: {{stir}}
Address: {{address}}

APPLICATION

{{request}}

Please review this application and respond in accordance with the procedure established by law.

Date: {{application_date}}
Signature: ____________________ {{applicant}}$en$,
    $ja${{tax_office}} 御中

申請者：{{applicant}}
納税者番号：{{stir}}
住所：{{address}}

申請書

{{request}}

本申請を審査し、法令に定める手続に従って回答されるようお願いいたします。

申請日：{{application_date}}
署名：____________________ {{applicant}}$ja$
  ),
  (
    'ishga-olish-buyrugi',
    $ru${{company}}

ПРИКАЗ № {{order_number}}
Дата: {{order_date}}

О ПРИЁМЕ НА РАБОТУ

Принять {{employee}} на должность {{position}} с {{start_date}} с месячной заработной платой {{salary}}.

Отделу кадров оформить трудовой договор и ознакомить работника с внутренними документами.

Руководитель: ____________________
С приказом ознакомлен(а): ____________________ {{employee}}$ru$,
    $en${{company}}

ORDER No. {{order_number}}
Date: {{order_date}}

EMPLOYMENT ORDER

Hire {{employee}} as {{position}} effective {{start_date}} with a monthly salary of {{salary}}.

The HR department shall execute the employment agreement and introduce the employee to internal policies.

Manager: ____________________
Acknowledged by: ____________________ {{employee}}$en$,
    $ja${{company}}

命令第{{order_number}}号
日付：{{order_date}}

採用命令

{{employee}}を{{start_date}}付で{{position}}として採用し、月給を{{salary}}とします。

人事部は雇用契約を締結し、従業員に社内規程を説明してください。

責任者：____________________
確認者：____________________ {{employee}}$ja$
  ),
  (
    'ishdan-boshatish-buyrugi',
    $ru${{company}}

ПРИКАЗ № {{order_number}}
Дата: {{order_date}}

О ПРЕКРАЩЕНИИ ТРУДОВОГО ДОГОВОРА

Прекратить с {{end_date}} трудовой договор с {{employee}}, занимающим(ей) должность {{position}}, на следующем основании:

{{basis}}

Бухгалтерии произвести окончательный расчёт, отделу кадров оформить необходимые документы.

Руководитель: ____________________
С приказом ознакомлен(а): ____________________ {{employee}}$ru$,
    $en${{company}}

ORDER No. {{order_number}}
Date: {{order_date}}

TERMINATION OF EMPLOYMENT

Terminate the employment agreement with {{employee}}, {{position}}, effective {{end_date}} on the following grounds:

{{basis}}

Accounting shall make the final settlement and HR shall prepare the required documents.

Manager: ____________________
Acknowledged by: ____________________ {{employee}}$en$,
    $ja${{company}}

命令第{{order_number}}号
日付：{{order_date}}

雇用契約終了命令

{{position}}である{{employee}}との雇用契約を、次の根拠により{{end_date}}付で終了します。

{{basis}}

経理部は最終精算を行い、人事部は必要書類を作成してください。

責任者：____________________
確認者：____________________ {{employee}}$ja$
  ),
  (
    'tatil-buyrugi',
    $ru${{company}}

ПРИКАЗ № {{order_number}}
Дата: {{order_date}}

О ПРЕДОСТАВЛЕНИИ ОТПУСКА

Предоставить {{employee}} трудовой отпуск продолжительностью {{days}} календарных дней с {{start_date}} по {{end_date}}.

Бухгалтерии начислить отпускные в установленный законодательством срок.

Руководитель: ____________________
С приказом ознакомлен(а): ____________________ {{employee}}$ru$,
    $en${{company}}

ORDER No. {{order_number}}
Date: {{order_date}}

LEAVE ORDER

Grant {{employee}} annual leave for {{days}} calendar days from {{start_date}} through {{end_date}}.

Accounting shall calculate leave pay within the period established by law.

Manager: ____________________
Acknowledged by: ____________________ {{employee}}$en$,
    $ja${{company}}

命令第{{order_number}}号
日付：{{order_date}}

休暇命令

{{employee}}に{{start_date}}から{{end_date}}まで、{{days}}暦日の休暇を付与します。

経理部は法令に定める期限内に休暇手当を計算してください。

責任者：____________________
確認者：____________________ {{employee}}$ja$
  ),
  (
    'ishonchnoma',
    $ru$ДОВЕРЕННОСТЬ

Я, {{principal}}, настоящей доверенностью уполномочиваю {{representative}} (паспорт/ПИНФЛ: {{representative_id}}) совершать следующие действия:

{{authority}}

Доверенность действительна до {{valid_until}}.

Дата выдачи: {{issue_date}}
Подпись доверителя: ____________________ {{principal}}$ru$,
    $en$POWER OF ATTORNEY

I, {{principal}}, authorize {{representative}} (passport/PINFL: {{representative_id}}) to perform the following actions:

{{authority}}

This power of attorney is valid until {{valid_until}}.

Issue date: {{issue_date}}
Principal’s signature: ____________________ {{principal}}$en$,
    $ja$委任状

私、{{principal}}は、{{representative}}（旅券・PINFL：{{representative_id}}）に次の権限を委任します。

{{authority}}

本委任状は{{valid_until}}まで有効です。

発行日：{{issue_date}}
委任者署名：____________________ {{principal}}$ja$
  ),
  (
    'tilxat',
    $ru$РАСПИСКА

Я, {{receiver}}, получил(а) от {{giver}} следующее:

{{subject}}

Цель передачи: {{purpose}}.
Дата возврата: {{return_date}}.

Подтверждаю достоверность сведений в настоящей расписке.

Дата: {{receipt_date}}
Подпись получателя: ____________________ {{receiver}}$ru$,
    $en$RECEIPT

I, {{receiver}}, confirm receipt from {{giver}} of:

{{subject}}

Purpose: {{purpose}}.
Return date: {{return_date}}.

I confirm that the information in this receipt is accurate.

Date: {{receipt_date}}
Receiver’s signature: ____________________ {{receiver}}$en$,
    $ja$受領書

私、{{receiver}}は、{{giver}}から次のものを受領しました。

{{subject}}

目的：{{purpose}}。
返還日：{{return_date}}。

本受領書の内容が正確であることを確認します。

日付：{{receipt_date}}
受領者署名：____________________ {{receiver}}$ja$
  )
) as localized(slug, template_ru, template_en, template_ja)
where template.slug = localized.slug;

-- Fail the migration if any seeded template is still incomplete.
do $$
declare
  incomplete_count integer;
begin
  select count(*)
  into incomplete_count
  from public.doc_templates
  where slug in (
    'ijara-turar-joy',
    'ijara-tijorat',
    'mehnat-shartnomasi',
    'xizmat-korsatish',
    'oldi-sotdi',
    'pudrat',
    'qarz-shartnomasi',
    'hamkorlik',
    'yatt-royxatdan-otish-arizasi',
    'soliq-organiga-ariza',
    'ishga-olish-buyrugi',
    'ishdan-boshatish-buyrugi',
    'tatil-buyrugi',
    'ishonchnoma',
    'tilxat'
  )
  and (
    nullif(trim(title_uz), '') is null or
    nullif(trim(title_ru), '') is null or
    nullif(trim(title_en), '') is null or
    nullif(trim(title_ja), '') is null or
    nullif(trim(template_uz), '') is null or
    nullif(trim(template_ru), '') is null or
    nullif(trim(template_en), '') is null or
    nullif(trim(template_ja), '') is null or
    exists (
      select 1
      from jsonb_array_elements(fields) as field
      where nullif(trim(field ->> 'label_uz'), '') is null
         or nullif(trim(field ->> 'label_ru'), '') is null
         or nullif(trim(field ->> 'label_en'), '') is null
         or nullif(trim(field ->> 'label_ja'), '') is null
    )
  );

  if incomplete_count > 0 then
    raise exception 'Four-language document template migration incomplete: % rows', incomplete_count;
  end if;
end
$$;
