export function PageHeader({ eyebrow, title, description, actions, className = '' }) {
  return (
    <header className={`page-header ${className}`.trim()}>
      <div className="page-header__copy">
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h1 className="page-header__title">{title}</h1>
        {description ? <p className="page-header__description">{description}</p> : null}
      </div>
      {actions ? <div className="page-header__actions">{actions}</div> : null}
    </header>
  );
}

export function SectionLabel({ children, action }) {
  return (
    <div className="section-label">
      <span>{children}</span>
      <span className="section-label__rule" aria-hidden="true" />
      {action}
    </div>
  );
}
