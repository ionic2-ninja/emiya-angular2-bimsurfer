import {Injectable} from '@angular/core';
import {Api} from './api';

@Injectable()
export class Bim {
  private libHost = 'https://thisisanexperimentalserver.com'
  private libLoaded = false
  private address;
  private username;
  private password;
  private instance;
  private token;

  constructor() {
    window['version'] = new Date().getTime();

    // This has been moved to bimserverapi, can be removed in a day
    String.prototype['firstUpper'] = function () {
      return this.charAt(0).toUpperCase() + this.slice(1);
    }

    // Because the demo is in a subfolder compared to the BIMsurfer API, we tell require JS to use the "../" baseUrl
    window['require'] = {
      baseUrl: "assets/",
      urlArgs: "bust=" + window['version']
    };
  }

  public setLibHost = (libHost?) => {
    if (libHost)
      this.libHost = libHost
  }

  private init = () => {
    let lib0 = new Promise((resolve, reject) => {
      try {
        this.loadScripts(this.libHost + '/apps/bimserverjavascriptapi/js/', ['bimserverapiwebsocket.js', 'bimserverclient.js', 'bimserverapipromise.js', 'ifc2x3tc1.js', 'ifc4.js', 'model.js', 'translations_en.js'], () => {

          resolve()
        }, (err) => {
          reject(err)
        })
      } catch (e) {
        reject(e)
      }
    })
    let lib1 = new Promise((resolve, reject) => {
      try {
        this.loadScripts('assets/bimsurfer/lib/', ['require.js', 'xeogl.js'], () => {
          resolve()
        }, (err) => {
          reject(err)
        })
      } catch (e) {
        reject(e)
      }
    })

    return Promise.all([lib0, lib1]).then(() => {
      this.libLoaded = true
    })
  }


  public connect = (address, usernameOrToken, password?) => {
    return new Promise((resolve, reject) => {
      this.address = address
      // if (this.password === null || this.password === undefined) {
      //   this.token = username
      // }
      // else {
      //   this.username = username
      //   this.password = password
      // }
      this.username = usernameOrToken
      this.password = password
      if (this.libLoaded) {
        return this._connect().then((instance) => {
          resolve(instance)
        }).catch((err) => {
          reject(err)
        })
      } else {
        this.init().then(() => {
          this._connect().then((instance) => {
            resolve(instance)
          }).catch((err) => {
            reject(err)
          })
        }).catch((err) => {
          reject(err)
        })
      }
    })
  }

  public getInstance = () => {
    return this.instance
  }

  private _connect = () => {
    return new Promise((resolve, reject) => {
      this.loadScripts(this.address + "/apps/bimserverjavascriptapi/js/", [
        "bimserverclient.js",
        "model.js",
        "bimserverapiwebsocket.js",
        "bimserverapipromise.js",
        "geometry.js",
        "ifc2x3tc1.js",
        "ifc4.js",
        "translations_en.js",
      ], () => {
        let instance = new Api(this.address, this.username, this.password);
        instance.login().then(() => {
          instance.loadLib().then(() => {
            this.instance = instance
            resolve(this.instance)
          }).catch((err) => {
            this.instance = null
            reject(err)
          })
        }).catch((err) => {
          this.instance = null
          reject(err)
        })
      }, (err) => {
        reject(err)
      })
    })
  }

  private loadScript = (url, callback?, onError?, timeout = 30000) => {

    let script = document.createElement("script")
    script.type = "text/javascript";
    let timer;

    if (script['readyState']) { //IE
      script['onreadystatechange'] = () => {
        if (script['readyState'] == "loaded" || script['readyState'] == "complete") {
          script['onreadystatechange'] = null;
          clearTimeout(timer)
          timer = null
          callback && callback(200, url);
        }
      };
    } else { //Others
      script.onload = () => {
        clearTimeout(timer)
        timer = null
        callback && callback(200, url);
      };
      script.onerror = (err) => {
        clearTimeout(timer)
        timer = null
        onError && onError(err, url)
      }
    }

    if (timeout > 0)
      timer = setTimeout(() => {
        onError && onError('timeout', url)
        timer = null
      }, timeout)
    script.src = url;
    document.getElementsByTagName("head")[0].appendChild(script);
  }

  private loadScripts = (baseAddress, filenames, callback?, onError?, timeout?) => {
    let counter = filenames.length;
    let index = 0

    let recursive = () => {
      if (index < counter)
        this.loadScript(baseAddress + filenames[index++], recursive, onError, timeout)
      else if (callback)
        callback()
    }
    recursive()

  }

}



