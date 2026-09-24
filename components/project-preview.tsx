import { ShieldCheck, Plus } from 'lucide-react';

export function ProjectPreview({ kind, placeholder = false, image, imageMobile, alt = '' }: { kind: string; placeholder?: boolean; image?: string; imageMobile?: string; alt?: string }) {
  // <picture> lets phones download only the portrait cover and desktops only the wide one.
  if (image || imageMobile) return <div className={`project-preview has-image ${imageMobile ? 'has-mobile-image' : ''} ${kind}`}>
    <picture>
      {imageMobile && <source media="(max-width: 900px)" srcSet={imageMobile}/>}
      <img src={image || imageMobile} alt={alt} loading="lazy" decoding="async"/>
    </picture>
  </div>;
  if (placeholder) return <div className={`project-preview source-placeholder ${kind}`} aria-hidden="true">
    <div className="project-skeleton"><div className="skeleton-sidebar"><i/><i/><i/></div><div className="skeleton-content"><span/><div className="skeleton-grid"><i/><i/><i/></div><div className="skeleton-lines"><i/><i/><i/></div></div></div>
  </div>;
  return <div className={`project-preview ${kind}`} aria-hidden="true">
    <div className="mini-window"><div className="window-bar"><span/><span/><span/><b>{kind === 'security' ? 'sentinel / overview' : kind === 'workspace' ? 'nexus / workspace' : 'packet-lab — bash'}</b></div>
      {kind === 'security' ? <div className="security-ui"><div className="mini-side"><ShieldCheck size={17}/><i/><i/><i/><i/></div><div className="mini-main"><div className="mini-title">Security overview <span>LIVE</span></div><div className="mini-stats"><div>Events<b>1,284</b></div><div>Monitored<b>24</b></div><div>Health<b className="accent">98.6%</b></div></div><div className="chart">{[25,42,32,65,44,72,49,35,62,85,52,68,42,90,64,78,98,72,89,63,82,70].map((h,i)=><i key={i} style={{height:`${h}%`}}/>)}</div><div className="mini-bottom">NETWORK ACTIVITY <span>Last 24 hours</span></div></div></div> : kind === 'workspace' ? <div className="workspace-ui"><div className="mini-title">Project workspace <Plus size={12}/></div><div className="kanban">{['To do', 'In progress', 'Done'].map((col,i)=><div key={col}><label><i/>{col}</label>{[0,1,2].slice(0,i===1?2:3).map(n=><div className="kanban-card" key={n}><em/><span/><span/><div><b/ ><small>{['Design','Develop','Review'][i]}</small></div></div>)}</div>)}</div></div> : <div className="terminal-ui"><p><span>➜</span> ~/packet-lab <b>python analyze.py</b></p><p className="muted">Initializing network analysis...</p><p><span>[✓]</span> Interface initialized</p><p><span>[✓]</span> Capture loaded: lab_traffic.pcap</p><br/><p className="terminal-columns">PROTOCOL <span>PACKETS</span> STATUS</p><p>TCP <span>842</span> <strong>analyzed</strong></p><p>UDP <span>128</span> <strong>analyzed</strong></p><p>DNS <span>64</span> <strong>analyzed</strong></p><p className="prompt">➜ <i/></p></div>}
    </div>
  </div>;
}
