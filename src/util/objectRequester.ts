import request from 'request';
import { config } from '../config/config';

const c = config.dev;

class ObjectRequester{
    static getUser( userId: number){
        return new Promise((resolve, reject) => {
            request({
                url: `${c.url}/api/${config.application.api_version}/users/${userId}`,
                headers: {
                  'Authorization': `microservice ${config.application.communication_secret}`
                },
                json:true
              } , (error, response, body) => {
                if (error) reject(error);
                if (response.statusCode !== 200) {
                    reject('Invalid status code <' + response.statusCode + '>');
                }
                resolve(body);
            });
        });
    }

    static getRestaurant( token:string ,  restaurantId: number){
        console.log("Requesting Object restaurant " , restaurantId);
        return new Promise((resolve, reject) => {
            request({
                url: `${c.url}/api/${config.application.api_version}/restaurants/${restaurantId}`,
                headers: {
                  'Authorization': `token ${token}`
                },
                json:true
              } , (error, response, body) => {
                if (error) console.log(error);
                if (response.statusCode !== 200) {
                    console.log('Invalid status code <' + response.statusCode + '>');
                    resolve(null);
                }
                resolve(body);
            });
        });
    }
    static getMenu( token:string ,  menuId: number){
        console.log("Requesting Menu Object " , menuId);
        return new Promise((resolve, reject) => {
            request({
                url: `${c.url}/api/${config.application.api_version}/menus/cantouch/${menuId}`,
                headers: {
                  'Authorization': `token ${token}`
                },
                json:true
              } , (error, response, body) => {
                if (error) console.log(error);
                if (response.statusCode !== 200) {
                    console.log('Invalid status code <' + response.statusCode + '>');
                    resolve(null);
                }
                resolve(body);
            });
        });
    }
    static getMenuItem( token:string ,  menuitemId: number){
        console.log("Requesting MenuItem Object " , menuitemId);
        return new Promise((resolve, reject) => {
            request({
                url: `${c.url}/api/${config.application.api_version}/menuitems/${menuitemId}`,
                headers: {
                  'Authorization': `token ${token}`
                },
                json:true
              } , (error, response, body) => {
                if (error) console.log(error);
                if (response.statusCode !== 200) {
                    console.log('Invalid status code <' + response.statusCode + '>');
                    resolve(null);
                }
                resolve(body);
            });
        });
    }
    static getCustomer( token:string ,  customerId: number){
        console.log("Requesting MenuItem Object " , customerId);
        return new Promise((resolve, reject) => {
            request({
                url: `${c.url}/api/${config.application.api_version}/customers/${customerId}`,
                headers: {
                  'Authorization': `token ${token}`
                },
                json:true
              } , (error, response, body) => {
                if (error) console.log(error);
                if (response.statusCode !== 200) {
                    console.log('Invalid status code <' + response.statusCode + '>');
                    resolve(null);
                }
                resolve(body);
            });
        });
    }

}

export default ObjectRequester;