function DashboardCard({ titulo, valor, icone }) {
  return (
    <div className="card-dashboard">
      <div className="icone">
        {icone}
      </div>

      <div>
        <h3>{titulo}</h3>
        <p>{valor}</p>
      </div>
    </div>
  );
}

export default DashboardCard;