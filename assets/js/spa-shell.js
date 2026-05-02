/**
 * SPA shell: two menu items switch between Calculator and Tic-tac-toe (both React).
 */
(function () {
  var ReactRef = window.React;
  var ReactDOMRef = window.ReactDOM;
  if (!ReactRef || !ReactDOMRef) return;

  var e = ReactRef.createElement;
  var useState = ReactRef.useState;
  var createRoot = ReactDOMRef.createRoot;

  function SpaApp() {
    var _view = useState("calc");
    var view = _view[0];
    var setView = _view[1];

    var Calc = window.HomeworkCalculatorApp;
    var Ttt = window.HomeworkTicTacToeApp;

    if (!Calc || !Ttt) {
      return e(
        "p",
        { className: "crud-status crud-status--error" },
        "Mini-apps failed to load. Check script order in spa.html."
      );
    }

    return e(
      "div",
      { className: "spa-layout" },
      e(
        "nav",
        {
          className: "spa-toolbar",
          "aria-label": "SPA menu items",
        },
        e(
          "button",
          {
            type: "button",
            className:
              "btn spa-tab" + (view === "calc" ? " spa-tab--active" : ""),
            "aria-current": view === "calc" ? "page" : undefined,
            onClick: function () {
              setView("calc");
            },
          },
          "Calculator"
        ),
        e(
          "button",
          {
            type: "button",
            className:
              "btn spa-tab" + (view === "ttt" ? " spa-tab--active" : ""),
            "aria-current": view === "ttt" ? "page" : undefined,
            onClick: function () {
              setView("ttt");
            },
          },
          "Tic-tac-toe"
        )
      ),
      e(
        "section",
        {
          className: "spa-panel",
          "aria-labelledby": "spa-panel-label",
        },
        e(
          "h3",
          { id: "spa-panel-label", className: "visually-hidden" },
          view === "calc" ? "Calculator application" : "Tic-tac-toe game"
        ),
        view === "calc" ? e(Calc) : e(Ttt)
      )
    );
  }

  var mount = document.getElementById("spa-root");
  if (mount) {
    createRoot(mount).render(e(SpaApp));
  }
})();
