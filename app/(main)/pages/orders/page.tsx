/* eslint-disable @next/next/no-img-element */
'use client';
import axios from 'axios';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { OverlayPanel } from 'primereact/overlaypanel';
import { FileUpload } from 'primereact/fileupload';
import { InputNumber, InputNumberValueChangeEvent } from 'primereact/inputnumber';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { RadioButton, RadioButtonChangeEvent } from 'primereact/radiobutton';
import { FilterMatchMode } from 'primereact/api';
import { Dropdown } from 'primereact/dropdown';
import { Rating } from 'primereact/rating';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { Tag } from 'primereact/tag';
import { classNames } from 'primereact/utils';
import React, { useEffect, useRef, useState } from 'react';
import { ProductService } from '../../../../demo/service/ProductService';
import { Demo } from '@/types';
import { Calendar } from 'primereact/calendar';
import { ColumnFilterElementTemplateOptions } from 'primereact/column';
import './test5.css';

const OrderPage = () => {
    const apiUrl = 'https://api.zidoo.online/api';
    const emptyOrder: Order = {
        id: '',
        fullname: '',
        phone: '',
        address: '',
        status: 'new',
        total_price: 0,
        created_at: '',
        updated_at: '',
        items: [],
    };

const [orders, setOrders] = useState<any[]>([]);
const [orderItems, setOrderItems] = useState<any[]>([]);
const [phoneError, setPhoneError] = useState<string | null>(null);
const [products, setProducts] = useState<any[]>([]);
const [fullName, setFullName] = useState('');
const [phone, setPhone] = useState('');
const [address, setAddress] = useState('');
const [totalPrice, setTotalPrice] = useState(0);
const [orderDialog, setOrderDialog] = useState<boolean>(false);
const [deleteOrderDialog, setDeleteOrderDialog] = useState<boolean>(false);
const [deleteOrdersDialog, setDeleteOrdersDialog] = useState(false);
const [order, setOrder] = useState<Order>(emptyOrder);
const [filters, setFilters] = useState({
    global: { value: null as string | null, matchMode: FilterMatchMode.CONTAINS },
    created_at: { value: null, matchMode: FilterMatchMode.BETWEEN },
    status: { value: null, matchMode: FilterMatchMode.EQUALS },
});

const [selectedOrders, setSelectedOrders] = useState<Order[]>([]);
const [displayProduct,setDisplayProduct] =useState('');
const [productDialog, setProductDialog] = useState<boolean>(false);
const [selectedOrderItems, setSelectedOrderItems] = useState([]);
const [submitted, setSubmitted] = useState(false);
const [globalFilter, setGlobalFilter] = useState('');
const [dateRange, setDateRange] = useState<{ startDate: Date | null; endDate: Date | null }>({ startDate: null, endDate: null });
const toast = useRef<Toast>(null);
const dt = useRef(null);
const op2 = useRef<OverlayPanel>(null);

const is_admin = localStorage.getItem('is_admin');

const [statuses, setStatuses] = useState([
    { label: 'جديد', value: 'new' },
    { label: 'تم التأكيد', value: 'confirmed' },
    { label: 'تم الشحن', value: 'Shipped' },
    { label: 'مؤجل', value: 'postponed' },
    { label: 'مرتجع', value: 'returned' },
    { label: 'تم التسليم', value: 'delivered' },
    { label: 'مستبدل', value: 'replaced' },
    { label: 'مكتمل', value: 'completed' },
    { label: 'تم الإلغاء', value: 'cancelled' }
]);


interface Order {
    id: string;
    fullname: string;
    phone: string;
    address: string;
    status: string;
    total_price: number;
    created_at: string;
    updated_at: string;
    items: Array<{
        product: { name: string };
        quantity: number;
    }>;
}


interface Product {
    product_id: string;
    name: string;
    quantity: number;
    price: number;
}

const initFilters = () => {
    setFilters({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        created_at: { value: null, matchMode: FilterMatchMode.BETWEEN },
        status: { value: null, matchMode: FilterMatchMode.EQUALS },
    });
    setDateRange({ startDate: null, endDate: null });

    setGlobalFilter('');
};

const countOrdersByStatus = (orders: any[]) => {
    const statusCounts = orders.reduce((acc: any, order: any) => {
        const status = order.status;
        if (acc[status]) {
            acc[status]++;
        } else {
            acc[status] = 1;
        }
        return acc;
    }, {});

    return statusCounts;
};


const clearFilter = () => {

    initFilters();
};



useEffect(() => {
    fetchdata();
}, []);

const filterByDateRange = (order: any) => {
    const { startDate, endDate } = dateRange;
    const orderDate = new Date(order.created_at);

    if (startDate instanceof Date && endDate instanceof Date) {
        return orderDate >= startDate && orderDate <= endDate;
    } else if (startDate instanceof Date) {
        return orderDate >= startDate;
    } else if (endDate instanceof Date) {
        return orderDate <= endDate;
    }
    return true;
};



const fetchdata = async () => {
    const token = localStorage.getItem('token');
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    try {
        const response = await axios.get(`${apiUrl}/orders`, config);
        const sortedOrders = response.data.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        // Count orders by status and update statuses
        const statusCounts = countOrdersByStatus(sortedOrders);
        setStatuses(statuses.map(status => ({
            ...status,
            label: `${status.label} (${statusCounts[status.value] || 0})`
        })));

        setOrders(sortedOrders);

    } catch (error) {
        console.error('Error fetching orders:', error);
    }
};

useEffect(() => {
    const fetchProducts = async () => {
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        try {
            const response = await axios.get(`${apiUrl}/products`, config);
            const availableProducts = response.data.filter((product:any) => product.stock > 0);
            const outOfStockProducts = response.data.filter((product:any) => product.stock <= 0);
console.log(availableProducts);
            setProducts(availableProducts); // Store available products in state
            if (outOfStockProducts.length > 0) {
                toast.current?.show({
                    severity: 'warn',
                    summary: 'منتجات غير متوفرة',
                    detail: `عدد ${outOfStockProducts.length} منتجات غير متوفرة في المخزون`,
                    life: 10000
                });
            }
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    };
    fetchProducts();
}, []);

const statusFilterTemplate = (options:any) => {
    return (
        <Dropdown
            value={options.value}
            options={statuses}
            onChange={(e) => options.filterApplyCallback(e.value)}
            placeholder="اختر الحالة"
            className="p-column-filter"
            //showClear
        />
    );
};

const removeOrderItem = (index: number) => {
    const updatedItems = [...orderItems];
    updatedItems.splice(index, 1);
    setOrderItems(updatedItems);
    calculateTotalPrice(updatedItems);
};

// Validation function for phone number
const validatePhoneNumber = (phone: string) => {
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phone);
};


const statusBodyTemplate = (rowData:any) => {
    const onStatusChange = async (newStatus:any) => {

        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };

            // Update the order status on the backend
            await axios.put(`${apiUrl}/orders/${rowData.id}`, { status: newStatus }, config);

            // Update the local state
            setOrders(prevOrders =>
                prevOrders.map(order =>
                    order.id === rowData.id ? { ...order, status: newStatus } : order
                )
            );
            toast.current?.show({
                severity: 'success',
                summary: 'تم التحديث',
                detail: 'تم تحديث حالة الطلب بنجاح',
                life: 3000
            });
        } catch (error) {
            console.error('Error updating status:', error);
            toast.current?.show({
                severity: 'error',
                summary: 'خطأ',
                detail: 'فشل في تحديث حالة الطلب',
                life: 3000
            });
        }
    };

    const statusColors = {
        'new': 'green',          // Color for 'جديد'
        'confirmed': 'blue',     // Color for 'تم التأكيد'
        'Shipped': 'purple',     // Color for 'تم الشحن'
        'postponed': 'orange',   // Color for 'مؤجل'
        'returned': 'red',       // Color for 'مرتجع'
        'delivered': 'blue',     // Color for 'تم التسليم'
        'replaced': 'violet',    // Color for 'مستبدل'
        'completed': 'purple',   // Color for 'مكتمل'
        'cancelled': 'red'       // Color for 'تم الإلغاء'
    };


    const getSeverity = (status: any) => {
        switch (status) {
            case 'new':
                return 'info';       // PrimeReact 'info' severity (typically blue)
            case 'confirmed':
                return 'success';    // PrimeReact 'success' severity (typically green)
            case 'Shipped':
                return 'primary';    // PrimeReact 'primary' severity (typically blue)
            case 'postponed':
                return 'warning';    // PrimeReact 'warning' severity (typically orange/yellow)
            case 'replaced':
                return 'info';       // PrimeReact 'info' severity (typically blue)
            case 'returned':
                return 'danger';     // PrimeReact 'danger' severity (typically red)
            case 'delivered':
                return 'success';    // PrimeReact 'success' severity (typically green)
            case 'completed':
                return 'success';    // PrimeReact 'success' severity (typically green)
            case 'cancelled':
                return 'danger';     // PrimeReact 'danger' severity (typically red)
            default:
                return null;         // Default case returns no specific severity
        }
    };



    return (
        <Dropdown
            value={rowData.status}
            options={statuses.map(status => ({
                label: status.label,  // Use Arabic label
                value: status.value,
                className: `p-tag p-tag-${getSeverity(status.value)}`  // Apply color coding
            }))}
            onChange={(e) => onStatusChange(e.value)}
            disabled={rowData.status === 'cancelled'}  // Disable if status is cancelled
            placeholder="اختر الحالة"
            className={`p-dropdown-${getSeverity(rowData.status)}`}  // Apply color styling
        />
    );
};



/* const onDateChange = (value, field) => {
    const _dateRange = { ...dateRange, [field]: value };
    setDateRange(_dateRange);
}; */
const onDateChange = (value: Date | null | undefined, field: string, options: any) => {
    const _dateRange = {
        ...options.value,
        [field]: value !== undefined ? value : null, // Explicitly convert undefined to null
    };
    setDateRange(_dateRange);
    options.filterCallback(_dateRange);
};





// Template for date range filter with Clear functionality
const dateRangeFilterTemplate = (options: { filterCallback: (arg0: null) => void; value: { startDate: any; endDate: any; }; }) => {
const clearDateRange = () => {
    // Reset the date range and apply the clear filter
    setDateRange({ startDate: null, endDate: null });
    options.filterCallback(null);  // Clear the filter
};

return (
    <div className="p-grid p-nogutter">
        <div className="p-col-6">
            <Calendar
                value={options.value?.startDate || null}
                onChange={(e) => onDateChange(e.value, 'startDate', options)}
                placeholder="Start Date"
                dateFormat="yy-mm-dd"
                className="p-column-filter"
                aria-label="Start Date Filter"
            />
        </div>
        <div className="p-col-6">
            <Calendar
                value={options.value?.endDate || null}
                onChange={(e) => onDateChange(e.value, 'endDate', options)}
                placeholder="End Date"
                dateFormat="yy-mm-dd"
                className="p-column-filter"
                aria-label="End Date Filter"
            />
        </div>
        {/* <div className="p-col-12">
            <Button label="Clear" className="p-button-secondary mt-2" onClick={clearDateRange} />
        </div> */}
    </div>
);
};


const formatDate = (value: string | number | Date) => {
    const date = new Date(value);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });
};

const leftToolbarTemplate = () => {
    if(is_admin=="true"){
    return (
        <React.Fragment>
            <Button label="جديد" icon="pi pi-plus" severity="success" className="ml-2" onClick={openNew} />
            <Button label="حذف" icon="pi pi-trash" severity="danger" className="mr-2" onClick={confirmDeleteSelected} disabled={!selectedOrders || !selectedOrders.length} />
        </React.Fragment>
    );
    }else{
        return(
            <React.Fragment>
            <Button label="جديد" icon="pi pi-plus" severity="success" className="ml-2" onClick={openNew} />
            </React.Fragment>
        )
    }
};

const rightToolbarTemplate = () => {
    return (
        <React.Fragment>
            {/* <FileUpload mode="basic" accept="image/*" maxFileSize={1000000} chooseLabel="استيراد" className="ml-2 inline-block" /> */}
            <Button label="تصدير" icon="pi pi-upload" severity="help" onClick={exportSelectedCSV} disabled={!selectedOrders.length} />
        </React.Fragment>
    );

};

const openNew = () => {
    // Reset the order state
    setOrder(emptyOrder);
    setFullName('');  // Clear fullName
    setPhone('');     // Clear phone
    setAddress('');   // Clear address
    setOrderItems([]); // Clear items
    setTotalPrice(0);  // Clear total price
    setSubmitted(false);
    setOrderDialog(true); // Open the dialog for new order creation
};



const hideDialog = () => {
    setSubmitted(false);
    setOrderDialog(false);
};
const exportSelectedCSV = () => {
    const csvData: any[] = []; // Move this outside the function as you don't need to call `useState` here.

    selectedOrders.forEach((order: Order) => {
        let itemS = '';

        order.items.forEach((item) => {
            itemS = itemS + '  ' + item.product.name + ' [' + item.quantity + ']';
        });

        csvData.push({
            fullName: order.fullname,
            phone:order.phone,
            address: order.address,
            id: order.id,
            status: order.status,
            created_at: formatDate(order.created_at),
            products: itemS,
            total_price: order.total_price
        });

    });

    // Perform the CSV export with the 'csvData'
    const csvHeaders = [
        { label: 'Order ID', key: 'id' },
        { label: 'Full Name', key: 'fullName' },
        { label: 'Phone', key: 'phone' },
        { label: 'Address', key: 'address' },
        { label: 'Status', key: 'status' },
        { label: 'Created At', key: 'created_at' },
        { label: 'Products', key: 'products' },
        { label: 'Total Price', key: 'total_price' }
    ];

    const csv = convertArrayToCSV(csvData, csvHeaders);
    downloadCSV(csv, 'selected_orders_with_products.csv');
};


const editOrder = (order:any) => {
    setOrder(order);
    setFullName(order.fullname); // Set the fullName
    setPhone(order.phone); // Set the phone
    setAddress(order.address); // Set the address
    setOrderItems(order.items); // Set the items
    setTotalPrice(order.total_price); // Set the total price
    setOrderDialog(true); // Open the dialog for editing
};

const convertArrayToCSV = (data: any[], headers: any[]) => {
    const headerRow = headers.map((header: { label: any; }) => header.label).join(',');
    const rows = data.map((row: { [x: string]: any; }) => headers.map((header: { key: string | number; }) => row[header.key]).join(','));

    return [headerRow, ...rows].join('\n');
};

const downloadCSV = (csvContent: BlobPart, filename: string) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);

    // Ensure the file is encoded in UTF-8 with BOM to display Arabic characters correctly
    const utf8BOM = '\uFEFF';  // Adding BOM for correct UTF-8 encoding
    const utf8Blob = new Blob([utf8BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const utf8Url = URL.createObjectURL(utf8Blob);

    link.setAttribute('href', utf8Url);  // Updated link with UTF-8 content
    link.setAttribute('download', filename);

    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

const saveOrder = async () => {
    setSubmitted(true);

    // if (!validatePhoneNumber(phone)) {
    //     setPhoneError('يجب أن يحتوي رقم الهاتف على 10 أرقام');
    //     return;
    // } else {
        setPhoneError(null);
    // }

    // Ensure no duplicate products in the order
    const uniqueOrderItems = orderItems.reduce((acc, item) => {
        const existingItemIndex = acc.findIndex((i: { product_id: any; }) => i.product_id === item.product_id);

        // If the product exists, update the quantity and price, otherwise add it as a new item
        if (existingItemIndex >= 0) {
            acc[existingItemIndex].quantity = item.quantity;
            acc[existingItemIndex].price = item.price;
        } else {
            acc.push(item);
        }

        return acc;
    }, []);

    const orderData = {
        fullname: fullName,
        phone: phone,
        address: address,
        status: order.status,
        total_price: totalPrice,
        items: uniqueOrderItems, // Use unique order items to prevent duplicates
    };

    /* console.log('Order Data being sent to the backend:', orderData); */

    try {
        const token = localStorage.getItem('token');
        const config = {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };

        let response;
        if (order.id) {
            // Update existing order
            response = await axios.put(`${apiUrl}/orders/${order.id}`, orderData, config);
        } else {
            // Create new order
            response = await axios.post(`${apiUrl}/orders`, orderData, config);
        }

        if (response.data) {
            setOrderItems(response.data.items);

            const updatedOrders = [...orders];
            if (order.id) {
                const index = updatedOrders.findIndex(o => o.id === order.id);
                updatedOrders[index] = response.data;
            } else {
                updatedOrders.push(response.data);
            }
             fetchdata();
            setOrders(updatedOrders);
            setOrderDialog(false);
            setOrder(emptyOrder);
            toast.current?.show({
                severity: 'success',
                summary: 'Order Saved',
                detail: 'Order has been saved successfully',
                life: 3000
            });
        }
    } catch (error) {
        console.error('Error saving order:', error);
        toast.current?.show({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to save order',
            life: 3000
        });
    }

};






const addProductToOrder = () => {
    const newProduct = { product_id: '', quantity: 1, price: 0, product_name: '' };
    setOrderItems([...orderItems, newProduct]);
};

const updateOrderItem = (index: number, field: string, value: any) => {
    const updatedItems = [...orderItems];

    if (field === 'product_id') {
        // If product is selected, auto-calculate price based on product and quantity
        const selectedProduct = products.find(product => product.id === value);
        updatedItems[index].product_id = value;
        updatedItems[index].price = selectedProduct.price; // Auto-set price based on product
        updatedItems[index].product_name = selectedProduct.name;
    } else if (field === 'price') {
        // If price is manually updated, set the manual price and stop recalculating it
        updatedItems[index].price = value;
    } else {
        updatedItems[index][field] = value;
    }

    setOrderItems(updatedItems);
    calculateTotalPrice(updatedItems);
};


const calculateTotalPrice = (items: any[]) => {
    const total = items.reduce((acc: number, item: { price: number; quantity: number; }) => acc + item.price * item.quantity, 0);
    setTotalPrice(total.toFixed(2));
};

const orderDialogFooter = (
    <>
        <Button label="إلغاء" icon="pi pi-times" text onClick={hideDialog} />
        <Button label="حفظ" icon="pi pi-check" text onClick={saveOrder} />
    </>
);

const confirmDeleteSelected = () => {
    setDeleteOrdersDialog(true);
};
const confirmDeleteSingleOrder = (order:any) => {
    setSelectedOrders([order]); // Set the single order to be deleted
    setDeleteOrdersDialog(true); // Open the confirmation dialog
};


const deleteSelectedOrders = async () => {
    const token = localStorage.getItem('token');
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };

    try {
        // Loop through each selected order and send delete requests
        if (selectedOrders && selectedOrders.length > 0) {
            for (const selectedOrder of selectedOrders) {
                await axios.delete(`${apiUrl}/orders/${selectedOrder.id}`, config);
            }

            // Remove the deleted orders from the frontend state
            const remainingOrders = orders.filter(order => !selectedOrders.includes(order));
            setOrders(remainingOrders);
            setSelectedOrders([]); // Clear the selection after deletion

            setDeleteOrdersDialog(false);
            toast.current?.show({
                severity: 'success',
                summary: 'تم بنجاح',
                detail: 'تم حذف الطلبات بنجاح',
                life: 3000
            });
        }
    } catch (error) {
        console.error('Error deleting orders:', error);
        toast.current?.show({
            severity: 'error',
            summary: 'خطأ',
            detail: 'فشل في حذف الطلبات',
            life: 3000
        });
    }
};



const showProductDialog = (rowData: any) => {
    setSelectedOrderItems(rowData.items);
    setDisplayProduct(rowData.address);

    setProductDialog(true);

};

const actionBodyTemplate = (rowData: any) => {
    if(is_admin=='true'){
    return (
        <>

            <Button icon="pi pi-eye" rounded severity="info"  className="p-1" onClick={() => showProductDialog(rowData)} />
            <Button icon="pi pi-pencil" rounded severity="success" className="p-1" onClick={() => editOrder(rowData)} />
            <Button icon="pi pi-trash" rounded severity="warning" className="p-1" onClick={() => confirmDeleteSingleOrder(rowData)} />
        </>
    );
    }
    else{
        return(
            <>
             <Button icon="pi pi-eye" rounded severity="info"  className="p-1" onClick={() => showProductDialog(rowData)} />
             <Button icon="pi pi-pencil" rounded severity="success" className="p-1" onClick={() => editOrder(rowData)} />
            </>
        )

    }
};

const header = (
    <div className="flex justify-content-between">
        <h5 className="m-2">إدارة الطلبات</h5>
        <span className="p-input-icon-left">
            <i className="pi pi-search" />
            <InputText
                type="search"
                placeholder="بحث..."
                onInput={(e) => {
                    const value = (e.target as HTMLInputElement).value;
                    setGlobalFilter(value);
                    setFilters({ ...filters, global: { value, matchMode: FilterMatchMode.CONTAINS } });
                }}
            />

        </span><Button type="button" icon="pi pi-filter-slash" label="Clear" outlined onClick={clearFilter} />
    </div>
);


return (
    <div className="grid Crud-demo" dir='rtl'>
        <div className="col-12" dir='rtl'>
            <div className="card">
                <Toast ref={toast} />
                <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>

                <DataTable

    ref={dt}
    value={orders.filter(filterByDateRange)}
    selection={selectedOrders}
    onSelectionChange={(e) => setSelectedOrders(e.value)}
    dataKey="id"
    paginator
    rows={10}
    rowsPerPageOptions={[5, 10, 25,50,100,250,500,1000]}
    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
    currentPageReportTemplate="عرض {first} إلى {last} من {totalRecords} طلبات"
    globalFilter={globalFilter}
    filters={filters}
    header={header}
    emptyMessage="لا توجد طلبات."
    responsiveLayout="scroll"
>
    <Column selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column>
    <Column field="id" header="معرف الطلب" sortable></Column>
    <Column field="fullname" header="الاسم الكامل" sortable></Column>
   <Column field="phone" header="الهاتف" sortable ></Column>
   {/* <Column field="address" header="عنوان" sortable></Column> */}
    <Column field="status" header="الحالة" body={statusBodyTemplate} filter filterElement={statusFilterTemplate} sortable></Column>
    <Column field="total_price" header="السعر الاجمالي" sortable></Column>
    <Column
        field="created_at"
        header="تاريخ الإنشاء"
        filter
        filterElement={dateRangeFilterTemplate}
        body={(rowData) => formatDate(rowData.created_at)}
        sortable
    ></Column>
    <Column body={actionBodyTemplate}></Column>
</DataTable>


                <Dialog visible={orderDialog} style={{ width: '450px' }} header="تفاصيل الطلب" modal className="p-fluid rtl-text" footer={orderDialogFooter} onHide={hideDialog} >
                <div className='row-span-3 mb-2'>
                    <p>الاسم الكامل</p>
                    <InputText value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="الاسم الكامل" />
                </div>

                <div className="row-span-3 mb-2">
            <p>الهاتف</p>
            <InputText value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="الهاتف" />
            {phoneError && <small className="p-error">{phoneError}</small>} {/* Display phone error message */}
            </div>

                <div className='row-span-3 mb-2'>
                    <p>عنوان</p>
                    <InputText value={address} onChange={(e) => setAddress(e.target.value)} placeholder="عنوان" />
                </div>
                {orderItems.map((item, index) => (
    <div key={index} className="field grid">
        <div className="col-6">
            <p>حدد المنتج</p>
            <Dropdown
                value={item.product_id}
                options={products.map(product => ({ label: product.name, value: product.id }))}
                onChange={(e) => updateOrderItem(index, 'product_id', e.value)}
                placeholder="حدد المنتج"
            />
        </div>
        <div className="col-3">
        <p>كمية</p>
            <InputNumber
                value={item.quantity}
                onValueChange={(e) => updateOrderItem(index, 'quantity', e.value)}
                min={1}
                placeholder="كمية"
            />
        </div>
        <div className="col-3">
            <p>السعر</p>
            <InputNumber
                value={item.price}
                onValueChange={(e) => updateOrderItem(index, 'price', e.value)} // Manual price input
                placeholder="السعر"
            />
        </div>
        <div className="col-2">
                                <Button icon="pi pi-trash" className="p-button-danger mt-2" onClick={() => removeOrderItem(index)} />
                            </div>
    </div>
))}


                            <div className="field">
                                <Button label="أضف منتج" icon="pi pi-plus" onClick={addProductToOrder} className="p-button-success" />
                            </div>

                            <div className="field">
                                <h6>السعر الإجمالي:
                                <span> ${totalPrice}</span> </h6>
                            </div>
                        </Dialog>

                <Dialog visible={productDialog} style={{ width: '450px' }} header="Products" modal onHide={() => setProductDialog(false)} className='rtl-text'>
                      <div className="field">
                                <h6>العنوان </h6>
                                <textarea>{displayProduct}</textarea>
                            </div>

                    <DataTable   value={selectedOrderItems} responsiveLayout="scroll">
                        <Column field="product.name" header="اسم المنتج" sortable />
                        <Column field="quantity" header="كمية" sortable />

                        <Column field="price" header="السعر" body={(rowData) => {
                            const price = parseFloat(rowData.price);
                            return isNaN(price) ? 'N/A' : `${price.toFixed(2)}$`;
                        }} sortable />
                    </DataTable>


                </Dialog>

                <Dialog visible={deleteOrdersDialog} style={{ width: '450px' }} header="تأكيد" modal footer={<>
                    <Button label="لا" icon="pi pi-times" text onClick={() => setDeleteOrdersDialog(false)} />
                    <Button label="نعم" icon="pi pi-check" text onClick={deleteSelectedOrders} />
                </>} onHide={() => setDeleteOrdersDialog(false)}>
                    <div className="confirmation-content">
                        <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                        <span>هل أنت متأكد أنك تريد حذف الطلبات المحددة؟</span>
                    </div>
                </Dialog>
            </div>
        </div>
    </div>
);
};

export default OrderPage;
