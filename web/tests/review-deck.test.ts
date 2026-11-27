import assert from "node:assert/strict";
import test from "node:test";

import { getGuide } from "../src/data/algorithmGuides.ts";
import { mlProblems } from "../src/data/mlProblems.ts";
import { problems } from "../src/data/problems.ts";
import { buildReviewDeck, serializeReviewDeck } from "../src/lib/review-deck.ts";

test("buildReviewDeck includes algorithm, ML, and SQL cards with normalized base paths", () => {
  const deck = buildReviewDeck(
    {
      problems,
      getGuide,
      mlProblems,
      sqlProblems: [
        {
          id: "SQL 01",
          slug: "customers-without-orders",
          title: "Customers Without Orders",
          difficulty: "Easy",
          category: "Joins",
          summary: "Find customers with no orders.",
          prompt: "Return customers without matching rows in orders.",
          hints: ["Use LEFT JOIN or NOT EXISTS."],
        },
      ],
    },
    "/mental-gym/"
  );

  const algoCard = deck["algorithms:1-two-sum"];
  assert.ok(algoCard);
  assert.equal(algoCard.href, "/mental-gym/algorithms/1-two-sum/");
  assert.ok(algoCard.promptHtml && algoCard.promptHtml.length > 0);
  assert.ok(algoCard.pattern.length > 0);
  assert.ok(algoCard.topTrap.length > 0);

  const mlCard = deck[`ml:${mlProblems[0].slug}`];
  assert.ok(mlCard);
  assert.equal(mlCard.href, `/mental-gym/machine-learning/${mlProblems[0].slug}/`);
  assert.ok(mlCard.promptText && mlCard.promptText.length > 0);

  const sqlCard = deck["sql:customers-without-orders"];
  assert.ok(sqlCard);
  assert.equal(sqlCard.href, "/mental-gym/sql/customers-without-orders/");
  assert.equal(sqlCard.hints[0], "Use LEFT JOIN or NOT EXISTS.");
});

test("serializeReviewDeck escapes closing script sequences and round-trips cleanly", () => {
  const deck = buildReviewDeck({
    problems: [],
    getGuide,
    mlProblems: [],
    sqlProblems: [
      {
        id: "SQL X",
        slug: "script-escape",
        title: "Escape Test",
        difficulty: "Easy",
        category: "SQL",
        summary: "Summary",
        prompt: "Test </script><script>alert(1)</script>",
        hints: [],
      },
    ],
  });

  const json = serializeReviewDeck(deck);
  assert.equal(json.includes("</script>"), false);
  const parsed = JSON.parse(json);
  assert.equal(
    parsed["sql:script-escape"].promptText,
    "Test </script><script>alert(1)</script>"
  );
});
