'use client';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Cairo } from '@next/font/google';

const cairo = Cairo({
    subsets: ['latin'],
    weight: ['600', '800'], // Use the weights you need
});

const Dashboard = () => {
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [usersCount, setUsersCount] = useState(0);
    const [completedOrdersTotal, setCompletedOrdersTotal] = useState(0);
    const [totalProducts, setTotalProducts] = useState(0); // For total products card
    const [selectedProduct, setSelectedProduct] = useState(null); // For viewing product details
    const [selectedOrder, setSelectedOrder] = useState(null); // For viewing order details
    const [productDialogVisible, setProductDialogVisible] = useState(false); // Show/hide product dialog
    const [orderDialogVisible, setOrderDialogVisible] = useState(false); // Show/hide order dialog
    const [totalOrder, setTotalOrder] = useState('0'); // Show/hide order dialog

    useEffect(() => {
        fetchData();
    }, []);

    console.log(selectedProduct);

    const fetchData = async () => {
        const token = localStorage.getItem('token');
        const config = {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };

        try{

            const total = await axios.get('http://127.0.0.1:8000/api/countOrder', config);
            setTotalOrder(total.data);

        }catch(error){
            console.error('Error fetching data:', error);
        }

        try {
            // Fetch Products
            const productsResponse = await axios.get('http://127.0.0.1:8000/api/products', config);
            const productsData = productsResponse.data;
            setProducts(productsData.slice(0, 10)); // Display the last 10 products
            setTotalProducts(productsData.length); // Set total products count

            // Fetch Orders
            const ordersResponse = await axios.get('http://127.0.0.1:8000/api/orders', config);


            const ordersData = ordersResponse.data;
            setOrders(ordersData.slice(0, 10)); // Display the last 10 orders

            // Calculate total price of completed orders
            const totalCompletedPrice = ordersData
                .filter((order:any) => order.status === 'completed')
                .reduce((acc:any, order:any) => acc + order.total_price, 0);
            setCompletedOrdersTotal(totalCompletedPrice);

            // Fetch Users
            const usersResponse = await axios.get('http://127.0.0.1:8000/api/users', config);
            setUsersCount(usersResponse.data.length); // Total number of users
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const formatCurrency = (value: number | null | undefined) => {
        return value?.toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD',
        });
    };

    // Open product details dialog
    const viewProductDetails = (product) => {
        setSelectedProduct(product);
        console.log(selectedProduct)
        setProductDialogVisible(true);
    };

    // Open order details dialog
    const viewOrderDetails = (order) => {
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
                                <span className="block text-500 font-medium mb-3">الرصيد</span>
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
                                <span className="block text-500 font-medium mb-3">العملاء</span>
                                <div className="text-900 font-medium text-xl">{usersCount}</div>
                            </div>
                            <div className="flex align-items-center justify-content-center bg-purple-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                                <i className="pi pi-comment text-purple-500 text-xl" />
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
                <Dialog header="تفاصيل الطلب" visible={orderDialogVisible} style={{ width: '50vw' }} onHide={() => setOrderDialogVisible(false)} dir="rtl">
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
                                )
                                )}
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
                            <Column field="total_price" header="السعر" sortable style={{ width: '10%' }} body={(data) => formatCurrency(data.total_price)} />
                            <Column
                                header="عرض"
                                style={{ width: '15%' }}
                                body={(rowData) => (
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
                            <Column field="price" header="السعر" sortable style={{ width: '10%' }} body={(data) => formatCurrency(data.price)} />
                            <Column
                                header="عرض"
                                style={{ width: '10%' }}
                                body={(rowData) => (
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
