import Image from "next/image";
import { CopyHighlight } from "@/components/copy-highlight";

type TickRow = {
  kind: "tick";
  label: string;
};

type TextRow = {
  kind: "text";
  label: string;
  heldi: string;
  shakes: string;
};

type ComparisonRow = TickRow | TextRow;

const TICK_ROWS: TickRow[] = [
  { kind: "tick", label: "Stirs straight into home cooking" },
  { kind: "tick", label: "Developed with desi home cooks" },
  { kind: "tick", label: "Aunty & uncle approved" },
  { kind: "tick", label: "Zero new habits required" }
];

const TEXT_ROWS: TextRow[] = [
  {
    kind: "text",
    label: "How you take it",
    heldi: "One spoonful, stirred into your plate",
    shakes: "Shake, gulp, rinse, repeat"
  },
  {
    kind: "text",
    label: "Aftertaste",
    heldi: "None. It disappears into the masala",
    shakes: "Fake vanilla until your next chai"
  },
  {
    kind: "text",
    label: "Flavours",
    heldi: "Cumin, turmeric, garam masala",
    shakes: "Birthday Cake Blast\u2122"
  },
  {
    kind: "text",
    label: "On the label",
    heldi: "90% whey isolate, the rest is spices you already know",
    shakes: "Sweeteners, gums and 'natural flavourings'"
  },
  {
    kind: "text",
    label: "Washing up",
    heldi: "A spoon",
    shakes: "That shaker. You know the smell."
  },
  {
    kind: "text",
    label: "Who it feeds",
    heldi: "The whole table",
    shakes: "Whoever owns the shaker"
  }
];

const ALL_ROWS: ComparisonRow[] = [...TICK_ROWS, ...TEXT_ROWS];

const ELEPHANT_ICON = "/images/comparison/elephant-icon.png";
const SHAKER_ICON = "/images/comparison/shaker-icon.png";
const POUCH_SHOT = "/images/comparison/heldi-pouch.png";

function TickMark({ yes }: { yes: boolean }) {
  return (
    <span
      className={`vs-mark ${yes ? "vs-mark--yes" : "vs-mark--no"}`}
      role="img"
      aria-label={yes ? "Yes" : "No"}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        {yes ? (
          <path
            d="M5.5 12.5 10 17l8.5-10"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : (
          <path
            d="M7 7l10 10M17 7 7 17"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
        )}
      </svg>
    </span>
  );
}

function SideIcon({
  side,
  className
}: {
  side: "heldi" | "shakes";
  className?: string;
}) {
  const isHeldi = side === "heldi";
  const src = isHeldi ? ELEPHANT_ICON : SHAKER_ICON;
  const dims = isHeldi
    ? { width: 270, height: 280 }
    : { width: 256, height: 256 };

  return (
    <span
      className={`vs-side-icon ${className ?? ""}`}
      role="img"
      aria-label={isHeldi ? "Heldi" : "Protein shakes"}
    >
      <Image
        src={src}
        alt=""
        width={dims.width}
        height={dims.height}
        aria-hidden="true"
      />
    </span>
  );
}

function DesktopTable() {
  return (
    <div className="vs-table-card">
      <div className="vs-table" role="table" aria-label="Heldi versus protein shakes">
        <div className="vs-table__panel" aria-hidden="true" />
        <div className="vs-table__pouch" aria-hidden="true">
          <div className="vs-table__pouch-frame">
            <Image
              src={POUCH_SHOT}
              alt=""
              width={420}
              height={546}
            />
          </div>
        </div>

        <div className="vs-table__head" role="row">
          <div className="vs-table__feature" role="columnheader">
            <span className="sr-only">Feature</span>
          </div>
          <div className="vs-table__heldi" role="columnheader">
            <span className="sr-only">Heldi</span>
          </div>
          <div className="vs-table__shakes" role="columnheader">
            <SideIcon side="shakes" className="vs-side-icon--head vs-side-icon--muted" />
            <span className="vs-table__shakes-name">Protein shakes</span>
          </div>
        </div>

        {ALL_ROWS.map((row) => (
          <div className="vs-table__row" role="row" key={row.label}>
            <div className="vs-table__feature" role="rowheader">
              {row.label}
            </div>
            {row.kind === "tick" ? (
              <>
                <div className="vs-table__heldi" role="cell">
                  <TickMark yes />
                </div>
                <div className="vs-table__shakes" role="cell">
                  <TickMark yes={false} />
                </div>
              </>
            ) : (
              <>
                <div className="vs-table__heldi vs-table__heldi--text" role="cell">
                  {row.heldi}
                </div>
                <div className="vs-table__shakes vs-table__shakes--text" role="cell">
                  {row.shakes}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function MobileScorecard() {
  return (
    <div className="vs-scorecard">
      <div
        className="vs-scorecard__grid"
        role="table"
        aria-label="Heldi versus protein shakes scorecard"
      >
        <div className="vs-scorecard__panel" aria-hidden="true" />
        <div className="vs-scorecard__pouch" aria-hidden="true">
          <div className="vs-scorecard__pouch-frame">
            <Image src={POUCH_SHOT} alt="" width={420} height={546} />
          </div>
        </div>

        <div className="vs-scorecard__head" role="row">
          <div className="vs-scorecard__intro" role="columnheader">
            <span className="sr-only">Feature</span>
          </div>
          <div className="vs-scorecard__heldi" role="columnheader">
            <span className="sr-only">Heldi</span>
          </div>
          <div className="vs-scorecard__shakes" role="columnheader">
            <SideIcon side="shakes" className="vs-side-icon--muted" />
            <span>Shakes</span>
          </div>
        </div>
        {TICK_ROWS.map((row) => (
          <div className="vs-scorecard__row" role="row" key={row.label}>
            <div className="vs-scorecard__label" role="rowheader">
              {row.label}
            </div>
            <div className="vs-scorecard__heldi" role="cell">
              <TickMark yes />
            </div>
            <div className="vs-scorecard__shakes" role="cell">
              <TickMark yes={false} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MobileCards() {
  return (
    <div
      className="vs-cards"
      role="table"
      aria-label="Heldi versus protein shakes details"
    >
      {TEXT_ROWS.map((row) => (
        <article className="vs-card" role="row" key={row.label}>
          <p className="vs-card__label" role="rowheader">
            {row.label}
          </p>
          <div className="vs-card__heldi" role="cell">
            <SideIcon side="heldi" />
            <p>{row.heldi}</p>
          </div>
          <div className="vs-card__shakes" role="cell">
            <SideIcon side="shakes" />
            <p>{row.shakes}</p>
          </div>
        </article>
      ))}
    </div>
  );
}

export function ComparisonSection() {
  return (
    <section className="section section--ink" id="vs-shaker">
      <div className="content vs">
        <header className="vs__header">
          <p className="eyebrow eyebrow--gold">HELDI VS THE SHAKER</p>
          <h2>
            Reasons to stop shaking and{" "}
            <CopyHighlight>start stirring</CopyHighlight>
          </h2>
          <p className="vs__lede">
            The first protein made with spices and flavours Indians actually
            like. Shakes were never developed for the desi palate, here are a
            few more reasons to give Heldi a try.
          </p>
        </header>

        <div className="vs__desktop">
          <DesktopTable />
        </div>

        <div className="vs__mobile">
          <MobileScorecard />
          <MobileCards />
        </div>
      </div>
    </section>
  );
}
