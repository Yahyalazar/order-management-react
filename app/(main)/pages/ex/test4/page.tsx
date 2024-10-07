/* eslint-disable @next/next/no-img-element */
'use client';
import axios from 'axios';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { FilterMatchMode } from 'primereact/api';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { Calendar } from 'primereact/calendar';
import React, { useEffect, useRef, useState } from 'react';

const OrderPage = () => {
    const emptyOrder = {
        id: '',
        status: 'new',
        total_price: 0,
        created_at: '',
        items: [],
    };

    const [orders, setOrders] = useState([]);
    const [selectedOrders, setSelectedOrders] = useState([]);
    const [order, setOrder] = useState(emptyOrder);
    const [orderDialog, setOrderDialog] = useState(false);
    const [deleteOrderDialog, setDeleteOrderDialog] = useState(false);
    const [deleteOrdersDialog, setDeleteOrdersDialog] = useState(false);
    const [globalFilter, setGlobalFilter] = useState(''); // Search functionality
    const [productDialog, setProductDialog] = useState(false);
    const [selectedOrderItems, setSelectedOrderItems] = useState([]);
    const [dateRange, setDateRange] = useState({ startDate: null, endDate: null });
    const [filters, setFilters] = useState({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        created_at: { value: null, matchMode: FilterMatchMode.BETWEEN },
    });

    const toast = useRef(null);
    const dt = useRef(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const token = localStorage.getItem('token');
        const config = {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };
        try {
            const response = await axios.get('http://127.0.0.1:8000/api/orders', config);
            setOrders(response.data);
        } catch (error) {
            console.error('Error fetching orders:', error);
        }
    };

    const filterByDateRange = (value, filter) => {
        if (!filter || (!filter.startDate && !filter.endDate)) {
            return true; // No filter applied, show all records
        }

        const { startDate, endDate } = filter;
        const orderDate = new Date(value);

        if (startDate && endDate) {
            return orderDate >= new Date(startDate) && orderDate <= new Date(endDate);
        } else if (startDate) {
            return orderDate >= new Date(startDate);
        } else if (endDate) {
            return orderDate <= new Date(endDate);
        }

        return true; // Default behavior if no date range is specified
    };

    const onDateChange = (value, field) => {
        const _dateRange = { ...dateRange, [field]: value };
        setDateRange(_dateRange);
        setFilters((prevFilters) => ({
            ...prevFilters,
            created_at: { value: _dateRange, matchMode: FilterMatchMode.BETWEEN },
        }));
    };

    const dateRangeFilterTemplate = (options) => {
        return (
            <div className="p-grid p-nogutter">
                <div className="p-col-6">
                    <Calendar
                        value={options.value?.startDate || null}
                        onChange={(e) => onDateChange(e.value, 'startDate')}
                        placeholder="Start Date"
                        dateFormat="yy-mm-dd"
                        className="p-column-filter"
                    />
                </div>
                <div className="p-col-6">
                    <Calendar
                        value={options.value?.endDate || null}
                        onChange={(e) => onDateChange(e.value, 'endDate')}
                        placeholder="End Date"
                        dateFormat="yy-mm-dd"
                        className="p-column-filter"
                    />
                </div>
            </div>
        );
    };

    const formatDate = (value) => {
        const date = new Date(value);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        });
    };

    const openNew = () => {
        setOrder(emptyOrder);
        setOrderDialog(true);
    };

    const hideDialog = () => {
        setOrderDialog(false);
    };

    const confirmDeleteOrder = (order) => {
        setOrder(order);
        setDeleteOrderDialog(true);
    };

    const deleteOrder = async () => {
        const token = localStorage.getItem('token');
        const config = {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };
        try {
            await axios.delete(`http://127.0.0.1:8000/api/orders/${order.id}`, config);
            let _orders = orders.filter((val) => val.id !== order.id);
            setOrders(_orders);
            setDeleteOrderDialog(false);
            toast.current.show({ severity: 'success', summary: 'Success', detail: 'Order Deleted', life: 3000 });
        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to Delete Order', life: 3000 });
        }
    };

    const saveOrder = async () => {
        const token = localStorage.getItem('token');
        const config = {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };
        try {
            let response;
            if (order.id) {
                response = await axios.put(`http://127.0.0.1:8000/api/orders/${order.id}`, order, config);
                const updatedOrders = orders.map((o) => (o.id === order.id ? response.data : o));
                setOrders(updatedOrders);
            } else {
                response = await axios.post('http://127.0.0.1:8000/api/orders', order, config);
                setOrders([...orders, response.data]);
            }
            setOrderDialog(false);
            setOrder(emptyOrder);
            toast.current.show({ severity: 'success', summary: 'Success', detail: 'Order Saved', life: 3000 });
        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to Save Order', life: 3000 });
        }
    };

    const exportSelectedCSV = () => {
        const csvData = [];

        selectedOrders.forEach((order) => {
            order.items.forEach((item) => {
                csvData.push({
                    id: order.id,
                    status: order.status,
                    total_price: order.total_price,
                    created_at: formatDate(order.created_at),
                    product_name: item.product.name,
                    quantity: item.quantity,
                    price: item.price,
                });
            });
        });

        const csvHeaders = [
            { label: 'Order ID', key: 'id' },
            { label: 'Status', key: 'status' },
            { label: 'Total Price', key: 'total_price' },
            { label: 'Created At', key: 'created_at' },
            { label: 'Product Name', key: 'product_name' },
            { label: 'Quantity', key: 'quantity' },
            { label: 'Price', key: 'price' },
        ];

        const csv = convertArrayToCSV(csvData, csvHeaders);
        downloadCSV(csv, 'selected_orders_with_products.csv');
    };

    const convertArrayToCSV = (data, headers) => {
        const headerRow = headers.map((header) => header.label).join(',');
        const rows = data.map((row) => headers.map((header) => row[header.key]).join(','));

        return [headerRow, ...rows].join('\n');
    };

    const downloadCSV = (csvContent, filename) => {
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const deleteSelectedOrders = async () => {
        const token = localStorage.getItem('token');
        const config = {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };

        try {
            await Promise.all(
                selectedOrders.map((order) =>
                    axios.delete(`http://127.0.0.1:8000/api/orders/${order.id}`, config)
                )
            );
            const remainingOrders = orders.filter(
                (order) => !selectedOrders.includes(order)
            );
            setOrders(remainingOrders);
            setSelectedOrders([]);
            setDeleteOrdersDialog(false);
            toast.current.show({ severity: 'success', summary: 'Success', detail: 'Selected Orders Deleted', life: 3000 });
        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to Delete Selected Orders', life: 3000 });
        }
    };

    const leftToolbarTemplate = () => {
        return (
            <div className="my-2">
                <Button label="New" icon="pi pi-plus" severity="success" className="mr-2" onClick={openNew} />
                <Button label="Delete" icon="pi pi-trash" severity="danger" className="mr-2" onClick={() => setDeleteOrdersDialog(true)} disabled={!selectedOrders.length} />
            </div>
        );
    };

    const rightToolbarTemplate = () => {
        return (
            <div className="my-2">
                <Button label="Export Selected" icon="pi pi-upload" severity="help" onClick={exportSelectedCSV} disabled={!selectedOrders.length} />
            </div>
        );
    };

    const actionBodyTemplate = (rowData) => {
        return (
            <>
                <Button icon="pi pi-eye" className="p-button-rounded p-button-info" onClick={() => setProductDialog(true)} />
                <Button icon="pi pi-pencil" className="p-button-rounded p-button-success" onClick={() => setOrder(rowData)} />
                <Button icon="pi pi-trash" className="p-button-rounded p-button-danger" onClick={() => confirmDeleteOrder(rowData)} />
            </>
        );
    };

    const header = (
        <div className="flex justify-content-between">
            <h5 className="m-2">Manage Orders</h5>
            <span className="p-input-icon-left">
                <i className="pi pi-search" />
                <InputText
                    type="search"
                    placeholder="Search..."
                    onInput={(e) => setGlobalFilter(e.target.value)}
                />
            </span>
        </div>
    );

    const orderDialogFooter = (
        <>
            <Button label="Cancel" icon="pi pi-times" text onClick={hideDialog} />
            <Button label="Save" icon="pi pi-check" text onClick={saveOrder} />
        </>
    );

    const deleteOrderDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" text onClick={() => setDeleteOrderDialog(false)} />
            <Button label="Yes" icon="pi pi-check" text onClick={deleteOrder} />
        </>
    );

    const deleteOrdersDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" text onClick={() => setDeleteOrdersDialog(false)} />
            <Button label="Yes" icon="pi pi-check" text onClick={deleteSelectedOrders} />
        </>
    );

    return (
        <div className="grid crud-demo">
            <div className="col-12">
                <div className="card">
                    <Toast ref={toast} />
                    <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>

                    <DataTable
                        ref={dt}
                        value={orders}
                        selection={selectedOrders}
                        onSelectionChange={(e) => setSelectedOrders(e.value)}
                        dataKey="id"
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} orders"
                        globalFilter={globalFilter}
                        header={header}
                        filters={filters}
                        filterDisplay="menu"
                        responsiveLayout="scroll"
                    >
                        <Column selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column>
                        <Column field="id" header="Order ID" sortable></Column>
                        <Column field="status" header="Status" sortable></Column>
                        <Column field="total_price" header="Total Price" sortable></Column>
                        <Column field="created_at" header="Created At" filter filterFunction={filterByDateRange} filterElement={dateRangeFilterTemplate} body={(rowData) => formatDate(rowData.created_at)} sortable></Column>
                        <Column body={actionBodyTemplate}></Column>
                    </DataTable>

                    <Dialog visible={orderDialog} style={{ width: '450px' }} header="Order Details" modal className="p-fluid" footer={orderDialogFooter} onHide={hideDialog}>
                        <div className="field">
                            <label htmlFor="status">Status</label>
                            <InputText id="status" value={order.status} onChange={(e) => setOrder({ ...order, status: e.target.value })} />
                        </div>
                        <div className="field">
                            <label htmlFor="total_price">Total Price</label>
                            <InputText id="total_price" value={order.total_price} onChange={(e) => setOrder({ ...order, total_price: e.target.value })} />
                        </div>
                    </Dialog>

                    <Dialog visible={productDialog} style={{ width: '450px' }} header="Product Details" modal onHide={() => setProductDialog(false)}>
                        <DataTable value={selectedOrderItems}>
                            <Column field="product.name" header="Product Name"></Column>
                            <Column field="quantity" header="Quantity"></Column>
                            <Column field="price" header="Price"></Column>
                        </DataTable>
                    </Dialog>

                    <Dialog visible={deleteOrderDialog} style={{ width: '450px' }} header="Confirm" modal footer={deleteOrderDialogFooter} onHide={() => setDeleteOrderDialog(false)}>
                        <div className="confirmation-content">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {order && <span>Are you sure you want to delete order <b>{order.id}</b>?</span>}
                        </div>
                    </Dialog>

                    <Dialog visible={deleteOrdersDialog} style={{ width: '450px' }} header="Confirm" modal footer={deleteOrdersDialogFooter} onHide={() => setDeleteOrdersDialog(false)}>
                        <div className="confirmation-content">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            <span>Are you sure you want to delete the selected orders?</span>
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default OrderPage;
