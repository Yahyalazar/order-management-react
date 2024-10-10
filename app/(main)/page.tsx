'use client';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Cairo } from '@next/font/google';

// Type for Product
interface Product {
    id: number;
    name: string;
    price: number;
    stock: number;
}

// Type for Order Item
interface OrderItem {
    product: Product;
    quantity: number;
}

// Type for Order
interface Order {
    id: number;
    total_price: number;
    status: string;
    created_at: string;
    items: OrderItem[];
}

// Type for API response
interface ApiResponse<T> {
    data: T;
}

// Adding Cairo font
const cairo = Cairo({
    subsets: ['latin'],
    weight: ['600', '800'], // Use the weights you need
});

const Dashboard: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [usersCount, setUsersCount] = useState<number>(0);
    const [completedOrdersTotal, setCompletedOrdersTotal] = useState<number>(0);
    const [totalProducts, setTotalProducts] = useState<number>(0);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [productDialogVisible, setProductDialogVisible] = useState<boolean>(false);
    const [orderDialogVisible, setOrderDialogVisible] = useState<boolean>(false);
    const [totalOrder, setTotalOrder] = useState<number>(0);

    useEffect(() => {
        fetchData();
    }, []);
    const apiUrl = 'https://api.zidoo.online/api';
    const fetchData = async () => {
        const token = localStorage.getItem('token');
        const config = {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };

        try {
            const totalResponse: ApiResponse<number> = await axios.get(`${apiUrl}/countOrder`, config);
            setTotalOrder(totalResponse.data);
        } catch (error) {
            console.error('Error fetching total order:', error);
        }

        try {
            // Fetch Products
            const productsResponse: ApiResponse<Product[]> = await axios.get(`${apiUrl}/products`, config);
            const productsData = productsResponse.data;
            setProducts(productsData.slice(0, 10));
            setTotalProducts(productsData.length);

            // Fetch Orders
            const ordersResponse: ApiResponse<Order[]> = await axios.get(`${apiUrl}/orders`, config);
            const ordersData = ordersResponse.data;
            setOrders(ordersData.slice(0, 10));

            // Calculate total price of completed orders
            const totalCompletedPrice = ordersData
                .filter((order) => order.status === 'completed')
                .reduce((acc, order) => acc + order.total_price, 0);
            setCompletedOrdersTotal(totalCompletedPrice);

            // Fetch Users
            const usersResponse = await axios.get(`${apiUrl}/deliveredOrder`, config);
            setUsersCount(usersResponse.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const formatCurrency = (value: number) => {
        return value?.toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD',
        });
    };

    const viewProductDetails = (product: Product) => {
        setSelectedProduct(product);
        setProductDialogVisible(true);
    };

    const viewOrderDetails = (order: Order) => {
        setSelectedOrder(order);
        setOrderDialogVisible(true);
    };

    return (
        <div className={cairo.className}>
            <div className="grid">
                {/* Cards Section */}
                <div className="col-12 lg:col-6 xl:col-3">
                    <div className="card mb-0">
                        <div className="flex justify-content-between mb-3">
                            <div>
                                <span className="block text-500 font-medium mb-3">المنتجات</span>
                                <div className="text-900 font-medium text-xl">{totalProducts}</div>
                            </div>
                            <div className="flex align-items-center justify-content-center bg-blue-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                                <i className="pi pi-box text-blue-500 text-xl" />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-12 lg:col-6 xl:col-3">
                    <div className="card mb-0">
                        <div className="flex justify-content-between mb-3">
                            <div>
                                <span className="block text-500 font-medium mb-3"> الرصيد المكتمل</span>
                                <div className="text-900 font-medium text-xl">${totalOrder}</div>
                            </div>
                            <div className="flex align-items-center justify-content-center bg-orange-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                                <i className="pi pi-money-bill text-orange-500 text-xl" />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-12 lg:col-6 xl:col-3">
                    <div className="card mb-0">
                        <div className="flex justify-content-between mb-3">
                            <div>
                                <span className="block text-500 font-medium mb-3">الطلبات</span>
                                <div className="text-900 font-medium text-xl">{orders.length}</div>
                            </div>
                            <div className="flex align-items-center justify-content-center bg-cyan-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                                <i className="pi pi-inbox text-cyan-500 text-xl" />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-12 lg:col-6 xl:col-3">
                    <div className="card mb-0">
                        <div className="flex justify-content-between mb-3">
                            <div>
                                <span className="block text-500 font-medium mb-3">الرصيد المستلم</span>
                                <div className="text-900 font-medium text-xl">${usersCount}</div>
                            </div>
                            <div className="flex align-items-center justify-content-center bg-purple-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                                <i className="pi pi-dollar text-purple-500 text-xl" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Product Details Dialog */}
                <Dialog header="تفاصيل المنتج" visible={productDialogVisible} style={{ width: '50vw' }} onHide={() => setProductDialogVisible(false)}>
                    {selectedProduct && (
                        <div>
                            <h3>اسم المنتج: {selectedProduct.name}</h3>
                            <p>السعر: {formatCurrency(selectedProduct.price)}</p>
                            <p>المخزون: {selectedProduct.stock}</p>
                        </div>
                    )}
                </Dialog>

                {/* Order Details Dialog */}
                <Dialog header="تفاصيل الطلب" visible={orderDialogVisible} style={{ width: '50vw' }} onHide={() => setOrderDialogVisible(false)} className='rtl-text'>
                    {selectedOrder && (
                        <div>
                            <h3>رمز الطلب: {selectedOrder.id}</h3>
                            <p>السعر الكلي: {formatCurrency(selectedOrder.total_price)}</p>
                            <p>الحالة: {selectedOrder.status}</p>
                            <p>التاريخ: {new Date(selectedOrder.created_at).toLocaleDateString()}</p>
                            <h4>المنتجات المطلوبة:</h4>
                            <ul>
                                {selectedOrder.items?.map((item) => (
                                    <li key={item.product.id}><h6>اسم المنتج: {item.product.name}</h6> - الكمية: {item.quantity}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </Dialog>

                {/* Table for Last 10 Orders */}
                <div className="col-12 xl:col-6">
                    <div className="card">
                        <h5>الطلبات الأخيرة</h5>
                        <DataTable value={orders} rows={5} paginator responsiveLayout="scroll">
                            <Column field="id" header="الرمز" sortable style={{ width: '10%' }} />
                            <Column field="total_price" header="السعر" sortable style={{ width: '10%' }} body={(data: Order) => formatCurrency(data.total_price)} />
                            <Column
                                header="عرض"
                                style={{ width: '15%' }}
                                body={(rowData: Order) => (
                                    <Button icon="pi pi-search" text onClick={() => viewOrderDetails(rowData)} />
                                )}
                            />
                        </DataTable>
                    </div>
                </div>

                {/* Table for Last 10 Products */}
                <div className="col-12 xl:col-6">
                    <div className="card">
                        <h5>المنتجات الأخيرة</h5>
                        <DataTable value={products} rows={5} paginator responsiveLayout="scroll">
                            <Column field="name" header="الاسم" sortable style={{ width: '10%' }} />
                            <Column field="price" header="السعر" sortable style={{ width: '10%' }} body={(data: Product) => formatCurrency(data.price)} />
                            <Column
                                header="عرض"
                                style={{ width: '10%' }}
                                body={(rowData: Product) => (
                                    <Button icon="pi pi-search" text onClick={() => viewProductDetails(rowData)} />
                                )}
                            />
                        </DataTable>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
