/**
 * Created by lihang on 16/9/19.
 */

import {AboutPage} from '../pages/about/about';
import {ContactPage} from '../pages/contact/contact';
import {DemoPage} from '../pages/demo/demo';
import {HomePage} from '../pages/home/home';
import {TabsPage} from '../pages/tabs/tabs';

export const Routes = {
  'TabsPage': {
    page: TabsPage,
    //url:'/tabs',
    root: true,
    enable: true
  },
  // 几个tab也要配置一下,特殊处理
  'HomePage': {
    page: HomePage,
  },
  'ContactPage': {
    page: ContactPage,
  },
  'AboutPage': {
    page: AboutPage,
  },
  'DemoPage': {
    page: DemoPage,
    //url:'/demo',
    pop: { //optional,when user try to pop from this page but there is no previous page in the navStack,router will redirect(fake pop animation) to page config here
      name: 'TabsPage',
      params: null,
      options: null,
      done: null,
      force:false //optional,true or false(default),set to true means always pop to the page config here
    }
  }
}
