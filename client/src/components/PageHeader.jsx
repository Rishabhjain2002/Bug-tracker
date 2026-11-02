// Title row at the top of each page, with an optional action button on the right
export default function PageHeader({ title, subtitle, breadcrumb, action }) {
  return (
    <div className="page-header">
      <div>
        {breadcrumb && <p className="breadcrumb">{breadcrumb}</p>}
        <h1>{title}</h1>
        {subtitle && <p className="muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
