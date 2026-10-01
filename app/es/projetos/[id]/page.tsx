import { ProjectPage, projectMetadata } from '@/components/project-page';
export const revalidate = 3600;
type Props = { params: Promise<{ id: string }> };
export async function generateMetadata({ params }: Props) { return projectMetadata('es', (await params).id); }
export default async function Page({ params }: Props) { return <ProjectPage locale="es" id={(await params).id}/>; }
