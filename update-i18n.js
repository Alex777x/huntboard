const fs = require('fs');
const file = 'src/lib/i18n/translations.ts';
let content = fs.readFileSync(file, 'utf-8');

const additions = {
  landing: {
    en: `    landing: {
      heroTitle: "Find Your Dream Job",
      heroSubtitle: "Track applications, prep for interviews, and optimize your CV.",
      getStarted: "Get Started",
      features: "Features",
      feature1Title: "ATS Optimizer",
      feature1Desc: "Optimize your resume to pass ATS filters.",
      cta: "Join Now",
    },`,
    ru: `    landing: {
      heroTitle: "Найди работу мечты",
      heroSubtitle: "Отслеживай отклики, готовься к интервью и оптимизируй резюме.",
      getStarted: "Начать",
      features: "Возможности",
      feature1Title: "ATS Оптимизатор",
      feature1Desc: "Оптимизируй резюме для прохождения ATS фильтров.",
      cta: "Присоединиться",
    },`,
    pl: `    landing: {
      heroTitle: "Znajdź wymarzoną pracę",
      heroSubtitle: "Śledź aplikacje, przygotuj się do rozmów i optymalizuj CV.",
      getStarted: "Rozpocznij",
      features: "Funkcje",
      feature1Title: "Optymalizator ATS",
      feature1Desc: "Optymalizuj CV, aby przejść przez filtry ATS.",
      cta: "Dołącz teraz",
    },`
  },
  auth: {
    en: `    auth: {
      login: "Login",
      register: "Register",
      email: "Email",
      password: "Password",
      seekerRole: "Job Seeker",
      recruiterRole: "Recruiter",
    },`,
    ru: `    auth: {
      login: "Войти",
      register: "Регистрация",
      email: "Email",
      password: "Пароль",
      seekerRole: "Соискатель",
      recruiterRole: "Рекрутер",
    },`,
    pl: `    auth: {
      login: "Zaloguj",
      register: "Zarejestruj",
      email: "Email",
      password: "Hasło",
      seekerRole: "Kandydat",
      recruiterRole: "Rekruter",
    },`
  },
  common: {
    en: `      add: "Add",\n      present: "Present",\n      tokens: "Tokens",\n      anonymousUser: "Anonymous User",\n      toggleTheme: "Toggle Theme",\n      justNow: "Just now",`,
    ru: `      add: "Добавить",\n      present: "По настоящее время",\n      tokens: "Токены",\n      anonymousUser: "Анонимный пользователь",\n      toggleTheme: "Сменить тему",\n      justNow: "Только что",`,
    pl: `      add: "Dodaj",\n      present: "Obecnie",\n      tokens: "Tokeny",\n      anonymousUser: "Anonimowy użytkownik",\n      toggleTheme: "Przełącz motyw",\n      justNow: "Przed chwilą",`
  },
  applications: {
    en: `      dialogFields: "Dialog Fields",\n      sourceOptions: "Source Options",\n      stageLabels: "Stage Labels",\n      tableHeaders: "Table Headers",\n      salaryUnlisted: "Salary Unlisted",\n      perYear: "per year",`,
    ru: `      dialogFields: "Поля формы",\n      sourceOptions: "Источники",\n      stageLabels: "Этапы",\n      tableHeaders: "Заголовки таблицы",\n      salaryUnlisted: "Зарплата не указана",\n      perYear: "в год",`,
    pl: `      dialogFields: "Pola formularza",\n      sourceOptions: "Źródła",\n      stageLabels: "Etapy",\n      tableHeaders: "Nagłówki tabeli",\n      salaryUnlisted: "Wynagrodzenie niepodane",\n      perYear: "rocznie",`
  },
  calendar: {
    en: `      formLabels: "Form Labels",\n      eventTypes: "Event Types",\n      placeholders: "Placeholders",`,
    ru: `      formLabels: "Поля формы",\n      eventTypes: "Типы событий",\n      placeholders: "Плейсхолдеры",`,
    pl: `      formLabels: "Etykiety formularza",\n      eventTypes: "Typy wydarzeń",\n      placeholders: "Symbole zastępcze",`
  },
  companies: {
    en: `      dialogFields: "Dialog Fields",\n      sizeOptions: "Size Options",`,
    ru: `      dialogFields: "Поля формы",\n      sizeOptions: "Размер компании",`,
    pl: `      dialogFields: "Pola formularza",\n      sizeOptions: "Opcje wielkości",`
  },
  contacts: {
    en: `      dialogFields: "Dialog Fields",\n      placeholders: "Placeholders",`,
    ru: `      dialogFields: "Поля формы",\n      placeholders: "Плейсхолдеры",`,
    pl: `      dialogFields: "Pola formularza",\n      placeholders: "Symbole zastępcze",`
  },
  community: {
    en: `      newPostDialog: "New Post",\n      reportDialogFields: "Report details",`,
    ru: `      newPostDialog: "Новый пост",\n      reportDialogFields: "Детали жалобы",`,
    pl: `      newPostDialog: "Nowy post",\n      reportDialogFields: "Szczegóły zgłoszenia",`
  },
  cv: {
    en: `      previewHeaders: "Preview Headers",\n      proficiencyLevels: "Proficiency Levels",\n      aiButtons: "AI Buttons",`,
    ru: `      previewHeaders: "Заголовки предпросмотра",\n      proficiencyLevels: "Уровни владения",\n      aiButtons: "Кнопки AI",`,
    pl: `      previewHeaders: "Nagłówki podglądu",\n      proficiencyLevels: "Poziomy biegłości",\n      aiButtons: "Przyciski AI",`
  },
  settings: {
    en: `      aiEngineSetup: "AI Engine Setup",\n      providerCards: "Provider Cards",`,
    ru: `      aiEngineSetup: "Настройка AI движка",\n      providerCards: "Провайдеры",`,
    pl: `      aiEngineSetup: "Ustawienia silnika AI",\n      providerCards: "Karty dostawców",`
  },
  feedback: {
    en: `      formLabels: "Form Labels",\n      badgeTypes: "Badge Types",`,
    ru: `      formLabels: "Поля формы",\n      badgeTypes: "Типы бейджей",`,
    pl: `      formLabels: "Etykiety formularza",\n      badgeTypes: "Typy odznak",`
  },
  admin: {
    en: `      tables: "Tables",\n      balanceTool: "Balance Tool",\n      ticketManagement: "Ticket Management",`,
    ru: `      tables: "Таблицы",\n      balanceTool: "Управление балансом",\n      ticketManagement: "Управление тикетами",`,
    pl: `      tables: "Tabele",\n      balanceTool: "Narzędzie balansu",\n      ticketManagement: "Zarządzanie zgłoszeniami",`
  },
  profile: {
    en: `      formLabels: "Form Labels",\n      skillLevels: "Skill Levels",`,
    ru: `      formLabels: "Поля формы",\n      skillLevels: "Уровни навыков",`,
    pl: `      formLabels: "Etykiety formularza",\n      skillLevels: "Poziomy umiejętności",`
  },
  recruiter: {
    en: `      verifyPage: "Verify Page",\n      statusOptions: "Status Options",`,
    ru: `      verifyPage: "Страница верификации",\n      statusOptions: "Опции статуса",`,
    pl: `      verifyPage: "Strona weryfikacji",\n      statusOptions: "Opcje statusu",`
  }
};

const locales = ['en', 'ru', 'pl'];
for (const loc of locales) {
  // Inject top-level namespaces right after \`loc: {\`
  const topLevelRegex = new RegExp(loc + ':\\s*\\{');
  content = content.replace(topLevelRegex, loc + ': {\n' + additions.landing[loc] + '\n' + additions.auth[loc]);

  // Inject common
  const commonRegex = new RegExp(loc + ':[\\s\\S]*?common:\\s*\\{');
  content = content.replace(commonRegex, match => match + '\n' + additions.common[loc]);

  // Inject applications
  const appRegex = new RegExp(loc + ':[\\s\\S]*?applications:\\s*\\{');
  content = content.replace(appRegex, match => match + '\n' + additions.applications[loc]);

  // Inject calendar
  const calRegex = new RegExp(loc + ':[\\s\\S]*?calendar:\\s*\\{');
  content = content.replace(calRegex, match => match + '\n' + additions.calendar[loc]);

  // Inject companies
  const compRegex = new RegExp(loc + ':[\\s\\S]*?companies:\\s*\\{');
  content = content.replace(compRegex, match => match + '\n' + additions.companies[loc]);

  // Inject contacts
  const contRegex = new RegExp(loc + ':[\\s\\S]*?contacts:\\s*\\{');
  content = content.replace(contRegex, match => match + '\n' + additions.contacts[loc]);

  // Inject community
  const commRegex = new RegExp(loc + ':[\\s\\S]*?community:\\s*\\{');
  content = content.replace(commRegex, match => match + '\n' + additions.community[loc]);

  // Inject cv
  const cvRegex = new RegExp(loc + ':[\\s\\S]*?cv:\\s*\\{');
  content = content.replace(cvRegex, match => match + '\n' + additions.cv[loc]);

  // Inject settings
  const setRegex = new RegExp(loc + ':[\\s\\S]*?settings:\\s*\\{');
  content = content.replace(setRegex, match => match + '\n' + additions.settings[loc]);

  // Inject feedback
  const feedRegex = new RegExp(loc + ':[\\s\\S]*?feedback:\\s*\\{');
  content = content.replace(feedRegex, match => match + '\n' + additions.feedback[loc]);

  // Inject admin
  const adminRegex = new RegExp(loc + ':[\\s\\S]*?admin:\\s*\\{');
  content = content.replace(adminRegex, match => match + '\n' + additions.admin[loc]);

  // Inject profile
  const profRegex = new RegExp(loc + ':[\\s\\S]*?profile:\\s*\\{');
  content = content.replace(profRegex, match => match + '\n' + additions.profile[loc]);

  // Inject recruiter
  const recRegex = new RegExp(loc + ':[\\s\\S]*?recruiter:\\s*\\{');
  content = content.replace(recRegex, match => match + '\n' + additions.recruiter[loc]);
}

fs.writeFileSync(file, content);
console.log('Updated translations.ts');
