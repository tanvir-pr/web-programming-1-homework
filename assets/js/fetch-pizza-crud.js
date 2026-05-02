(function () {
  /** Same folder level as fetchapi.html → api/pizzas.php */
  var API_URL = "api/pizzas.php";
  var CATEGORY_URL = "assets/data/category.txt";

  var pizzas = [];
  var categories = [];
  var editingId = null;

  function $(id) {
    return document.getElementById(id);
  }

  function setStatus(msg, isError) {
    var el = $("fetch-status");
    if (!el) return;
    el.textContent = msg || "";
    el.classList.toggle("crud-status--error", !!isError);
  }

  function parseTabLines(text) {
    return text.trim().split(/\r?\n/).filter(function (line) {
      return line.trim().length > 0;
    });
  }

  function parseCategories(text) {
    var lines = parseTabLines(text);
    var list = [];
    for (var i = 1; i < lines.length; i++) {
      var parts = lines[i].split("\t");
      if (!parts[0]) continue;
      list.push({
        cname: parts[0].trim(),
        price: parts[1] ? parts[1].trim() : "",
      });
    }
    return list;
  }

  function fillCategorySelect() {
    var sel = $("fetch-categoryname");
    if (!sel) return;
    sel.innerHTML = "";
    categories.forEach(function (c) {
      var opt = document.createElement("option");
      opt.value = c.cname;
      opt.textContent = c.price ? c.cname + " (" + c.price + ")" : c.cname;
      sel.appendChild(opt);
    });
  }

  async function apiRequest(method, bodyObj) {
    var opts = { method: method };
    if (bodyObj !== undefined && bodyObj !== null) {
      opts.headers = { "Content-Type": "application/json" };
      opts.body = JSON.stringify(bodyObj);
    }
    var res = await fetch(API_URL, opts);
    var text = await res.text();
    var data = null;
    try {
      data = JSON.parse(text);
    } catch (e) {
      throw new Error("Invalid JSON from server");
    }
    if (!res.ok || !data || data.ok === false) {
      var err = (data && data.error) || text || res.statusText;
      throw new Error(err);
    }
    return data;
  }

  async function loadList() {
    setStatus("Loading from database…");
    var data = await apiRequest("GET");
    pizzas = data.data || [];
    renderTable();
    $("fetch-pizza-count").textContent = String(pizzas.length);
    setStatus("Loaded " + pizzas.length + " rows from MySQL via Fetch.");
  }

  function renderTable() {
    var tbody = document.querySelector("#fetch-pizza-table tbody");
    if (!tbody) return;
    tbody.replaceChildren();

    pizzas
      .slice()
      .sort(function (a, b) {
        return a.id - b.id;
      })
      .forEach(function (p) {
        var veg = Number(p.vegetarian) === 1 ? 1 : 0;
        var tr = document.createElement("tr");

        var tdId = document.createElement("td");
        tdId.textContent = String(p.id);

        var tdName = document.createElement("td");
        tdName.textContent = p.pname;

        var tdCat = document.createElement("td");
        tdCat.textContent = p.categoryname;

        var tdVeg = document.createElement("td");
        tdVeg.textContent = veg === 1 ? "Yes" : "No";

        var tdAct = document.createElement("td");
        tdAct.className = "crud-actions";

        var btnEdit = document.createElement("button");
        btnEdit.type = "button";
        btnEdit.className = "btn btn-secondary btn-sm";
        btnEdit.textContent = "Edit";
        btnEdit.addEventListener("click", function () {
          startEdit(p);
        });

        var btnDel = document.createElement("button");
        btnDel.type = "button";
        btnDel.className = "btn btn-danger btn-sm";
        btnDel.textContent = "Delete";
        btnDel.addEventListener("click", function () {
          deleteRow(p.id);
        });

        tdAct.append(btnEdit, btnDel);
        tr.append(tdId, tdName, tdCat, tdVeg, tdAct);
        tbody.appendChild(tr);
      });
  }

  function resetForm() {
    editingId = null;
    $("fetch-pizza-form").reset();
    $("fetch-cancel-edit").hidden = true;
    $("fetch-save-submit").textContent = "Add pizza";
    if (categories.length) $("fetch-categoryname").value = categories[0].cname;
    $("fetch-vegetarian").checked = false;
  }

  function startEdit(p) {
    editingId = p.id;
    $("fetch-pname").value = p.pname;
    $("fetch-categoryname").value = p.categoryname;
    $("fetch-vegetarian").checked = Number(p.vegetarian) === 1;
    $("fetch-cancel-edit").hidden = false;
    $("fetch-save-submit").textContent = "Update pizza";
    $("fetch-pname").focus();
  }

  async function deleteRow(id) {
    if (!window.confirm("Delete this row from the database?")) return;
    try {
      await apiRequest("DELETE", { id: id });
      await loadList();
    } catch (err) {
      setStatus(err.message, true);
    }
  }

  async function onSubmit(ev) {
    ev.preventDefault();
    var pname = $("fetch-pname").value.trim();
    var categoryname = $("fetch-categoryname").value;
    var vegetarian = $("fetch-vegetarian").checked ? 1 : 0;

    if (!pname) {
      setStatus("Pizza name is required.", true);
      return;
    }

    try {
      if (editingId != null) {
        await apiRequest("PUT", {
          id: editingId,
          pname: pname,
          categoryname: categoryname,
          vegetarian: vegetarian,
        });
        setStatus("Updated on server.");
      } else {
        await apiRequest("POST", {
          pname: pname,
          categoryname: categoryname,
          vegetarian: vegetarian,
        });
        setStatus("Created on server.");
      }
      resetForm();
      await loadList();
    } catch (err) {
      setStatus(err.message, true);
    }
  }

  async function init() {
    try {
      var catRes = await fetch(CATEGORY_URL);
      if (!catRes.ok) throw new Error("Cannot load category.txt");
      categories = parseCategories(await catRes.text());
      fillCategorySelect();
    } catch (err) {
      setStatus(err.message, true);
      return;
    }

    $("fetch-pizza-form").addEventListener("submit", onSubmit);
    $("fetch-cancel-edit").addEventListener("click", function () {
      resetForm();
      setStatus("Edit cancelled.");
    });

    try {
      await loadList();
    } catch (err) {
      setStatus(
        err.message +
          " — Create DB, run database/schema.sql + seed, start PHP (e.g. XAMPP), open site via http://localhost/...",
        true
      );
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
