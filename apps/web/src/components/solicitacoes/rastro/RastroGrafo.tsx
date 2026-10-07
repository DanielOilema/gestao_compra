import React, { useLayoutEffect, useRef, useState } from "react";
import { colunasDoRastro, type RastroNo, type RastroSolicitacaoGrafo } from "@gestao-compra/shared";
import { cn } from "@gestao-compra/ui";

interface RastroGrafoProps {
  grafo: RastroSolicitacaoGrafo;
  onSelect: (id: string) => void;
}

interface RastroTraco {
  id: string;
  d: string;
}

const ponto = (container: HTMLElement, el: HTMLElement, lado: "direita" | "esquerda") => {
  const raiz = container.getBoundingClientRect();
  const caixa = el.getBoundingClientRect();
  return {
    x: (lado === "direita" ? caixa.right : caixa.left) - raiz.left + container.scrollLeft,
    y: caixa.top + caixa.height / 2 - raiz.top + container.scrollTop,
  };
};

const tracoEntre = (x1: number, y1: number, x2: number, y2: number): string => {
  const dx = Math.max(24, Math.abs(x2 - x1) / 2);
  return `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
};

const RastroCard: React.FC<{
  no: RastroNo;
  onSelect: (id: string) => void;
  registrar: (id: string, el: HTMLButtonElement | null) => void;
}> = ({ no, onSelect, registrar }) => {
  const status = no.tipo === "nota" ? no.documento.status : undefined;
  return (
    <button
      type="button"
      ref={(el) => registrar(no.id, el)}
      onClick={() => onSelect(no.id)}
      className={cn(
        "w-full rounded-md border-2 border-foreground bg-card px-3 py-3 text-center shadow-sm",
        "hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "md:w-44",
      )}
    >
      <span className="block text-sm font-semibold text-foreground">{no.titulo}</span>
      <span className="mt-1 block break-words text-xs text-muted-foreground">{no.subtitulo}</span>
      {status ? <span className="mt-1 block text-[11px] font-medium text-foreground">{status}</span> : null}
    </button>
  );
};

const RastroGrafo: React.FC<RastroGrafoProps> = ({ grafo, onSelect }) => {
  const colunas = colunasDoRastro(grafo);
  const containerRef = useRef<HTMLDivElement>(null);
  const nosRef = useRef(new Map<string, HTMLButtonElement>());
  const [tracos, setTracos] = useState<RastroTraco[]>([]);
  const [tamanho, setTamanho] = useState({ w: 0, h: 0 });

  const registrar = (id: string, el: HTMLButtonElement | null) => {
    if (el) nosRef.current.set(id, el);
    else nosRef.current.delete(id);
  };

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const medir = () => {
      const media = typeof window.matchMedia === "function" ? window.matchMedia("(min-width: 768px)") : undefined;
      const desktop = media?.matches ?? false;
      if (!desktop) {
        setTracos((atual) => (atual.length === 0 ? atual : []));
        return;
      }
      const proximos: RastroTraco[] = [];
      for (const ligacao of grafo.ligacoes) {
        const origem = nosRef.current.get(ligacao.origemId);
        const destino = nosRef.current.get(ligacao.destinoId);
        if (!origem || !destino) continue;
        const inicio = ponto(container, origem, "direita");
        const fim = ponto(container, destino, "esquerda");
        proximos.push({
          id: `${ligacao.origemId}>${ligacao.destinoId}`,
          d: tracoEntre(inicio.x, inicio.y, fim.x, fim.y),
        });
      }
      setTracos((atual) => {
        if (
          atual.length === proximos.length &&
          atual.every((item, index) => item.id === proximos[index]?.id && item.d === proximos[index]?.d)
        ) {
          return atual;
        }
        return proximos;
      });
      const w = container.scrollWidth;
      const h = container.scrollHeight;
      setTamanho((atual) => (atual.w === w && atual.h === h ? atual : { w, h }));
    };

    medir();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(medir);
    observer.observe(container);
    return () => observer.disconnect();
  }, [grafo]);

  return (
    <div ref={containerRef} className="relative" role="group" aria-label="Rastro da solicitação">
      {tracos.length > 0 ? (
        <svg
          className="pointer-events-none absolute left-0 top-0 hidden text-foreground md:block"
          width={tamanho.w}
          height={tamanho.h}
          aria-hidden="true"
        >
          {tracos.map((traco) => (
            <path key={traco.id} d={traco.d} fill="none" stroke="currentColor" strokeWidth="2" />
          ))}
        </svg>
      ) : null}
      <div className="relative flex flex-col gap-8 md:flex-row md:items-center md:gap-16">
        {colunas.map((coluna) => (
          <div key={coluna.id} className="flex flex-col gap-4 md:gap-6">
            {coluna.nos.map((no) => (
              <RastroCard key={no.id} no={no} onSelect={onSelect} registrar={registrar} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RastroGrafo;
