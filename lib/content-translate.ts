import type { SiteContent } from './content';
import type { Locale } from './locales';

// Starting translations for the template and the content saved so far. Used when a language has no
// version of its own in the database yet, and to prefill that version in /admin. Unknown text stays as is.
const phrases: [pt: string, en: string, es: string][] = [
  ['Retrato de exemplo — substitua pela sua foto', 'Sample portrait — replace it with your photo', 'Retrato de ejemplo — reemplázalo con tu foto'],
  ['Seu nome', 'Your name', 'Tu nombre'],
  ['Desenvolvimento\nfull stack.', 'Full stack\ndevelopment.', 'Desarrollo\nfull stack.'],
  ['& segurança.', '& security.', '& seguridad.'],
  ['Aplicações web, ferramentas e estudos de segurança.\nAqui ficam os projetos, as decisões técnicas e o que aprendi no processo.', 'Web applications, tools and security studies.\nHere you will find the projects, the technical decisions and what I learned along the way.', 'Aplicaciones web, herramientas y estudios de seguridad.\nAquí están los proyectos, las decisiones técnicas y lo que aprendí en el proceso.'],
  ['Ferramentas', 'Tools', 'Herramientas'],
  ['Sobre mim.', 'About me.', 'Sobre mí.'],
  ['Além da stack.', 'Beyond the stack.', 'Más allá del stack.'],
  ['Olá, eu sou', "Hi, I'm", 'Hola, soy'],
  ['[Sua apresentação entra aqui: como você começou, no que está trabalhando ou estudando agora e que tipo de problema gosta de resolver.]', '[Your introduction goes here: how you started, what you are working on or studying now and what kind of problems you like to solve.]', '[Tu presentación va aquí: cómo empezaste, en qué estás trabajando o estudiando ahora y qué tipo de problemas te gusta resolver.]'],
  ['sobre /', 'about /', 'sobre mí /'],
  ['O que estou construindo', "What I'm building", 'Lo que estoy construyendo'],
  ['[Um projeto atual, o problema que ele resolve e a sua participação.]', '[A current project, the problem it solves and your role in it.]', '[Un proyecto actual, el problema que resuelve y tu participación.]'],
  ['O que estou estudando', "What I'm studying", 'Lo que estoy estudiando'],
  ['[Um assunto específico, um laboratório ou uma dúvida que você está investigando.]', '[A specific topic, a lab or a question you are investigating.]', '[Un tema específico, un laboratorio o una duda que estás investigando.]'],
  ['Fora do editor', 'Away from the editor', 'Fuera del editor'],
  ['[Um interesse seu que não aparece na lista de tecnologias.]', "[An interest of yours that isn't on the technology list.]", '[Un interés tuyo que no aparece en la lista de tecnologías.]'],
  ['Projetos', 'Projects', 'Proyectos'],
  ['& notas técnicas.', '& technical notes.', '& notas técnicas.'],
  ['Projeto full stack', 'Full stack project', 'Proyecto full stack'],
  ['APLICAÇÃO / PLACEHOLDER', 'APPLICATION / PLACEHOLDER', 'APLICACIÓN / PLACEHOLDER'],
  ['[Qual era o problema? Descreva o que foi construído, para quem e qual foi a sua participação.]', '[What was the problem? Describe what was built, for whom and what your role was.]', '[¿Cuál era el problema? Describe qué se construyó, para quién y cuál fue tu participación.]'],
  ['[Explique uma decisão de implementação, uma dificuldade real e o que você mudaria hoje. Inclua resultados apenas quando tiver como demonstrá-los.]', "[Explain an implementation decision, a real difficulty and what you would change today. Only include results you can demonstrate.]", '[Explica una decisión de implementación, una dificultad real y lo que cambiarías hoy. Incluye resultados solo cuando puedas demostrarlos.]'],
  ['Aplicação web', 'Web application', 'Aplicación web'],
  ['Estudo de segurança', 'Security study', 'Estudio de seguridad'],
  ['Stack de trabalho.', 'Work stack.', 'Stack de trabajo.'],
  ['Peça por peça.', 'Piece by piece.', 'Pieza por pieza.'],
  ['Ferramentas e onde elas entram.\nSelecione uma área ou continue rolando.', 'Tools and where they fit in.\nPick an area or keep scrolling.', 'Herramientas y dónde encajan.\nElige un área o sigue desplazándote.'],
  ['Interface e estado.', 'Interface and state.', 'Interfaz y estado.'],
  ['Componentes, estado, navegação e acessibilidade. [Adicione um exemplo de onde você usou essas ferramentas.]', 'Components, state, navigation and accessibility. [Add an example of where you used these tools.]', 'Componentes, estado, navegación y accesibilidad. [Agrega un ejemplo de dónde usaste estas herramientas.]'],
  ['Interfaces em componentes', 'Component-based interfaces', 'Interfaces basadas en componentes'],
  ['Renderização e navegação', 'Rendering and navigation', 'Renderizado y navegación'],
  ['Contratos e tipagem', 'Contracts and typing', 'Contratos y tipado'],
  ['Sistemas visuais responsivos', 'Responsive visual systems', 'Sistemas visuales responsivos'],
  ['Lógica & dados', 'Logic & data', 'Lógica y datos'],
  ['API e persistência.', 'API and persistence.', 'API y persistencia.'],
  ['Validação de entrada, regras de negócio e modelagem de dados. [Descreva uma decisão de backend de um projeto seu.]', 'Input validation, business rules and data modeling. [Describe a backend decision from one of your projects.]', 'Validación de entrada, reglas de negocio y modelado de datos. [Describe una decisión de backend de uno de tus proyectos.]'],
  ['Serviços e integrações', 'Services and integrations', 'Servicios e integraciones'],
  ['Automação e processamento', 'Automation and processing', 'Automatización y procesamiento'],
  ['Dados e relacionamentos', 'Data and relationships', 'Datos y relaciones'],
  ['Comunicação entre sistemas', 'Communication between systems', 'Comunicación entre sistemas'],
  ['Proteção', 'Protection', 'Protección'],
  ['Aplicação e superfície de ataque.', 'Application and attack surface.', 'Aplicación y superficie de ataque.'],
  ['Permissões, validação, protocolos e análise de vulnerabilidades. [Inclua seus estudos ou laboratórios autorizados.]', 'Permissions, validation, protocols and vulnerability analysis. [Include your studies or authorized labs.]', 'Permisos, validación, protocolos y análisis de vulnerabilidades. [Incluye tus estudios o laboratorios autorizados.]'],
  ['Sistemas e permissões', 'Systems and permissions', 'Sistemas y permisos'],
  ['Riscos em aplicações web', 'Web application risks', 'Riesgos en aplicaciones web'],
  ['Redes', 'Networking', 'Redes'],
  ['Protocolos e análise de tráfego', 'Protocols and traffic analysis', 'Protocolos y análisis de tráfico'],
  ['Segurança no desenvolvimento', 'Security in development', 'Seguridad en el desarrollo'],
  ['Entrega', 'Delivery', 'Entrega'],
  ['Ambiente e deploy.', 'Environment and deploy.', 'Entorno y despliegue.'],
  ['Versionamento, ambientes reproduzíveis e entrega. [Conte como você organiza o desenvolvimento e o deploy.]', 'Versioning, reproducible environments and delivery. [Tell how you organize development and deployment.]', 'Versionado, entornos reproducibles y entrega. [Cuenta cómo organizas el desarrollo y el despliegue.]'],
  ['Histórico e colaboração', 'History and collaboration', 'Historial y colaboración'],
  ['Ambientes reproduzíveis', 'Reproducible environments', 'Entornos reproducibles'],
  ['Verificação e entrega contínua', 'Continuous verification and delivery', 'Verificación y entrega continua'],
  ['Publicação de aplicações', 'Application publishing', 'Publicación de aplicaciones'],
  ['Experiência.', 'Experience.', 'Experiencia.'],
  ['Onde aprendi fazendo.', 'Where I learned by doing.', 'Donde aprendí haciendo.'],
  ['Trabalhos, estágios e projetos que moldaram\ncomo eu construo e protejo sistemas.', 'Jobs, internships and projects that shaped\nhow I build and protect systems.', 'Trabajos, prácticas y proyectos que moldearon\ncómo construyo y protejo sistemas.'],
  ['Desenvolvedor Full Stack', 'Full Stack Developer', 'Desarrollador Full Stack'],
  ['[Empresa atual]', '[Current company]', '[Empresa actual]'],
  ['Emprego', 'Job', 'Empleo'],
  ['Remoto', 'Remote', 'Remoto'],
  ['[O que você faz no dia a dia, com qual time trabalha e qual produto sustenta.]', '[What you do day to day, which team you work with and which product you support.]', '[Lo que haces en el día a día, con qué equipo trabajas y qué producto mantienes.]'],
  ['[Uma entrega concreta que você liderou]', '[A concrete delivery you led]', '[Una entrega concreta que lideraste]'],
  ['[Um resultado com número: tempo, custo, usuários]', '[A result with a number: time, cost, users]', '[Un resultado con cifras: tiempo, costo, usuarios]'],
  ['Estágio em Segurança da Informação', 'Information Security Internship', 'Prácticas en Seguridad de la Información'],
  ['[Empresa]', '[Company]', '[Empresa]'],
  ['Estágio', 'Internship', 'Prácticas'],
  ['[Cidade]', '[City]', '[Ciudad]'],
  ['[Rotina de segurança: análise de vulnerabilidades, hardening, resposta a incidentes em ambiente autorizado.]', '[Security routine: vulnerability analysis, hardening, incident response in an authorized environment.]', '[Rutina de seguridad: análisis de vulnerabilidades, hardening, respuesta a incidentes en un entorno autorizado.]'],
  ['[Um processo que você melhorou]', '[A process you improved]', '[Un proceso que mejoraste]'],
  ['[Uma ferramenta ou automação que você criou]', '[A tool or automation you built]', '[Una herramienta o automatización que creaste]'],
  ['Projetos freelance', 'Freelance projects', 'Proyectos freelance'],
  ['Autônomo', 'Self-employed', 'Autónomo'],
  ['[Sites e sistemas para clientes: o tipo de cliente, o problema e o que foi entregue.]', '[Websites and systems for clients: the type of client, the problem and what was delivered.]', '[Sitios y sistemas para clientes: el tipo de cliente, el problema y lo que se entregó.]'],
  ['[Um projeto de destaque e o impacto para o cliente]', '[A highlight project and its impact for the client]', '[Un proyecto destacado y su impacto para el cliente]'],
  ['[Curso / Graduação]', '[Course / Degree]', '[Curso / Grado]'],
  ['[Instituição]', '[Institution]', '[Institución]'],
  ['Formação', 'Education', 'Formación'],
  ['[Sua formação e os assuntos que mais aprofundou: redes, sistemas, desenvolvimento.]', '[Your education and the subjects you went deepest into: networking, systems, development.]', '[Tu formación y los temas que más profundizaste: redes, sistemas, desarrollo.]'],
  ['[Um trabalho, certificação ou CTF relevante]', '[A relevant paper, certification or CTF]', '[Un trabajo, certificación o CTF relevante]'],
  ['Algoritmos', 'Algorithms', 'Algoritmos'],
  ['Sistemas', 'Systems', 'Sistemas'],
  ['Quer conversar', 'Want to talk', '¿Quieres conversar'],
  ['sobre um projeto?', 'about a project?', 'sobre un proyecto?'],
  ['Me escreva por e-mail ou encontre meus projetos no GitHub.', 'Email me or find my projects on GitHub.', 'Escríbeme por correo o encuentra mis proyectos en GitHub.'],
  ['Boas ideias começam\ncom uma', 'Good ideas start\nwith a', 'Las buenas ideas empiezan\ncon una'],
  ['conversa.', 'conversation.', 'conversación.'],
];

const tables: Record<Exclude<Locale, 'pt'>, Map<string, string>> = {
  en: new Map(phrases.map(([pt, en]) => [pt, en])),
  es: new Map(phrases.map(([pt, , es]) => [pt, es])),
};

// Structural values (ids, colors, URLs, code) are never translated.
const skip = new Set(['id', 'icon', 'color', 'kind', 'photo', 'photoPosition', 'image', 'imageMobile', 'github', 'live', 'link', 'email', 'linkedin', 'code', 'file', 'mark', 'category', 'updatedAt', 'initials', 'name']);

function translate(value: unknown, table: Map<string, string>, locale: Locale, key = ''): unknown {
  if (typeof value === 'string') {
    const exact = table.get(value);
    if (exact !== undefined) return exact;
    if (key === 'period') return value.replace(/\batual\b/i, locale === 'en' ? 'present' : 'actualidad');
    return value;
  }
  if (Array.isArray(value)) return value.map(item => translate(item, table, locale, key));
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([field, item]) => [field, skip.has(field) ? item : translate(item, table, locale, field)]));
  }
  return value;
}

export function translateContent(content: SiteContent, locale: Locale): SiteContent {
  if (locale === 'pt') return content;
  const result = translate(content, tables[locale], locale) as SiteContent;
  // Area and tool names are only translated when mapped ("Redes" → "Networking"); brand names stay.
  result.toolkit.areas = content.toolkit.areas.map((area, index) => ({
    ...result.toolkit.areas[index],
    name: tables[locale].get(area.name) ?? area.name,
    tools: area.tools.map((tool, toolIndex) => ({ ...result.toolkit.areas[index].tools[toolIndex], name: tables[locale].get(tool.name) ?? tool.name, mark: tool.mark })),
  }));
  return result;
}
