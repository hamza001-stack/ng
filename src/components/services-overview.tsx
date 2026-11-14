import Link from 'next/link';
import {
  ArrowUpRight,
  BrainCircuit,
  Workflow,
  Code2,
  Cloud,
  ShieldCheck,
  Smartphone,
  Database,
  MessagesSquare,
  Network,
  Layers3,
  Compass,
} from 'lucide-react';
import { services } from '@/lib/catalogue';
import { Button } from '@/components/ui/button';
const icons = [
  BrainCircuit,
  BrainCircuit,
  MessagesSquare,
  Database,
  Workflow,
  Layers3,
  Database,
  Layers3,
  Network,
  Code2,
  Smartphone,
  Code2,
  Cloud,
  ShieldCheck,
  Compass,
];
export function ServiceCards({ featured = false }: { featured?: boolean }) {
  const selected = featured
    ? [services[0], services[4], services[9]]
    : services;
  return (
    <div className="service-grid">
      {selected.map((s) => {
        const index = services.indexOf(s);
        const Icon = icons[index];
        return (
          <Link href={'/' + s[0]} key={s[0]} className="service-card">
            <div className="service-top">
              <span className="service-icon">
                <Icon size={25} />
              </span>
              <span className="service-number">
                {String(index + 1).padStart(2, '0')}
              </span>
            </div>
            <h3>{s[1]}</h3>
            <p>{s[2]}</p>
            <div className="service-bottom">
              <span>
                {index < 4
                  ? 'Intelligence & knowledge'
                  : index < 9
                    ? 'Connected operations'
                    : index < 12
                      ? 'Digital experiences'
                      : 'Strategy & infrastructure'}
              </span>
              <ArrowUpRight size={19} />
            </div>
          </Link>
        );
      })}
    </div>
  );
}
export function ServicesOverview() {
  return (
    <>
      <div className="section-toolbar">
        <p>From a focused pilot to a connected platform.</p>
        <a className="text-link" href="#service-catalogue">
          Explore 15 capabilities <ArrowUpRight size={16} />
        </a>
      </div>
      <div id="service-catalogue">
        <ServiceCards />
      </div>
      <div className="engagement-band">
        <div>
          <span className="eyebrow">A CLEAR WAY FORWARD</span>
          <h2>
            Expertise is only useful
            <br />
            when it moves you forward.
          </h2>
          <p>
            Define the outcome. Agree the scope. Build with a team that
            understands both.
          </p>
        </div>
        <Button asChild>
          <Link href="/contact">
            Discuss your project <ArrowUpRight size={18} />
          </Link>
        </Button>
      </div>
    </>
  );
}
