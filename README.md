# Cyber / FullStack Portfolio

Portfólio em Next.js (App Router), React e TypeScript, pronto para deploy na Vercel. Não depende de banco de dados, chave de API ou serviço pago. As condições e limites da hospedagem dependem do plano escolhido na Vercel.

## Rodar localmente

```bash
npm install
npm run dev
```

Abra http://localhost:3000.

## Personalizar

- `/admin`: edição de perfil, textos, projetos e ferramentas, com importação/exportação.
- `lib/content.ts`: conteúdo padrão usado por novos visitantes.
- `app/page.tsx`: tecnologias, textos das seções e estrutura.
- `app/globals.css`: cores, fontes, espaçamentos e responsividade.
- `app/layout.tsx`: título e descrição para buscadores.
- `app/icon.svg`: ícone da aba.

Os textos entre colchetes e os projetos são placeholders. Preencha-os pelo painel e mantenha apenas as tecnologias que representam seu trabalho. Links vazios ficam ocultos.

O painel atual salva no localStorage do navegador: suas edições não são publicadas para outros visitantes. Para publicar conteúdo sem um banco, atualize os padrões em `lib/content.ts`. A atualização visual preserva campos personalizados já salvos e renova apenas valores iguais aos padrões antigos.

## Publicar na Vercel

1. Suba este projeto para um repositório Git.
2. Importe o repositório no painel da Vercel.
3. Use o preset Next.js e a pasta raiz do projeto.
4. Use `npm run build` como comando de build, sem alterar o diretório de saída padrão.
5. Faça o deploy. Não são necessárias variáveis de ambiente.

## Verificação

```bash
npm run typecheck
npm run build
```

## Interações

- Geometria 3D projetada em Canvas, com movimento suave e interação com o ponteiro.
- Cards com perspectiva, filtros e detalhes em um diálogo acessível.
- Revelação no scroll e indicador de progresso.
- Menu mobile e seleção de camadas da stack operáveis por teclado.
- Respeito a `prefers-reduced-motion` e pausa do desenho fora da tela.

As fontes são carregadas pelo Google Fonts via CSS, com fallback local caso não estejam disponíveis.

## Globo neon

Globo 3D com continentes pontilhados, conexões entre cidades e rotação independente da taxa de quadros. Respeita movimento reduzido e pausa fora da tela. Os pontos em lib/globe-land.json foram derivados do mapa de terra 1:110m do Natural Earth (domínio público), preservado em public/land.geojson. Fonte: https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_110m_land.geojson


## Apresentação dos projetos por scroll

`components/project-showcase.tsx` contém a sequência de projetos, filtros e atualização do progresso. Cada capítulo permanece fixo por um trecho com CSS `position: sticky`; imagem e texto alternam os lados. O scroll não é interceptado. Em telas pequenas, baixas ou com movimento reduzido, a sequência volta ao fluxo normal. Os links “A seguir” também permitem navegação direta por teclado.

Referência do padrão: https://motion.dev/examples/js-scroll-pinning. Implementação própria usando CSS e requestAnimationFrame, sem dependência adicional.
