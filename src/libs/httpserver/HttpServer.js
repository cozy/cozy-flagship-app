import {
	NativeModules,
	AppState,
	Platform
 } from 'react-native';

const { HttpServer: NativeHttpServer } = NativeModules;

const PORT = '';
const ROOT = null;

class HttpServer {
	constructor(port, root, opts) {
		this.port = `${port}` || PORT;
		this.root = root || ROOT;
		this.localOnly = (opts && opts.localOnly) || false;
		this.keepAlive = (opts && opts.keepAlive) || false;

		this.started = false;
		this._origin = undefined;
		this._handleAppStateChangeFn = this._handleAppStateChange.bind(this);
	}

	start() {
		if( this.running ){
			return Promise.resolve(this.origin);
		}

		this.started = true;
		this.running = true;

		if (!this.keepAlive && (Platform.OS === 'android')) {
			AppState.addEventListener('change', this._handleAppStateChangeFn);
		}

		return NativeHttpServer.start(this.port, this.root, this.localOnly, this.keepAlive)
			.then((origin) => {
				this._origin = origin;
				return origin;
			});
	}

	stop() {
		this.running = false;

		return NativeHttpServer.stop();
	}

	kill() {
		this.stop();
		this.started = false;
		this._origin = undefined;
		AppState.removeEventListener('change', this._handleAppStateChangeFn);
	}

	_handleAppStateChange(appState) {
		if (!this.started) {
			return;
		}

		if (appState === "active" && !this.running) {
			this.start();
		}

		if (appState === "background" && this.running) {
			this.stop();
		}

		if (appState === "inactive" && this.running) {
			this.stop();
		}
	}

	get origin() {
		return this._origin;
	}

	isRunning() {
		return NativeHttpServer.isRunning()
			.then(running => {
				this.running = running;

				return this.running;
			})
	}

}

export default HttpServer;
