var undefined;
Date.__parse__ = Date.parse;

Date.parse = function(s, format) {
  if (arguments.length == 1) {
    return Date.__parse__(s);
  }

  var d = new Date(1970, 1, 1); // local time

  var fields = [function() {}];
  format = format.replace(/[\\\^\$\*\+\?\[\]\(\)\.\{\}]/g, "\\$&");
  format = format.replace(/%[a-zA-Z0-9]/g, function(s) {
      switch (s) {
        case '%S': {
          fields.push(function(x) { d.setSeconds(x); });
          return "([0-9]+)";
        }
        case '%M': {
          fields.push(function(x) { d.setMinutes(x); });
          return "([0-9]+)";
        }
        case '%H': {
          fields.push(function(x) { d.setHours(x); });
          return "([0-9]+)";
        }
        case '%d': {
          fields.push(function(x) { d.setDate(x); });
          return "([0-9]+)";
        }
        case '%m': {
          fields.push(function(x) { d.setMonth(x - 1); });
          return "([0-9]+)";
        }
        case '%Y': {
          fields.push(function(x) { d.setYear(x); });
          return "([0-9]+)";
        }
        case '%%': {
          fields.push(function() {});
          return "%";
        }
        case '%y': {
          fields.push(function(x) {
              x = Number(x);
              d.setYear(x + (((0 <= x) && (x < 69)) ? 2000
                  : (((x >= 69) && (x < 100) ? 1900 : 0))));
            });
          return "([0-9]+)";
        }
      }
      return s;
    });

  var match = s.match(format);
  if (match) {
    match.forEach(function(m, i) { fields[i](m); });
  }

  return d;
};

if (Date.prototype.toLocaleFormat) {
  Date.prototype.format = Date.prototype.toLocaleFormat;
} else {
  Date.prototype.format = function(format) {
    var d = this;
    return format.replace(/%[a-zA-Z0-9]/g, function(s) {
        switch (s) {
          case '%a': return [
              "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat",
            ][d.getDay()];
          case '%A': return [
              "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday",
              "Saturday",
            ][d.getDay()];
          case '%b': return [
              "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep",
              "Oct", "Nov", "Dec",
            ][d.getMonth()];
          case '%B': return [
              "January", "February", "March", "April", "May", "June", "July",
              "August", "September", "October", "November", "December",
            ][d.getMonth()];
          case '%S': return d.getSeconds();
          case '%M': return d.getMinutes();
          case '%H': return d.getHours();
          case '%d': return d.getDate();
          case '%m': return d.getMonth() + 1;
          case '%Y': return d.getYear();
          case '%%': return "%";
          case '%y': return d.getYear() % 100;
        }
        return s;
      });
    };
}
if (typeof CanvasRenderingContext2D == "undefined") {
  var CanvasRenderingContext2D = document
      .createElement("canvas").getContext("2d").constructor;
}

var c = CanvasRenderingContext2D.prototype;
if (c.mozDrawText) {
  if (!c.measureText) {
    c.measureText = function(s) {
      this.mozTextStyle = this.font;
      return { width: this.mozMeasureText(s) };
    };
  }
  if (!c.fillText) {
    c.fillText = function(s, x, y) {
      this.mozTextStyle = this.font;
      this.save();
      this.translate(x, y);
      this.mozDrawText(s);
      this.restore();
    };
  }
} else {
  if (!c.measureText) {
    c.measureText = function() { return { width: -1 }; };
  }
  if (!c.fillText) {
    c.fillText = function() {};
  }
}
window.addEventListener("load", function() {
    var scripts = document.getElementsByTagName("script");
    for (var i = 0; i < scripts.length; i++) {
      if (scripts[i].type == "text/javascript+protovis") {
        try {
          pv.Panel.$dom = scripts[i];
          eval(pv.parse(scripts[i].textContent));
        } catch (ignored) {}
        delete pv.Panel.$dom;
      }
    }
  }, false);
var pv = function () {
var pv = {};

pv.extend = function(f) {
  function g() {}
  g.prototype = f.prototype;
  return new g();
};

/* Function expression support. */
try {
  eval("pv.parse = function(x) x;"); // native support
} catch (e) {
  pv.parse = function(js) { // hacky regex support
    var re = new RegExp("function(\\s+\\w+)?\\([^)]*\\)\\s*", "mg"), m, i = 0;
    var s = "";
    while (m = re.exec(js)) {
      var j = m.index + m[0].length;
      if (js[j--] != '{') {
        s += js.substring(i, j) + "{return ";
        i = j;
        for (var p = 0; p >= 0 && j < js.length; j++) {
          switch (js[j]) {
            case '[': case '(': p++; break;
            case ']': case ')': p--; break;
            case ';':
            case ',': if (p == 0) p--; break;
          }
        }
        s += pv.parse(js.substring(i, --j)) + ";}";
        i = j;
      }
      re.lastIndex = j;
    }
    s += js.substring(i);
    return s;
  };
}

pv.identity = function(x) { return x; };

pv.range = function(start, end, step) {
  if (arguments.length == 1) {
    end = start;
    start = 0;
  }
  if (step == undefined) {
    step = 1;
  }
  var array = [], i = 0, j;
  while ((j = start + step * i++) < end) {
    array.push(j);
  }
  return array;
};

pv.cross = function(a, b) {
  var array = [];
  for (var i = 0, n = a.length, m = b.length; i < n; i++) {
    for (var j = 0, x = a[i]; j < m; j++) {
      array.push([x, b[j]]);
    }
  }
  return array;
};

pv.nest = function(array) {
  return new pv.Nest(array);
};

pv.blend = function(arrays) {
  return Array.prototype.concat.apply([], arrays);
};

pv.keys = function(map) {
  var array = [];
  for (var key in map) {
    array.push(key);
  }
  return array;
};

pv.entries = function(map) {
  var array = [];
  for (var key in map) {
    array.push({ key: key, value: map[key] });
  }
  return array;
};

pv.values = function(map) {
  var array = [];
  for (var key in map) {
    array.push(map[key]);
  }
  return array;
};

pv.normalize = function(array, f) {
  if (!f) {
    f = pv.identity;
  }
  var sum = pv.reduce(array, function(p, d) { return p + f(d); }, 0);
  return array.map(function(d) { return f(d) / sum; });
};

pv.count = function(array) {
  return array.length;
};

pv.sum = function(array, f) {
  if (!f) {
    f = pv.identity;
  }
  return pv.reduce(array, function(p, d) { return p + f(d); }, 0);
};

pv.max = function(array, f) {
  if (!f) {
    f = pv.identity;
  }
  return pv.reduce(array, function(p, d) { return Math.max(p, f(d)); }, -Infinity);
};

pv.max.index = function(array, f) {
  if (!f) {
    f = pv.identity;
  }
  var maxi = -1, maxx = -Infinity;
  for (var i = 0; i < array.length; i++) {
    var x = f(array[i]);
    if (x > maxx) {
      maxx = x;
      maxi = i;
    }
  }
  return maxi;
}

pv.min = function(array, f) {
  if (!f) {
    f = pv.identity;
  }
  return pv.reduce(array, function(p, d) { return Math.min(p, f(d)); }, Infinity);
};

pv.min.index = function(array, f) {
  if (!f) {
    f = pv.identity;
  }
  var mini = -1, minx = Infinity;
  for (var i = 0; i < array.length; i++) {
    var x = f(array[i]);
    if (x < minx) {
      minx = x;
      mini = i;
    }
  }
  return mini;
}

pv.mean = function(array, f) {
  return pv.sum(array, f) / array.length;
};

pv.median = function(array, f) {
  if (!f) {
    f = pv.identity;
  }
  array = array.map(f).sort(function(a, b) { return a - b; });
  if (array.length % 2) {
    return array[Math.floor(array.length / 2)];
  }
  var i = array.length / 2;
  return (array[i - 1] + array[i]) / 2;
};

/**
 * Array reduce was added in JavaScript 1.8. This implementation uses the native
 * method if provided; otherwise we use our own implementation derived from the
 * JavaScript documentation. Note that we don't want to add it to the Array
 * prototype directly because this breaks certain (bad) for loop idioms.
 */
if (/\[native code\]/.test(Array.prototype.reduce)) {
  pv.reduce = function(array, f, v) {
    var p = Array.prototype;
    return p.reduce.apply(array, p.slice.call(arguments, 1));
  };
} else {
  pv.reduce = function(array, f, v) {
    var len = array.length;
    if (!len && (arguments.length == 2)) {
      throw new Error();
    }

    var i = 0;
    if (arguments.length < 3) {
      while (true) {
        if (i in array) {
          v = array[i++];
          break;
        }
        if (++i >= len) {
          throw new Error();
        }
      }
    }

    for (; i < len; i++) {
      if (i in array) {
        v = f.call(null, v, array[i], i, array);
      }
    }
    return v;
  };
};

pv.dict = function(array, f) {
  var m = {};
  for (var i = 0; i < array.length; i++) {
    if (i in array) {
      var k = array[i];
      m[k] = f.call(null, k, i, array);
    }
  }
  return m;
};

pv.permute = function(array, permutation, f) {
  if (!f) {
    f = pv.identity;
  }
  var p = new Array(array.length);
  permutation.forEach(function(j, i) { p[i] = f(array[j]); });
  return p;
};

pv.numerate = function(array, f) {
  if (!f) {
    f = pv.identity;
  }
  var map = {};
  array.forEach(function(x, i) { map[f(x)] = i; });
  return map;
};

pv.reverseOrder = function(b, a) {
  return (a < b) ? -1 : ((a > b) ? 1 : 0);
};

pv.naturalOrder = function(a, b) {
  return (a < b) ? -1 : ((a > b) ? 1 : 0);
};

pv.gradient = function() {
  if (arguments.length < 2) {
    return arguments[0];
  }
  var g = new pv.Gradient();
  for (var i = 0, n = arguments.length - 1; i <= n; i++) {
    g.color(i / n, arguments[i]);
  }
  return g;
};

pv.css = function(e, p) {
  return parseFloat(self.getComputedStyle(e, null).getPropertyValue(p));
};

pv.ns = {
 svg: "http://www.w3.org/2000/svg",
 xmlns: "http://www.w3.org/2000/xmlns",
 xlink: "http://www.w3.org/1999/xlink",
};

pv.version = { major: 2, minor: 5 };
pv.Nest = function(array) {
  this.array = array;
  this.keys = [];
};

pv.Nest.prototype.key = function(key) {
  this.keys.push(key);
  return this;
};

pv.Nest.prototype.sortKeys = function(order) {
  this.keys[this.keys.length - 1].order = order || pv.naturalOrder;
  return this;
};

pv.Nest.prototype.sortValues = function(order) {
  this.order = order || pv.naturalOrder;
  return this;
};

pv.Nest.prototype.rollup = function(f) {
  var map = this.map();

  function rollup(map) {
    for (var key in map) {
      var e = map[key];
      if (e instanceof Array) {
        map[key] = f(e);
      } else {
        rollup(e);
      }
    }
  }

  rollup(map);
  return map;
};

pv.Nest.prototype.entries = function() {

  function entries(map) {
    var array = [];
    for (var k in map) {
      var v = map[k];
      array.push({ key: k, values: (v instanceof Array) ? v : entries(v) });
    };
    return array;
  }

  function sort(array, i) {
    var o = this.keys[i].order;
    if (o) {
      array.sort(function(a, b) { return o(a.key, b.key); });
    }
    if (++i < this.keys.length) {
      for (var j = 0; j < array.length; j++) {
        sort.call(this, array[j].values, i);
      }
    }
    return array;
  }

  return sort.call(this, entries(this.map()), 0);
};

pv.Nest.prototype.map = function() {
  if (!this.keys.length) {
    return this.array;
  }

  var map = {}, values = [];
  for (var i, j = 0; j < this.array.length; j++) {
    var x = this.array[j];
    var m = map;
    for (i = 0; i < this.keys.length - 1; i++) {
      var k = this.keys[i](x);
      if (!m[k]) {
        m[k] = {};
      }
      m = m[k];
    }
    k = this.keys[i](x);
    if (!m[k]) {
      var a = [];
      values.push(a);
      m[k] = a;
    }
    m[k].push(x);
  }

  if (this.order) {
    for (var i = 0; i < values.length; i++) {
      values[i].sort(this.order);
    }
  }

  return map;
};
pv.Scales = {};
pv.Scales.epsilon = 1e-30;
pv.Scales.defaultBase = 10;

/**
 * Scale is a base class for scale objects. Scale objects are used to scale the
 * data to a given range. The Scale object initially scales the value to the
 * interval [0, 1]. The values are then mapped to a given range by the range()
 * method.
 */
pv.Scales.Scale = function() {
  // Pixel coordinate minimum
  this._rMin = 0;
  // Pixel coordinate maximum
  this._rMax = 100;
  // Round value?
  this._round = true;
};

/**
 * Sets the range to map the data to.
 */
pv.Scales.Scale.prototype.range = function(a, b) {
  if (a == undefined) {
    // use default values
    // TODO: [0, 100] may not be the best default values.
    // Find better default values, which may be different for each scale type.
  } else if (b == undefined) {
    this._rMin = 0;
    this._rMax = a;
  } else {
    this._rMin = a;
    this._rMax = b;
  }

  return this;
};

// Accessor method for range min
pv.Scales.Scale.prototype.rangeMin = function(x) {
  if (x == undefined) {
    return this._rMin;
  } else {
    this._rMin = x;
    return this;
  }
};

// Accessor method for range max
pv.Scales.Scale.prototype.rangeMax = function(x) {
  if (x == undefined) {
    return this._rMax;
  } else {
    this._rMax = x;
    return this;
  }
};

//Scales the input to the set range
pv.Scales.Scale.prototype.scale = function(x) {
  var v = this._rMin + (this._rMax-this._rMin) * this.normalize(x);
  return this._round ? Math.round(v) : v;
};

// Returns the inverse scaled value.
pv.Scales.Scale.prototype.invert = function(y) {
  var n = (y - this._rMin) / (this._rMax - this._rMin);
  return this.unnormalize(n);
};
pv.Scales.ordinal = function(ordinals) {
  return new pv.Scales.OrdinalScale(ordinals);
};

/**
 * OrdinalScale is a Scale for ordered sequential data.  This supports both
 * numeric and non-numeric data, and simply places each element in sequence
 * using the ordering found in the input data array.
 */
pv.Scales.OrdinalScale = function(ordinals) {
  pv.Scales.Scale.call(this);

  /* Filter the specified ordinals to their unique values. */
  var seen = {};
  this._ordinals = [];
  for (var i = 0; i < ordinals.length; i++) {
    var o = ordinals[i];
    if (seen[o] == undefined) {
      seen[o] = true;
      this._ordinals.push(o);
    }
  }

  this._map = pv.numerate(this._ordinals);
};

pv.Scales.OrdinalScale.prototype = pv.extend(pv.Scales.Scale);

// Accessor method for ordinals
pv.Scales.OrdinalScale.prototype.ordinals = function(ordinals) {
  if (ordinals == undefined) {
    return this._ordinals;
  } else {
    this._ordinals = ordinals;
    this._map = pv.numerate(ordinals);
    return this;
  }
};

// Normalizes the value
pv.Scales.OrdinalScale.prototype.normalize = function(x) {
  var i = this._map[x];

  // if x not an ordinal value(assume x is an index value)
  if (i == undefined) i = x;

  // Not sure if the value should be shifted
  return (i == undefined) ? -1 : (i + 0.5) / this._ordinals.length;
};

// Returns the ordinal values for i
pv.Scales.OrdinalScale.prototype.unnormalize = function(n) {
  var i = Math.floor(n * this._ordinals.length - 0.5);
  return this._ordinals[i];
};

// Returns a list of rule values
pv.Scales.OrdinalScale.prototype.ruleValues = function() {
  return pv.range(0.5, this._ordinals.length-0.5);
};

// Returns the width between rules
pv.Scales.OrdinalScale.prototype.ruleWidth = function() {
  return this.scale(1/this._ordinals.length);
};
/**
 * QuantitativeScale is a base class for representing quantitative numerical data
 * scales.
 */
pv.Scales.QuantitativeScale = function(min, max, base) {
  pv.Scales.Scale.call(this);

  this._min = min;
  this._max = max;
  this._base = base==undefined ? pv.Scales.defaultBase : base;
};

pv.Scales.QuantitativeScale.prototype = pv.extend(pv.Scales.Scale);

// Accessor method for min
pv.Scales.QuantitativeScale.prototype.min = function(x) {
  if (x == undefined) {
    return this._min;
  } else {
    this._min = x;
    return this;
  }
};

// Accessor method for max
pv.Scales.QuantitativeScale.prototype.max = function(x) {
  if (x == undefined) {
    return this._max;
  } else {
    this._max = x;
    return this;
  }
};

// Accessor method for base
pv.Scales.QuantitativeScale.prototype.base = function(x) {
  if (x == undefined) {
    return this._base;
  } else {
    this._base = x;
    return this;
  }
};

// Checks if the mapped interval contains x
pv.Scales.QuantitativeScale.prototype.contains = function(x) {
  return (x >= this._min && x <= this._max);
};

// Returns the step for the scale
pv.Scales.QuantitativeScale.prototype.step = function(min, max, base) {
  if (!base) base = pv.Scales.defaultBase;
  var exp = Math.round(Math.log(max-min)/Math.log(base)) - 1;

  return Math.pow(base, exp);
};
pv.Scales.linear = function(min, max, base) {
  return new pv.Scales.LinearScale(min, max, base);
};

pv.Scales.linear.fromData = function(data, f, base) {
  return new pv.Scales.LinearScale(pv.min(data, f), pv.max(data, f), base);
}

/**
 * LinearScale is a QuantativeScale that spaces values linearly along the scale
 * range. This is the default scale for numeric types.
 */
pv.Scales.LinearScale = function(min, max, base) {
  pv.Scales.QuantitativeScale.call(this, min, max, base);
};

pv.Scales.LinearScale.prototype = pv.extend(pv.Scales.QuantitativeScale);

// Normalizes the value
pv.Scales.LinearScale.prototype.normalize = function(x) {
  var eps = pv.Scales.epsilon;
  var range = this._max - this._min;

  return (range < eps && range > -eps) ? 0 : (x - this._min) / range;
};

// Un-normalizes the value
pv.Scales.LinearScale.prototype.unnormalize = function(n) {
  return n * (this._max - this._min) + this._min;
};

// Sets min/max values to "nice numbers"
pv.Scales.LinearScale.prototype.nice = function() {
  var step = this.step(this._min, this._max, this._base);

  this._min = Math.floor(this._min / step) * step;
  this._max = Math.ceil(this._max / step) * step;

  return this;
};

// Returns a list of rule values
pv.Scales.LinearScale.prototype.ruleValues = function() {
  var step = this.step(this._min, this._max, this._base);

  var start = Math.floor(this._min / step) * step;
  var end = Math.ceil(this._max / step) * step;

  var list = pv.range(start, end+step, step);

  // Remove precision problems
  // TODO move to tick rendering, not scales
  if (step < 1) {
    var exp = Math.round(Math.log(step)/Math.log(this._base));

    for (var i = 0; i < list.length; i++) {
      list[i] = list[i].toFixed(-exp);
    }
  }

  // check end points
  if (list[0] < this._min) list.splice(0, 1);
  if (list[list.length-1] > this._max) list.splice(list.length-1, 1);

  return list;
};
pv.Scales.log = function(min, max, base) {
  return new pv.Scales.LogScale(min, max, base);
};

pv.Scales.log.fromData = function(data, f, base) {
  return new pv.Scales.LogScale(pv.min(data, f), pv.max(data, f), base);
}

/*
 * LogScale is a QuantativeScale that performs a log transformation of the
 * data. The base of the logarithm is determined by the base property.
 */
pv.Scales.LogScale = function(min, max, base) {
  pv.Scales.QuantitativeScale.call(this, min, max, base);

  this.update();
};

// Zero-symmetric log function
pv.Scales.LogScale.log = function(x, b) {
  return x==0 ? 0 : x>0 ? Math.log(x)/Math.log(b) : -Math.log(-x)/Math.log(b);
};

// Adjusted zero-symmetric log function
pv.Scales.LogScale.zlog = function(x, b) {
  var s = (x < 0) ? -1 : 1;
  x = s*x;
  if (x < b) x += (b-x)/b;
  return s * Math.log(x) / Math.log(b);
};

pv.Scales.LogScale.prototype = pv.extend(pv.Scales.QuantitativeScale);

// Accessor method for min
pv.Scales.LogScale.prototype.min = function(x) {
  var value = pv.Scales.QuantitativeScale.prototype.min.call(this, x);

  if (x != undefined) this.update();
  return value;
};

// Accessor method for max
pv.Scales.LogScale.prototype.max = function(x) {
  var value = pv.Scales.QuantitativeScale.prototype.max.call(this, x);

  if (x != undefined) this.update();
  return value;
};

// Accessor method for base
pv.Scales.LogScale.prototype.base = function(x) {
  var value = pv.Scales.QuantitativeScale.prototype.base.call(this, x);

  if (x != undefined) this.update();
  return value;
};

// Normalizes the value
pv.Scales.LogScale.prototype.normalize = function(x) {
  var eps = pv.Scales.epsilon;
  var range = this._lmax - this._lmin;

  return (range < eps && range > -eps) ? 0 : (this._log(x, this._base) - this._lmin) / range;
};

// Un-normalizes the value
pv.Scales.LogScale.prototype.unnormalize = function(n) {
  // TODO: handle case where _log = zlog
  return Math.pow(this._base, n * (this._lmax - this._lmin) + this._lmin);
};

/**
 * Sets min/max values to "nice numbers" For LogScale, we compute "nice" min/max
 * values for the log scale(_lmin, _lmax) first, then calculate the data min/max
 * values from the log min/max values.
 */
pv.Scales.LogScale.prototype.nice = function() {
  var step = 1; //this.step(this._lmin, this._lmax);

  this._lmin = Math.floor(this._lmin / step) * step;
  this._lmax = Math.ceil(this._lmax / step) * step;

  // TODO: handle case where _log = zlog
  this._min = Math.pow(this._base, this._lmin);
  this._max = Math.pow(this._base, this._lmax);

  return this;
};

// Returns a list of rule values
pv.Scales.LogScale.prototype.ruleValues = function() {
  var step = this.step(this._lmin, this._lmax);
  if (step < 1) step = 1; // bound to 1

  var start = Math.floor(this._lmin);
  var end = Math.ceil(this._lmax);

  var list =[];
  var i, j, b;
  for (i = start; i < end; i++) { // for each step
    // add each rule value
    // TODO: handle case where _log = zlog
    b = Math.pow(this._base, i);
    for (j = 1; j < this._base; j++) {
      if (i >= 0) list.push(b*j);
      else list.push((b*j).toFixed(-i));
    }
  }
  list.push(b*this._base); // add max value

  // check end points
  if (list[0] < this._min) list.splice(0, 1);
  if (list[list.length-1] > this._max) list.splice(list.length-1, 1);

  return list;
};

// Update log scale values
pv.Scales.LogScale.prototype.update = function() {
  this._log = (this._min < 0 && this._max > 0) ? pv.Scales.LogScale.zlog : pv.Scales.LogScale.log;
  this._lmin = this._log(this._min, this._base);
  this._lmax = this._log(this._max, this._base);
};
pv.Scales.root = function(min, max, base) {
  return new pv.Scales.RootScale(min, max, base);
};

pv.Scales.root.fromData = function(data, f, base) {
  return new pv.Scales.RootScale(pv.min(data, f), pv.max(data, f), base);
}

/**
 * RootScale is a QuantativeScale that performs a root transformation of the
 * data. This could be a square root or any arbitrary power. A root scale may
 * be a many-to-one mapping where the reverse mapping will not be correct.
 */
pv.Scales.RootScale = function(min, max, base) {
  if (min instanceof Array) {
    if (max == undefined) max = 2; // default base for root is 2.
  } else {
    if (base == undefined) base = 2; // default base for root is 2.
  }

  pv.Scales.QuantitativeScale.call(this, min, max, base);

  this.update();
};

// Returns the root value with base b
pv.Scales.RootScale.root = function (x, b) {
  var s = (x < 0) ? -1 : 1;
  return s * Math.pow(s * x, 1 / b);
};

pv.Scales.RootScale.prototype = pv.extend(pv.Scales.QuantitativeScale);

// Accessor method for min
pv.Scales.RootScale.prototype.min = function(x) {
  var value = pv.Scales.QuantitativeScale.prototype.min.call(this, x);
  if (x != undefined) this.update();
  return value;
};

// Accessor method for max
pv.Scales.RootScale.prototype.max = function(x) {
  var value = pv.Scales.QuantitativeScale.prototype.max.call(this, x);
  if (x != undefined) this.update();
  return value;
};

// Accessor method for base
pv.Scales.RootScale.prototype.base = function(x) {
  var value = pv.Scales.QuantitativeScale.prototype.base.call(this, x);
  if (x != undefined) this.update();
  return value;
};

// Normalizes the value
pv.Scales.RootScale.prototype.normalize = function(x) {
  var eps = pv.Scales.epsilon;
  var range = this._rmax - this._rmin;

  return (range < eps && range > -eps) ? 0
    : (pv.Scales.RootScale.root(x, this._base) - this._rmin)
      / (this._rmax - this._rmin);
};

// Un-normalizes the value
pv.Scales.RootScale.prototype.unnormalize = function(n) {
  return Math.pow(n * (this._rmax - this._rmin) + this._rmin, this._base);
};

// Sets min/max values to "nice numbers"
pv.Scales.RootScale.prototype.nice = function() {
  var step = this.step(this._rmin, this._rmax);

  this._rmin = Math.floor(this._rmin / step) * step;
  this._rmax = Math.ceil(this._rmax / step) * step;

  this._min = Math.pow(this._rmin, this._base);
  this._max = Math.pow(this._rmax, this._base);

  return this;
};

// Returns a list of rule values
// The rule values of a root scale should be the powers
// of integers, e.g. 1, 4, 9, ... for base = 2
// TODO: This function needs further testing
pv.Scales.RootScale.prototype.ruleValues = function() {
  var step = this.step(this._rmin, this._rmax);
//  if (step < 1) step = 1; // bound to 1
  // TODO: handle decimal values

  var s;
  var list = pv.range(Math.floor(this._rmin), Math.ceil(this._rmax), step);
  for (var i = 0; i < list.length; i++) {
    s = (list[i] < 0) ? -1 : 1;
    list[i] = s*Math.pow(list[i], this._base);
  }

  // check end points
  if (list[0] < this._min) list.splice(0, 1);
  if (list[list.length-1] > this._max) list.splice(list.length-1, 1);

  return list;
};

// Update root scale values
pv.Scales.RootScale.prototype.update = function() {
  var rt = pv.Scales.RootScale.root;
  this._rmin = rt(this._min, this._base);
  this._rmax = rt(this._max, this._base);
};
pv.Scales.dateTime = function(min, max) {
  return new pv.Scales.DateTimeScale(min, max);
}

/**
 * DateTimeScale DateTimeScale scales time data.
 */
pv.Scales.DateTimeScale = function(min, max) {
  pv.Scales.Scale.call(this);

  this._min = min;
  this._max = max;
};

pv.Scales.DateTimeScale.prototype = pv.extend(pv.Scales.Scale);

// Accessor method for min
pv.Scales.DateTimeScale.prototype.min = function(x) {
  if (x == undefined) {
    return this._min;
  } else {
    this._min = x;
    return this;
  }
};

// Accessor method for max
pv.Scales.DateTimeScale.prototype.max = function(x) {
  if (x == undefined) {
    return this._max;
  } else {
    this._max = x;
    return this;
  }
};

// Normalizes DateTimeScale value
pv.Scales.DateTimeScale.prototype.normalize = function(x) {
  var eps = pv.Scales.epsilon;
  var range = this._max - this._min;

  return (range < eps && range > -eps) ? 0 : (x - this._min) / range;
};

// Un-normalizes the value
pv.Scales.DateTimeScale.prototype.unnormalize = function(n) {
  return n * (this._max - this._min) + this._min;
};

// Checks if the mapped interval contains x
pv.Scales.DateTimeScale.prototype.contains = function(x) {
  var t = x.valueOf();
  return (t >= this._min.valueOf() && t <= this._max.valueOf());
};

// Sets min/max values to "nice" values
pv.Scales.DateTimeScale.prototype.nice = function() {
  var span  = this.span(this._min, this._max);
  this._min = this.round(this._min, span, false);
  this._max = this.round(this._max, span, true);
};

// Returns a list of rule values
pv.Scales.DateTimeScale.prototype.ruleValues = function() {
  var min  = this._min.valueOf(), max = this._max.valueOf();
  var span = this.span(this._min, this._max);
  var step = this.step(this._min, this._max, span);
  var list = [];

  var d = this._min;
  if (span < pv.Scales.DateTimeScale.Span.MONTHS) {
    while (d.valueOf() <= max) {
      list.push(d);
      d = new Date(d.valueOf()+step);
    }
  } else if (span == pv.Scales.DateTimeScale.Span.MONTHS) {
    // TODO: Handle quarters
    step = 1;
    while (d.valueOf() <= max) {
      list.push(d);
      d = new Date(d);
      d.setMonth(d.getMonth() + step);
    }
  } else { // Span.YEARS
    step = 1;
    while (d.valueOf() <= max) {
      list.push(d);
      d = new Date(d);
      d.setFullYear(d.getFullYear() + step);
    }
  }

  return list;
};

// Time Span Constants
pv.Scales.DateTimeScale.Span = {};
pv.Scales.DateTimeScale.Span.YEARS        =  0;
pv.Scales.DateTimeScale.Span.MONTHS       = -1;
pv.Scales.DateTimeScale.Span.DAYS         = -2;
pv.Scales.DateTimeScale.Span.HOURS        = -3;
pv.Scales.DateTimeScale.Span.MINUTES      = -4;
pv.Scales.DateTimeScale.Span.SECONDS      = -5;
pv.Scales.DateTimeScale.Span.MILLISECONDS = -6;
pv.Scales.DateTimeScale.Span.WEEKS        = -10;
pv.Scales.DateTimeScale.Span.QUARTERS     = -11;

// Rounds the date
pv.Scales.DateTimeScale.prototype.round = function(t, span, roundUp) {
  var Span = pv.Scales.DateTimeScale.Span;
  var d = t, bias = roundUp ? 1 : 0;

  if (span > Span.YEARS) {
    d = new Date(t.getFullYear() + bias, 0);
  } else if (span == Span.MONTHS) {
    d = new Date(t.getFullYear(), t.getMonth() + bias);
  } else if (span == Span.DAYS) {
    d = new Date(t.getFullYear(), t.getMonth(), t.getDate() + bias);
  } else if (span == Span.HOURS) {
    d = new Date(t.getFullYear(), t.getMonth(), t.getDate(), t.getHours() + bias);
  } else if (span == Span.MINUTES) {
    d = new Date(t.getFullYear(), t.getMonth(), t.getDate(), t.getHours(), t.getMinutes() + bias);
  } else if (span == Span.SECONDS) {
    d = new Date(t.getFullYear(), t.getMonth(), t.getDate(), t.getHours(), t.getMinutes(), t.getSeconds() + bias);
  } else if (span == Span.MILLISECONDS) {
    d = new Date(d.time + (roundUp ? 1 : -1));
  } else if (span == Span.WEEKS) {
    bias = roundUp ? 7 - d.day : -d.day;
    d = new Date(t.getFullYear(), t.getMonth(), t.getDate() + bias);
  }
  return d;
};

// Returns the span of the given min/max values
pv.Scales.DateTimeScale.prototype.span = function(min, max) {
  var MS_MIN = 60*1000, MS_HOUR = 60*MS_MIN, MS_DAY = 24*MS_HOUR, MS_WEEK = 7*MS_DAY;
  var Span = pv.Scales.DateTimeScale.Span;
  var span = max.valueOf() - min.valueOf();
  var days = span / MS_DAY;

  // TODO: handle Weeks/Quarters
  if (days >= 365*2) return (1 + max.getFullYear()-min.getFullYear());
  else if (days >= 60) return Span.MONTHS;
  else if (span/MS_WEEK > 1) return Span.WEEKS;
  else if (span/MS_DAY > 1) return Span.DAYS;
  else if (span/MS_HOUR > 1) return Span.HOURS;
  else if (span/MS_MIN > 1) return Span.MINUTES;
  else if (span/1000.0 > 1) return Span.SECONDS;
  else return Span.MILLISECONDS;
}

// Returns the step for the scale
pv.Scales.DateTimeScale.prototype.step = function(min, max, span) {
  var Span = pv.Scales.DateTimeScale.Span;

  if (span > Span.YEARS) {
    var exp = Math.round(Math.log(Math.max(1,span-1)/Math.log(10))) - 1;
    return Math.pow(10, exp);
  } else if (span == Span.MONTHS) {
    return 0;
  } else if (span == Span.WEEKS) {
    return 7*24*60*60*1000;
  } else if (span == Span.DAYS) {
    return 24*60*60*1000;
  } else if (span == Span.HOURS) {
    return 60*60*1000;
  } else if (span == Span.MINUTES) {
    return 60*1000;
  } else if (span == Span.SECONDS) {
    return 1000;
  } else {
    return 1;
  }
};
pv.Colors = function(values) {

  /*
   * Each set of colors has an associated (numeric) ID that is used to store a
   * cache of assigned colors on the root scene. As unique keys are discovered,
   * a new color is allocated and assigned to the given key.
   *
   * The key function determines how uniqueness is determined. By default,
   * colors are assigned using the mark's childIndex, such that each new mark
   * added is given a new color. Note that derived marks will not inherit the
   * exact color of the prototype, but instead inherit the set of colors.
   */
  function colors(keyf) {
    var id = pv.Colors.count++;

    function color() {
      var key = keyf.apply(this, this.root.scene.data);
      var state = this.root.scene.colors;
      if (!state) this.root.scene.colors = state = {};
      if (!state[id]) state[id] = { count: 0 };
      var color = state[id][key];
      if (color == undefined) {
        color = state[id][key] = values[state[id].count++ % values.length];
      }
      return color;
    }
    return color;
  };

  var c = colors(function() { return this.childIndex; });

  /*
   * The by function allows a new set of colors to be derived from the current
   * set using a different key function. For instance, to color marks using the
   * value of the field "foo", say: pv.Colors.category10.by(function(d) d.foo).
   * For convenience, "index" and "parent.index" keys are predefined.
   */
  c.by = colors;
  c.unique = c.by(function() { return this.index; });
  c.parent = c.by(function() { return this.parent.index; });

  /* Or, you can just access the array of color values directly. */
  c.values = values;

  return c;
};

pv.Colors.count = 0;

/* From Flare. */

pv.Colors.category10 = pv.Colors([
  "#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd",
  "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"
]);

pv.Colors.category20 = pv.Colors([
  "#1f77b4", "#aec7e8", "#ff7f0e", "#ffbb78", "#2ca02c",
  "#98df8a", "#d62728", "#ff9896", "#9467bd", "#c5b0d5",
  "#8c564b", "#c49c94", "#e377c2", "#f7b6d2", "#7f7f7f",
  "#c7c7c7", "#bcbd22", "#dbdb8d", "#17becf", "#9edae5"
]);

pv.Colors.category19 = pv.Colors([
  "#9c9ede", "#7375b5", "#4a5584", "#cedb9c", "#b5cf6b",
  "#8ca252", "#637939", "#e7cb94", "#e7ba52", "#bd9e39",
  "#8c6d31", "#e7969c", "#d6616b", "#ad494a", "#843c39",
  "#de9ed6", "#ce6dbd", "#a55194", "#7b4173"
]);
/*
 * For now, just support {rgba, hsla} conversion to {rgb, hsl} with separate
 * opacity. In the future, it would be nice to support gradients and patterns,
 * and to include stroke-width with the style definition (e.g., "solid 10px
 * red").
 */

pv.Style = function(style) {
  this.opacity = 1;
  if (!style || (style == "transparent")) {
    this.color = "none";
  } else {
    var m1 = /([a-z]+)\((.*)\)/i.exec(style);
    if (m1) {
      var m2 = m1[2].split(",");
      switch (m1[1]) {
        case "hsla":
        case "hsl": {
          var h = parseFloat(m2[0]),
              s = parseFloat(m2[1]) / 100,
              l = parseFloat(m2[2]) / 100;
          this.color = pv.Style.hslToRgb(h, s, l).toString();
          break;
        }
        case "rgba":
        case "rgb": {
          this.color = "rgb(" + m2.slice(0, 3).join(",") + ")";
          break;
        }
      }
      switch (m1[1]) {
        case "hsla":
        case "rgba": {
          this.opacity = parseFloat(m2[3]);
          break;
        }
      }
    } else {
      this.color = style;
    }
  }
};

/**
 * @return rgb in [0, 1]
 * @param h hue in degrees in [0, 360) (modulo)
 * @param s saturation in [0, 1] (clamp)
 * @param l luminosity in [0, 1] (clamp)
 */
pv.Style.hslToRgb = function(h, s, l) {
  h = h % 360;
  if (h < 0) h += 360;
  s = Math.max(0, Math.min(s, 1));
  l = Math.max(0, Math.min(l, 1));

  function rgb(r, g, b) {
    this.r = r;
    this.g = g;
    this.b = b;
  }
  rgb.prototype.toString = function() {
    return "rgb(" + Math.round(this.r * 255) + ","
        + Math.round(this.g * 255) + ","
        + Math.round(this.b * 255) + ")";
  };

  /* From FvD 13.37 */
  var m2 = (l < .5) ? (l * (l + s)) : (l + s - l * s);
  var m1 = 2 * l - m2;
  if (s == 0) {
    return new rgb(l, l, l);
  }
  function v(h) {
    if (h > 360) h -= 360;
    else if (h < 0) h += 360;
    if (h < 60) return m1 + (m2 - m1) * h / 60;
    else if (h < 180) return m2;
    else if (h < 240) return m1 + (m2 - m1) * (240 - h) / 60;
    return m1;
  }
  return new rgb(v(h + 120), v(h), v(h - 120));
};
pv.Mark = function() {};

pv.Mark.toString = function() {
  return "mark";
};

pv.Mark.property = function(name) {
  return function(v) {
      if (arguments.length) {
        if (this.scene) {
          this.scene[this.index][name] = v;
        } else {
          this["$" + name] = (v instanceof Function) ? v : function() { return v; };
        }
        return this;
      }
      return this.scene[this.index][name];
    };
};

pv.Mark.prototype.defineProperty = function(name) {
  if (!this.hasOwnProperty("properties")) {
    this.properties = (this.properties || []).concat();
  }
  this.properties.push(name);
  this[name] = pv.Mark.property(name);
};

pv.Mark.prototype.type = pv.Mark;
pv.Mark.prototype.proto = null;
pv.Mark.prototype.parent = null;
pv.Mark.prototype.childIndex = -1;
pv.Mark.prototype.index = -1;
pv.Mark.prototype.scene = null;
pv.Mark.prototype.root = null;
pv.Mark.prototype.defineProperty("data");
pv.Mark.prototype.defineProperty("visible");
pv.Mark.prototype.defineProperty("left");
pv.Mark.prototype.defineProperty("right");
pv.Mark.prototype.defineProperty("top");
pv.Mark.prototype.defineProperty("bottom");
pv.Mark.prototype.defineProperty("cursor");
pv.Mark.prototype.defineProperty("title");

pv.Mark.defaults = new pv.Mark()
  .data([null])
  .visible(true);

pv.Mark.prototype.extend = function(proto) {
  this.proto = proto;
  return this;
};

pv.Mark.prototype.add = function(type) {
  return this.parent.add(type).extend(this);
};

pv.Mark.Anchor = function() {
  pv.Mark.call(this);
};

pv.Mark.Anchor.prototype = pv.extend(pv.Mark);
pv.Mark.Anchor.prototype.name = pv.Mark.property("name");

pv.Mark.prototype.anchor = function(name) {
  var anchorType = this.type;
  while (!anchorType.Anchor) {
    anchorType = anchorType.defaults.proto.type;
  }
  var anchor = new anchorType.Anchor().extend(this).name(name);
  anchor.parent = this.parent;
  anchor.type = this.type;
  return anchor;
};

pv.Mark.prototype.anchorTarget = function() {
  var target = this;
  while (!(target instanceof pv.Mark.Anchor)) {
    target = target.proto;
  }
  return target.proto;
};

pv.Mark.prototype.first = function() {
  return this.scene[0];
};

pv.Mark.prototype.last = function() {
  return this.scene[this.scene.length - 1];
};

pv.Mark.prototype.sibling = function() {
  return (this.index == 0) ? null : this.scene[this.index - 1];
};

pv.Mark.prototype.cousin = function(panel, i) {
  var s = panel
      ? panel.scene[this.parent.index]
      : (this.parent && this.parent.sibling());
  return (s && s.children)
      ? s.children[this.childIndex][(i == undefined) ? this.index : i]
      : null;
};

/**
 * Renders this mark; includes all children marks if this is a panel. This
 * method consists of two phases: BUILD and UPDATE.
 */
pv.Mark.prototype.render = function() {
  this.build();
  this.update();
};

/**
 * Evaluates properties and computes implied properties.
 */
pv.Mark.prototype.build = function(parent) {
  if (!this.scene) {
    this.scene = [];
    if (!this.parent) {
      this.scene.data = [];
    }
  }

  var data = this.get("data");
  var stack = this.root.scene.data;
  stack.unshift(null);
  this.index = -1;
  for (var i = 0, d; i < data.length; i++) {
    pv.Mark.prototype.index = ++this.index;
    var s = {};

    /*
     * This is a bit confusing and could be cleaned up. This "scene" stores the
     * previous scene graph; we want to reuse SVG elements that were created
     * previously rather than recreating them, so we extract them. We also want
     * to reuse SVG child elements as well.
     */
    if (this.scene[this.index]) {
      s.svg = this.scene[this.index].svg;
      s.children = this.scene[this.index].children;
    }
    this.scene[this.index] = s;

    s.index = i;
    s.data = stack[0] = data[i];
    s.parent = parent;
    s.visible = this.get("visible");
    if (s.visible) {
      this.buildInstance(s);
    }
  }
  stack.shift();
  delete this.index;
  pv.Mark.prototype.index = -1;

  /* Clear any old instances from the scene. */
  for (var i = data.length; i < this.scene.length; i++) {
    this.clearInstance(this.scene[i]);
  }
  this.scene.length = data.length;

  return this;
};

pv.Mark.prototype.clearInstance = function(s) {
  if (s.svg) {
    s.parent.svg.removeChild(s.svg);
  }
};

pv.Mark.prototype.buildInstance = function(s) {
  var p = this.type.prototype;
  for (var i = 0; i < p.properties.length; i++) {
    var name = p.properties[i];
    if (!(name in s)) {
      s[name] = this.get(name);
    }
  }
  this.buildImplied(s);
};

pv.Mark.prototype.buildImplied = function(s) {
  var p = this.type.prototype;

  var l = s.left;
  var r = s.right;
  var t = s.top;
  var b = s.bottom;
  var w = p.width ? s.width : 0;
  var h = p.height ? s.height : 0;

  var width = s.parent ? s.parent.width : 0;
  if (w == null) {
    w = width - (r = r || 0) - (l = l || 0);
  } else if (r == null) {
    r = width - w - (l = l || 0);
  } else if (l == null) {
    l = width - w - (r = r || 0);
  }

  var height = s.parent ? s.parent.height : 0;
  if (h == null) {
    h = height - (t = t || 0) - (b = b || 0);
  } else if (b == null) {
    b = height - h - (t = t || 0);
  } else if (t == null) {
    t = height - h - (b = b || 0);
  }

  s.left = l;
  s.right = r;
  s.top = t;
  s.bottom = b;
  if (p.width) s.width = w;
  if (p.height) s.height = h;
};

pv.Mark.prototype.get = function(name) {
  var mark = this;
  while (!mark["$" + name]) {
    mark = mark.proto;
    if (!mark) {
      mark = this.type.defaults;
      while (!mark["$" + name]) {
        mark = mark.proto;
        if (!mark) {
          return null;
        }
      }
      break;
    }
  }

  // Note that the property function is applied to the 'this' instance (the
  // leaf-level mark), rather than whatever mark defined the property function.
  // This can be confusing because a property function can be called on an
  // object of a different "class", but is useful for logic reuse.
  return mark["$" + name].apply(this, this.root.scene.data);
};

/**
 * Previously-computed property values are used to update the display. In cases
 * where the scene graph has been manipulated externally, this method can be
 * invoked separately to update the display (e.g., changing the color of a mark
 * on mouse-over).
 */
pv.Mark.prototype.update = function() {
  for (var i = 0; i < this.scene.length; i++) {
    this.updateInstance(this.scene[i]);
  }
};

pv.Mark.prototype.updateInstance = function(s) {
  var that = this, v = s.svg;

  if (!s.visible) {
    if (v) v.setAttribute("display", "none");
    return;
  }
  v.removeAttribute("display");

  /* TODO set title via mouseover + mouseout. */
  if (s.cursor) v.style.cursor = s.cursor;

  function dispatch(type) {
    return function(e) {
        /* TODO set full scene stack. */
        var data = [s.data], p = s;
        while (p = p.parent) {
          data.push(p.data);
        }
        that.index = s.index;
        that.scene = s.parent.children[that.childIndex];
        that.events[type].apply(that, data);
        that.updateInstance(s); // XXX updateInstance, bah!
        delete that.index;
        delete that.scene;
        e.preventDefault();
      };
  };

  /* TODO inherit event handlers. */
  for (var type in this.events) {
    v["on" + type] = dispatch(type);
  }
};

pv.Mark.prototype.event = function(type, handler) {
  if (!this.events) this.events = {};
  this.events[type] = handler;
  return this;
};
pv.Area = function() {
  pv.Mark.call(this);
};

pv.Area.toString = function() {
  return "area";
};

pv.Area.prototype = pv.extend(pv.Mark);
pv.Area.prototype.type = pv.Area;
pv.Area.prototype.defineProperty("width");
pv.Area.prototype.defineProperty("height");
pv.Area.prototype.defineProperty("lineWidth");
pv.Area.prototype.defineProperty("strokeStyle");
pv.Area.prototype.defineProperty("fillStyle");

pv.Area.defaults = new pv.Area().extend(pv.Mark.defaults)
    .width(0)
    .height(0)
    .lineWidth(1.5)
    .strokeStyle(null)
    .fillStyle(pv.Colors.category20);

pv.Area.Anchor = function() {
  pv.Mark.Anchor.call(this);
};

pv.Area.Anchor.prototype = pv.extend(pv.Mark.Anchor);
pv.Area.Anchor.prototype.type = pv.Area;

pv.Area.Anchor.prototype.$left = function(d) {
  var area = this.anchorTarget();
  switch (this.get("name")) {
    case "bottom":
    case "top":
    case "center": return area.left() + area.width() / 2;
    case "right": return area.left() + area.width();
  }
  return null;
};

pv.Area.Anchor.prototype.$right = function(d) {
  var area = this.anchorTarget();
  switch (this.get("name")) {
    case "bottom":
    case "top":
    case "center": return area.right() + area.width() / 2;
    case "left": return area.right() + area.width();
  }
  return null;
};

pv.Area.Anchor.prototype.$top = function(d) {
  var area = this.anchorTarget();
  switch (this.get("name")) {
    case "left":
    case "right":
    case "center": return area.top() + area.height() / 2;
    case "bottom": return area.top() + area.height();
  }
  return null;
};

pv.Area.Anchor.prototype.$bottom = function(d) {
  var area = this.anchorTarget();
  switch (this.get("name")) {
    case "left":
    case "right":
    case "center": return area.bottom() + area.height() / 2;
    case "top": return area.bottom() + area.height();
  }
  return null;
};

pv.Area.Anchor.prototype.$textAlign = function(d) {
  switch (this.get("name")) {
    case "left": return "left";
    case "bottom":
    case "top":
    case "center": return "center";
    case "right": return "right";
  }
  return null;
};

pv.Area.Anchor.prototype.$textBaseline = function(d) {
  switch (this.get("name")) {
    case "right":
    case "left":
    case "center": return "middle";
    case "top": return "top";
    case "bottom": return "bottom";
  }
  return null;
};

pv.Area.prototype.update = function(g) {
  if (!this.scene.length) return;

  var s = this.scene[0], v = s.svg;
  if (s.visible) {
    if (!v) {
      v = s.svg = document.createElementNS(pv.ns.svg, "polygon");
      s.parent.svg.appendChild(v);
    }

    /* TODO allow points to be changed on events? */
    var p = "";
    for (var i = 0; i < this.scene.length; i++) {
      var si = this.scene[i];
      if (isNaN(si.left)) si.left = 0;
      if (isNaN(si.top)) si.top = 0;
      p += si.left + "," + si.top + " ";
    }
    for (var i = this.scene.length - 1; i >= 0; i--) {
      var si = this.scene[i];
      if (isNaN(si.width)) si.width = 0;
      if (isNaN(si.height)) si.height = 0;
      p += (si.left + si.width) + "," + (si.top + si.height) + " ";
    }
    v.setAttribute("points", p);

    this.updateInstance(s);
    v.removeAttribute("display");
  } else if (v) {
    v.setAttribute("display", "none");
  }
};

/**
 * For Areas, this method is only invoked after event handlers have updated the
 * scene graph; it is guaranteed to be called only from the first scene.
 */
pv.Area.prototype.updateInstance = function(s) {
  var v = s.svg;

  pv.Mark.prototype.updateInstance.call(this, s);
  if (!s.visible) return;

  /* TODO gradient, patterns */
  var fill = new pv.Style(s.fillStyle);
  v.setAttribute("fill", fill.color);
  v.setAttribute("fill-opacity", fill.opacity);
  var stroke = new pv.Style(s.strokeStyle);
  v.setAttribute("stroke", stroke.color);
  v.setAttribute("stroke-opacity", stroke.opacity);
  v.setAttribute("stroke-width", s.lineWidth);
};
pv.Bar = function() {
  pv.Mark.call(this);
};

pv.Bar.toString = function() {
  return "bar";
};

pv.Bar.prototype = pv.extend(pv.Mark);
pv.Bar.prototype.type = pv.Bar;
pv.Bar.prototype.defineProperty("width");
pv.Bar.prototype.defineProperty("height");
pv.Bar.prototype.defineProperty("lineWidth");
pv.Bar.prototype.defineProperty("strokeStyle");
pv.Bar.prototype.defineProperty("fillStyle");

pv.Bar.defaults = new pv.Bar().extend(pv.Mark.defaults)
    .lineWidth(1.5)
    .strokeStyle(null)
    .fillStyle(pv.Colors.category20);

pv.Bar.Anchor = function() {
  pv.Mark.Anchor.call(this);
};

pv.Bar.Anchor.prototype = pv.extend(pv.Mark.Anchor);
pv.Bar.Anchor.prototype.type = pv.Bar;

pv.Bar.Anchor.prototype.$left = function(d) {
  var bar = this.anchorTarget();
  switch (this.get("name")) {
    case "bottom":
    case "top":
    case "center": return bar.left() + bar.width() / 2;
    case "left": return bar.left();
  }
  return null;
};

pv.Bar.Anchor.prototype.$right = function(d) {
  var bar = this.anchorTarget();
  switch (this.get("name")) {
    case "bottom":
    case "top":
    case "center": return bar.right() + bar.width() / 2;
    case "right": return bar.right();
  }
  return null;
};

pv.Bar.Anchor.prototype.$top = function(d) {
  var bar = this.anchorTarget();
  switch (this.get("name")) {
    case "left":
    case "right":
    case "center": return bar.top() + bar.height() / 2;
    case "top": return bar.top();
  }
  return null;
};

pv.Bar.Anchor.prototype.$bottom = function(d) {
  var bar = this.anchorTarget();
  switch (this.get("name")) {
    case "left":
    case "right":
    case "center": return bar.bottom() + bar.height() / 2;
    case "bottom": return bar.bottom();
  }
  return null;
};

pv.Bar.Anchor.prototype.$textAlign = function(d) {
  var bar = this.anchorTarget();
  switch (this.get("name")) {
    case "left": return "left";
    case "bottom":
    case "top":
    case "center": return "center";
    case "right": return "right";
  }
  return null;
};

pv.Bar.Anchor.prototype.$textBaseline = function(d) {
  var bar = this.anchorTarget();
  switch (this.get("name")) {
    case "right":
    case "left":
    case "center": return "middle";
    case "top": return "top";
    case "bottom": return "bottom";
  }
  return null;
};

pv.Bar.prototype.updateInstance = function(s) {
  var v = s.svg;
  if (s.visible && !v) {
    v = s.svg = document.createElementNS(pv.ns.svg, "rect");
    s.parent.svg.appendChild(v);
  }

  pv.Mark.prototype.updateInstance.call(this, s);
  if (!s.visible) return;

  v.setAttribute("x", s.left);
  v.setAttribute("y", s.top);

  /* If width and height are exactly zero, the rect is not stroked! */
  v.setAttribute("width", Math.max(1E-10, s.width));
  v.setAttribute("height", Math.max(1E-10, s.height));

  /* TODO gradient, patterns */
  var fill = new pv.Style(s.fillStyle);
  v.setAttribute("fill", fill.color);
  v.setAttribute("fill-opacity", fill.opacity);
  var stroke = new pv.Style(s.strokeStyle);
  v.setAttribute("stroke", stroke.color);
  v.setAttribute("stroke-opacity", stroke.opacity);
  v.setAttribute("stroke-width", s.lineWidth);
};
pv.Dot = function() {
  pv.Mark.call(this);
};

pv.Dot.toString = function() {
  return "dot";
};

pv.Dot.prototype = pv.extend(pv.Mark);
pv.Dot.prototype.type = pv.Dot;
pv.Dot.prototype.defineProperty("size");
pv.Dot.prototype.defineProperty("shape");
pv.Dot.prototype.defineProperty("angle");
pv.Dot.prototype.defineProperty("lineWidth");
pv.Dot.prototype.defineProperty("strokeStyle");
pv.Dot.prototype.defineProperty("fillStyle");

pv.Dot.defaults = new pv.Dot().extend(pv.Mark.defaults)
    .size(20)
    .shape("circle")
    .angle(0)
    .lineWidth(1.5)
    .strokeStyle(pv.Colors.category10)
    .fillStyle(null);

pv.Dot.Anchor = function() {
  pv.Mark.Anchor.call(this);
};

pv.Dot.Anchor.prototype = pv.extend(pv.Mark.Anchor);
pv.Dot.Anchor.prototype.type = pv.Dot;

pv.Dot.Anchor.prototype.$left = function(d) {
  var dot = this.anchorTarget();
  switch (this.get("name")) {
    case "bottom":
    case "top":
    case "center": return dot.left();
    case "left": return dot.left() - dot.radius();
  }
  return null;
};

pv.Dot.Anchor.prototype.$right = function(d) {
  var dot = this.anchorTarget();
  switch (this.get("name")) {
    case "bottom":
    case "top":
    case "center": return dot.right();
    case "right": return dot.right() - dot.radius();
  }
  return null;
};

pv.Dot.Anchor.prototype.$top = function(d) {
  var dot = this.anchorTarget();
  switch (this.get("name")) {
    case "left":
    case "right":
    case "center": return dot.top();
    case "top": return dot.top() - dot.radius();
  }
  return null;
};

pv.Dot.Anchor.prototype.$bottom = function(d) {
  var dot = this.anchorTarget();
  switch (this.get("name")) {
    case "left":
    case "right":
    case "center": return dot.bottom();
    case "bottom": return dot.bottom() - dot.radius();
  }
  return null;
};

pv.Dot.Anchor.prototype.$textAlign = function(d) {
  switch (this.get("name")) {
    case "left": return "right";
    case "bottom":
    case "top":
    case "center": return "center";
    case "right": return "left";
  }
  return null;
};

pv.Dot.Anchor.prototype.$textBaseline = function(d) {
  switch (this.get("name")) {
    case "right":
    case "left":
    case "center": return "middle";
    case "top": return "bottom";
    case "bottom": return "top";
  }
  return null;
};

pv.Dot.prototype.radius = function() {
  return Math.sqrt(this.size());
};

pv.Dot.prototype.updateInstance = function(s) {
  var v = s.svg;
  if (s.visible && !v) {
    v = s.svg = document.createElementNS(pv.ns.svg, "path");
    s.parent.svg.appendChild(v);
  }

  pv.Mark.prototype.updateInstance.call(this, s);
  if (!s.visible) return;

  v.setAttribute("transform", "translate(" + s.left + "," + s.top +")"
      + (s.angle ? " rotate(" + 180 * s.angle / Math.PI + ")" : ""));

  /* TODO gradient, patterns? */
  var fill = new pv.Style(s.fillStyle);
  v.setAttribute("fill", fill.color);
  v.setAttribute("fill-opacity", fill.opacity);
  var stroke = new pv.Style(s.strokeStyle);
  v.setAttribute("stroke", stroke.color);
  v.setAttribute("stroke-opacity", stroke.opacity);
  v.setAttribute("stroke-width", s.lineWidth);

  var radius = Math.sqrt(s.size);

  var d;
  switch (s.shape) {
    case "cross": {
      d = "M" + -radius + "," + -radius
          + "L" + radius + "," + radius
          + "M" + radius + "," + -radius
          + "L" + -radius + "," + radius;
      break;
    }
    case "triangle": {
      var h = radius, w = radius * 2 / Math.sqrt(3);
      d = "M0," + h
          + "L" + w +"," + -h
          + " " + -w + "," + -h
          + "Z";
      break;
    }
    case "diamond": {
      radius *= Math.sqrt(2);
      d = "M0," + -radius
          + "L" + radius + ",0"
          + " 0," + radius
          + " " + -radius + ",0"
          + "Z";
      break;
    }
    case "square": {
      d = "M" + -radius + "," + -radius
          + "L" + radius + "," + -radius
          + " " + radius + "," + radius
          + " " + -radius + "," + radius
          + "Z";
      break;
    }
    case "tick": {
      d = "M0,0L0," + -s.size;
      break;
    }
    default: { // circle
      d = "M0," + radius
          + "A" + radius + "," + radius + " 0 1,1 0," + (-radius)
          + "A" + radius + "," + radius + " 0 1,1 0," + radius
          + "Z";
      break;
    }
  }
  v.setAttribute("d", d);
};
pv.Label = function() {
  pv.Mark.call(this);
};

pv.Label.toString = function() {
  return "label";
};

pv.Label.prototype = pv.extend(pv.Mark);
pv.Label.prototype.type = pv.Label;
pv.Label.prototype.defineProperty("text");
pv.Label.prototype.defineProperty("font");
pv.Label.prototype.defineProperty("textAngle");
pv.Label.prototype.defineProperty("textStyle");
pv.Label.prototype.defineProperty("textAlign");
pv.Label.prototype.defineProperty("textBaseline");
pv.Label.prototype.defineProperty("textMargin");
pv.Label.prototype.defineProperty("textShadow");

pv.Label.defaults = new pv.Label().extend(pv.Mark.defaults)
    .text(pv.identity)
    .font("10px Sans-Serif")
    .textAngle(0)
    .textStyle("black")
    .textAlign("left")
    .textBaseline("bottom")
    .textMargin(3);

pv.Label.prototype.updateInstance = function(s) {
  var v = s.svg;
  if (s.visible && !v) {
    v = s.svg = document.createElementNS(pv.ns.svg, "text");
    v.$text = document.createTextNode("");
    v.appendChild(v.$text);
    s.parent.svg.appendChild(v);
  }

  pv.Mark.prototype.updateInstance.call(this, s);
  if (!s.visible) return;

  v.setAttribute("transform", "translate(" + s.left + "," + s.top + ")"
      + (s.textAngle ? " rotate(" + 180 * s.textAngle / Math.PI + ")" : ""));

  switch (s.textBaseline) {
    case "middle": {
      v.removeAttribute("y");
      v.setAttribute("dy", ".4em");
      break;
    }
    case "top": {
      v.setAttribute("y", s.textMargin);
      v.setAttribute("dy", ".8em");
      break;
    }
    case "bottom": {
      v.setAttribute("y", -s.textMargin);
      v.removeAttribute("dy");
      break;
    }
  }

  switch (s.textAlign) {
    case "right": {
      v.setAttribute("text-anchor", "end");
      v.setAttribute("x", -s.textMargin);
      break;
    }
    case "center": {
      v.setAttribute("text-anchor", "middle");
      v.removeAttribute("x");
      break;
    }
    case "left": {
      v.setAttribute("text-anchor", "start");
      v.setAttribute("x", s.textMargin);
      break;
    }
  }

  /* TODO centralize font definition? */
  v.$text.nodeValue = s.text;
  var style = "font:" + s.font + ";";
  if (s.textShadow) {
    style += "text-shadow:" + s.textShadow +";";
  }
  v.setAttribute("style", style);

  /* TODO gradient, patterns? */
  var fill = new pv.Style(s.textStyle);
  v.setAttribute("fill", fill.color);
  v.setAttribute("fill-opacity", fill.opacity);

  /* TODO enable interaction on labels? centralize this definition? */
  v.setAttribute("pointer-events", "none");
};
pv.Line = function() {
  pv.Mark.call(this);
};

pv.Line.toString = function() {
  return "line";
};

pv.Line.prototype = pv.extend(pv.Mark);
pv.Line.prototype.type = pv.Line;
pv.Line.prototype.defineProperty("lineWidth");
pv.Line.prototype.defineProperty("strokeStyle");
pv.Line.prototype.defineProperty("fillStyle");

pv.Line.defaults = new pv.Line().extend(pv.Mark.defaults)
    .lineWidth(1.5)
    .strokeStyle(pv.Colors.category10);

pv.Line.prototype.update = function(g) {
  if (!this.scene.length) return;

  var s = this.scene[0], v = s.svg;
  if (s.visible) {
    if (!v) {
      v = s.svg = document.createElementNS(pv.ns.svg, "polyline");
      s.parent.svg.appendChild(v);
    }

    /* TODO allow points to be changed on events? */
    var p = "";
    for (var i = 0; i < this.scene.length; i++) {
      var si = this.scene[i];
      if (isNaN(si.left)) si.left = 0;
      if (isNaN(si.top)) si.top = 0;
      p += si.left + "," + si.top + " ";
    }
    v.setAttribute("points", p);

    this.updateInstance(s);
    v.removeAttribute("display");
  } else if (v) {
    v.setAttribute("display", "none");
  }
};

/**
 * For Lines, this method is only invoked after event handlers have updated the
 * scene graph; it is guaranteed to be called only from the first scene.
 */
pv.Line.prototype.updateInstance = function(s) {
  var v = s.svg;

  pv.Mark.prototype.updateInstance.call(this, s);
  if (!s.visible) return;

  /* TODO gradient, patterns */
  var fill = new pv.Style(s.fillStyle);
  v.setAttribute("fill", fill.color);
  v.setAttribute("fill-opacity", fill.opacity);
  var stroke = new pv.Style(s.strokeStyle);
  v.setAttribute("stroke", stroke.color);
  v.setAttribute("stroke-opacity", stroke.opacity);
  v.setAttribute("stroke-width", s.lineWidth);
};
pv.Rule = function() {
  pv.Mark.call(this);
};

pv.Rule.toString = function() {
  return "rule";
};

pv.Rule.prototype = pv.extend(pv.Mark);
pv.Rule.prototype.type = pv.Rule;
pv.Rule.prototype.defineProperty("lineWidth");
pv.Rule.prototype.defineProperty("strokeStyle");

pv.Rule.defaults = new pv.Rule().extend(pv.Mark.defaults)
    .lineWidth(1)
    .strokeStyle("black");

pv.Rule.Anchor = function() {
  pv.Mark.Anchor.call(this);
};

pv.Rule.Anchor.prototype = pv.extend(pv.Mark.Anchor);
pv.Rule.Anchor.prototype.type = pv.Rule;

pv.Rule.Anchor.prototype.$left = function(d) {
  var rule = this.anchorTarget();
  switch (this.get("name")) {
    case "bottom":
    case "top":
    case "left": return rule.left();
  }
 return null;
};

pv.Rule.Anchor.prototype.$right = function(d) {
  var rule = this.anchorTarget();
  switch (this.get("name")) {
    case "right": return rule.right();
  }
  return null;
};

pv.Rule.Anchor.prototype.$top = function(d) {
  var rule = this.anchorTarget();
  switch (this.get("name")) {
    case "left":
    case "right":
    case "top": return rule.top();
  }
  return null;
};

pv.Rule.Anchor.prototype.$bottom = function(d) {
  var rule = this.anchorTarget();
  switch (this.get("name")) {
    case "bottom": return rule.bottom();
  }
  return null;
};

pv.Rule.Anchor.prototype.$textAlign = function(d) {
  switch (this.get("name")) {
    case "top":
    case "bottom": return "center";
    case "right": return "left";
    case "left": return "right";
  }
  return null;
};

pv.Rule.Anchor.prototype.$textBaseline = function(d) {
  switch (this.get("name")) {
    case "right":
    case "left": return "middle";
    case "top": return "bottom";
    case "bottom": return "top";
  }
  return null;
};

pv.Rule.prototype.buildImplied = function(s) {
  s.width = s.height = 0;

  var l = s.left;
  var r = s.right;
  var t = s.top;
  var b = s.bottom;

  /* Determine horizontal or vertical orientation. */
  if (((l == null) && (r == null)) || ((r != null) && (l != null))) {
    s.width = s.parent.width - (l = l || 0) - (r = r || 0);
  } else {
    s.height = s.parent.height - (t = t || 0) - (b = b || 0);
  }

  s.left = l;
  s.right = r;
  s.top = t;
  s.bottom = b;

  pv.Mark.prototype.buildImplied.call(this, s);
};

pv.Rule.prototype.updateInstance = function(s) {
  var v = s.svg;
  if (s.visible && !v) {
    v = s.svg = document.createElementNS(pv.ns.svg, "line");
    s.parent.svg.appendChild(v);
  }

  pv.Mark.prototype.updateInstance.call(this, s);
  if (!s.visible) return;

  v.setAttribute("x1", s.left);
  v.setAttribute("y1", s.top);
  v.setAttribute("x2", s.left + s.width);
  v.setAttribute("y2", s.top + s.height);

  /* TODO gradient, patterns? */
  var stroke = new pv.Style(s.strokeStyle);
  v.setAttribute("stroke", stroke.color);
  v.setAttribute("stroke-opacity", stroke.opacity);
  v.setAttribute("stroke-width", s.lineWidth);
};
pv.Panel = function() {
  pv.Bar.call(this);
  this.children = [];
  this.root = this;
  this.$dom = pv.Panel.$dom;
};

pv.Panel.toString = function() {
  return "panel";
};

pv.Panel.prototype = pv.extend(pv.Bar);
pv.Panel.prototype.type = pv.Panel;
pv.Panel.prototype.defineProperty("canvas");
pv.Panel.prototype.defineProperty("reverse");

pv.Panel.defaults = new pv.Panel().extend(pv.Bar.defaults)
    .top(0).left(0).bottom(0).right(0)
    .fillStyle(null)
    .reverse(false);

pv.Panel.prototype.add = function(type) {
  var child = new type();
  child.parent = this;
  child.root = this.root;
  child.childIndex = this.children.length;
  this.children.push(child);
  return child;
};

pv.Panel.prototype.createCanvas = function(w, h) {
  function lastChild(node) {
    while (node.lastChild && node.lastChild.tagName) {
      node = node.lastChild;
    }
    return (node == document.body) ? node : node.parentNode;
  }

  /* Cache the canvas element to reuse across renders. */
  if (!this.$canvases) this.$canvases = [];
  var c = this.$canvases[this.index];
  if (!c) {
    this.$canvases[this.index] = c = document.createElementNS(pv.ns.svg, "svg");
    this.$dom // script element for text/javascript+protovis
        ? this.$dom.parentNode.insertBefore(c, this.$dom)
        : lastChild(document.body).appendChild(c);
  }

  c.setAttribute("width", w);
  c.setAttribute("height", h);
  return c;
};

pv.Panel.prototype.buildInstance = function(s) {
  pv.Bar.prototype.buildInstance.call(this, s);
  if (!s.children) s.children = [];
  for (var i = 0; i < this.children.length; i++) {
    this.children[i].scene = s.children[i] || [];
    this.children[i].build(s);
  }
  for (var i = 0; i < this.children.length; i++) {
    s.children[i] = this.children[i].scene;
    delete this.children[i].scene;
  }
  s.children.length = this.children.length;
};

pv.Panel.prototype.buildImplied = function(s) {
  if (!s.parent) {
    var c = s.canvas;
    if (c) {
      var d = (typeof c == "string") ? document.getElementById(c) : c;

      /* Clear the container if it's not already associated with this panel. */
      if (d.$panel != this) {
        d.$panel = this;
        delete d.$canvas;
        d.innerHTML = "";
      }

      /* Construct the canvas if not already present. */
      if (!(c = d.$canvas)) {
        d.$canvas = c = document.createElementNS(pv.ns.svg, "svg");
        d.appendChild(c);
      }

      /* If width and height weren't specified, inspect the container. */
      var w, h;
      if (s.width == null) {
        w = pv.css(d, "width");
        s.width = w - s.left - s.right;
      } else {
        w = s.width + s.left + s.right;
      }
      if (s.height == null) {
        h = pv.css(d, "height");
        s.height = h - s.top - s.bottom;
      } else {
        h = s.height + s.top + s.bottom;
      }

      c.setAttribute("width", w);
      c.setAttribute("height", h);
      s.canvas = c;
    } else {
      s.canvas = this.createCanvas(
          s.width + s.left + s.right,
          s.height + s.top + s.bottom);
    }
  }
  pv.Bar.prototype.buildImplied.call(this, s);
};

pv.Panel.prototype.update = function() {
  var appends = [];
  for (var i = 0; i < this.scene.length; i++) {
    var s = this.scene[i];

    var v = s.svg;
    if (!v) {
      v = s.svg = document.createElementNS(pv.ns.svg, "g");
      appends.push(s);
    }

    this.updateInstance(s);
    for (var j = 0; j < this.children.length; j++) {
      var c = this.children[j];
      c.scene = s.children[j];
      c.update();
      delete c.scene;
    }
  }

  /*
   * WebKit appears to have a bug where images were not rendered if the <g>
   * element was appended before it contained any elements. Creating the child
   * elements first and then appending them solves the problem and is likely
   * more efficient. Also, it means we can reverse the order easily.
   */
  if (appends.length) {
    if (appends[0].reverse) appends.reverse();
    for (var i = 0; i < appends.length; i++) {
      var s = appends[i];
      (s.parent ? s.parent.svg : s.canvas).appendChild(s.svg);
    }
  }
};

/*
 * TODO fill and stroke on the <g> element does not render a box, but are
 * instead inherited by child elements. In order to render any fill and
 * stroke associated with the panel itself, we must create another <rect>
 * element.
 *
 * TODO As a performance optimization, it may also be possible to assign
 * constant property values (or even the most common value for each
 * property) as attributes on the <g> element so they can be inherited.
 */

pv.Panel.prototype.updateInstance = function(s) {
  // TODO visibility?
  if (s.left || s.top) {
    s.svg.setAttribute("transform", "translate(" + s.left + "," + s.top +")");
  }
};
pv.Image = function() {
  pv.Bar.call(this);
};

pv.Image.toString = function() {
  return "image";
};

pv.Image.prototype = pv.extend(pv.Bar);
pv.Image.prototype.type = pv.Image;
pv.Image.prototype.defineProperty("image");
pv.Image.prototype.defineProperty("imageWidth");
pv.Image.prototype.defineProperty("imageHeight");

pv.Image.defaults = new pv.Image().extend(pv.Bar.defaults)
    .fillStyle(null);

pv.Image.prototype.updateInstance = function(s) {
  var v = s.svg;
  if (s.visible && !v) {
    v = s.svg = document.createElementNS(pv.ns.svg, "image");
    s.parent.svg.appendChild(v);
  }

  pv.Mark.prototype.updateInstance.call(this, s);
  if (!s.visible) return;

  /* TODO fill, stroke, dynamic images */
  v.setAttribute("x", s.left);
  v.setAttribute("y", s.top);
  v.setAttribute("width", s.width);
  v.setAttribute("height", s.height);

  v.setAttributeNS(pv.ns.xlink, "href", s.image);
};
pv.Wedge = function() {
  pv.Mark.call(this);
};

pv.Wedge.toString = function() {
  return "wedge";
};

pv.Wedge.prototype = pv.extend(pv.Mark);
pv.Wedge.prototype.type = pv.Wedge;
pv.Wedge.prototype.defineProperty("startAngle");
pv.Wedge.prototype.defineProperty("endAngle");
pv.Wedge.prototype.defineProperty("angle");
pv.Wedge.prototype.defineProperty("innerRadius");
pv.Wedge.prototype.defineProperty("outerRadius");
pv.Wedge.prototype.defineProperty("lineWidth");
pv.Wedge.prototype.defineProperty("strokeStyle");
pv.Wedge.prototype.defineProperty("fillStyle");

pv.Wedge.defaults = new pv.Wedge().extend(pv.Mark.defaults)
    .startAngle(function() {
        var s = this.sibling();
        return s ? s.endAngle : -Math.PI / 2;
      })
    .innerRadius(0)
    .lineWidth(1.5)
    .strokeStyle(null)
    .fillStyle(pv.Colors.category20.unique);

pv.Wedge.prototype.midRadius = function() {
  return (this.innerRadius() + this.outerRadius()) / 2;
};

pv.Wedge.prototype.midAngle = function() {
  return (this.startAngle() + this.endAngle()) / 2;
};

pv.Wedge.Anchor = function() {
  pv.Mark.Anchor.call(this);
};

pv.Wedge.Anchor.prototype = pv.extend(pv.Mark.Anchor);
pv.Wedge.Anchor.prototype.type = pv.Wedge;

pv.Wedge.Anchor.prototype.$left = function() {
  var w = this.anchorTarget();
  switch (this.get("name")) {
    case "outer": return w.left() + w.outerRadius() * Math.cos(w.midAngle());
    case "inner": return w.left() + w.innerRadius() * Math.cos(w.midAngle());
    case "start": return w.left() + w.midRadius() * Math.cos(w.startAngle());
    case "center": return w.left() + w.midRadius() * Math.cos(w.midAngle());
    case "end": return w.left() + w.midRadius() * Math.cos(w.endAngle());
  }
  return null;
};

pv.Wedge.Anchor.prototype.$right = function() {
  var w = this.anchorTarget();
  switch (this.get("name")) {
    case "outer": return w.right() + w.outerRadius() * Math.cos(w.midAngle());
    case "inner": return w.right() + w.innerRadius() * Math.cos(w.midAngle());
    case "start": return w.right() + w.midRadius() * Math.cos(w.startAngle());
    case "center": return w.right() + w.midRadius() * Math.cos(w.midAngle());
    case "end": return w.right() + w.midRadius() * Math.cos(w.endAngle());
  }
  return null;
};

pv.Wedge.Anchor.prototype.$top = function() {
  var w = this.anchorTarget();
  switch (this.get("name")) {
    case "outer": return w.top() + w.outerRadius() * Math.sin(w.midAngle());
    case "inner": return w.top() + w.innerRadius() * Math.sin(w.midAngle());
    case "start": return w.top() + w.midRadius() * Math.sin(w.startAngle());
    case "center": return w.top() + w.midRadius() * Math.sin(w.midAngle());
    case "end": return w.top() + w.midRadius() * Math.sin(w.endAngle());
  }
  return null;
};

pv.Wedge.Anchor.prototype.$bottom = function() {
  var w = this.anchorTarget();
  switch (this.get("name")) {
    case "outer": return w.bottom() + w.outerRadius() * Math.sin(w.midAngle());
    case "inner": return w.bottom() + w.innerRadius() * Math.sin(w.midAngle());
    case "start": return w.bottom() + w.midRadius() * Math.sin(w.startAngle());
    case "center": return w.bottom() + w.midRadius() * Math.sin(w.midAngle());
    case "end": return w.bottom() + w.midRadius() * Math.sin(w.endAngle());
  }
  return null;
};

pv.Wedge.Anchor.prototype.$textAlign = function() {
  var w = this.anchorTarget();
  switch (this.get("name")) {
    case "outer": return pv.Wedge.upright(w.midAngle()) ? "right" : "left";
    case "inner": return pv.Wedge.upright(w.midAngle()) ? "left" : "right";
    default: return "center";
  }
};

pv.Wedge.Anchor.prototype.$textBaseline = function() {
  var w = this.anchorTarget();
  switch (this.get("name")) {
    case "start": return pv.Wedge.upright(w.startAngle()) ? "top" : "bottom";
    case "end": return pv.Wedge.upright(w.endAngle()) ? "bottom" : "top";
    default: return "middle";
  }
};

pv.Wedge.Anchor.prototype.$textAngle = function() {
  var w = this.anchorTarget();
  var a = 0;
  switch (this.get("name")) {
    case "center":
    case "inner":
    case "outer": a = w.midAngle(); break;
    case "start": a = w.startAngle(); break;
    case "end": a = w.endAngle(); break;
  }
  return pv.Wedge.upright(a) ? a : (a + Math.PI);
};

pv.Wedge.upright = function(angle) {
  angle = angle % (2 * Math.PI);
  angle = (angle < 0) ? (2 * Math.PI + angle) : angle;
  return (angle < Math.PI / 2) || (angle > 3 * Math.PI / 2);
};

pv.Wedge.prototype.buildImplied = function(s) {
  pv.Mark.prototype.buildImplied.call(this, s);
  if (s.endAngle == null) {
    s.endAngle = s.startAngle + s.angle;
  }
};

pv.Wedge.prototype.updateInstance = function(s) {
  var v = s.svg;
  if (s.visible && !v) {
    v = s.svg = document.createElementNS(pv.ns.svg, "path");
    v.setAttribute("fill-rule", "evenodd");
    s.parent.svg.appendChild(v);
  }

  pv.Mark.prototype.updateInstance.call(this, s);
  if (!s.visible) return;

  v.setAttribute("transform", "translate(" + s.left + "," + s.top +")");

  var r1 = s.innerRadius, r2 = s.outerRadius;
  if (s.angle >= 2 * Math.PI) {
    if (r1) {
      v.setAttribute("d", "M0," + r2
          + "A" + r2 + "," + r2 + " 0 1,1 0," + (-r2)
          + "A" + r2 + "," + r2 + " 0 1,1 0," + r2
          + "M0," + r1
          + "A" + r1 + "," + r1 + " 0 1,1 0," + (-r1)
          + "A" + r1 + "," + r1 + " 0 1,1 0," + r1
          + "Z");
    } else {
      v.setAttribute("d", "M0," + r2
          + "A" + r2 + "," + r2 + " 0 1,1 0," + (-r2)
          + "A" + r2 + "," + r2 + " 0 1,1 0," + r2
          + "Z");
    }
  } else {
    var c1 = Math.cos(s.startAngle), c2 = Math.cos(s.endAngle),
        s1 = Math.sin(s.startAngle), s2 = Math.sin(s.endAngle);
    if (r1) {
      v.setAttribute("d", "M" + r2 * c1 + "," + r2 * s1
          + "A" + r2 + "," + r2 + " 0 "
          + ((s.angle < Math.PI) ? "0" : "1") + ",1 "
          + r2 * c2 + "," + r2 * s2
          + "L" + r1 * c2 + "," + r1 * s2
          + "A" + r1 + "," + r1 + " 0 "
          + ((s.angle < Math.PI) ? "0" : "1") + ",0 "
          + r1 * c1 + "," + r1 * s1 + "Z");
    } else {
      v.setAttribute("d", "M" + r2 * c1 + "," + r2 * s1
          + "A" + r2 + "," + r2 + " 0 "
          + ((s.angle < Math.PI) ? "0" : "1") + ",1 "
          + r2 * c2 + "," + r2 * s2 + "L0,0Z");
    }
  }

  /* TODO gradient, patterns */
  var fill = new pv.Style(s.fillStyle);
  v.setAttribute("fill", fill.color);
  v.setAttribute("fill-opacity", fill.opacity);
  var stroke = new pv.Style(s.strokeStyle);
  v.setAttribute("stroke", stroke.color);
  v.setAttribute("stroke-opacity", stroke.opacity);
  v.setAttribute("stroke-width", s.lineWidth);
};
  return pv;
}();
