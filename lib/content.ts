// Modelo único de conteúdo do site. Fica salvo no Supabase (tabela site_content);
// estes valores são o padrão enquanto a tabela estiver vazia.

export const previewKinds = ['security', 'workspace', 'terminal'] as const;
export const areaIcons = ['code', 'braces', 'shield', 'layers', 'terminal', 'database', 'cloud', 'cpu'] as const;

export type PreviewKind = (typeof previewKinds)[number];
export type AreaIcon = (typeof areaIcons)[number];

export type Project = {
  id: string;
  title: string;
  type: string;
  category: string;
  description: string;
  detail: string;
  tags: string[];
  kind: PreviewKind;
  /** Capa enviada ao Storage. Vazia = prévia ilustrada do tipo escolhido. */
  image?: string;
  /** Capa vertical usada em telas até 900px. Vazia = usa a capa normal. */
  imageMobile?: string;
  github: string;
  live: string;
};

export type Principle = { title: string; text: string };

export type Experience = {
  id: string;
  role: string;
  company: string;
  period: string;
  type: string;
  location: string;
  current: boolean;
  description: string;
  highlights: string[];
  tags: string[];
  link: string;
};

export type Tool = { name: string; description: string; mark: string };

export type StackArea = {
  id: string;
  name: string;
  label: string;
  icon: AreaIcon;
  color: string;
  subtitle: string;
  description: string;
  tools: Tool[];
  file: string;
  code: string;
};

export type SiteContent = {
  profile: { photo: string; photoAlt: string; photoPosition: string; name: string; initials: string; role: string; status: string; email: string; github: string; linkedin: string };
  hero: { title: string; accent: string; text: string };
  strip: { label: string; items: string[] };
  about: { title: string; accent: string; intro: string; text: string; traits: string[]; principles: Principle[]; marquee: string };
  projectsSection: { title: string; accent: string };
  projects: Project[];
  toolkit: { title: string; accent: string; text: string; areas: StackArea[] };
  experience: { title: string; accent: string; text: string; items: Experience[] };
  contact: { title: string; accent: string; text: string };
  updatedAt: string | null;
};

export const defaultContent: SiteContent = {
  "profile": {
    "photo": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=1200&q=85",
    "photoAlt": "Retrato de exemplo — substitua pela sua foto",
    "photoPosition": "50% 50%",
    "name": "Seu nome",
    "initials": "dev",
    "role": "Full stack / Cybersecurity",
    "status": "",
    "email": "",
    "github": "",
    "linkedin": ""
  },
  "hero": {
    "title": "Desenvolvimento\nfull stack.",
    "accent": "& segurança.",
    "text": "Aplicações web, ferramentas e estudos de segurança.\nAqui ficam os projetos, as decisões técnicas e o que aprendi no processo."
  },
  "strip": {
    "label": "Ferramentas",
    "items": [
      "Next.js",
      "React",
      "TypeScript",
      "Python",
      "Linux",
      "Docker",
      "PostgreSQL",
      "Node.js"
    ]
  },
  "about": {
    "title": "Sobre mim.",
    "accent": "Além da stack.",
    "intro": "Olá, eu sou",
    "text": "[Sua apresentação entra aqui: como você começou, no que está trabalhando ou estudando agora e que tipo de problema gosta de resolver.]",
    "traits": [],
    "marquee": "sobre /",
    "principles": [
      {
        "title": "O que estou construindo",
        "text": "[Um projeto atual, o problema que ele resolve e a sua participação.]"
      },
      {
        "title": "O que estou estudando",
        "text": "[Um assunto específico, um laboratório ou uma dúvida que você está investigando.]"
      },
      {
        "title": "Fora do editor",
        "text": "[Um interesse seu que não aparece na lista de tecnologias.]"
      }
    ]
  },
  "projectsSection": {
    "title": "Projetos",
    "accent": "& notas técnicas."
  },
  "projects": [
    {
      "id": "sentinel",
      "title": "Projeto full stack",
      "type": "APLICAÇÃO / PLACEHOLDER",
      "category": "Cyber",
      "description": "[Qual era o problema? Descreva o que foi construído, para quem e qual foi a sua participação.]",
      "tags": [
        "Python",
        "FastAPI",
        "React"
      ],
      "kind": "security",
      "github": "",
      "live": "",
      "detail": "[Explique uma decisão de implementação, uma dificuldade real e o que você mudaria hoje. Inclua resultados apenas quando tiver como demonstrá-los.]"
    },
    {
      "id": "nexus",
      "title": "Aplicação web",
      "type": "APLICAÇÃO / PLACEHOLDER",
      "category": "FullStack",
      "description": "[Qual era o problema? Descreva o que foi construído, para quem e qual foi a sua participação.]",
      "tags": [
        "Next.js",
        "TypeScript",
        "PostgreSQL"
      ],
      "kind": "workspace",
      "github": "",
      "live": "",
      "detail": "[Explique uma decisão de implementação, uma dificuldade real e o que você mudaria hoje. Inclua resultados apenas quando tiver como demonstrá-los.]"
    },
    {
      "id": "packet-lab",
      "title": "Estudo de segurança",
      "type": "LAB / PLACEHOLDER",
      "category": "Cyber",
      "description": "[Qual era o problema? Descreva o que foi construído, para quem e qual foi a sua participação.]",
      "tags": [
        "Python",
        "Linux",
        "Docker"
      ],
      "kind": "terminal",
      "github": "",
      "live": "",
      "detail": "[Explique uma decisão de implementação, uma dificuldade real e o que você mudaria hoje. Inclua resultados apenas quando tiver como demonstrá-los.]"
    }
  ],
  "toolkit": {
    "title": "Stack de trabalho.",
    "accent": "Peça por peça.",
    "text": "Ferramentas e onde elas entram.\nSelecione uma área ou continue rolando.",
    "areas": [
      {
        "id": "frontend",
        "name": "Frontend",
        "label": "Interface",
        "icon": "code",
        "color": "#66c9ff",
        "subtitle": "Interface e estado.",
        "description": "Componentes, estado, navegação e acessibilidade. [Adicione um exemplo de onde você usou essas ferramentas.]",
        "tools": [
          {
            "name": "React",
            "description": "Interfaces em componentes",
            "mark": "Re"
          },
          {
            "name": "Next.js",
            "description": "Renderização e navegação",
            "mark": "N"
          },
          {
            "name": "TypeScript",
            "description": "Contratos e tipagem",
            "mark": "TS"
          },
          {
            "name": "Tailwind CSS",
            "description": "Sistemas visuais responsivos",
            "mark": "Tw"
          }
        ],
        "file": "",
        "code": ""
      },
      {
        "id": "backend",
        "name": "Backend",
        "label": "Lógica & dados",
        "icon": "braces",
        "color": "#a89aff",
        "subtitle": "API e persistência.",
        "description": "Validação de entrada, regras de negócio e modelagem de dados. [Descreva uma decisão de backend de um projeto seu.]",
        "tools": [
          {
            "name": "Node.js",
            "description": "Serviços e integrações",
            "mark": "JS"
          },
          {
            "name": "Python",
            "description": "Automação e processamento",
            "mark": "Py"
          },
          {
            "name": "PostgreSQL",
            "description": "Dados e relacionamentos",
            "mark": "Pg"
          },
          {
            "name": "REST APIs",
            "description": "Comunicação entre sistemas",
            "mark": "{}"
          }
        ],
        "file": "",
        "code": ""
      },
      {
        "id": "cybersecurity",
        "name": "Cybersecurity",
        "label": "Proteção",
        "icon": "shield",
        "color": "#72dded",
        "subtitle": "Aplicação e superfície de ataque.",
        "description": "Permissões, validação, protocolos e análise de vulnerabilidades. [Inclua seus estudos ou laboratórios autorizados.]",
        "tools": [
          {
            "name": "Linux",
            "description": "Sistemas e permissões",
            "mark": "~/"
          },
          {
            "name": "OWASP",
            "description": "Riscos em aplicações web",
            "mark": "OW"
          },
          {
            "name": "Redes",
            "description": "Protocolos e análise de tráfego",
            "mark": "IP"
          },
          {
            "name": "AppSec",
            "description": "Segurança no desenvolvimento",
            "mark": "</>"
          }
        ],
        "file": "",
        "code": ""
      },
      {
        "id": "infra",
        "name": "Infra & DevOps",
        "label": "Entrega",
        "icon": "layers",
        "color": "#90b4ff",
        "subtitle": "Ambiente e deploy.",
        "description": "Versionamento, ambientes reproduzíveis e entrega. [Conte como você organiza o desenvolvimento e o deploy.]",
        "tools": [
          {
            "name": "Git",
            "description": "Histórico e colaboração",
            "mark": "Git"
          },
          {
            "name": "Docker",
            "description": "Ambientes reproduzíveis",
            "mark": "Dk"
          },
          {
            "name": "CI/CD",
            "description": "Verificação e entrega contínua",
            "mark": "↻"
          },
          {
            "name": "Vercel",
            "description": "Publicação de aplicações",
            "mark": "▲"
          }
        ],
        "file": "",
        "code": ""
      }
    ]
  },
  "experience": {
    "title": "Experiência.",
    "accent": "Onde aprendi fazendo.",
    "text": "Trabalhos, estágios e projetos que moldaram\ncomo eu construo e protejo sistemas.",
    "items": [
      {
        "id": "atual",
        "role": "Desenvolvedor Full Stack",
        "company": "[Empresa atual]",
        "period": "2024 — atual",
        "type": "Emprego",
        "location": "Remoto",
        "current": true,
        "description": "[O que você faz no dia a dia, com qual time trabalha e qual produto sustenta.]",
        "highlights": [
          "[Uma entrega concreta que você liderou]",
          "[Um resultado com número: tempo, custo, usuários]"
        ],
        "tags": [
          "Next.js",
          "TypeScript",
          "PostgreSQL"
        ],
        "link": ""
      },
      {
        "id": "estagio-seguranca",
        "role": "Estágio em Segurança da Informação",
        "company": "[Empresa]",
        "period": "2023 — 2024",
        "type": "Estágio",
        "location": "[Cidade]",
        "current": false,
        "description": "[Rotina de segurança: análise de vulnerabilidades, hardening, resposta a incidentes em ambiente autorizado.]",
        "highlights": [
          "[Um processo que você melhorou]",
          "[Uma ferramenta ou automação que você criou]"
        ],
        "tags": [
          "Linux",
          "Python",
          "OWASP"
        ],
        "link": ""
      },
      {
        "id": "freelance",
        "role": "Projetos freelance",
        "company": "Autônomo",
        "period": "2022 — 2023",
        "type": "Freelance",
        "location": "Remoto",
        "current": false,
        "description": "[Sites e sistemas para clientes: o tipo de cliente, o problema e o que foi entregue.]",
        "highlights": [
          "[Um projeto de destaque e o impacto para o cliente]"
        ],
        "tags": [
          "React",
          "Node.js",
          "Docker"
        ],
        "link": ""
      },
      {
        "id": "formacao",
        "role": "[Curso / Graduação]",
        "company": "[Instituição]",
        "period": "2021 — 2025",
        "type": "Formação",
        "location": "[Cidade]",
        "current": false,
        "description": "[Sua formação e os assuntos que mais aprofundou: redes, sistemas, desenvolvimento.]",
        "highlights": [
          "[Um trabalho, certificação ou CTF relevante]"
        ],
        "tags": [
          "Redes",
          "Algoritmos",
          "Sistemas"
        ],
        "link": ""
      }
    ]
  },
  "contact": {
    "title": "Quer conversar",
    "accent": "sobre um projeto?",
    "text": "Me escreva por e-mail ou encontre meus projetos no GitHub."
  },
  "updatedAt": null
};

export const slugify = (value: string) => value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'item';

export const uniqueId = (base: string, taken: string[]) => {
  const slug = slugify(base);
  let id = slug, n = 2;
  while (taken.includes(id)) id = `${slug}-${n++}`;
  return id;
};
