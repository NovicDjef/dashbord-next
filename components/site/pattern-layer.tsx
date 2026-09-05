import { PATTERN_PLACES, PATTERN_SYMBOLS, PATTERN_TILE } from "./pattern-icons";

// Nombre de tuiles rendues : 4 × 4 tuiles de 640 px couvrent tout écran jusqu'à 2560 px.
const COLS = 4;
const ROWS = 4;

/**
 * Fond animé Koursier : couche fixe derrière toute la page.
 * Chaque icône frémit brièvement à son propre rythme, et un scooter traverse l'écran de temps en temps.
 * Rendu côté serveur, sans JavaScript ; les animations sont en CSS et coupées si l'utilisateur préfère moins de mouvement.
 */
export function PatternLayer() {
  const uses: React.ReactNode[] = [];
  let i = 0;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      for (const p of PATTERN_PLACES) {
        const x = c * PATTERN_TILE + p.x;
        const y = r * PATTERN_TILE + p.y;
        // Décalage et durée propres à chaque icône : elles ne bougent jamais toutes en même temps.
        const delay = (i * 7.3) % 29;
        const duration = 24 + (i % 6) * 2;
        uses.push(
          <g key={i} transform={`translate(${x} ${y}) rotate(${p.rotate} 24 24) scale(${p.scale})`}>
            <use href={`#kp-${p.id}`} width="48" height="48" className={`kp-icon ${p.tone === "o" ? "kp-orange" : "kp-green"}`} style={{ animationDelay: `-${delay}s`, animationDuration: `${duration}s` }} />
          </g>,
        );
        i++;
      }
    }
  }

  return (
    <div className="pattern-layer" aria-hidden="true">
      <svg className="pattern-layer-svg" width={COLS * PATTERN_TILE} height={ROWS * PATTERN_TILE} viewBox={`0 0 ${COLS * PATTERN_TILE} ${ROWS * PATTERN_TILE}`} fill="none" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <defs>
          {Object.entries(PATTERN_SYMBOLS).map(([id, body]) => (
            <symbol key={id} id={`kp-${id}`} viewBox="0 0 48 48" dangerouslySetInnerHTML={{ __html: body }} />
          ))}
        </defs>
        {uses}
      </svg>
      {/* Le livreur qui passe */}
      <div className="pattern-rider">
        <svg viewBox="0 0 48 48" width="72" height="72" fill="none" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <use href="#kp-scooter" width="48" height="48" />
        </svg>
      </div>
    </div>
  );
}
