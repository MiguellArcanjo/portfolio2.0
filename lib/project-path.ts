import { localePath, type Locale } from './locales';
export const projectPath = (locale: Locale, id: string) => localePath(locale).replace(/\/$/, '') + '/projetos/' + encodeURIComponent(id);
