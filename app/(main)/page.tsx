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
import { Dropdown } from 'primereact/dropdown';
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
    const [nbCompletedOrder, setNbCompletedOrder] = useState<number>(0);
    const [nbCancledOrder, setNbCancledOrderr] = useState<number>(0);
    const [lenghtOrder, setLenghtOrder] = useState<number>(0);
        const [selectedProductId, setSelectedProductId] = useState<number>(0);
    const [dateEnd, setDateEnd] = useState<Date | null>(null);
    const [perDelivery, setPerDelivery] = useState(0);
    const [proTotalDilevery, setProTotalDilevery] = useState(0);
    const [proTotalCompleted, setProTotalCompleted] = useState(0);
    const [proPerDilevery, setProPerDilevery] = useState(0);
    const [totalCmptRange, setTotalCmptRange] = useState(0);
    const [dateStart, setDateStart] = useState<Date | null>(null);
    const [chartData, setChartData] = useState({});
    const [datast, setDatast] = useState<number[]>([0, 0, 0, 0]);
    const [chartOptions, setChartOptions] = useState({});
     const [allProducts, setAllPrducts] = useState([
        { label: 'حدد المنتج', value: 'حدد المنتج' },

    ]);
    useEffect(() => {
        const data = {
            labels: ['إلغاء الطلبات', 'الطلبات المكتملة', 'الطلبات الشحن ', 'مجموع الطلبات'],
            datasets: [
                {
                    label: 'Sales',
                    data: datast,
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
            // Fetch Products
            const productsResponse: ApiResponse<Product[]> = await axios.get(`${apiUrl}/products`, config);
            const productsData = productsResponse.data;
   productsData.forEach(function (value:any) {
                    allProducts.push({ label: value.name, value: value.id });
});
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

            const is_admin = localStorage.getItem('is_admin');
            const totalResponse: ApiResponse<any> = await axios.get(`${apiUrl}/ordersSummary`, config);
            setNbCompletedOrder(totalResponse.data.completed_orders);
            setNbCancledOrderr(totalResponse.data.cancelled_orders);

            if (is_admin == 'true') {
                setTotalOrder(totalResponse.data.completed_total_revenue);
            }
            setUsersCount(totalResponse.data.delivered_total_revenue);
            console.log(totalResponse.data);
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
            const totalResponse: ApiResponse<any> = await axios.get(`${apiUrl}/order-stats?start_date=${dateStart ? formatDate(dateStart) : ''}&end_date=${dateEnd ? formatDate(dateEnd) : ''}`, config);
            setDatast([Number(totalResponse.data.cancelled_orders), Number(totalResponse.data.completed_orders), Number(totalResponse.data.delivery_order), Number(totalResponse.data.total_orders)]);
            setPerDelivery(totalResponse.data.delivery_percentage);
            setTotalCmptRange(totalResponse.data.total_revenue);
        } catch (error) {
            console.error('Error fetching total order:', error);
        }
    };
    const getStatProd = async (id:any) => {
        const token = localStorage.getItem('token');
           const config = {
            headers: {
                Authorization: `Bearer ${token}`
               }

        };
try {
            const response = await axios.get(`${apiUrl}/product/delivery-percentage?product_id=${selectedProductId}&start_date=${dateStart ? formatDate(dateStart) : ''}&end_date=${dateEnd ? formatDate(dateEnd) : ''}`, config);
    console.log(response);
            setProPerDilevery(response.data.delivery_percentage);
            setProTotalCompleted(response.data.total_orders);
            setProTotalDilevery(response.data.delivered_orders);
        } catch (error) {
            console.error('Error fetching orders:', error);
        }
}
    const selectproduct = async (id:any) => {
        setSelectedProductId(id);


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
                <div className="col-12 lg:col-4 xl:col-4'">
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
                <div className="col-12 lg:col-4 xl:col-4'">
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
                <div className="col-12 lg:col-4 xl:col-4'">
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
                <div className="col-12 lg:col-4 xl:col-4'">
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
                <div className="col-12 lg:col-4 xl:col-4'">
                    <div className="mb-0 card">
                        <div className="flex mb-3 justify-content-between">
                            <div>
                                <span className="block mb-3 font-medium text-500"> عدد الطلبات المكتملة </span>
                                <div className="text-xl font-medium text-900">{nbCompletedOrder}</div>
                            </div>
                            <div className="flex bg-green-100 align-items-center justify-content-center border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                                <i className="text-xl text-green-500 pi pi-box" />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-12 lg:col-4 xl:col-4'">
                    <div className="mb-0 card">
                        <div className="flex mb-3 justify-content-between">
                            <div>
                                <span className="block mb-3 font-medium text-500">عدد الطلبات الملغاه </span>
                                <div className="text-xl font-medium text-900">{nbCancledOrder}</div>
                            </div>
                            <div className="flex bg-red-100 align-items-center justify-content-center border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                                <i className="text-xl text-red-500 pi pi-box" />
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

                <div className="col-12 mt-2">
                    <div className="text-center card">
                        <h5> احصائيات الطلبات </h5>
                        <div className="flex flex-wrap gap-3 justify-content-center">
                            <Calendar placeholder="start date" value={dateStart} onChange={(e) => setDateStart(e.value ?? null)} />
                            <Calendar placeholder=" end date" value={dateEnd} onChange={(e) => setDateEnd(e.value ?? null)} /> <Button onClick={getStatus} icon="pi pi-search" rounded severity="success" />
                        </div>
                        <div className="grid mt-5 overflow-scroll">
                            <div className=" col-12 xl:col-4">
                                <div className="card">
                                    <h5>نسبة التسليم</h5>
                                    <Knob value={perDelivery} />
                                </div>
                                <div className="card">
                                    <h5> السعر الإجمالي</h5>

                                    <div className="mb-0 card">
                                        <div className="flex mb-3 justify-content-center">
                                            <div>
                                                <div className="text-xl font-medium text-900">${totalCmptRange}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className=" col-12 xl:col-8">
                                <div className=" card">
                                    <Chart type="bar" data={chartData} options={chartOptions} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-12">
                    <div className="card">
                        <h5 className="text-center"> احصائيات المنتجات </h5>
                        <div className="flex flex-wrap gap-3 justify-content-center mt-2">
                            <Calendar placeholder="start date" value={dateStart} onChange={(e) => setDateStart(e.value ?? null)} />
                            <Calendar placeholder=" end date" value={dateEnd} onChange={(e) => setDateEnd(e.value ?? null)} />
                        <Dropdown

                options={allProducts}
                value={selectedProductId}
onChange={(e)=>{selectproduct(e.value)}}
                placeholder="اختر المنتج"
                className="p-column-filter"
                
            />
                            <Button onClick={getStatProd} icon="pi pi-search" rounded severity="success" />

                        </div>
                        <div className="grid mt-4">
                            <div className="xl:col-4 col-12">
                                <div className="card">
                                    <div className="flex mb-3 justify-content-between">
                                        <div>
                                            <span className="block mb-3 font-medium text-500">مجموع الطلبات</span>
                                            <div className="text-xl font-medium text-900">{proTotalCompleted}</div>
                                        </div>
                                        <div className="flex bg-purple-100 align-items-center justify-content-center border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                                            <i className="text-xl text-purple-500 pi pi-box" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="xl:col-4 col-12">
                                <div className="card">
                                    <div className="flex mb-3 justify-content-between">
                                        <div>
                                            <span className="block mb-3 font-medium text-500"> الطلبات المُسلَّمة </span>
                                            <div className="text-xl font-medium text-900">{proTotalDilevery}</div>
                                        </div>
                                        <div className="flex bg-blue-100 align-items-center justify-content-center border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                                            <i className="text-xl text-blue-500 pi pi-shopping-bag" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="xl:col-4 col-12">
                                <div className="card">
                                    <div className="flex mb-3 justify-content-between">
                                        <div>
                                            <span className="block mb-3 font-medium text-500"> نسبة التسليم </span>
                                            <div className="text-xl font-medium text-900">
                                                <Knob value={proPerDilevery} />
                                            </div>
                                        </div>
                                        <div className="flex bg-green-100 align-items-center justify-content-center border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                                            <i className="text-xl text-green-500 pi pi-percentage " />
                                        </div>
                                    </div>
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
