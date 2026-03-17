const steps = [
  {
    active: -1,
    found: [],
    map: {},
    explanation:
      "We iterate through the array. For each element, check if its complement (target - current) already exists in the hash map. If yes: done. If no: store the current value and its index.",
  },
  {
    active: 0,
    found: [],
    map: {},
    mapAfter: { 2: 0 },
    explanation:
      "i=0, nums[0]=2. Complement = 9 - 2 = 7. Is 7 in the map? No. Store {2: 0} and move on.",
  },
  {
    active: 1,
    found: [],
    map: { 2: 0 },
    mapAfter: { 2: 0 },
    explanation:
      "i=1, nums[1]=7. Complement = 9 - 7 = 2. Is 2 in the map? Yes! It is at index 0.",
  },
  {
    active: 1,
    found: [0, 1],
    map: { 2: 0 },
    mapAfter: { 2: 0 },
    explanation:
      "Found it. Return [0, 1]. nums[0] + nums[1] = 2 + 7 = 9. Correct!",
  },
];

let current = 0;

const prevBtn = document.getElementById("anim-prev");
const nextBtn = document.getElementById("anim-next");
const stepLabel = document.getElementById("anim-step-label");
const explanation = document.getElementById("anim-explanation");
const hashmapRow = document.getElementById("hashmap-row");
const cells = document.querySelectorAll(".array-cell");

function buildMapHTML(map) {
  const entries = Object.entries(map);
  if (entries.length === 0) {
    return '<span class="hashmap-empty">empty</span>';
  }
  return entries
    .map(function (entry) {
      return (
        '<span class="hashmap-entry">' +
        entry[0] +
        ' <span class="hashmap-arrow">-></span> ' +
        entry[1] +
        "</span>"
      );
    })
    .join("");
}

function render() {
  const step = steps[current];

  stepLabel.textContent = "Step " + (current + 1) + " / " + steps.length;
  prevBtn.disabled = current === 0;
  nextBtn.disabled = current === steps.length - 1;

  cells.forEach(function (cell) {
    const idx = parseInt(cell.dataset.idx, 10);
    cell.classList.remove("active", "found", "visited");
    if (step.found.indexOf(idx) !== -1) {
      cell.classList.add("found");
    } else if (idx === step.active) {
      cell.classList.add("active");
    } else if (idx < step.active) {
      cell.classList.add("visited");
    }
  });

  const mapData = step.mapAfter !== undefined ? step.mapAfter : step.map;
  hashmapRow.innerHTML = buildMapHTML(mapData);
  explanation.textContent = step.explanation;
}

prevBtn.addEventListener("click", function () {
  if (current > 0) {
    current--;
    render();
  }
});

nextBtn.addEventListener("click", function () {
  if (current < steps.length - 1) {
    current++;
    render();
  }
});

render();
