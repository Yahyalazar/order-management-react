/* eslint-disable @next/next/no-img-element */
'use client';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { FilterMatchMode } from 'primereact/api';
import { FileUpload } from 'primereact/fileupload';
import { InputNumber, InputNumberValueChangeEvent } from 'primereact/inputnumber';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { RadioButton, RadioButtonChangeEvent } from 'primereact/radiobutton';
import { Rating } from 'primereact/rating';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { classNames } from 'primereact/utils';
import React, { useEffect, useRef, useState } from 'react';
import { ProductService } from '../../../../demo/service/ProductService';
import { Demo } from '@/types';
import axios from 'axios';
import { config } from 'process';
/* @todo استخدام 'as any' لأنواع هنا. سيتم الإصلاح في النسخة القادمة بسبب مشكلة نوع حدث onSelectionChange. */
const Crud = () => {

    let emptyProduct: Demo.Product = {
    id: '',
    name: '',
    price: 0,
    stock: 0,
    created_at: '',
    updated_at: ''
    };

    let _product: {
        id: string;
        name: string;
        price: number;
        stock: number;
        created_at: string;
        updated_at: string;
        [key: string]: string | number; // Adding index signature
    };

    const [products, setProducts] = useState<Demo.Product[]>([]);  // Initialize as an empty array;
    const [productDialog, setProductDialog] = useState(false);
    const [deleteProductDialog, setDeleteProductDialog] = useState(false);
    const [filters, setFilters] = useState({
        global: { value: null as string | null, matchMode: FilterMatchMode.CONTAINS },
        name: { value: null as string | null, matchMode: FilterMatchMode.STARTS_WITH },
        price: { value: null as string | null, matchMode: FilterMatchMode.CONTAINS },
    });

    const [deleteProductsDialog, setDeleteProductsDialog] = useState(false);
    const [product, setProduct] = useState<Demo.Product>(emptyProduct);
    const [selectedProducts, setSelectedProducts] = useState<Demo.Product[] | null>(null);
    const [submitted, setSubmitted] = useState(false);
 const [globalFilter, setGlobalFilter] = useState<string | null>(null);
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);
    const [globalFilterValue, setGlobalFilterValue] = useState<string>('');
    const apiUrl = 'https://api.zidoo.online/api';
    useEffect(() => {
        fetchdata()
        ProductService.getProducts().then((data) => setProducts(data as any));
        /* console.log(products) */
    }, []);
    const fetchdata=()=>{
        ProductService.getProducts().then((data) => setProducts(data as any));

    }
    const is_admin = localStorage.getItem('is_admin');
    const onGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        let _filters = { ...filters };

        _filters['global'].value = value; // `value` can now be either `null` or `string`

        setFilters(_filters);
        setGlobalFilterValue(value);
    };
    const formatCurrency = (value: number) => {
        return value.toLocaleString('us-dollar', {
            style: 'currency',
            currency: 'USD'
        });
    };

    const openNew = () => {
        setProduct(emptyProduct);
        setSubmitted(false);
        setProductDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setProductDialog(false);
    };

    const hideDeleteProductDialog = () => {
        setDeleteProductDialog(false);
    };

    const hideDeleteProductsDialog = () => {
        setDeleteProductsDialog(false);
    };

    const saveProduct = async () => {
        setSubmitted(true);
        const token = localStorage.getItem('token');
        const config = {
            headers: {
                Authorization: `Bearer ${token}`, // include token in Authorization header
            },
        };

        if (product.name.trim()) {
            let _products = [...(products as any)];
            let _product = { ...product };

            // Populate created_at and updated_at for new products
            if (!_product.created_at) {
                _product.created_at = new Date().toISOString();
            }
            _product.updated_at = new Date().toISOString();

            try {
                // Save or update product logic here
                if (product.id) {
                    const index = findIndexById(parseInt(product.id));
                    _products[index] = _product;
                    await ProductService.updateProducts(product, product.id);
                    fetchdata();
                    toast.current?.show({ severity: 'success', summary: 'Success', detail: 'Product Updated', life: 3000 });
                } else {
                    const response = await axios.post(`${apiUrl}/products`, {
                        name: _product.name,
                        price: _product.price,
                        stock: _product.stock,
                        created_at: _product.created_at, // Pass the created_at date
                        updated_at: _product.updated_at, // Pass the updated_at date
                    }, config);
                    _product.id = createId();
                    _products.push(_product);
                    toast.current?.show({ severity: 'success', summary: 'Success', detail: 'Product Created', life: 3000 });
                }

                setProducts(_products as any);
                setProductDialog(false);
                setProduct(emptyProduct);
            } catch (error) {
                console.error('Error while saving product: ', error);
                toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to save product', life: 3000 });
            }
        }
    };


    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-us', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
    };



    const editProduct = (product: Demo.Product) => {
        setProduct({ ...product });
        console.log(product);

        setProductDialog(true);
    };

    const confirmDeleteProduct = (product: Demo.Product) => {
        setProduct(product);
        setDeleteProductDialog(true);
    };

    const deleteProduct = async () => {
        const token = localStorage.getItem('token');
        const config = {
            headers: {
                Authorization: `Bearer ${token}`, // include token in Authorization header
            },
        };

        try {
            await axios.delete(`${apiUrl}/products/${product.id}`, config);

            let _products = (products as any)?.filter((val: any) => val.id !== product.id);
            setProducts(_products);
            setDeleteProductDialog(false);
            setProduct(emptyProduct);

            toast.current?.show({
                severity: 'success',
                summary: 'ناجح',
                detail: 'تم حذف المنتج',
                life: 3000
            });
        } catch (error) {
            console.error("Error deleting product: ", error);
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to delete product', life: 3000 });
        }
    };


    const findIndexById = (id: number) => {
        let index = -1;
        for (let i = 0; i < (products as any)?.length; i++) {
            if ((products as any)[i].id === id) {
                index = i;
                break;
            }
        }

        return index;
    };

    const createId = () => {
        let id = '';
        let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < 5; i++) {
            id += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return id;
    };

    const exportCSV = () => {
        dt.current?.exportCSV();
    };

    const confirmDeleteSelected = () => {
        setDeleteProductsDialog(true);
    };

    /* const deleteSelectedProducts = () => {
        let _products = (products as any)?.filter((val: any) => !(selectedProducts as any)?.includes(val));
        console.log(_products);
        setProducts(_products);
        setDeleteProductsDialog(false);
        setSelectedProducts(null);
        toast.current?.show({
            severity: 'success',
            summary: 'ناجح',
            detail: 'تم حذف المنتجات',
            life: 3000
        });
    }; */

    const deleteSelectedProducts = async () => {
        if (!selectedProducts) return;
        const token = localStorage.getItem('token');
        const config = {
            headers: { Authorization: `Bearer ${token}` },
        };
        try {
            await Promise.all(
                selectedProducts?.map((product:any) => axios.delete(`${apiUrl}/products/${product.id}`, config))
            );
            setProducts(products.filter((val:any) => !selectedProducts?.includes(val)));
            setDeleteProductsDialog(false);
            toast.current?.show({ severity: 'success', summary: 'تم بنجاح', detail: 'تم حذف الطلبات بنجاح', life: 3000 });
        } catch (error) {
            console.error('Error deleting selected orders:', error);
            toast.current?.show({ severity: 'error', summary: 'خطأ', detail: 'فشل في حذف الطلبات', life: 3000 });
        }
    };


    /* const onCategoryChange = (e: RadioButtonChangeEvent) => {
        let _product = { ...product };
        _product['category'] = e.value;
        setProduct(_product);
    }; */

    const onInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, name: keyof Demo.Product) => {
        const val = (e.target as HTMLInputElement).value || '';  // Cast e.target to HTMLInputElement or HTMLTextAreaElement
        setProduct(prevProduct => ({
            ...prevProduct,
            [name]: val
        }));
    };




    const onInputNumberChange = (e: InputNumberValueChangeEvent, name: keyof typeof _product) => {
        const val = e.value || 0;

        let _product = { ...product };

        if (name === 'price' || name === 'stock') {
            _product[name] = val; // Directly access known properties 'price' and 'stock'
        }

        setProduct(_product);
    };

    const leftToolbarTemplate = () => {
        if(is_admin=="true"){
        return (
            <React.Fragment>
                <div className="my-2">
                    <Button label="جديد" icon="pi pi-plus" severity="success" className=" ml-2" onClick={openNew} />
                    <Button label="حذف" icon="pi pi-trash" severity="danger" className=" mr-2" onClick={confirmDeleteSelected} disabled={!selectedProducts || !(selectedProducts as any).length} />
                </div>
            </React.Fragment>
        );
        }else{
            return(
            <React.Fragment>
                <div className="my-2">
                    <Button label="جديد" icon="pi pi-plus" severity="success" className=" ml-2" onClick={openNew} />
                </div>
            </React.Fragment>
            )
        }
    };

    const rightToolbarTemplate = () => {
        return (
            <React.Fragment>
                <FileUpload mode="basic" accept="image/*" maxFileSize={1000000} chooseLabel="استيراد" className="ml-2 inline-block" />
                <Button label="تصدير" icon="pi pi-upload" severity="help" onClick={exportCSV} className="mr-2 inline-block"/>
            </React.Fragment>
        );
    };

    const codeBodyTemplate = (rowData: Demo.Product) => {
        return (
            <>
                <span className="p-column-title">الرمز</span>
                {rowData.id}
            </>
        );
    };

    const nameBodyTemplate = (rowData: Demo.Product) => {
        return (
            <>
                <span className="p-column-title">الاسم</span>
                {rowData.name}
            </>
        );
    };

    const priceBodyTemplate = (rowData: Demo.Product) => {
        return (
            <>
                <span className="p-column-title">السعر</span>
                {formatCurrency(rowData.price as number)}
            </>
        );
    };


    const ratingBodyTemplate = (rowData: Demo.Product) => {
        return (
            <>
                <span className="p-column-title">الكمية</span>
                {rowData.stock}
           </>
        );
    };

    const createdBodyTemplate = (rowData: Demo.Product) => {
        return (
            <>
                <span className="p-column-title">تاريخ الإنشاء</span>
                {formatDate(rowData.created_at)}
            </>
        );
    };


    const updatedBodyTemplate = (rowData: Demo.Product) => {
        return (
            <>
                <span className="p-column-title">وقت الانشاء</span>
                {rowData.updated_at}
            </>
        );
    };


    const actionBodyTemplate = (rowData: Demo.Product) => {
        if(is_admin=="true"){
        return (
            <>
                <Button icon="pi pi-pencil" rounded severity="success" className="ml-2" onClick={() => editProduct(rowData)} />
                <Button icon="pi pi-trash" rounded severity="warning" onClick={() => confirmDeleteProduct(rowData)} />
            </>
        );
        }else{

            return (
                <>
                    <Button icon="pi pi-pencil" rounded severity="success" className="ml-2" onClick={() => editProduct(rowData)} />
                </>
            );
        }
    };

    const header = (
        <div className="flex justify-content-between md:flex-col sm:flex-col">
            <h5 className="m-2">إدارة المنتجات</h5>
            <span className="p-input-icon-left">
                <i className="pi pi-search" />
                <InputText

                    type="search"
                    placeholder="Search..."
                    onInput={(e) => {
                        const value = (e.target as HTMLInputElement).value;
                        setGlobalFilter(value);
                        setFilters({
                            ...filters,
                            global: { value, matchMode: FilterMatchMode.CONTAINS }
                        });
                    }}
                />
            </span>
        </div>
    );


    const productDialogFooter = (
        <>
            <Button label="إلغاء" icon="pi pi-times" text onClick={hideDialog} />
            <Button label="حفظ" icon="pi pi-check" text onClick={saveProduct} />
        </>
    );

    const deleteProductDialogFooter = (
        <>
            <Button label="لا" icon="pi pi-times" text onClick={hideDeleteProductDialog} />
            <Button label="نعم" icon="pi pi-check" text onClick={deleteProduct} />
        </>
    );

    const deleteProductsDialogFooter = (
        <>
            <Button label="لا" icon="pi pi-times" text onClick={hideDeleteProductsDialog} />
            <Button label="نعم" icon="pi pi-check" text onClick={deleteSelectedProducts} />
        </>
    );

    return (
        <div className="grid crud-demo">
            <div className="col-12">
                <div className="card">
                    <Toast ref={toast} />
                    <Toolbar className="mb-4" left={leftToolbarTemplate} ></Toolbar>

                    <DataTable
                        ref={dt}
                        value={products as any}
                        selection={selectedProducts}
                        onSelectionChange={(e) => setSelectedProducts(e.value)}
                        dataKey="id"
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="عرض {first} إلى {last} من {totalRecords} منتجات"
                        globalFilterFields={['id', 'name', 'stock', 'price','created_at','updated_at']}
                        globalFilter={globalFilter}
                        filters={filters}
                        header={header}
                        emptyMessage="لا توجد منتجات متاحة."
                        responsiveLayout="scroll"

                    >
                        {
                        <Column selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column>}
                        <Column  field="id" header="الرمز" body={codeBodyTemplate} sortable></Column>
                        <Column filterField="name" field="name" header="الاسم" body={nameBodyTemplate} sortable></Column>
                        <Column field="price" header="السعر" body={priceBodyTemplate} sortable></Column>

                        <Column field="stock" header="الكمية" body={ratingBodyTemplate} sortable></Column>
                        <Column field="created_at" header="تاريخ الإنشاء" body={(rowData) => formatDate(rowData.created_at)} sortable></Column>
                        <Column field="updated_at" header="تاريخ التحديث" body={(rowData) => formatDate(rowData.updated_at)} sortable></Column>
                        {/* <Column field="inventoryStatus" header="الحالة" body={statusBodyTemplate} sortable></Column> */}
                        <Column body={actionBodyTemplate}></Column>
                    </DataTable>

                    <Dialog visible={productDialog} style={{ width: '450px' }} header="تفاصيل المنتج" modal className="p-fluid" footer={productDialogFooter} onHide={hideDialog}>
                        <div className="field">
                            <label htmlFor="name">الاسم</label>
                            <InputText id="name" value={product.name} onChange={(e) => onInputChange(e, 'name')} required autoFocus className={classNames({ 'p-invalid': submitted && !product.name })} />
                            {submitted && !product.name && <small className="p-error">الاسم مطلوب.</small>}
                        </div>


                        <div className="formgrid grid">
                            <div className="field col">
                                <label htmlFor="price">السعر</label>
                                <InputNumber id="price" value={product.price} onValueChange={(e) => onInputNumberChange(e, 'price')} mode="currency" currency="USD" locale="us-dollar" min={0} />
                            </div>
                            <div className="field col">
                                <label htmlFor="quantity">الكمية</label>
                                <InputNumber id="quantity" min={0} value={product.stock} onValueChange={(e) => onInputNumberChange(e, 'stock')} />
                            </div>
                        </div>
                    </Dialog>

                    <Dialog visible={deleteProductDialog} style={{ width: '450px' }} header="تأكيد" modal footer={deleteProductDialogFooter} onHide={hideDeleteProductDialog}>
                        <div className="confirmation-content">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {product && <span>هل أنت متأكد من أنك تريد حذف <b>{product.name}</b>؟</span>}
                        </div>
                    </Dialog>

                    <Dialog visible={deleteProductsDialog} style={{ width: '450px' }} header="تأكيد" modal footer={deleteProductsDialogFooter} onHide={hideDeleteProductsDialog}>
                        <div className="confirmation-content">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {product && <span>هل أنت متأكد من أنك تريد حذف المنتجات المحددة؟</span>}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default Crud;
