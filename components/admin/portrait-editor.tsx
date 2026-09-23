'use client';

import type { SiteContent } from '@/lib/content';
import { Field, Panel } from './fields';
import { ImageField } from './image-field';
import type { Edit } from './editors';

export function PortraitEditor({ profile, edit }: { profile: SiteContent['profile']; edit: Edit }) {
  return <Panel title="Foto de abertura" description="O retrato se endireita e se expande durante o scroll, com seu nome sobre a composição.">
    <div className="adm-grid">
      <ImageField label="Foto" folder="perfil" maxSize={2000} value={profile.photo} previewStyle={{ aspectRatio: '4 / 5', objectPosition: profile.photoPosition, filter: 'grayscale(1)' }}
        onChange={url => edit(draft => { draft.profile.photo = url; if (url && !draft.profile.photoAlt.trim()) draft.profile.photoAlt = `Retrato de ${draft.profile.name}`; })}
        hint="Exibida em preto e branco no site."/>
      <div className="adm-stack">
        <Field label="Descrição da foto (acessibilidade)" value={profile.photoAlt} onChange={value => edit(draft => { draft.profile.photoAlt = value; })}/>
        <Field label="Enquadramento" hint="Horizontal e vertical. Ex.: 50% 30% aproxima o enquadramento do topo." value={profile.photoPosition} onChange={value => edit(draft => { draft.profile.photoPosition = value; })}/>
        <Field label="Ou use uma URL" hint="Opcional: link direto para uma imagem hospedada em outro lugar." value={profile.photo.startsWith('data:') ? '' : profile.photo} placeholder="https://…" onChange={value => edit(draft => { draft.profile.photo = value; })}/>
      </div>
    </div>
  </Panel>;
}
