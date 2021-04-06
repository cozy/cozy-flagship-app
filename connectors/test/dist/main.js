/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _libs_ContentScript__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1);
/* eslint-disable no-console */



class TestContenScript extends _libs_ContentScript__WEBPACK_IMPORTED_MODULE_0__["default"] {
  async ensureAuthenticated() {
    return true
  }
  async getAccountInformation() {
    return {
      email: 'toto@cozycloud.cc',
    }
  }
  async fetch() {
    this.log('data is fetched')
    return 'fetch result'
  }
}

const connector = new TestContenScript()
connector.init().catch((err) => {
  console.error(err)
})


/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return ContentScript; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "LauncherBridge", function() { return LauncherBridge; });
/* harmony import */ var post_me__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2);
/* eslint-disable no-console */



class ContentScript {
  async init() {
    this.bridge = new LauncherBridge({localWindow: window})
    const exposedMethodsNames = [
      'ensureAuthenticated',
      'getAccountInformation',
      'fetch',
    ]
    const exposedMethods = {}
    // TODO error handling
    // should catch and call onError on the launcher to let it handle the job update
    for (const method of exposedMethodsNames) {
      exposedMethods[method] = this[method].bind(this)
    }
    await this.bridge.init({exposedMethods})
  }
  log(message) {
    this.bridge.emit('log', message)
  }
  async ensureAuthenticated() {}
  async getAccountInformation() {}
  async fetch({context}) {}
}

class LauncherBridge {
  constructor({localWindow}) {
    this.localWindow = localWindow
  }

  async init({exposedMethods = {}} = {}) {
    const messenger = new ContentScriptMessenger({
      localWindow: this.localWindow,
    })
    this.connection = await Object(post_me__WEBPACK_IMPORTED_MODULE_0__["ChildHandshake"])(messenger, exposedMethods)
    this.localHandle = this.connection.localHandle()
    this.remoteHandle = this.connection.remoteHandle()
  }

  async call(...args) {
    return this.remoteHandle.call(...args)
  }

  async emit(...args) {
    return this.localHandle.emit(...args)
  }

  async addEventListener(...args) {
    this.remoteHandle.addEventListener(...args)
  }
}

class ContentScriptMessenger {
  constructor({localWindow}) {
    this.localWindow = localWindow
  }
  postMessage(message) {
    this.localWindow.ReactNativeWebView.postMessage(JSON.stringify(message))
  }
  addMessageListener(listener) {
    const outerListener = (event) => {
      listener(event)
    }

    this.localWindow.addEventListener('message', outerListener)

    const removeListener = () => {
      this.localWindow.removeEventListener('message', outerListener)
    }

    return removeListener
  }
}


/***/ }),
/* 2 */
/***/ (function(__webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "BareMessenger", function() { return BareMessenger; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ChildHandshake", function() { return ChildHandshake; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ConcreteEmitter", function() { return ConcreteEmitter; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "DebugMessenger", function() { return DebugMessenger; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ParentHandshake", function() { return ParentHandshake; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "PortMessenger", function() { return PortMessenger; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "WindowMessenger", function() { return WindowMessenger; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "WorkerMessenger", function() { return WorkerMessenger; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "debug", function() { return debug; });
function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var MARKER = '@post-me';

function createUniqueIdFn() {
  var __id = 0;
  return function () {
    var id = __id;
    __id += 1;
    return id;
  };
}
/**
 * A concrete implementation of the {@link Emitter} interface
 *
 * @public
 */


var ConcreteEmitter = /*#__PURE__*/function () {
  function ConcreteEmitter() {
    _classCallCheck(this, ConcreteEmitter);

    this._listeners = {};
  }
  /** {@inheritDoc Emitter.addEventListener} */


  _createClass(ConcreteEmitter, [{
    key: "addEventListener",
    value: function addEventListener(eventName, listener) {
      var listeners = this._listeners[eventName];

      if (!listeners) {
        listeners = new Set();
        this._listeners[eventName] = listeners;
      }

      listeners.add(listener);
    }
    /** {@inheritDoc Emitter.removeEventListener} */

  }, {
    key: "removeEventListener",
    value: function removeEventListener(eventName, listener) {
      var listeners = this._listeners[eventName];

      if (!listeners) {
        return;
      }

      listeners["delete"](listener);
    }
    /** {@inheritDoc Emitter.once} */

  }, {
    key: "once",
    value: function once(eventName) {
      var _this = this;

      return new Promise(function (resolve) {
        var listener = function listener(data) {
          _this.removeEventListener(eventName, listener);

          resolve(data);
        };

        _this.addEventListener(eventName, listener);
      });
    }
    /** @internal */

  }, {
    key: "emit",
    value: function emit(eventName, data) {
      var listeners = this._listeners[eventName];

      if (!listeners) {
        return;
      }

      listeners.forEach(function (listener) {
        listener(data);
      });
    }
    /** @internal */

  }, {
    key: "removeAllListeners",
    value: function removeAllListeners() {
      Object.values(this._listeners).forEach(function (listeners) {
        if (listeners) {
          listeners.clear();
        }
      });
    }
  }]);

  return ConcreteEmitter;
}();

var MessageType;

(function (MessageType) {
  MessageType["HandshakeRequest"] = "handshake-request";
  MessageType["HandshakeResponse"] = "handshake-response";
  MessageType["Call"] = "call";
  MessageType["Response"] = "response";
  MessageType["Error"] = "error";
  MessageType["Event"] = "event";
  MessageType["Callback"] = "callback";
})(MessageType || (MessageType = {})); // Message Creators


function createHandshakeRequestMessage(sessionId) {
  return {
    type: MARKER,
    action: MessageType.HandshakeRequest,
    sessionId: sessionId
  };
}

function createHandshakeResponseMessage(sessionId) {
  return {
    type: MARKER,
    action: MessageType.HandshakeResponse,
    sessionId: sessionId
  };
}

function createCallMessage(sessionId, requestId, methodName, args) {
  return {
    type: MARKER,
    action: MessageType.Call,
    sessionId: sessionId,
    requestId: requestId,
    methodName: methodName,
    args: args
  };
}

function createResponsMessage(sessionId, requestId, result, error) {
  var message = {
    type: MARKER,
    action: MessageType.Response,
    sessionId: sessionId,
    requestId: requestId
  };

  if (result !== undefined) {
    message.result = result;
  }

  if (error !== undefined) {
    message.error = error;
  }

  return message;
}

function createCallbackMessage(sessionId, requestId, callbackId, args) {
  return {
    type: MARKER,
    action: MessageType.Callback,
    sessionId: sessionId,
    requestId: requestId,
    callbackId: callbackId,
    args: args
  };
}

function createEventMessage(sessionId, eventName, payload) {
  return {
    type: MARKER,
    action: MessageType.Event,
    sessionId: sessionId,
    eventName: eventName,
    payload: payload
  };
} // Type Guards


function isMessage(m) {
  return m && m.type === MARKER;
}

function isHandshakeRequestMessage(m) {
  return isMessage(m) && m.action === MessageType.HandshakeRequest;
}

function isHandshakeResponseMessage(m) {
  return isMessage(m) && m.action === MessageType.HandshakeResponse;
}

function isCallMessage(m) {
  return isMessage(m) && m.action === MessageType.Call;
}

function isResponseMessage(m) {
  return isMessage(m) && m.action === MessageType.Response;
}

function isCallbackMessage(m) {
  return isMessage(m) && m.action === MessageType.Callback;
}

function isEventMessage(m) {
  return isMessage(m) && m.action === MessageType.Event;
}

function makeCallbackEvent(requestId) {
  return "callback_".concat(requestId);
}

function makeResponseEvent(requestId) {
  return "response_".concat(requestId);
}

var Dispatcher = /*#__PURE__*/function (_ConcreteEmitter) {
  _inherits(Dispatcher, _ConcreteEmitter);

  var _super = _createSuper(Dispatcher);

  function Dispatcher(messenger, sessionId) {
    var _this2;

    _classCallCheck(this, Dispatcher);

    _this2 = _super.call(this);
    _this2.uniqueId = createUniqueIdFn();
    _this2.messenger = messenger;
    _this2.sessionId = sessionId;
    _this2.removeMessengerListener = _this2.messenger.addMessageListener(_this2.messengerListener.bind(_assertThisInitialized(_this2)));
    return _this2;
  }

  _createClass(Dispatcher, [{
    key: "messengerListener",
    value: function messengerListener(event) {
      var data = event.data;

      if (!isMessage(data)) {
        return;
      }

      if (this.sessionId !== data.sessionId) {
        return;
      }

      if (isCallMessage(data)) {
        this.emit(MessageType.Call, data);
      } else if (isResponseMessage(data)) {
        this.emit(makeResponseEvent(data.requestId), data);
      } else if (isEventMessage(data)) {
        this.emit(MessageType.Event, data);
      } else if (isCallbackMessage(data)) {
        this.emit(makeCallbackEvent(data.requestId), data);
      }
    }
  }, {
    key: "callOnRemote",
    value: function callOnRemote(methodName, args, transfer) {
      var requestId = this.uniqueId();
      var callbackEvent = makeCallbackEvent(requestId);
      var responseEvent = makeResponseEvent(requestId);
      var message = createCallMessage(this.sessionId, requestId, methodName, args);
      this.messenger.postMessage(message, transfer);
      return {
        callbackEvent: callbackEvent,
        responseEvent: responseEvent
      };
    }
  }, {
    key: "respondToRemote",
    value: function respondToRemote(requestId, value, error, transfer) {
      if (error instanceof Error) {
        error = {
          name: error.name,
          message: error.message
        };
      }

      var message = createResponsMessage(this.sessionId, requestId, value, error);
      this.messenger.postMessage(message, transfer);
    }
  }, {
    key: "callbackToRemote",
    value: function callbackToRemote(requestId, callbackId, args) {
      var message = createCallbackMessage(this.sessionId, requestId, callbackId, args);
      this.messenger.postMessage(message);
    }
  }, {
    key: "emitToRemote",
    value: function emitToRemote(eventName, payload, transfer) {
      var message = createEventMessage(this.sessionId, eventName, payload);
      this.messenger.postMessage(message, transfer);
    }
  }, {
    key: "close",
    value: function close() {
      this.removeMessengerListener();
      this.removeAllListeners();
    }
  }]);

  return Dispatcher;
}(ConcreteEmitter);

var ParentHandshakeDispatcher = /*#__PURE__*/function (_ConcreteEmitter2) {
  _inherits(ParentHandshakeDispatcher, _ConcreteEmitter2);

  var _super2 = _createSuper(ParentHandshakeDispatcher);

  function ParentHandshakeDispatcher(messenger, sessionId) {
    var _this3;

    _classCallCheck(this, ParentHandshakeDispatcher);

    _this3 = _super2.call(this);
    _this3.messenger = messenger;
    _this3.sessionId = sessionId;
    _this3.removeMessengerListener = _this3.messenger.addMessageListener(_this3.messengerListener.bind(_assertThisInitialized(_this3)));
    return _this3;
  }

  _createClass(ParentHandshakeDispatcher, [{
    key: "messengerListener",
    value: function messengerListener(event) {
      var data = event.data;

      if (!isMessage(data)) {
        return;
      }

      if (this.sessionId !== data.sessionId) {
        return;
      }

      if (isHandshakeResponseMessage(data)) {
        this.emit(data.sessionId, data);
      }
    }
  }, {
    key: "initiateHandshake",
    value: function initiateHandshake() {
      var message = createHandshakeRequestMessage(this.sessionId);
      this.messenger.postMessage(message);
      return this.sessionId;
    }
  }, {
    key: "close",
    value: function close() {
      this.removeMessengerListener();
      this.removeAllListeners();
    }
  }]);

  return ParentHandshakeDispatcher;
}(ConcreteEmitter);

var ChildHandshakeDispatcher = /*#__PURE__*/function (_ConcreteEmitter3) {
  _inherits(ChildHandshakeDispatcher, _ConcreteEmitter3);

  var _super3 = _createSuper(ChildHandshakeDispatcher);

  function ChildHandshakeDispatcher(messenger) {
    var _this4;

    _classCallCheck(this, ChildHandshakeDispatcher);

    _this4 = _super3.call(this);
    _this4.messenger = messenger;
    _this4.removeMessengerListener = _this4.messenger.addMessageListener(_this4.messengerListener.bind(_assertThisInitialized(_this4)));
    return _this4;
  }

  _createClass(ChildHandshakeDispatcher, [{
    key: "messengerListener",
    value: function messengerListener(event) {
      var data = event.data;

      if (isHandshakeRequestMessage(data)) {
        this.emit(MessageType.HandshakeRequest, data);
      }
    }
  }, {
    key: "acceptHandshake",
    value: function acceptHandshake(sessionId) {
      var message = createHandshakeResponseMessage(sessionId);
      this.messenger.postMessage(message);
    }
  }, {
    key: "close",
    value: function close() {
      this.removeMessengerListener();
      this.removeAllListeners();
    }
  }]);

  return ChildHandshakeDispatcher;
}(ConcreteEmitter);

var ProxyType;

(function (ProxyType) {
  ProxyType["Callback"] = "callback";
})(ProxyType || (ProxyType = {}));

function createCallbackProxy(callbackId) {
  return {
    type: MARKER,
    proxy: ProxyType.Callback,
    callbackId: callbackId
  };
}

function isCallbackProxy(p) {
  return p && p.type === MARKER && p.proxy === ProxyType.Callback;
}

var ConcreteRemoteHandle = /*#__PURE__*/function (_ConcreteEmitter4) {
  _inherits(ConcreteRemoteHandle, _ConcreteEmitter4);

  var _super4 = _createSuper(ConcreteRemoteHandle);

  function ConcreteRemoteHandle(dispatcher) {
    var _this5;

    _classCallCheck(this, ConcreteRemoteHandle);

    _this5 = _super4.call(this);
    _this5._dispatcher = dispatcher;
    _this5._callTransfer = {};

    _this5._dispatcher.addEventListener(MessageType.Event, _this5._handleEvent.bind(_assertThisInitialized(_this5)));

    return _this5;
  }

  _createClass(ConcreteRemoteHandle, [{
    key: "close",
    value: function close() {
      this.removeAllListeners();
    }
  }, {
    key: "setCallTransfer",
    value: function setCallTransfer(methodName, transfer) {
      this._callTransfer[methodName] = transfer;
    }
  }, {
    key: "call",
    value: function call(methodName) {
      for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      return this.customCall(methodName, args);
    }
  }, {
    key: "customCall",
    value: function customCall(methodName, args) {
      var _this6 = this;

      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      return new Promise(function (resolve, reject) {
        var sanitizedArgs = [];
        var callbacks = [];
        var callbackId = 0;
        args.forEach(function (arg) {
          if (typeof arg === 'function') {
            callbacks.push(arg);
            sanitizedArgs.push(createCallbackProxy(callbackId));
            callbackId += 1;
          } else {
            sanitizedArgs.push(arg);
          }
        });
        var hasCallbacks = callbacks.length > 0;
        var callbackListener = undefined;

        if (hasCallbacks) {
          callbackListener = function callbackListener(data) {
            var callbackId = data.callbackId,
                args = data.args;
            callbacks[callbackId].apply(callbacks, _toConsumableArray(args));
          };
        }

        var transfer = options.transfer;

        if (transfer === undefined && _this6._callTransfer[methodName]) {
          var _this6$_callTransfer;

          transfer = (_this6$_callTransfer = _this6._callTransfer)[methodName].apply(_this6$_callTransfer, sanitizedArgs);
        }

        var _this6$_dispatcher$ca = _this6._dispatcher.callOnRemote(methodName, sanitizedArgs, transfer),
            callbackEvent = _this6$_dispatcher$ca.callbackEvent,
            responseEvent = _this6$_dispatcher$ca.responseEvent;

        if (hasCallbacks) {
          _this6._dispatcher.addEventListener(callbackEvent, callbackListener);
        }

        _this6._dispatcher.once(responseEvent).then(function (response) {
          if (callbackListener) {
            _this6._dispatcher.removeEventListener(callbackEvent, callbackListener);
          }

          var result = response.result,
              error = response.error;

          if (error !== undefined) {
            reject(error);
          } else {
            resolve(result);
          }
        });
      });
    }
  }, {
    key: "_handleEvent",
    value: function _handleEvent(data) {
      var eventName = data.eventName,
          payload = data.payload;
      this.emit(eventName, payload);
    }
  }]);

  return ConcreteRemoteHandle;
}(ConcreteEmitter);

var ConcreteLocalHandle = /*#__PURE__*/function () {
  function ConcreteLocalHandle(dispatcher, localMethods) {
    _classCallCheck(this, ConcreteLocalHandle);

    this._dispatcher = dispatcher;
    this._methods = localMethods;
    this._returnTransfer = {};
    this._emitTransfer = {};

    this._dispatcher.addEventListener(MessageType.Call, this._handleCall.bind(this));
  }

  _createClass(ConcreteLocalHandle, [{
    key: "emit",
    value: function emit(eventName, payload) {
      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      var transfer = options.transfer;

      if (transfer === undefined && this._emitTransfer[eventName]) {
        transfer = this._emitTransfer[eventName](payload);
      }

      this._dispatcher.emitToRemote(eventName, payload, transfer);
    }
  }, {
    key: "setMethods",
    value: function setMethods(methods) {
      this._methods = methods;
    }
  }, {
    key: "setMethod",
    value: function setMethod(methodName, method) {
      this._methods[methodName] = method;
    }
  }, {
    key: "setReturnTransfer",
    value: function setReturnTransfer(methodName, transfer) {
      this._returnTransfer[methodName] = transfer;
    }
  }, {
    key: "setEmitTransfer",
    value: function setEmitTransfer(eventName, transfer) {
      this._emitTransfer[eventName] = transfer;
    }
  }, {
    key: "_handleCall",
    value: function _handleCall(data) {
      var _this7 = this;

      var requestId = data.requestId,
          methodName = data.methodName,
          args = data.args;
      var callMethod = new Promise(function (resolve, reject) {
        var _this7$_methods;

        var method = _this7._methods[methodName];

        if (typeof method !== 'function') {
          reject(new Error("The method \"".concat(methodName, "\" has not been implemented.")));
          return;
        }

        var desanitizedArgs = args.map(function (arg) {
          if (isCallbackProxy(arg)) {
            var callbackId = arg.callbackId;
            return function () {
              for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                args[_key2] = arguments[_key2];
              }

              _this7._dispatcher.callbackToRemote(requestId, callbackId, args);
            };
          } else {
            return arg;
          }
        });
        Promise.resolve((_this7$_methods = _this7._methods)[methodName].apply(_this7$_methods, _toConsumableArray(desanitizedArgs))).then(resolve)["catch"](reject);
      });
      callMethod.then(function (result) {
        var transfer;

        if (_this7._returnTransfer[methodName]) {
          transfer = _this7._returnTransfer[methodName](result);
        }

        _this7._dispatcher.respondToRemote(requestId, result, undefined, transfer);
      })["catch"](function (error) {
        _this7._dispatcher.respondToRemote(requestId, undefined, error);
      });
    }
  }]);

  return ConcreteLocalHandle;
}();

var ConcreteConnection = /*#__PURE__*/function () {
  function ConcreteConnection(dispatcher, localMethods) {
    _classCallCheck(this, ConcreteConnection);

    this._dispatcher = dispatcher;
    this._localHandle = new ConcreteLocalHandle(dispatcher, localMethods);
    this._remoteHandle = new ConcreteRemoteHandle(dispatcher);
  }

  _createClass(ConcreteConnection, [{
    key: "close",
    value: function close() {
      this._dispatcher.close();

      this.remoteHandle().close();
    }
  }, {
    key: "localHandle",
    value: function localHandle() {
      return this._localHandle;
    }
  }, {
    key: "remoteHandle",
    value: function remoteHandle() {
      return this._remoteHandle;
    }
  }]);

  return ConcreteConnection;
}();

var uniqueSessionId = createUniqueIdFn();

var runUntil = function runUntil(worker, condition, unfulfilled, maxAttempts, attemptInterval) {
  var attempt = 0;

  var fn = function fn() {
    if (!condition() && (attempt < maxAttempts || maxAttempts < 1)) {
      worker();
      attempt += 1;
      setTimeout(fn, attemptInterval);
    } else if (!condition() && attempt >= maxAttempts && maxAttempts >= 1) {
      unfulfilled();
    }
  };

  fn();
};
/**
 * Initiate the handshake from the Parent side
 *
 * @param messenger - The Messenger used to send and receive messages from the other end
 * @param localMethods - The methods that will be exposed to the other end
 * @param maxAttempts - The maximum number of handshake attempts
 * @param attemptsInterval - The interval between handshake attempts
 * @returns A Promise to an active {@link Connection} to the other end
 *
 * @public
 */


function ParentHandshake(messenger) {
  var localMethods = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var maxAttempts = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 5;
  var attemptsInterval = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 100;
  var thisSessionId = uniqueSessionId();
  var connected = false;
  return new Promise(function (resolve, reject) {
    var handshakeDispatcher = new ParentHandshakeDispatcher(messenger, thisSessionId);
    handshakeDispatcher.once(thisSessionId).then(function (response) {
      connected = true;
      handshakeDispatcher.close();
      var sessionId = response.sessionId;
      var dispatcher = new Dispatcher(messenger, sessionId);
      var connection = new ConcreteConnection(dispatcher, localMethods);
      resolve(connection);
    });
    runUntil(function () {
      return handshakeDispatcher.initiateHandshake();
    }, function () {
      return connected;
    }, function () {
      return reject(new Error("Handshake failed, reached maximum number of attempts"));
    }, maxAttempts, attemptsInterval);
  });
}
/**
 * Initiate the handshake from the Child side
 *
 * @param messenger - The Messenger used to send and receive messages from the other end
 * @param localMethods - The methods that will be exposed to the other end
 * @returns A Promise to an active {@link Connection} to the other end
 *
 * @public
 */


function ChildHandshake(messenger) {
  var localMethods = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  return new Promise(function (resolve, reject) {
    var handshakeDispatcher = new ChildHandshakeDispatcher(messenger);
    handshakeDispatcher.once(MessageType.HandshakeRequest).then(function (response) {
      var sessionId = response.sessionId;
      handshakeDispatcher.acceptHandshake(sessionId);
      handshakeDispatcher.close();
      var dispatcher = new Dispatcher(messenger, sessionId);
      var connection = new ConcreteConnection(dispatcher, localMethods);
      resolve(connection);
    });
  });
}

var acceptableMessageEvent = function acceptableMessageEvent(event, remoteWindow, acceptedOrigin) {
  var source = event.source,
      origin = event.origin;

  if (source !== remoteWindow) {
    return false;
  }

  if (origin !== acceptedOrigin && acceptedOrigin !== '*') {
    return false;
  }

  return true;
};
/**
 * A concrete implementation of {@link Messenger} used to communicate with another Window.
 *
 * @public
 *
 */


var WindowMessenger = function WindowMessenger(_ref) {
  var localWindow = _ref.localWindow,
      remoteWindow = _ref.remoteWindow,
      remoteOrigin = _ref.remoteOrigin;

  _classCallCheck(this, WindowMessenger);

  localWindow = localWindow || window;

  this.postMessage = function (message, transfer) {
    remoteWindow.postMessage(message, remoteOrigin, transfer);
  };

  this.addMessageListener = function (listener) {
    var outerListener = function outerListener(event) {
      if (acceptableMessageEvent(event, remoteWindow, remoteOrigin)) {
        listener(event);
      }
    };

    localWindow.addEventListener('message', outerListener);

    var removeListener = function removeListener() {
      localWindow.removeEventListener('message', outerListener);
    };

    return removeListener;
  };
};
/** @public */


var BareMessenger = function BareMessenger(postable) {
  _classCallCheck(this, BareMessenger);

  this.postMessage = function (message) {
    var transfer = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
    postable.postMessage(message, transfer);
  };

  this.addMessageListener = function (listener) {
    var outerListener = function outerListener(event) {
      listener(event);
    };

    postable.addEventListener('message', outerListener);

    var removeListener = function removeListener() {
      postable.removeEventListener('message', outerListener);
    };

    return removeListener;
  };
};
/**
 * A concrete implementation of {@link Messenger} used to communicate with a Worker.
 *
 * Takes a {@link Postable} representing the `Worker` (when calling from
 * the parent context) or the `self` `DedicatedWorkerGlobalScope` object
 * (when calling from the child context).
 *
 * @public
 *
 */


var WorkerMessenger = /*#__PURE__*/function (_BareMessenger) {
  _inherits(WorkerMessenger, _BareMessenger);

  var _super5 = _createSuper(WorkerMessenger);

  function WorkerMessenger(_ref2) {
    var worker = _ref2.worker;

    _classCallCheck(this, WorkerMessenger);

    return _super5.call(this, worker);
  }

  return WorkerMessenger;
}(BareMessenger);
/**
 * A concrete implementation of {@link Messenger} used to communicate with a MessagePort.
 *
 * @public
 *
 */


var PortMessenger = /*#__PURE__*/function (_BareMessenger2) {
  _inherits(PortMessenger, _BareMessenger2);

  var _super6 = _createSuper(PortMessenger);

  function PortMessenger(_ref3) {
    var port = _ref3.port;

    _classCallCheck(this, PortMessenger);

    port.start();
    return _super6.call(this, port);
  }

  return PortMessenger;
}(BareMessenger);
/**
 * Create a logger function with a specific namespace
 *
 * @param namespace - The namespace will be prepended to all the arguments passed to the logger function
 * @param log - The underlying logger (`console.log` by default)
 *
 * @public
 *
 */


function debug(namespace, log) {
  log = log || console.debug || console.log || function () {};

  return function () {
    for (var _len3 = arguments.length, data = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
      data[_key3] = arguments[_key3];
    }

    log.apply(void 0, [namespace].concat(data));
  };
}
/**
 * Decorate a {@link Messenger} so that it will log any message exchanged
 * @param messenger - The Messenger that will be decorated
 * @param log - The logger function that will receive each message
 * @returns A decorated Messenger
 *
 * @public
 *
 */


function DebugMessenger(messenger, log) {
  log = log || debug('post-me');

  var debugListener = function debugListener(event) {
    var data = event.data;
    log('⬅️ received message', data);
  };

  messenger.addMessageListener(debugListener);
  return {
    postMessage: function postMessage(message, transfer) {
      log('➡️ sending message', message);
      messenger.postMessage(message, transfer);
    },
    addMessageListener: function addMessageListener(listener) {
      return messenger.addMessageListener(listener);
    }
  };
}




/***/ })
/******/ ]);