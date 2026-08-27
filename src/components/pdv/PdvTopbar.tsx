interface Props {
  onHome: () => void;
}

export default function PdvTopbar({ onHome }: Props) {
  return (
    <div className="g-topbar">
      <div className="g-topbar-inner">
        <div className="g-brand">
          <button
            className="g-brand-logo g-brand-back"
            onClick={onHome}
            title="Voltar à tela inicial"
            aria-label="Voltar à tela inicial"
          >
            ←
          </button>
          <span>Wake PDV</span>
        </div>
      </div>
    </div>
  );
}
