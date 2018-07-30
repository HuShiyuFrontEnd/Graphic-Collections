import axios from 'axios'
import qs from 'qs'

const setting = {
    socketHost:'ws://im.zmlearn.com:9999',//test  ws://116.62.33.229:9999
    httpHost:'',//反向代理这个接口//'http://open.zmlearn.com',//http://open-test.zmlearn.com
    listApi:'/api/report/paymentRoll/recent',
    // simulateApi:'/api/im/pushEvent'
}

const API = {
    socket:setting.socketHost,
    getOrderList(){
        return axios.get(setting.httpHost + setting.listApi);
    },
    pushSimulate(data){
        return axios.post(setting.httpHost + setting.simulateApi, data);
    }
}

export default API;