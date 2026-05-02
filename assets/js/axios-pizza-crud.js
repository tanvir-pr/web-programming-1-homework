/**
 * React + Axios CRUD — same API as fetchapi.html (api/pizzas.php).
 * React createElement + useState + useEffect; Axios for HTTP.
 */
(function () {
  var ReactRef = window.React;
  var ReactDOMRef = window.ReactDOM;
  var axiosRef = window.axios;

  if (!ReactRef || !ReactDOMRef || !axiosRef) {
    var root = document.getElementById("axios-crud-root");
    if (root) {
      root.textContent =
        "Missing React, ReactDOM, or Axios. Check script tags in axios.html.";
    }
    return;
  }

  var e = ReactRef.createElement;
  var useState = ReactRef.useState;
  var useEffect = ReactRef.useEffect;
  var createRoot = ReactDOMRef.createRoot;

  var API_URL = "api/pizzas.php";
  var CATEGORY_URL = "assets/data/category.txt";

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

  function axiosErrorMessage(err) {
    var msg = err.message || "Request failed";
    if (err.response && err.response.data && err.response.data.error) {
      msg = err.response.data.error;
    }
    return msg;
  }

  function PizzaAxiosApp() {
    var _pizzas = useState([]);
    var pizzas = _pizzas[0];
    var setPizzas = _pizzas[1];
    var _categories = useState([]);
    var categories = _categories[0];
    var setCategories = _categories[1];
    var _loading = useState(true);
    var loading = _loading[0];
    var setLoading = _loading[1];
    var _status = useState("");
    var status = _status[0];
    var setStatus = _status[1];
    var _statusErr = useState(false);
    var statusErr = _statusErr[0];
    var setStatusErr = _statusErr[1];
    var _editingId = useState(null);
    var editingId = _editingId[0];
    var setEditingId = _editingId[1];
    var _pname = useState("");
    var pname = _pname[0];
    var setPname = _pname[1];
    var _categoryname = useState("");
    var categoryname = _categoryname[0];
    var setCategoryname = _categoryname[1];
    var _vegetarian = useState(false);
    var vegetarian = _vegetarian[0];
    var setVegetarian = _vegetarian[1];

    function loadPizzas() {
      return axiosRef.get(API_URL).then(function (res) {
        var body = res.data;
        if (!body || body.ok !== true) {
          throw new Error((body && body.error) || "Bad response");
        }
        setPizzas(body.data || []);
        setStatus("Loaded " + (body.data ? body.data.length : 0) + " rows via Axios.");
        setStatusErr(false);
      });
    }

    useEffect(function () {
      setLoading(true);
      fetch(CATEGORY_URL)
        .then(function (r) {
          if (!r.ok) throw new Error("Cannot load category.txt");
          return r.text();
        })
        .then(function (text) {
          var cats = parseCategories(text);
          setCategories(cats);
          if (cats.length) setCategoryname(cats[0].cname);
          return loadPizzas();
        })
        .catch(function (err) {
          setStatus(err.message || String(err));
          setStatusErr(true);
        })
        .finally(function () {
          setLoading(false);
        });
    }, []);

    function resetForm() {
      setEditingId(null);
      setPname("");
      setVegetarian(false);
      if (categories.length) setCategoryname(categories[0].cname);
    }

    function startEdit(p) {
      setEditingId(p.id);
      setPname(p.pname);
      setCategoryname(p.categoryname);
      setVegetarian(Number(p.vegetarian) === 1);
      setStatus("Editing #" + p.id);
      setStatusErr(false);
    }

    function deleteRow(id) {
      if (!window.confirm("Delete this row from the database?")) return;
      axiosRef
        .delete(API_URL, { data: { id: id } })
        .then(function (res) {
          var body = res.data;
          if (!body || body.ok !== true) {
            throw new Error((body && body.error) || "Delete failed");
          }
          return loadPizzas();
        })
        .catch(function (err) {
          setStatus(axiosErrorMessage(err));
          setStatusErr(true);
        });
    }

    function onSubmit(ev) {
      ev.preventDefault();
      var name = pname.trim();
      if (!name) {
        setStatus("Pizza name is required.");
        setStatusErr(true);
        return;
      }
      var veg = vegetarian ? 1 : 0;
      var req =
        editingId != null
          ? axiosRef.put(API_URL, {
              id: editingId,
              pname: name,
              categoryname: categoryname,
              vegetarian: veg,
            })
          : axiosRef.post(API_URL, {
              pname: name,
              categoryname: categoryname,
              vegetarian: veg,
            });

      req
        .then(function (res) {
          var body = res.data;
          if (!body || body.ok !== true) {
            throw new Error((body && body.error) || "Save failed");
          }
          setStatus(editingId != null ? "Updated via Axios." : "Created via Axios.");
          setStatusErr(false);
          resetForm();
          return loadPizzas();
        })
        .catch(function (err) {
          setStatus(axiosErrorMessage(err));
          setStatusErr(true);
        });
    }

    if (loading) {
      return e("p", { className: "crud-status" }, "Loading categories and database…");
    }

    var statusClass =
      "crud-status" + (statusErr ? " crud-status--error" : "");

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
      var veg = Number(p.vegetarian) === 1 ? 1 : 0;
      return e(
        "tr",
        { key: p.id },
        e("td", null, String(p.id)),
        e("td", null, p.pname),
        e("td", null, p.categoryname),
        e("td", null, veg === 1 ? "Yes" : "No"),
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
                deleteRow(p.id);
              },
            },
            "Delete"
          )
        )
      );
    });

    return e(
      "div",
      { className: "react-crud-app axios-crud-app" },
      e("p", { className: statusClass, role: "status" }, status),
      e(
        "section",
        { className: "crud-panel", "aria-labelledby": "axios-form-heading" },
        e(
          "h3",
          { id: "axios-form-heading", className: "crud-subtitle" },
          "Add or edit pizza (React + Axios)"
        ),
        e(
          "form",
          { className: "crud-form", onSubmit: onSubmit },
          e(
            "div",
            { className: "field" },
            e("label", { htmlFor: "axios-pname" }, "Pizza name"),
            e("input", {
              id: "axios-pname",
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
            e("label", { htmlFor: "axios-category" }, "Category"),
            e(
              "select",
              {
                id: "axios-category",
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
              id: "axios-vegetarian",
              type: "checkbox",
              checked: vegetarian,
              onChange: function (ev) {
                setVegetarian(ev.target.checked);
              },
            }),
            e("label", { htmlFor: "axios-vegetarian" }, "Vegetarian")
          ),
          e(
            "div",
            { className: "field-actions" },
            e(
              "button",
              { type: "submit", className: "btn btn-primary" },
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
                      setStatusErr(false);
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
        { className: "crud-panel", "aria-labelledby": "axios-table-heading" },
        e(
          "h3",
          { id: "axios-table-heading", className: "crud-subtitle" },
          "Pizza list from database ",
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
            { className: "crud-table" },
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

  var mount = document.getElementById("axios-crud-root");
  if (mount) {
    createRoot(mount).render(e(PizzaAxiosApp));
  }
})();
