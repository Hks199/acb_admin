const PageHeading = ({ title, description, section = 'Catalog' }) => (
  <div className="page-heading">
    <p className="page-eyebrow">{section}</p>
    <h1>{title}</h1>
    <p className="page-description">{description}</p>
  </div>
);

export default PageHeading;
