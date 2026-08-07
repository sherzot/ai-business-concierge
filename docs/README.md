# AI Business Concierge hujjatlari

Bu papkadagi o'zbekcha hujjatlar loyiha uchun canonical manba hisoblanadi. Tarjimalar `English/`, `Russian/` va `日本語/` papkalarida saqlanadi.

> Repo darajasidagi majburiy agent qoidasi: [../AGENTS.md](../AGENTS.md). Har yangi agent sessiyasi startup va documentation closeout tartibiga amal qilishi shart.

## Qaysi hujjat nimaga xizmat qiladi

| Hujjat | Vazifasi | Yangilash vaqti |
|---|---|---|
| [STATUS.md](STATUS.md) | Joriy ishlaydigan holat, bloklar va eng yaqin handoff | Har sessiya yakunida |
| [DEVLOG.md](DEVLOG.md) | O'zgarmas xronologik tarix va verifikatsiya natijalari | Har material o'zgarishdan keyin |
| [PLAN.md](PLAN.md) | Faqat faol va navbatdagi bajariladigan ishlar | Prioritet o'zgarganda |
| [ROADMAP.md](ROADMAP.md) | Mahsulot bosqichlari va uzoqroq yo'nalish | Bosqich o'zgarganda |
| [REQUIREMENTS.md](REQUIREMENTS.md) | `R-XXX` talablar va ularning `done/partial/planned` holati | Talab yoki holat o'zgarganda |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Joriy texnik chegaralar va kod yozish qoidalari | Arxitektura o'zgarganda |
| [SPEC.md](SPEC.md) | Mahsulot, rol, UX va jarayon spetsifikatsiyasi | Mahsulot qarori o'zgarganda |
| [CONNECTIONS.md](CONNECTIONS.md) | Tashqi servislar holati va operatsion setup | Integratsiya o'zgarganda |

`R001_*`, `R002_*` va `R015_*` fayllari tegishli requirement uchun operatsion qo'llanmalardir. `FIRST_PUSH.md` tarixiy Phase 0 qo'llanmasi; kundalik deploy uchun canonical manba emas.

## Source-of-truth ustuvorligi

Bir-biriga zid ma'lumot uchrasa, quyidagi tartib ishlatiladi:

1. Kod va oxirgi muvaffaqiyatli verifikatsiya natijasi.
2. `STATUS.md`.
3. `DEVLOG.md`ning eng yangi yozuvi.
4. `PLAN.md`, `ROADMAP.md` va `REQUIREMENTS.md`.
5. Eski setup, tahlil va arxiv hujjatlari.

`DEVLOG.md` tarixiy yozuv bo'lgani uchun eski entrylar qayta tahrirlanmaydi. Keyingi holat yangi entry bilan tepaga qo'shiladi.

## Sessiya yakuni protokoli

1. Test, build, deploy yoki platforma verifikatsiyasi natijasini `DEVLOG.md`ga yozing.
2. `STATUS.md`dagi snapshot, bloklar va next actionlarni yangilang.
3. Bajarilgan ishni `PLAN.md`dan olib tashlang yoki keyingi sprintga o'tkazing.
4. Requirement holati o'zgarsa `REQUIREMENTS.md`ni yangilang.
5. Phase o'zgarsa `ROADMAP.md`ni yangilang.
6. Canonical o'zbekcha matndan keyin uchta tarjimani sinxronlang.
7. Secret, token, parol yoki raw connection stringni hujjatga yozmang.

## Arxiv

Eski, katta va tarixiy rejalarning nusxalari [archive/](archive/README.md) ichida saqlanadi. Arxiv fayllaridagi ochiq checkboxlar joriy backlog hisoblanmaydi.
