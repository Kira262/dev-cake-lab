export function DessertArt({ type, large }) {
  return (
    <div className={`dessert-art art-${type} ${large ? "large" : ""}`}>
      <div className="art-shadow" />
      <div className="art-main" />
      <div className="art-icing" />
      <div className="art-detail one" />
      <div className="art-detail two" />
      <div className="art-detail three" />
    </div>
  );
}
