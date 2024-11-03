'use client';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Cairo } from '@next/font/google';
import { Calendar } from 'primereact/calendar';
import { Chart } from 'primereact/chart';
import { Knob } from 'primereact/knob';
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
    weight: ['600', '800'] // Use the weights you need
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
    const [lenghtOrder, setLenghtOrder] = useState<number>(0);
    const [dateEnd, setDateEnd] = useState('');
    const [perDelivery, setPerDelivery] = useState(0);
    const [dateStart, setDateStart] = useState('');
    const [chartData, setChartData] = useState({});
     const [datast, setDatast] = useState<number[]>([0, 0, 0, 0]);
    const [chartOptions, setChartOptions] = useState({});
    useEffect(() => {
        const data = {
            labels: ['إلغاء الطلبات', 'الطلبات المكتملة', 'الطلبات التسليم', 'مجموع الطلبات'],
            datasets: [
                {
                    label: 'Sales',
                    data:datast,
                    backgroundColor: ['rgba(255, 159, 64, 0.2)', 'rgba(75, 192, 192, 0.2)', 'rgba(54, 162, 235, 0.2)', 'rgba(153, 102, 255, 0.2)'],
                    borderColor: ['rgb(255, 159, 64)', 'rgb(75, 192, 192)', 'rgb(54, 162, 235)', 'rgb(153, 102, 255)'],
                    borderWidth: 1
                }
            ]
        };
        const options = {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        };
        data.datasets[0].data = datast;
        setChartData(data);
        setChartOptions(options);
        fetchData();
    }, [datast]);
   const formatDate = (value: string | number | Date) => {
    const date = new Date(value);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};
    const apiUrl = 'https://wh1389740.ispot.cc/api';
    const fetchData = async () => {
        const token = localStorage.getItem('token');
        const config = {
            headers: {
                Authorization: `Bearer ${token}`
            }
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
            const lenght = productsData.length;
            setProducts(productsData.slice(0, 10));
            setTotalProducts(lenght);

            // Fetch Orders
            const ordersResponse: ApiResponse<Order[]> = await axios.get(`${apiUrl}/orders`, config);
            const ordersData = ordersResponse.data;
            setLenghtOrder(ordersData.length);
            setOrders(ordersData.slice(0, 10));

            // Calculate total price of completed orders
            const totalCompletedPrice = ordersData.filter((order) => order.status === 'completed').reduce((acc, order) => acc + order.total_price, 0);
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
            currency: 'USD'
        });
    };
    const getStatus = async () => {
     const token = localStorage.getItem('token');
        const config = {
            headers: {
                Authorization: `Bearer ${token}`
            }
        };

        try {
            const totalResponse: ApiResponse<any> = await axios.get(`${apiUrl}/order-stats?start_date=${formatDate(dateStart)}&end_date=${formatDate(dateEnd)}`, config);
                setDatast([
                Number(totalResponse.data.cancelled_orders),
                Number(totalResponse.data.completed_orders),
                Number(totalResponse.data.delivery_order),
                Number(totalResponse.data.total_orders)
            ]);
            setPerDelivery(totalResponse.data.delivery_percentage)
            console.log("good", formatDate(dateStart), formatDate(dateEnd), totalResponse,datast);
        } catch (error) {
            console.error('Error fetching total order:', error);
        }

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
                    <div className="mb-0 card">
                        <div className="flex mb-3 justify-content-between">
                            <div>
                                <span className="block mb-3 font-medium text-500">المنتجات</span>
                                <div className="text-xl font-medium text-900">{totalProducts}</div>
                            </div>
                            <div className="flex bg-blue-100 align-items-center justify-content-center border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                                <i className="text-xl text-blue-500 pi pi-box" />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-12 lg:col-6 xl:col-3">
                    <div className="mb-0 card">
                        <div className="flex mb-3 justify-content-between">
                            <div>
                                <span className="block mb-3 font-medium text-500"> الرصيد المكتمل</span>
                                <div className="text-xl font-medium text-900">${totalOrder}</div>
                            </div>
                            <div className="flex bg-orange-100 align-items-center justify-content-center border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                                <i className="text-xl text-orange-500 pi pi-money-bill" />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-12 lg:col-6 xl:col-3">
                    <div className="mb-0 card">
                        <div className="flex mb-3 justify-content-between">
                            <div>
                                <span className="block mb-3 font-medium text-500">الطلبات</span>
                                <div className="text-xl font-medium text-900">{lenghtOrder}</div>
                            </div>
                            <div className="flex align-items-center justify-content-center bg-cyan-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                                <i className="text-xl pi pi-inbox text-cyan-500" />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-12 lg:col-6 xl:col-3">
                    <div className="mb-0 card">
                        <div className="flex mb-3 justify-content-between">
                            <div>
                                <span className="block mb-3 font-medium text-500">الرصيد تم التسليم</span>
                                <div className="text-xl font-medium text-900">${usersCount}</div>
                            </div>
                            <div className="flex bg-purple-100 align-items-center justify-content-center border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                                <i className="text-xl text-purple-500 pi pi-dollar" />
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
                <Dialog header="تفاصيل الطلب" visible={orderDialogVisible} style={{ width: '50vw' }} onHide={() => setOrderDialogVisible(false)} className="rtl-text">
                    {selectedOrder && (
                        <div>
                            <h3>رمز الطلب: {selectedOrder.id}</h3>
                            <p>السعر الكلي: {formatCurrency(selectedOrder.total_price)}</p>
                            <p>الحالة: {selectedOrder.status}</p>
                            <p>التاريخ: {new Date(selectedOrder.created_at).toLocaleDateString()}</p>
                            <h4>المنتجات المطلوبة:</h4>
                            <ul>
                                {selectedOrder.items?.map((item) => (
                                    <li key={item.product.id}>
                                        <h6>اسم المنتج: {item.product.name}</h6> - الكمية: {item.quantity}
                                    </li>
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
                            <Column header="عرض" style={{ width: '15%' }} body={(rowData: Order) => <Button icon="pi pi-search" text onClick={() => viewOrderDetails(rowData)} />} />
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
                            <Column header="عرض" style={{ width: '10%' }} body={(rowData: Product) => <Button icon="pi pi-search" text onClick={() => viewProductDetails(rowData)} />} />
                        </DataTable>
                    </div>
                </div>
                <div className="col xl:col">
                    <div className="text-center card">
                        <h5>الا حصائيات</h5>
                        <div className="flex flex-wrap gap-3 justify-content-center">

                            <Calendar placeholder='تاريخ البدء' showButtonBar value={dateStart} onChange={(e) => setDateStart(e.value)} />
                            <Calendar placeholder='نهاية التاريخ' showButtonBar value={dateEnd} onChange={(e) => setDateEnd(e.value)} /> <Button onClick={getStatus} icon="pi pi-search" rounded severity="success" />
                        </div>
                        <div className="grid mt-5 ">
                            <div className=" col-11 xl:col-4">
                                <div className="card">
                                    <h5>نسبة التسليم</h5>
                                    <Knob value={perDelivery} onChange={(e) => setPerDelivery(e.value)} />
                                </div>
                            </div>
                            <div className=" col-10 xl:col-8">
                                <div className=" card">
                                    <Chart type="bar" data={chartData} options={chartOptions} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
