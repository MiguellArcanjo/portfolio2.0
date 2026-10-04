// Kept in code on purpose (the owner asked not to manage it in /admin). Brazil +55, area code 83.
const WHATSAPP_NUMBER = '558398825681';

// Opens a chat with a greeting already typed, in the page's language.
export const whatsappUrl = (message: string) => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
