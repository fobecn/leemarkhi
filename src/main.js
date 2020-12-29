import Vue from 'vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import App from './App.vue'
import Vuex from 'vuex'
import store from './store'
import api from './api/request.js'
import axios from 'axios';


Vue.use(ElementUI,Vuex,store),

Vue.prototype.$api = api;
Vue.prototype.$axios = axios;

new Vue({
  el: '#app',
  store,
  render: h => h(App)
})
