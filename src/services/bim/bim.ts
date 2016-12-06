import {Injectable} from '@angular/core';
import {Api} from './api';

@Injectable()
export class Bim {
  public libHost = 'https://thisisanexperimentalserver.com'
  public localLibHost = 'bimsurfer/lib/'
  public localLibPrefix = 'assets/'
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
      baseUrl: this.localLibPrefix,
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
        this.loadScripts(this.libHost + '/apps/bimserverjavascriptapi/js/', ['bimserverapiwebsocket.js', 'bimserverclient.js', 'bimserverapipromise.js', 'ifc2x3tc1.js', 'ifc4.js', 'model.js', 'translations_en.js']).then(() => {
          resolve()
        }).catch((err) => {
          reject(err)
        })
      } catch (e) {
        reject(e)
      }
    })
    let lib1 = new Promise((resolve, reject) => {
      try {
        this.loadScripts(this.localLibPrefix + this.localLibHost, ['require.js', 'xeogl.js']).then(() => {
          resolve()
        }).catch((err) => {
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
      ]).then(() => {
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
      }).catch((err) => {
        reject(err)
      })
    })
  }

  private loadScript = (url, timeout = 30000) => {
    return new Promise((resolve, reject) => {
      let script = document.createElement("script")
      script.type = "text/javascript";
      let timer;

      if (script['readyState']) { //IE
        script['onreadystatechange'] = () => {
          if (script['readyState'] == "loaded" || script['readyState'] == "complete") {
            script['onreadystatechange'] = null;
            clearTimeout(timer)
            timer = null
            reject({url: url, msg: 404})
          }
        };
      } else { //Others
        script.onload = (code) => {
          clearTimeout(timer)
          timer = null
          resolve({url: url, msg: code})
        };
        script.onerror = (err) => {
          clearTimeout(timer)
          timer = null
          reject({url: url, msg: err})
        }
      }

      if (timeout > 0)
        timer = setTimeout(() => {
          reject({url: url, msg: 400})
          timer = null
        }, timeout)
      script.src = url;
      document.getElementsByTagName("head")[0].appendChild(script);
    })
  }

  private loadScripts = (baseAddress = '', filenames, timeout?) => {
    let counter = filenames.length;
    let index = 0
    let list = []
    for (let c in filenames)
      list.push(this.loadScript(baseAddress + filenames[c]), timeout)

    return Promise.all(list)

    //   let recursive = () => {
    //     if (index < counter)
    //       this.loadScript(baseAddress + filenames[index++], recursive, onError, timeout)
    //     else if (callback)
    //       callback()
    //   }
    // recursive()

  }

}



