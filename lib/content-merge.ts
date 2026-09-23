import { defaultContent, type SiteContent } from './content';
import { upgradeTemplateContent } from './content-migration';

// Fill in fields added to the model after the content was saved, so old data keeps rendering.
export function mergeContent(value: unknown): SiteContent {
  if (!value || typeof value !== 'object') return defaultContent;
  const stored = upgradeTemplateContent(value as Partial<SiteContent>);
  return {
    ...defaultContent,
    ...stored,
    profile: { ...defaultContent.profile, ...stored.profile },
    hero: { ...defaultContent.hero, ...stored.hero },
    strip: { ...defaultContent.strip, ...stored.strip },
    about: { ...defaultContent.about, ...stored.about },
    projectsSection: { ...defaultContent.projectsSection, ...stored.projectsSection },
    projects: (stored.projects ?? defaultContent.projects).map(project => ({ image: '', ...project })),
    toolkit: { ...defaultContent.toolkit, ...stored.toolkit },
    experience: { ...defaultContent.experience, ...stored.experience },
    contact: { ...defaultContent.contact, ...stored.contact },
  };
}
