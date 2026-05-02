/**
 * Calculator mini-app for SPA homework (React + useState + createElement).
 * Inspired by typical seminar calculator exercises (React basics).
 */
(function (global) {
  var ReactRef = global.React;
  if (!ReactRef) return;
  var e = ReactRef.createElement;
  var useState = ReactRef.useState;

  function CalculatorApp() {
    var _display = useState("0");
    var display = _display[0];
    var setDisplay = _display[1];
    var _stored = useState(null);
    var stored = _stored[0];
    var setStored = _stored[1];
    var _op = useState(null);
    var op = _op[0];
    var setOp = _op[1];
    var _fresh = useState(true);
    var fresh = _fresh[0];
    var setFresh = _fresh[1];

    function compute(a, b, operator) {
      switch (operator) {
        case "+":
          return a + b;
        case "-":
          return a - b;
        case "*":
          return a * b;
        case "/":
          return b === 0 ? NaN : a / b;
        default:
          return b;
      }
    }

    function inputDigit(d) {
      var str = typeof d === "number" ? String(d) : ".";
      if (fresh) {
        setDisplay(str === "." ? "0." : str);
        setFresh(false);
      } else {
        if (str === ".") {
          if (display.indexOf(".") !== -1) return;
          setDisplay(display + ".");
        } else {
          setDisplay(display === "0" ? str : display + str);
        }
      }
    }

    function inputOp(nextOp) {
      var current = parseFloat(display);
      if (isNaN(current)) return;
      if (stored != null && op != null && !fresh) {
        var result = compute(stored, current, op);
        if (isNaN(result)) {
          setDisplay("Error");
          setStored(null);
          setOp(null);
          setFresh(true);
          return;
        }
        setDisplay(String(result));
        setStored(result);
      } else {
        setStored(current);
      }
      setOp(nextOp);
      setFresh(true);
    }

    function equals() {
      if (stored == null || op == null) return;
      var current = parseFloat(display);
      if (isNaN(current)) return;
      var result = compute(stored, current, op);
      setDisplay(isNaN(result) ? "Error" : String(result));
      setStored(null);
      setOp(null);
      setFresh(true);
    }

    function clearAll() {
      setDisplay("0");
      setStored(null);
      setOp(null);
      setFresh(true);
    }

    function btnDigit(d) {
      return e(
        "button",
        {
          type: "button",
          className: "calc-btn",
          onClick: function () {
            inputDigit(d);
          },
        },
        String(d)
      );
    }

    function btnOp(symbol, oper) {
      return e(
        "button",
        {
          type: "button",
          className: "calc-btn calc-btn--op",
          onClick: function () {
            inputOp(oper);
          },
        },
        symbol
      );
    }

    return e(
      "div",
      { className: "calc-app" },
      e(
        "div",
        { className: "calc-display", "aria-live": "polite" },
        display
      ),
      e(
        "div",
        { className: "calc-grid" },
        btnDigit(7),
        btnDigit(8),
        btnDigit(9),
        btnOp("\u00F7", "/"),
        btnDigit(4),
        btnDigit(5),
        btnDigit(6),
        btnOp("\u00D7", "*"),
        btnDigit(1),
        btnDigit(2),
        btnDigit(3),
        btnOp("\u2212", "-"),
        e(
          "button",
          {
            type: "button",
            className: "calc-btn calc-btn--zero",
            onClick: function () {
              inputDigit(0);
            },
          },
          "0"
        ),
        e(
          "button",
          {
            type: "button",
            className: "calc-btn",
            onClick: function () {
              inputDigit(".");
            },
          },
          "."
        ),
        e(
          "button",
          {
            type: "button",
            className: "calc-btn calc-btn--equals",
            onClick: equals,
          },
          "="
        ),
        btnOp("+", "+"),
        e(
          "button",
          {
            type: "button",
            className: "calc-btn calc-btn--ac",
            onClick: clearAll,
          },
          "AC"
        )
      )
    );
  }

  global.HomeworkCalculatorApp = CalculatorApp;
})(typeof window !== "undefined" ? window : globalThis);
