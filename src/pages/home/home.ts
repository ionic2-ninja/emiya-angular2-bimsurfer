import {Component, AfterViewInit} from '@angular/core';
import {Bim} from '../../services/bim/bim'
import {NavController, App} from 'ionic-angular';
import {DemoPage} from '../demo/demo'
import {Router} from 'emiya-ionic2-router'
import {Token} from 'emiya-angular2-token'

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage implements AfterViewInit {

  projects;
  bust = new Date().getTime();
  isLogging = ''
  private instance
  private username
  private password
  private address
  currentUser = ''
  loginStatus = false


  constructor(public navCtrl: NavController, private bim: Bim, private app: App, private router: Router) {
  }

  login = (address?, username?, password?) => {
    this.isLogging = 'true'
    if (address == null)
      address = document.getElementById('address' + this.bust)['value']
    if (username == null)
      username = document.getElementById('username' + this.bust)['value']
    if (password == null)
      password = document.getElementById('password' + this.bust)['value']
    this.bim.connect(address, username, password).then((instance) => {
      this.instance = instance;
      this.instance.getAllProjects().then((data) => {
        this.projects = data
        this.projects = this.instance.makeProjectTree(this.projects)
        document.getElementById('projectlist' + this.bust).innerHTML = ''
        this.instance.makeProjectView(this.projects, document.getElementById('projectlist' + this.bust), this.showDemo)
        this.isLogging = ''
        this.address = address
        this.username = username
        this.password = password
        this.loginStatus = true
        this.currentUser = address + '/' + this.username
        if (password != '') {
          Token.set('bimAddress', encodeURIComponent(address))
          Token.set('bimUsername', encodeURIComponent(username))
          Token.set('bimPassword', encodeURIComponent(password))
          Token.set('bimToken', encodeURIComponent(this.instance.getToken()))
        }
      }).catch(() => {
        this.isLogging = ''
        this.address = null
        this.username = null
        this.password = null
        this.projects = null
        this.loginStatus = false
        this.currentUser = ''
        Token.delete('bimAddress')
        Token.delete('bimUsername')
        Token.delete('bimPassword')
        Token.delete('bimToken')
      })
    }).catch(() => {
      this.isLogging = ''
      this.address = null
      this.username = null
      this.password = null
      this.projects = null
      this.loginStatus = false
      this.currentUser = ''
      Token.delete('bimAddress')
      Token.delete('bimUsername')
      Token.delete('bimPassword')
      Token.delete('bimToken')
    })
  }

  showDemo = (obj) => {
    this.router.push(DemoPage, {poid: obj.oid, roid: obj.lastRevisionId, name: obj.name})
  }

  ngAfterViewInit() {

    let token = decodeURIComponent(Token.get('bimToken'))
    if (token != '' && token != null && token != undefined) {
      document.getElementById('address' + this.bust)['value'] = decodeURIComponent(Token.get('bimAddress'))
      document.getElementById('username' + this.bust)['value'] = decodeURIComponent(Token.get('bimUsername'))
      document.getElementById('password' + this.bust)['value'] = decodeURIComponent(Token.get('bimPassword'))
      if (!this.bim.getInstance())
        this.login(decodeURIComponent(Token.get('bimAddress')), token, '')
      else {
        this.instance = this.bim.getInstance()
        this.instance.getAllProjects().then((data) => {
          this.projects = data
          this.projects = this.instance.makeProjectTree(this.projects)
          document.getElementById('projectlist' + this.bust).innerHTML = ''
          this.instance.makeProjectView(this.projects, document.getElementById('projectlist' + this.bust), this.showDemo)
          this.isLogging = ''
          this.address = decodeURIComponent(Token.get('bimAddress'))
          this.username = decodeURIComponent(Token.get('bimUsername'))
          this.password = decodeURIComponent(Token.get('bimPassword'))
          this.loginStatus = true
          this.currentUser = decodeURIComponent(Token.get('bimAddress')) + '/' + this.username
        }).catch(() => {
          this.isLogging = ''
          this.address = null
          this.username = null
          this.password = null
          this.projects = null
          this.loginStatus = false
          this.currentUser = ''
          Token.delete('bimAddress')
          Token.delete('bimUsername')
          Token.delete('bimPassword')
          Token.delete('bimToken')
        })
      }
    }
    else {
      //All my document ready code here, which doesn't work
      // document.getElementById('address' + this.bust)['value'] = 'http://122.114.175.19:8083/bimserverwar-1.5.61'
      // document.getElementById('username' + this.bust)['value'] = '158114520@qq.com'
      // document.getElementById('password' + this.bust)['value'] = '123'
      document.getElementById('address' + this.bust)['value'] = 'http://192.168.102.28:8085/bimserverwar-1.5.62'
      document.getElementById('username' + this.bust)['value'] = 'admin@admin.com'
      document.getElementById('password' + this.bust)['value'] = '123'
    }
  }

}
