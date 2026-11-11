import type { Locale } from "./content";

// Boxed asides a pink-paper post can carry (front-matter `aside`, rendered
// by components/pink-paper.tsx). Structured rather than MDX: the box sits
// outside the article's text flow, in its own panel, and every locale's
// copy has the same shape.

export type CostAside = {
  steps: string[];
  formula: { total: string; fixed: string; variable: string };
  /** Each term of the formula, explained. `lands` is set in bold after
   *  the explanation: where capex and marginal cost sit. */
  terms: { term: string; text: string; lands?: string }[];
};

const WORST_BUSINESS: Record<Locale, CostAside> = {
  en: {
    steps: [
      "The higher the upfront investment, the higher the risk.",
      "When there is competition, customers choose on price.",
      "There is an incentive to cut prices.",
      "When customers choose on price, the only way to recover or pay off the capex is to survive, and so to sell more: cut prices and add capacity, to take customers from the competition or keep your own.",
      "That raises total capacity: supply outstrips demand, so prices fall…",
      "The spiral only stops when prices can’t fall any further without losing money in the short term.",
      "When market share is all that matters, paying creditors stops being a priority.",
      "Investors lose.",
    ],
    formula: {
      total: "Average total cost",
      fixed: "Average fixed cost",
      variable: "Average variable cost",
    },
    terms: [
      {
        term: "Average total cost",
        text: "Total cost divided by the number of units produced.",
      },
      {
        term: "Average fixed cost",
        text: "Fixed costs, the ones that do not change with the quantity produced, divided by the number of units produced.",
        lands: "Capex goes here.",
      },
      {
        term: "Average variable cost",
        text: "Variable costs, the ones that change with the quantity produced, divided by the number of units produced.",
        lands: "Marginal cost, the cost of producing one more unit, goes here.",
      },
    ],
  },
  de: {
    steps: [
      "Je höher die Anfangsinvestition, desto höher das Risiko.",
      "Gibt es Wettbewerb, entscheiden die Kunden nach dem Preis.",
      "Es gibt einen Anreiz, die Preise zu senken.",
      "Wenn die Kunden nach dem Preis entscheiden, führt der einzige Weg, die Capex wieder hereinzuholen oder abzubezahlen, übers Überleben, also über mehr Absatz: Preise senken und Kapazität ausbauen, um der Konkurrenz Kunden abzunehmen oder die eigenen zu halten.",
      "Das erhöht die Gesamtkapazität: Das Angebot übersteigt die Nachfrage, also fallen die Preise …",
      "Die Spirale endet erst, wenn sich der Preis nicht weiter senken lässt, ohne kurzfristig Geld zu verlieren.",
      "Wenn nur noch der Marktanteil zählt, hat es keine Priorität mehr, die Gläubiger zu bezahlen.",
      "Die Investoren verlieren.",
    ],
    formula: {
      total: "Durchschnittliche Gesamtkosten",
      fixed: "Durchschnittliche Fixkosten",
      variable: "Durchschnittliche variable Kosten",
    },
    terms: [
      {
        term: "Durchschnittliche Gesamtkosten",
        text: "Die Gesamtkosten geteilt durch die Anzahl der produzierten Einheiten.",
      },
      {
        term: "Durchschnittliche Fixkosten",
        text: "Die Fixkosten, also die Kosten, die sich nicht mit der produzierten Menge ändern, geteilt durch die Anzahl der produzierten Einheiten.",
        lands: "Hierhin gehört die Capex.",
      },
      {
        term: "Durchschnittliche variable Kosten",
        text: "Die variablen Kosten, also die Kosten, die sich mit der produzierten Menge ändern, geteilt durch die Anzahl der produzierten Einheiten.",
        lands: "Hierhin gehören die Grenzkosten, die Kosten einer zusätzlich produzierten Einheit.",
      },
    ],
  },
  ca: {
    steps: [
      "Com més alta és la inversió inicial, més alt és el risc.",
      "Si hi ha competència, els clients decideixen segons el preu.",
      "Hi ha un incentiu per abaixar preus.",
      "Quan els clients decideixen segons el preu, l’única possibilitat de recobrar o pagar el CAPEX passa per sobreviure i, per tant, per vendre més: abaixar preus i augmentar la capacitat, per poder prendre els clients a la competència o mantenir els actuals.",
      "Això duu a un augment de la capacitat total: l’oferta és superior a la demanda i, per tant, els preus baixen…",
      "Aquesta espiral només s’atura quan el preu no es pot abaixar més sense perdre-hi doblers a curt termini.",
      "Quan el focus és només la quota de mercat, pagar els creditors deixa de ser prioritari.",
      "Els inversors hi perden.",
    ],
    formula: {
      total: "Cost total mitjà",
      fixed: "Cost fix mitjà",
      variable: "Cost variable mitjà",
    },
    terms: [
      {
        term: "Cost total mitjà",
        text: "El cost total dividit pel nombre d’unitats produïdes.",
      },
      {
        term: "Cost fix mitjà",
        text: "Els costos fixos, els que no canvien amb la quantitat produïda, dividits pel nombre d’unitats produïdes.",
        lands: "Aquí hi va el CAPEX.",
      },
      {
        term: "Cost variable mitjà",
        text: "Els costos variables, els que canvien amb la quantitat produïda, dividits pel nombre d’unitats produïdes.",
        lands: "Aquí hi va el cost marginal, el cost de produir una unitat més.",
      },
    ],
  },
};

export const ASIDES = { "worst-business": WORST_BUSINESS } as const;

export type AsideKey = keyof typeof ASIDES;

export function isAsideKey(key: unknown): key is AsideKey {
  return typeof key === "string" && Object.hasOwn(ASIDES, key);
}
