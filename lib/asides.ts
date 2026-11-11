import type { Locale } from "./content";

// Boxed asides a pink-paper post can carry (front-matter `aside`, rendered
// by components/pink-paper.tsx). Structured rather than MDX: the box sits
// outside the article's text flow, in its own panel, and every locale's
// copy has the same shape.

export type CostAside = {
  /** Heading over the numbered steps. */
  stepsTitle: string;
  steps: string[];
  /** Heading over the formula. */
  costsTitle: string;
  formula: { total: string; fixed: string; variable: string };
  /** Each term of the formula, explained. `lands` is set in bold after
   *  the explanation: where capex and marginal cost sit. */
  terms: { term: string; text: string; lands?: string }[];
  /** How the formula ties back to the steps. */
  note: string;
};

const WORST_BUSINESS: Record<Locale, CostAside> = {
  en: {
    stepsTitle: "How it ends in the worst business in the world",
    steps: [
      "The higher the upfront investment, the higher the risk.",
      "When there is competition, customers choose on price.",
      "So there is an incentive to cut prices.",
      "When customers choose on price, the only way to recover or pay off the capex is to survive, and so to sell more: cut prices and add capacity, to take customers from the competition or keep your own.",
      "That raises total capacity: supply outstrips demand, so prices fall…",
      "The spiral only stops when prices can’t fall any further without losing money in the short term.",
      "When market share is all that matters, paying creditors stops being a priority.",
      "Investors lose.",
    ],
    costsTitle: "Where the costs go",
    formula: {
      total: "Average total cost",
      fixed: "Average fixed cost",
      variable: "Average variable cost",
    },
    terms: [
      {
        term: "Average total cost",
        text: "Everything the firm spends, divided by the units it sells: tokens served, hours of compute rented. In the long run the price has to cover it, or the business loses money.",
      },
      {
        term: "Average fixed cost",
        text: "The costs that do not change with how much is sold, divided by the units sold: data centres, chips, training runs, written off as depreciation over their life. Selling more spreads them thinner, which is why everyone races for volume.",
        lands: "Capex goes here.",
      },
      {
        term: "Average variable cost",
        text: "The costs that rise with every unit sold, such as power, cooling and the compute to answer one more request, divided by the units sold. When each extra unit costs about the same, it equals the marginal cost: the cost of one more unit.",
        lands: "Marginal cost goes here.",
      },
    ],
    note: "Competition pushes the price down towards marginal cost (step 6). Above it, every sale still pays something towards the capex; at it, nothing does, and the fixed cost is never recovered (step 8).",
  },
  de: {
    stepsTitle: "Wie es im schlechtesten Geschäft der Welt endet",
    steps: [
      "Je höher die Anfangsinvestition, desto höher das Risiko.",
      "Gibt es Wettbewerb, entscheiden die Kunden nach dem Preis.",
      "Also gibt es einen Anreiz, die Preise zu senken.",
      "Wenn die Kunden nach dem Preis entscheiden, führt der einzige Weg, die Capex wieder hereinzuholen oder abzubezahlen, übers Überleben, also über mehr Absatz: Preise senken und Kapazität ausbauen, um der Konkurrenz Kunden abzunehmen oder die eigenen zu halten.",
      "Das erhöht die Gesamtkapazität: Das Angebot übersteigt die Nachfrage, also fallen die Preise …",
      "Die Spirale endet erst, wenn sich der Preis nicht weiter senken lässt, ohne kurzfristig Geld zu verlieren.",
      "Wenn nur noch der Marktanteil zählt, hat es keine Priorität mehr, die Gläubiger zu bezahlen.",
      "Die Investoren verlieren.",
    ],
    costsTitle: "Wohin die Kosten gehen",
    formula: {
      total: "Durchschnittliche Gesamtkosten",
      fixed: "Durchschnittliche Fixkosten",
      variable: "Durchschnittliche variable Kosten",
    },
    terms: [
      {
        term: "Durchschnittliche Gesamtkosten",
        text: "Alles, was das Unternehmen ausgibt, geteilt durch die verkauften Einheiten: ausgelieferte Tokens, vermietete Rechenstunden. Langfristig muss der Preis sie decken, sonst verliert das Geschäft Geld.",
      },
      {
        term: "Durchschnittliche Fixkosten",
        text: "Die Kosten, die sich nicht mit der verkauften Menge ändern, geteilt durch die verkauften Einheiten: Rechenzentren, Chips, Trainingsläufe, über ihre Lebensdauer abgeschrieben. Mehr Absatz verteilt sie auf mehr Einheiten, deshalb jagen alle dem Volumen nach.",
        lands: "Hierhin gehört die Capex.",
      },
      {
        term: "Durchschnittliche variable Kosten",
        text: "Die Kosten, die mit jeder verkauften Einheit steigen, etwa Strom, Kühlung und die Rechenleistung für eine weitere Anfrage, geteilt durch die verkauften Einheiten. Kostet jede weitere Einheit ungefähr gleich viel, entsprechen sie den Grenzkosten: den Kosten einer zusätzlichen Einheit.",
        lands: "Hierhin gehören die Grenzkosten.",
      },
    ],
    note: "Der Wettbewerb drückt den Preis Richtung Grenzkosten (Punkt 6). Darüber trägt jeder Verkauf noch etwas zur Capex bei; auf dieser Höhe nichts mehr, und die Fixkosten werden nie hereingeholt (Punkt 8).",
  },
  ca: {
    stepsTitle: "Com s’arriba al pitjor negoci del món",
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
    costsTitle: "On van els costos",
    formula: {
      total: "Cost total mitjà",
      fixed: "Cost fix mitjà",
      variable: "Cost variable mitjà",
    },
    terms: [
      {
        term: "Cost total mitjà",
        text: "Tot el que gasta l’empresa, dividit per les unitats que ven: tokens servits, hores de computació llogades. A llarg termini el preu l’ha de cobrir, o el negoci perd doblers.",
      },
      {
        term: "Cost fix mitjà",
        text: "Els costos que no canvien amb la quantitat venuda, dividits per les unitats venudes: centres de dades, xips, entrenaments, amortitzats al llarg de la seva vida útil. Vendre més els reparteix entre més unitats, i per això tothom competeix per guanyar volum.",
        lands: "Aquí hi va el CAPEX.",
      },
      {
        term: "Cost variable mitjà",
        text: "Els costos que creixen amb cada unitat venuda, com l’electricitat, la refrigeració i la computació per respondre una petició més, dividits per les unitats venudes. Quan cada unitat addicional costa més o menys el mateix, és igual al cost marginal: el cost d’una unitat més.",
        lands: "Aquí hi va el cost marginal.",
      },
    ],
    note: "La competència empeny el preu cap al cost marginal (punt 6). Per sobre, cada venda encara paga una part del CAPEX; a aquest nivell ja no en paga res, i el cost fix no es recupera mai (punt 8).",
  },
};

export const ASIDES = { "worst-business": WORST_BUSINESS } as const;

export type AsideKey = keyof typeof ASIDES;

export function isAsideKey(key: unknown): key is AsideKey {
  return typeof key === "string" && Object.hasOwn(ASIDES, key);
}
