/**
 * OOJS graphical demo — homework requirements:
 * class, constructor, methods, extends, super, document.body.appendChild
 */
(function () {
  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }

  /** Base graphic piece inside the playfield */
  class MovingPiece {
    constructor(boardEl, label, color) {
      if (!boardEl) throw new Error("Board element required");
      this.boardEl = boardEl;
      this.size = 76;

      this.el = document.createElement("button");
      this.el.type = "button";
      this.el.className = "oojs-piece";
      this.el.textContent = label;
      this.el.style.backgroundColor = color;

      this.x = Math.random() * Math.max(8, boardEl.clientWidth - this.size);
      this.y = Math.random() * Math.max(8, boardEl.clientHeight - this.size);
      this.dx = (Math.random() - 0.5) * 3.2;
      this.dy = (Math.random() - 0.5) * 3.2;
      this.dragging = false;

      this.boardEl.appendChild(this.el);
      this.layout();
      this.bindDrag();
    }

    layout() {
      this.el.style.width = this.size + "px";
      this.el.style.height = this.size + "px";
      this.el.style.transform =
        "translate(" + this.x + "px," + this.y + "px)";
    }

    bindDrag() {
      var self = this;
      this.el.addEventListener("mousedown", function (ev) {
        self.dragging = true;
        self.dx = 0;
        self.dy = 0;
        ev.preventDefault();
      });
      window.addEventListener("mousemove", function (ev) {
        if (!self.dragging) return;
        var rect = self.boardEl.getBoundingClientRect();
        self.x = clamp(
          ev.clientX - rect.left - self.size / 2,
          0,
          rect.width - self.size
        );
        self.y = clamp(
          ev.clientY - rect.top - self.size / 2,
          0,
          rect.height - self.size
        );
        self.layout();
      });
      window.addEventListener("mouseup", function () {
        self.dragging = false;
      });
    }

    bounce(maxW, maxH) {
      if (this.dragging) return;
      this.x += this.dx;
      this.y += this.dy;
      if (this.x <= 0 || this.x >= maxW - this.size) {
        this.dx *= -1;
        this.x = clamp(this.x, 0, maxW - this.size);
      }
      if (this.y <= 0 || this.y >= maxH - this.size) {
        this.dy *= -1;
        this.y = clamp(this.y, 0, maxH - this.size);
      }
      this.layout();
    }
  }

  /** Pizza-themed moving piece */
  class PizzaPiece extends MovingPiece {
    constructor(boardEl, name) {
      super(boardEl, name, "#e85d04");
      this.el.classList.add("oojs-piece--pizza");
      this.bumpCount = 0;
      this.rotation = 0;
    }

    layout() {
      this.el.style.width = this.size + "px";
      this.el.style.height = this.size + "px";
      this.el.style.transform =
        "translate(" +
        this.x +
        "px," +
        this.y +
        "px) rotate(" +
        this.rotation +
        "deg)";
    }

    cheer() {
      this.bumpCount++;
      this.rotation = (this.bumpCount * 25) % 360;
      this.el.style.boxShadow = "0 0 0 3px rgba(232,93,4,0.55)";
    }

    bounce(maxW, maxH) {
      var prevDx = this.dx;
      var prevDy = this.dy;
      super.bounce(maxW, maxH);
      if (
        !this.dragging &&
        (prevDx !== this.dx || prevDy !== this.dy)
      ) {
        this.cheer();
        this.layout();
      }
    }
  }

  /** Vegetable-themed subclass (second hierarchy use) */
  class VeggiePiece extends MovingPiece {
    constructor(boardEl, name) {
      super(boardEl, name, "#2a9d8f");
      this.el.classList.add("oojs-piece--veg");
    }

    pulse() {
      this.el.style.opacity = "0.82";
      var self = this;
      window.setTimeout(function () {
        self.el.style.opacity = "1";
      }, 120);
    }

    bounce(maxW, maxH) {
      super.bounce(maxW, maxH);
      if (Math.random() < 0.02) this.pulse();
    }
  }

  /** Stage wrapper + animation loop */
  class PizzaArena {
    constructor(mountEl) {
      this.mountEl = mountEl;
      this.boardEl = document.createElement("div");
      this.boardEl.className = "oojs-board";
      this.boardEl.setAttribute("role", "application");
      this.boardEl.setAttribute(
        "aria-label",
        "Bouncing pizza tokens — drag them inside the box"
      );
      this.pieces = [];
      this.loop = this.loop.bind(this);
    }

    mount() {
      this.mountEl.appendChild(this.boardEl);
      var w = Math.min(560, Math.floor(window.innerWidth * 0.92));
      this.boardEl.style.width = w + "px";
      this.boardEl.style.height = "280px";

      this.pieces.push(new PizzaPiece(this.boardEl, "PZ-1"));
      this.pieces.push(new PizzaPiece(this.boardEl, "PZ-2"));
      this.pieces.push(new VeggiePiece(this.boardEl, "VG"));

      requestAnimationFrame(this.loop);
    }

    loop() {
      var rect = this.boardEl.getBoundingClientRect();
      var bw = rect.width;
      var bh = rect.height;
      for (var i = 0; i < this.pieces.length; i++) {
        this.pieces[i].bounce(bw, bh);
      }
      requestAnimationFrame(this.loop);
    }
  }

  /** Requirement hook: append something directly under document.body */
  function attachBodyBanner() {
    var hint = document.createElement("div");
    hint.className = "oojs-body-banner";
    hint.textContent =
      "OOJS demo active — tokens bounce automatically; you can also drag them.";
    document.body.appendChild(hint);
  }

  function boot() {
    var mount = document.getElementById("oojs-mount");
    if (!mount) return;
    attachBodyBanner();
    var arena = new PizzaArena(mount);
    arena.mount();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
