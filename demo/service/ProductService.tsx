import { Demo } from '@/types';
import axios from 'axios';

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
        const response = await axios.get(`https://api.zidoo.online/api/products`, config);
        return response.data;
    },

    async getOrders() {  // This is the new method to fetch orders
        const token = localStorage.getItem('token');
        const config = {
            headers: {
                Authorization: `Bearer ${token}` // include token in Authorization header
            }
        };
        const response = await axios.get(`https://api.zidoo.online/api/orders`, config);
        return response.data;
    },

    async updateProducts(data: any, id: any) {
        const token = localStorage.getItem('token');
        const config = {
            headers: {
                Authorization: `Bearer ${token}` // include token in Authorization header
            }
        };
        const response = await axios.put(`https://api.zidoo.online/api/products/${id}`, data, config);
        return response.data;
    },

    async deleteProducts(id: any) {
        const token = localStorage.getItem('token');
        const config = {
            headers: {
                Authorization: `Bearer ${token}` // include token in Authorization header
            }
        };
        const response = await axios.delete(`https://api.zidoo.online/api/products/${id}`, config);
        return response.data;
    },

    getProductsWithOrdersSmall() {
        return fetch('/demo/data/products-orders-small.json', { headers: { 'Cache-Control': 'no-cache' } })
            .then((res) => res.json())
            .then((d) => d.data as Demo.Product[]);
    }
};
