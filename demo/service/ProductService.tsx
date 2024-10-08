import { Demo } from '@/types';
import axios from 'axios';

const apiUrl='http://www.api.zidoo.online/api';
export const ProductService = {

    getProductsSmall() {
        return fetch('/demo/data/products-small.json', { headers: { 'Cache-Control': 'no-cache' } })
            .then((res) => res.json())
            .then((d) => d.data as Demo.Product[]);
    },

    async getProducts() {
        const token = localStorage.getItem('token');
        const config = {
            headers: {
                Authorization: `Bearer ${token}` // include token in Authorization header
            }
        };
        const response = await axios.get(`${apiUrl}/products`, config);
        return response.data;
    },

    async getOrders() {  // This is the new method to fetch orders
        const token = localStorage.getItem('token');
        const config = {
            headers: {
                Authorization: `Bearer ${token}` // include token in Authorization header
            }
        };
        const response = await axios.get(`${apiUrl}/orders`, config);
        return response.data;
    },

    async updateProducts(data: any, id: any) {
        const token = localStorage.getItem('token');
        const config = {
            headers: {
                Authorization: `Bearer ${token}` // include token in Authorization header
            }
        };
        const response = await axios.put(`${apiUrl}/products/${id}`, data, config);
        return response.data;
    },

    async deleteProducts(id: any) {
        const token = localStorage.getItem('token');
        const config = {
            headers: {
                Authorization: `Bearer ${token}` // include token in Authorization header
            }
        };
        const response = await axios.delete(`${apiUrl}/products/${id}`, config);
        return response.data;
    },

    getProductsWithOrdersSmall() {
        return fetch('/demo/data/products-orders-small.json', { headers: { 'Cache-Control': 'no-cache' } })
            .then((res) => res.json())
            .then((d) => d.data as Demo.Product[]);
    }
};
