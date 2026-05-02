/**
 * React CRUD — React + createElement only (no JSX, no Babel in browser).
 * Expects global React and ReactDOM from UMD builds (see react.html).
 */
(function () {
  const e = React.createElement;
  const { useState, useEffect } = React;
  const { createRoot } = ReactDOM;

  const PIZZA_URL = "assets/data/pizza.txt";
  const CATEGORY_URL = "assets/data/category.txt";

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

  function nextId(list) {
    if (!list.length) return 1;
    return Math.max(...list.map((p) => p.id)) + 1;
  }

  function PizzaCrudApp() {
    const [pizzas, setPizzas] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("");
    const [status, setStatus] = useState("");
    const [statusError, setStatusError] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [pname, setPname] = useState("");
    const [categoryname, setCategoryname] = useState("");
    const [vegetarian, setVegetarian] = useState(false);

    useEffect(function () {
      setLoading(true);
      Promise.all([fetch(PIZZA_URL), fetch(CATEGORY_URL)])
        .then(function (responses) {
          const [pr, cr] = responses;
          if (!pr.ok) throw new Error("Cannot load pizza.txt");
          if (!cr.ok) throw new Error("Cannot load category.txt");
          return Promise.all([pr.text(), cr.text()]);
        })
        .then(function ([pizzaText, catText]) {
          const cats = parseCategories(catText);
          setCategories(cats);
          const rows = assignIds(parsePizzaRows(pizzaText));
          setPizzas(rows);
          if (cats.length) setCategoryname(cats[0].cname);
          setLoadError("");
          setStatus(
            "Loaded " +
              rows.length +
              " pizzas into React state (array). Session-only changes."
          );
          setStatusError(false);
        })
        .catch(function (err) {
          console.error(err);
          setLoadError(
            err.message ||
              "Failed to load files. Use a local server (http://localhost), not file://."
          );
        })
        .finally(function () {
          setLoading(false);
        });
    }, []);

    function resetForm() {
      setEditingId(null);
      setPname("");
      setVegetarian(false);
      setCategoryname(categories[0] ? categories[0].cname : "");
    }

    function startEdit(p) {
      setEditingId(p.id);
      setPname(p.pname);
      setCategoryname(p.categoryname);
      setVegetarian(p.vegetarian === 1);
      setStatus("Editing pizza #" + p.id);
      setStatusError(false);
    }

    function removeRow(id) {
      if (!window.confirm("Delete this pizza from state?")) return;
      setPizzas(function (prev) {
        return prev.filter(function (x) {
          return x.id !== id;
        });
      });
      if (editingId === id) resetForm();
      setStatus("Row deleted from React state.");
      setStatusError(false);
    }

    function onSubmit(ev) {
      ev.preventDefault();
      var name = pname.trim();
      if (!name) {
        setStatus("Pizza name is required.");
        setStatusError(true);
        return;
      }
      var veg = vegetarian ? 1 : 0;
      if (editingId != null) {
        setPizzas(function (prev) {
          return prev.map(function (x) {
            if (x.id !== editingId) return x;
            return {
              id: x.id,
              pname: name,
              categoryname: categoryname,
              vegetarian: veg,
            };
          });
        });
        setStatus("Pizza updated.");
        setStatusError(false);
        resetForm();
      } else {
        setPizzas(function (prev) {
          return prev.concat([
            {
              id: nextId(prev),
              pname: name,
              categoryname: categoryname,
              vegetarian: veg,
            },
          ]);
        });
        setStatus("Pizza added.");
        setStatusError(false);
        resetForm();
      }
    }

    if (loading) {
      return e("p", { className: "crud-status" }, "Loading data files…");
    }

    if (loadError) {
      return e("p", { className: "crud-status crud-status--error" }, loadError);
    }

    var statusClass = "crud-status" + (statusError ? " crud-status--error" : "");

    var categoryOptions = categories.map(function (c) {
      return e(
        "option",
        { key: c.cname, value: c.cname },
        c.price ? c.cname + " (" + c.price + ")" : c.cname
      );
    });

    var sorted = pizzas
      .slice()
      .sort(function (a, b) {
        return a.id - b.id;
      });

    var tbodyRows = sorted.map(function (p) {
      return e(
        "tr",
        { key: p.id },
        e("td", null, String(p.id)),
        e("td", null, p.pname),
        e("td", null, p.categoryname),
        e("td", null, p.vegetarian === 1 ? "Yes" : "No"),
        e(
          "td",
          { className: "crud-actions" },
          e(
            "button",
            {
              type: "button",
              className: "btn btn-secondary btn-sm",
              onClick: function () {
                startEdit(p);
              },
            },
            "Edit"
          ),
          e(
            "button",
            {
              type: "button",
              className: "btn btn-danger btn-sm",
              onClick: function () {
                removeRow(p.id);
              },
            },
            "Delete"
          )
        )
      );
    });

    return e(
      "div",
      { className: "react-crud-app" },
      e("p", { className: statusClass, role: "status" }, status),
      e(
        "section",
        { className: "crud-panel", "aria-labelledby": "react-form-heading" },
        e(
          "h3",
          { id: "react-form-heading", className: "crud-subtitle" },
          "Add or edit pizza (React)"
        ),
        e(
          "form",
          { className: "crud-form", onSubmit: onSubmit },
          e(
            "div",
            { className: "field" },
            e("label", { htmlFor: "react-pname" }, "Pizza name"),
            e("input", {
              id: "react-pname",
              type: "text",
              required: true,
              maxLength: 200,
              autoComplete: "off",
              value: pname,
              onChange: function (ev) {
                setPname(ev.target.value);
              },
            })
          ),
          e(
            "div",
            { className: "field" },
            e("label", { htmlFor: "react-category" }, "Category"),
            e(
              "select",
              {
                id: "react-category",
                value: categoryname,
                onChange: function (ev) {
                  setCategoryname(ev.target.value);
                },
              },
              categoryOptions
            )
          ),
          e(
            "div",
            { className: "field field-check" },
            e("input", {
              id: "react-vegetarian",
              type: "checkbox",
              checked: vegetarian,
              onChange: function (ev) {
                setVegetarian(ev.target.checked);
              },
            }),
            e("label", { htmlFor: "react-vegetarian" }, "Vegetarian")
          ),
          e(
            "div",
            { className: "field-actions" },
            e(
              "button",
              {
                type: "submit",
                className: "btn btn-primary",
                id: "react-save-submit",
              },
              editingId != null ? "Update pizza" : "Add pizza"
            ),
            editingId != null
              ? e(
                  "button",
                  {
                    type: "button",
                    className: "btn btn-secondary",
                    onClick: function () {
                      resetForm();
                      setStatus("Edit cancelled.");
                      setStatusError(false);
                    },
                  },
                  "Cancel edit"
                )
              : null
          )
        )
      ),
      e(
        "section",
        { className: "crud-panel", "aria-labelledby": "react-table-heading" },
        e(
          "h3",
          { id: "react-table-heading", className: "crud-subtitle" },
          "Pizza list ",
          e(
            "span",
            { className: "crud-meta" },
            "(",
            String(pizzas.length),
            " rows)"
          )
        ),
        e(
          "div",
          { className: "table-scroll" },
          e(
            "table",
            { className: "crud-table", id: "react-pizza-table" },
            e(
              "thead",
              null,
              e(
                "tr",
                null,
                e("th", { scope: "col" }, "ID"),
                e("th", { scope: "col" }, "Name"),
                e("th", { scope: "col" }, "Category"),
                e("th", { scope: "col" }, "Vegetarian"),
                e("th", { scope: "col" }, "Actions")
              )
            ),
            e("tbody", null, tbodyRows)
          )
        )
      )
    );
  }

  var mount = document.getElementById("react-crud-root");
  if (!mount) return;
  if (typeof React === "undefined" || typeof ReactDOM === "undefined") {
    mount.textContent =
      "React failed to load. Check network or script URLs in react.html.";
    return;
  }
  createRoot(mount).render(e(PizzaCrudApp));
})();
