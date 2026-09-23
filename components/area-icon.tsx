import { Code2, Braces, ShieldCheck, Layers, Terminal, Database, Cloud, Cpu, type LucideProps } from 'lucide-react';
import type { AreaIcon as AreaIconName } from '@/lib/content';

const icons = { code: Code2, braces: Braces, shield: ShieldCheck, layers: Layers, terminal: Terminal, database: Database, cloud: Cloud, cpu: Cpu };

export function AreaIcon({ name, ...props }: { name: AreaIconName } & LucideProps) {
  const Icon = icons[name] ?? Code2;
  return <Icon {...props}/>;
}
