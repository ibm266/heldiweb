"use client";

import { useEffect, useRef } from "react";
import type { NutritionProduct } from "./nutrition-data";

// One modal for every pouch. The product passes its own bundle (KHANA_NUTRITION
// or CHAI_NUTRITION), so nothing in here can quietly show one product's
// figures on the other's page.
export function NutritionModal({
  onClose,
  product
}: {
  onClose: () => void;
  product: NutritionProduct;
}) {
  const { formula, servingLabel, aminoServingLabel, rows, aminoRows, riFootnote, basisNote, productName } =
    product;
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    panelRef.current?.focus();
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="nutri-overlay" onClick={onClose}>
      <div
        className="nutri-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Nutrition and amino acid profile"
        ref={panelRef}
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="nutri-modal__header">
          <h2>Nutrition</h2>
          <button
            className="nutri-modal__close"
            type="button"
            onClick={onClose}
            aria-label="Close nutrition information"
          >
            ×
          </button>
        </header>

        <p className="nutri-formula">
          <strong>Formula:</strong> {formula}
        </p>
        <p className="nutri-complete">
          {productName} is a <strong>complete protein</strong>: every serving
          carries all nine essential amino acids.
        </p>
        <p className="nutri-footnote">{basisNote}</p>

        <table className="nutri-table">
          <caption className="sr-only">Nutrition declaration</caption>
          <thead>
            <tr>
              <th scope="col">Nutrition declaration</th>
              <th scope="col">Per 100g</th>
              <th scope="col">{servingLabel}</th>
              <th scope="col">%RI per serving*</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className={row.indent ? "nutri-table__indent" : undefined}>
                <th scope="row">{row.label}</th>
                <td>{row.per100g}</td>
                <td>{row.perServing}</td>
                <td>{row.riPerServing}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="nutri-footnote">{riFootnote}</p>

        <table className="nutri-table">
          <caption className="sr-only">Amino acid profile</caption>
          <thead>
            <tr>
              <th scope="col">Amino acid</th>
              <th scope="col">Per 100g</th>
              <th scope="col">{aminoServingLabel}</th>
            </tr>
          </thead>
          <tbody>
            {aminoRows.map((row) => (
              <tr key={row.name}>
                <th scope="row">
                  {row.name}
                  {row.essential ? "*" : ""}
                </th>
                <td>{row.per100g}</td>
                <td>{row.perServing}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="nutri-footnote">*Essential amino acid.</p>
      </div>
    </div>
  );
}
