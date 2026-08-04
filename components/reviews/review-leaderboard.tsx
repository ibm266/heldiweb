import {
  PROTEIN_GRAMS_PER_TBSP,
  displayStandings,
  reviewProteinGrams
} from "@/lib/reviews";
import { SHOWCASE_MODE } from "@/lib/showcase";

// The spoonboard: who stirred the most protein into one pot. Until real
// reviews arrive the standings are invented people, so they appear only in
// showcase mode (lib/showcase.ts) and the table renders nothing otherwise.
export function ReviewLeaderboard() {
  const rows = displayStandings();
  if (rows.length === 0) return null;

  return (
    <div className="leaderboard">
      <header className="leaderboard__header">
        <p className="eyebrow">THE IPL</p>
        <h3>The Indian Protein League.</h3>
        <p>
          Most protein stirred into one pot. Every review asks for your spoon
          count. One heaped tablespoon is {PROTEIN_GRAMS_PER_TBSP}g of protein,
          and the league table does the rest.
        </p>
      </header>

      <ol className="leaderboard__list">
        {rows.map((row, index) => (
          <li key={`${row.author}-${row.dish}`} className="leaderboard__row">
            <span className="leaderboard__rank" aria-hidden="true">
              {index + 1}
            </span>
            <span className="leaderboard__who">
              <strong>{row.author}</strong>
              {row.location ? <span> · {row.location}</span> : null}
            </span>
            <span className="leaderboard__dish">
              {row.tablespoons} heaped tbsp into {row.dish}
            </span>
            <span className="leaderboard__grams">
              +{reviewProteinGrams(row.tablespoons)}g
            </span>
          </li>
        ))}
      </ol>

      <p className="leaderboard__note">
        {SHOWCASE_MODE
          ? "Sample standings, shown here to lay the table out. Not real people, and never shown to a customer."
          : "Review with a photo or video and your spoon count to enter the league."}
      </p>
    </div>
  );
}
