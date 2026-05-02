(function () {
  const PIZZA_URL = "assets/data/pizza.txt";
  const CATEGORY_URL = "assets/data/category.txt";

  /** @type {{ id: number, pname: string, categoryname: string, vegetarian: number }[]} */
  let pizzas = [];
  /** @type {{ cname: string, price: string }[]} */
  let categories = [];
  let editingId = null;

  const statusEl = () => document.getElementById("crud-status");
  const form = () => document.getElementById("pizza-form");
  const inpPname = () => document.getElementById("pname");
  const selCategory = () => document.getElementById("categoryname");
  const chkVeg = () => document.getElementById("vegetarian");
  const btnCancel = () => document.getElementById("cancel-edit");
  const submitBtn = () => document.getElementById("save-submit");

  function setStatus(msg, isError) {
    const el = statusEl();
    if (!el) return;
    el.textContent = msg || "";
    el.classList.toggle("crud-status--error", !!isError);
  }

  function parseTabLines(text) {
    return text.trim().split(/\r?\n/).filter((line) => line.trim().length > 0);
  }

  function parsePizzaRows(text) {
    const lines = parseTabLines(text);
    const rows = [];
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split("\t");
      if (parts.length < 3) continue;
      const vegetarian = parseInt(parts[2].trim(), 10) === 1 ? 1 : 0;
      rows.push({
        pname: parts[0].trim(),
        categoryname: parts[1].trim(),
        vegetarian,
      });
    }
    return rows;
  }

  function assignIds(rows) {
    return rows.map((r, idx) => ({
      id: idx + 1,
      pname: r.pname,
      categoryname: r.categoryname,
      vegetarian: r.vegetarian,
    }));
  }

  function parseCategories(text) {
    const lines = parseTabLines(text);
    const list = [];
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split("\t");
      if (!parts[0]) continue;
      list.push({
        cname: parts[0].trim(),
        price: parts[1] ? parts[1].trim() : "",
      });
    }
    return list;
  }

  function fillCategorySelect() {
    const sel = selCategory();
    if (!sel) return;
    sel.innerHTML = "";
    categories.forEach((c) => {
      const opt = document.createElement("option");
      opt.value = c.cname;
      opt.textContent = c.price ? `${c.cname} (${c.price})` : c.cname;
      sel.appendChild(opt);
    });
  }

  function nextId() {
    if (pizzas.length === 0) return 1;
    return Math.max(...pizzas.map((p) => p.id)) + 1;
  }

  function renderTable() {
    const tbody = document.querySelector("#pizza-table tbody");
    if (!tbody) return;
    tbody.replaceChildren();

    [...pizzas]
      .sort((a, b) => a.id - b.id)
      .forEach((p) => {
        const tr = document.createElement("tr");

        const tdId = document.createElement("td");
        tdId.textContent = String(p.id);

        const tdName = document.createElement("td");
        tdName.textContent = p.pname;

        const tdCat = document.createElement("td");
        tdCat.textContent = p.categoryname;

        const tdVeg = document.createElement("td");
        tdVeg.textContent = p.vegetarian === 1 ? "Yes" : "No";

        const tdAct = document.createElement("td");
        tdAct.className = "crud-actions";

        const btnEdit = document.createElement("button");
        btnEdit.type = "button";
        btnEdit.className = "btn btn-secondary btn-sm";
        btnEdit.textContent = "Edit";
        btnEdit.addEventListener("click", () => startEdit(p.id));

        const btnDel = document.createElement("button");
        btnDel.type = "button";
        btnDel.className = "btn btn-danger btn-sm";
        btnDel.textContent = "Delete";
        btnDel.addEventListener("click", () => removeRow(p.id));

        tdAct.append(btnEdit, btnDel);
        tr.append(tdId, tdName, tdCat, tdVeg, tdAct);
        tbody.appendChild(tr);
      });

    const countEl = document.getElementById("pizza-count");
    if (countEl) countEl.textContent = String(pizzas.length);
  }

  function resetForm() {
    editingId = null;
    const f = form();
    if (f) f.reset();
    const c = btnCancel();
    if (c) c.hidden = true;
    const sb = submitBtn();
    if (sb) sb.textContent = "Add pizza";
    const sel = selCategory();
    if (sel && categories.length && !sel.value) sel.selectedIndex = 0;
  }

  function startEdit(id) {
    const p = pizzas.find((x) => x.id === id);
    if (!p) return;
    editingId = id;
    inpPname().value = p.pname;
    selCategory().value = p.categoryname;
    chkVeg().checked = p.vegetarian === 1;
    btnCancel().hidden = false;
    submitBtn().textContent = "Update pizza";
    inpPname().focus();
  }

  function removeRow(id) {
    if (!window.confirm("Delete this pizza from the in-memory list?")) return;
    pizzas = pizzas.filter((p) => p.id !== id);
    if (editingId === id) resetForm();
    renderTable();
    setStatus("Row deleted (session only — not saved to file).");
  }

  function onSubmit(e) {
    e.preventDefault();
    const pname = inpPname().value.trim();
    const categoryname = selCategory().value;
    const vegetarian = chkVeg().checked ? 1 : 0;

    if (!pname) {
      setStatus("Pizza name is required.", true);
      return;
    }

    if (editingId != null) {
      const p = pizzas.find((x) => x.id === editingId);
      if (p) {
        p.pname = pname;
        p.categoryname = categoryname;
        p.vegetarian = vegetarian;
      }
      setStatus("Pizza updated in array.");
      resetForm();
    } else {
      pizzas.push({
        id: nextId(),
        pname,
        categoryname,
        vegetarian,
      });
      setStatus("Pizza added to array.");
      resetForm();
    }
    renderTable();
  }

  async function init() {
    setStatus("Loading data files…");
    try {
      const [pizzaRes, catRes] = await Promise.all([
        fetch(PIZZA_URL),
        fetch(CATEGORY_URL),
      ]);
      if (!pizzaRes.ok) throw new Error("Cannot load pizza.txt");
      if (!catRes.ok) throw new Error("Cannot load category.txt");

      const pizzaText = await pizzaRes.text();
      const catText = await catRes.text();

      categories = parseCategories(catText);
      fillCategorySelect();

      const rows = parsePizzaRows(pizzaText);
      pizzas = assignIds(rows);

      renderTable();
      resetForm();
      setStatus(
        `Loaded ${pizzas.length} pizzas into an array. Changes stay in memory until you refresh the page.`
      );
    } catch (err) {
      console.error(err);
      setStatus(
        err.message ||
          "Failed to load files. Serve this site via a local server (not file://) if fetch is blocked.",
        true
      );
    }

    form().addEventListener("submit", onSubmit);
    btnCancel().addEventListener("click", () => {
      resetForm();
      setStatus("Edit cancelled.");
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
