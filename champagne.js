/**
 * Copyright reelyActive 2017
 * We believe in an open Internet of Things
 */

CHAMPAGNE_ROOT = 'https://champagne.reelyactive.com/';

var ChampagnePopper = {
  
  scripts: [
    {
      file: 'https://cdnjs.cloudflare.com/ajax/libs/angular.js/1.4.7/angular.min.js',
      ignore: function() { // if this returns true, script is already loaded
        if (typeof angular == 'undefined') return false;
        if (angular.version.major >= 2) return true; // v2.0 or newer
        if (angular.version.minor >= 4) return true; // v1.4 or newer
        return false; // older than v1.4
      }
    },
    {
      file: 'https://code.jquery.com/jquery-3.1.0.min.js',
      ignore: function() {
        return typeof jQuery != 'undefined';
      }
    },
    'https://code.angularjs.org/1.4.7/angular-animate.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/angular-ui-bootstrap/2.0.2/ui-bootstrap-tpls.min.js',
    {
      file: 'https://cdnjs.cloudflare.com/ajax/libs/socket.io/1.3.7/socket.io.min.js',
      ignore: function() { return !Champagne.socketsEnabled }
    },
    {
      file: CHAMPAGNE_ROOT+'libs/socket.min.js',
      ignore: function() { return !Champagne.socketsEnabled }
    },
    CHAMPAGNE_ROOT+'beaver.js',
    CHAMPAGNE_ROOT+'cormorant.js',
    CHAMPAGNE_ROOT+'cuttlefish.js',
    CHAMPAGNE_ROOT+'bottlenose.js',
    CHAMPAGNE_ROOT+'bubble.js'
  ],
  
  styles: [
    'https://fonts.googleapis.com/css?family=Open+Sans:400,600,700,300',
    CHAMPAGNE_ROOT+'style/bubble.css',
  ],
  
  getScript: function(script) {
    if (typeof script === 'object') {
      if (script.ignore()) return Promise.resolve(true);
      file = script.file;
    } else {
      file = script;
    }
    return new Promise(function(fulfill, reject) {
      var script = document.createElement('script');
      script.addEventListener('load', fulfill);
      script.src = file;
      console.log(file);
      document.head.appendChild(script);
    });
  },
  
  getStyle: function(file) {
    var style = document.createElement('link');
    style.href = file;
    style.rel = 'stylesheet';
    style.type = 'text/css';
    console.log(file);
    document.head.appendChild(style);
  },
  
  getScripts: function() {
    var self = this;
    self.getScript(self.scripts.shift()).then(function() {
      if (self.scripts.length > 0) {
        self.getScripts();
      } else {
        Champagne.flow();
      }
    })
  },
  
  init: function() {
    var self = this;
    self.styles.forEach(function(file) {
      self.getStyle(file);
    });
    self.getScripts();
  }
  
}


var Champagne = {
  
  socketsEnabled: false,
  
  flow: function() {
    var self = this;
    
    var dependencies = [
      'reelyactive.beaver',
      'reelyactive.cormorant',
      'reelyactive.cuttlefish',
      'reelyactive.bottlenose'
    ];
    
    if (self.socketsEnabled) {
      dependencies.push('btford.socket-io');
    }
    
    angular.module('champagne', dependencies);
    
    self.trackModules();
    if (typeof self.uncork !== "undefined") { 
      self.uncork();
    }
    self.initModules();
  },
  
  enableSockets: function() {
    var self = this;
    self.socketsEnabled = true;
  },
  
  ready: function(js) {
    var self = this;
    self.uncork = js;
  },
  
  trackModules: function() {
    (function(orig) {
      angular.modules = [];
      angular.module = function() {
        if (arguments.length > 1) {
          angular.modules.push(arguments[0]);
        }
        return orig.apply(null, arguments);
      }
    })(angular.module);
  },
  
  initModules: function() {
    var self = this;
    angular.modules.forEach(function(module) {
      self.bootstrap(module);
    });
  },
  
  bootstrap: function(module) {
    angular.bootstrap(document, [module]);
  }
  
}


ChampagnePopper.init();
