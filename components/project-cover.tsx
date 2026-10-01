import type { Project } from '@/lib/content';
export function ProjectCover({ project, eager = false }: { project: Project; eager?: boolean }) {
  return project.image || project.imageMobile ? <picture>{project.imageMobile && <source media="(max-width: 600px)" srcSet={project.imageMobile}/>}<img src={project.image || project.imageMobile} alt={project.title} loading={eager ? 'eager' : 'lazy'}/></picture> : <div className="cover-type" aria-hidden="true"><span>{project.category}</span><strong>{project.title}</strong><span>{project.tags.slice(0,3).join(' / ')}</span></div>;
}