"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CopyHighlight } from "@/components/copy-highlight";

type DishItem = {
  name: string;
  grams: number;
  heldi?: boolean;
};

type CourseSection = {
  label: "TO START" | "THE MAIN" | "ON THE SIDE";
  dishes: DishItem[];
};

type MenuVariant = {
  id: string;
  label: string;
  mainDish: DishItem;
  foodTotal: number;
  tableTotal: number;
};

type Menu = {
  id: string;
  title: string;
  tag: "LUNCH" | "DINNER";
  scheme: "cream" | "marigold";
  courses: CourseSection[];
  foodTotal: number;
  heldiTbsp: number;
  heldiTotal: number;
  tableTotal: number;
  variants?: {
    label: string;
    options: MenuVariant[];
  };
};

const CARD_STEP = 304;

const MENUS: Menu[] = [
  {
    id: "weeknight-dinner",
    title: "The Weeknight Dinner",
    tag: "DINNER",
    scheme: "cream",
    foodTotal: 36,
    heldiTbsp: 4,
    heldiTotal: 40,
    tableTotal: 76,
    courses: [
      {
        label: "TO START",
        dishes: [{ name: "Papad & chutney", grams: 4 }]
      },
      {
        label: "THE MAIN",
        dishes: [{ name: "Dal tadka", grams: 18, heldi: true }]
      },
      {
        label: "ON THE SIDE",
        dishes: [
          { name: "Jeera rice", grams: 8 },
          { name: "Cucumber raita", grams: 6, heldi: true }
        ]
      }
    ]
  },
  {
    id: "saturday-lunch",
    title: "The Saturday Lunch",
    tag: "LUNCH",
    scheme: "marigold",
    foodTotal: 40,
    heldiTbsp: 6,
    heldiTotal: 60,
    tableTotal: 100,
    courses: [
      {
        label: "TO START",
        dishes: [{ name: "Aloo chaat", grams: 8, heldi: true }]
      },
      {
        label: "THE MAIN",
        dishes: [{ name: "Chana masala", grams: 16, heldi: true }]
      },
      {
        label: "ON THE SIDE",
        dishes: [
          { name: "Steamed rice", grams: 6 },
          { name: "Bowl of dahi", grams: 10, heldi: true }
        ]
      }
    ]
  },
  {
    id: "friday-feast",
    title: "The Friday Feast",
    tag: "DINNER",
    scheme: "cream",
    foodTotal: 46,
    heldiTbsp: 4,
    heldiTotal: 40,
    tableTotal: 86,
    courses: [
      {
        label: "TO START",
        dishes: [{ name: "Vegetable samosa", grams: 6 }]
      },
      {
        label: "THE MAIN",
        dishes: [{ name: "Paneer butter masala", grams: 24, heldi: true }]
      },
      {
        label: "ON THE SIDE",
        dishes: [
          { name: "Jeera rice", grams: 8 },
          { name: "Boondi raita", grams: 8, heldi: true }
        ]
      }
    ],
    variants: {
      label: "SELECT YOUR MAIN",
      options: [
        {
          id: "veg",
          label: "VEG",
          mainDish: { name: "Paneer butter masala", grams: 24, heldi: true },
          foodTotal: 46,
          tableTotal: 86
        },
        {
          id: "non-veg",
          label: "NON-VEG",
          mainDish: { name: "Butter chicken", grams: 40, heldi: true },
          foodTotal: 62,
          tableTotal: 102
        }
      ]
    }
  },
  {
    id: "light-lunch",
    title: "The Light Lunch",
    tag: "LUNCH",
    scheme: "marigold",
    foodTotal: 36,
    heldiTbsp: 4,
    heldiTotal: 40,
    tableTotal: 76,
    courses: [
      {
        label: "TO START",
        dishes: [{ name: "Khaman dhokla", grams: 8 }]
      },
      {
        label: "THE MAIN",
        dishes: [{ name: "Kadhi", grams: 14, heldi: true }]
      },
      {
        label: "ON THE SIDE",
        dishes: [
          { name: "Khichdi", grams: 10, heldi: true },
          { name: "Roasted papad", grams: 4 }
        ]
      }
    ]
  },
  {
    id: "sunday-thali",
    title: "The Sunday Thali",
    tag: "DINNER",
    scheme: "cream",
    foodTotal: 46,
    heldiTbsp: 6,
    heldiTotal: 60,
    tableTotal: 106,
    courses: [
      {
        label: "TO START",
        dishes: [{ name: "Samosa chaat", grams: 10, heldi: true }]
      },
      {
        label: "THE MAIN",
        dishes: [{ name: "Dal makhani", grams: 22, heldi: true }]
      },
      {
        label: "ON THE SIDE",
        dishes: [
          { name: "Two rotis", grams: 8 },
          { name: "Cucumber raita", grams: 6, heldi: true }
        ]
      }
    ]
  }
];

type MenuGalleryProps = {
  gramsPerTbsp: number;
};

function dishGrams(
  dish: DishItem,
  gramsPerTbsp: number,
  heldiTbsp: number,
  heldiDishCount: number
) {
  if (!dish.heldi || heldiDishCount === 0) return dish.grams;
  const tbspPerDish = heldiTbsp / heldiDishCount;
  return dish.grams + Math.round(tbspPerDish * gramsPerTbsp);
}

function MenuCard({
  menu,
  gramsPerTbsp,
  variantId,
  onVariantChange
}: {
  menu: Menu;
  gramsPerTbsp: number;
  variantId?: string;
  onVariantChange?: (id: string) => void;
}) {
  const activeVariant =
    menu.variants?.options.find((option) => option.id === variantId) ??
    menu.variants?.options[0];

  const courses = menu.courses.map((course) => {
    if (course.label !== "THE MAIN" || !activeVariant) return course;
    return {
      ...course,
      dishes: [activeVariant.mainDish]
    };
  });

  const foodTotal = activeVariant?.foodTotal ?? menu.foodTotal;
  const heldiTotal = menu.heldiTotal;
  const tableTotal = activeVariant?.tableTotal ?? menu.tableTotal;
  const heldiDishCount = courses.reduce(
    (count, course) => count + course.dishes.filter((dish) => dish.heldi).length,
    0
  );

  return (
    <article
      className={`menu-card menu-card--${menu.scheme}`}
      aria-label={menu.title}
    >
      <span className="menu-card__tag">{menu.tag}</span>
      <h3 className="menu-card__title">{menu.title}</h3>
      <div className="menu-card__rule" aria-hidden="true" />

      {menu.variants ? (
        <div className="menu-card__variants">
          <p className="menu-card__variants-label">{menu.variants.label}</p>
          <div
            className="menu-card__variant-chips"
            role="radiogroup"
            aria-label={menu.variants.label}
          >
            {menu.variants.options.map((option) => {
              const selected = activeVariant?.id === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  className={`menu-card__variant-chip${selected ? " is-active" : ""}`}
                  onClick={() => onVariantChange?.(option.id)}
                >
                  {selected ? "✓ " : ""}
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="menu-card__courses">
        {courses.map((course) => (
          <section className="menu-card__course" key={course.label}>
            <h4>{course.label}</h4>
            <ul>
              {course.dishes.map((dish) => (
                <li
                  className={dish.heldi ? "menu-card__dish menu-card__dish--heldi" : "menu-card__dish"}
                  key={dish.name}
                >
                  <span className="menu-card__dish-name">{dish.name}</span>
                  <span className="menu-card__dish-leader" aria-hidden="true" />
                  <span className="menu-card__dish-grams">
                    {dishGrams(dish, gramsPerTbsp, menu.heldiTbsp, heldiDishCount)}g
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <div className="menu-card__summary">
        <p className="menu-card__from-food">
          <span>From the food</span>
          <strong>{foodTotal}g</strong>
        </p>
        <div className="menu-card__heldi-band">
          <span className="menu-card__heldi-label">
            Boosted with Heldi · {menu.heldiTbsp} tbsp
          </span>
          <strong className="menu-card__heldi-value">+{heldiTotal}g</strong>
        </div>
        <p className="menu-card__table-total">
          <span>ON THE TABLE</span>
          <span className="menu-card__grams-stat menu-card__grams-stat--table">
            <strong>{tableTotal}g</strong>
            <span className="menu-card__grams-note">of protein</span>
          </span>
        </p>
      </div>
    </article>
  );
}

export function MenuGallery({ gramsPerTbsp }: MenuGalleryProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [variantByMenu, setVariantByMenu] = useState<Record<string, string>>({
    "friday-feast": "veg"
  });
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    function sync() {
      setReducedMotion(media.matches);
    }
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  const handleScroll = useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    setActiveIndex(Math.round(scroller.scrollLeft / CARD_STEP));
  }, []);

  function scrollToCard(index: number) {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    scroller.scrollTo({
      left: index * CARD_STEP,
      behavior: reducedMotion ? "auto" : "smooth"
    });
  }

  return (
    <div className="menu-gallery">
      <header className="menu-gallery__header">
        <p className="eyebrow eyebrow--gold">PUT IT ON THE TABLE</p>
        <h2>Lunch and dinner menus.</h2>
        <p className="menu-gallery__lede">
          <strong>Five ways to lay the table.</strong> Gold dishes are{" "}
          <CopyHighlight>boosted with Heldi</CopyHighlight>,{" "}
          <strong>counted for a couple.</strong>
        </p>
      </header>

      <div
        className="menu-gallery__scroller"
        ref={scrollerRef}
        onScroll={handleScroll}
      >
        {MENUS.map((menu) => (
          <MenuCard
            key={menu.id}
            menu={menu}
            gramsPerTbsp={gramsPerTbsp}
            variantId={variantByMenu[menu.id]}
            onVariantChange={(id) =>
              setVariantByMenu((current) => ({ ...current, [menu.id]: id }))
            }
          />
        ))}
      </div>

      <div className="menu-gallery__dots" role="tablist" aria-label="Menu cards">
        {MENUS.map((menu, index) => (
          <button
            key={menu.id}
            type="button"
            role="tab"
            className={`menu-gallery__dot${index === activeIndex ? " is-active" : ""}`}
            aria-label={`Menu ${index + 1} of ${MENUS.length}`}
            aria-selected={index === activeIndex}
            onClick={() => scrollToCard(index)}
          />
        ))}
      </div>
    </div>
  );
}
