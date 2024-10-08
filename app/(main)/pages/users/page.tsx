/* eslint-disable @next/next/no-img-element */
'use client';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DropdownChangeEvent } from 'primereact/dropdown';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { FilterMatchMode } from 'primereact/api';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { classNames } from 'primereact/utils';
import React, { useEffect, useRef, useState, ChangeEvent } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const Crud = () => {
    const apiUrl = 'https://api.zidoo.online/api';
    let emptyUser: User = {
        id: '',
        name: '',
        email: '',
        password: '',
        email_verified_at: null as string | null,
        created_at: '',
        updated_at: '',
        is_admin: false
    };
    interface User {
        id: string;
        name: string;
        email: string;
        password: string;
        email_verified_at: string | null;
        created_at: string;
        updated_at: string;
        is_admin: boolean;
    }




    const [users, setUsers] = useState<User[]>([]);
    const [userDialog, setUserDialog] = useState(false);
    const [deleteUserDialog, setDeleteUserDialog] = useState(false);
    const [deleteUsersDialog, setDeleteUsersDialog] = useState(false);
    const [user, setUser] = useState(emptyUser);
    const [selectedUsers, setSelectedUsers] = useState<User[] | null>(null);

    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState<string | null>(null);
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);
    const [filters, setFilters] = useState({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        name: { value: null, matchMode: FilterMatchMode.STARTS_WITH }
    });
    const router = useRouter();
    useEffect(() => {
        const is_admin = localStorage.getItem('is_admin');
        if(is_admin!='true'){
            router.push("/");
        }
        fetchUsers();
    }, [router]);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            };

            const response = await axios.get(`${apiUrl}/users`, config);
            setUsers(response.data);
        } catch (error) {
            console.error("Error fetching users: ", error);
        }
    };

    const editUser = (user: User) => {
        setUser({ ...user });
        setUserDialog(true);
    };
    const confirmDeleteUser = (user: User) => {
        setUser(user); // Set the user to be deleted
        setDeleteUserDialog(true); // Open the delete confirmation dialog
    };


    const saveUser = async () => {
        setSubmitted(true);

        if (user.name.trim() && user.email.trim() && user.password.trim()) {
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };

            let _users = [...users];
            let _user = { ...user };

            try {
                if (user.id) {
                    // Update existing user
                    const response = await axios.put(`${apiUrl}/users/${user.id}`, _user, config);
                    const index = findIndexById(user.id);
                    _users[index] = response.data;
                    toast.current?.show({ severity: 'success', summary: 'Success', detail: 'User Updated', life: 3000 });
                } else {
                    // Create new user
                    const response = await axios.post(`${apiUrl}/users`, _user, config);
                    _user.id = response.data.id;
                    _users.push(_user);
                    toast.current?.show({ severity: 'success', summary: 'Success', detail: 'User Created', life: 3000 });
                }

                setUsers(_users);
                setUserDialog(false);
                setUser(emptyUser);
            } catch (error) {
                toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to Save User', life: 3000 });
            }
        } else {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Please fill in all required fields', life: 3000 });
        }
    };





    const deleteUser = async () => {
        const token = localStorage.getItem('token');
        const config = {
            headers: {
                Authorization: `Bearer ${token}`
            }
        };

        try {
            await axios.delete(`${apiUrl}/users/${user.id}`, config);
            if (users) {
            let _users = users.filter((val: any) => val.id !== user.id);
            setUsers(_users);
            setDeleteUserDialog(false);
            setUser(emptyUser);
}
            toast.current?.show({
                severity: 'success',
                summary: 'نجاح',
                detail: 'تم حذف المستخدم',
                life: 3000
            });
        } catch (error) {
            console.error("Error deleting user: ", error);
            toast.current?.show({ severity: 'error', summary: 'خطأ', detail: 'فشل في حذف المستخدم', life: 3000 });
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A'; // Handle null or empty values

        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'N/A'; // Handle invalid date strings

        return new Intl.DateTimeFormat('en-us', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
    };



    const onInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | DropdownChangeEvent, name: keyof typeof user) => {
        let val = 'value' in e ? e.value : (e.target as HTMLInputElement).value || '';

        setUser(prevUser => ({
            ...prevUser,
            [name]: val
        }));
    };

    const hideDialog = () => {
        setSubmitted(false);
        setUserDialog(false);
    };

    const hideDeleteUserDialog = () => {
        setDeleteUserDialog(false);
    };

    const findIndexById = (id: string) => {
        let index = -1;
        for (let i = 0; i < users.length; i++) {
            if (users[i].id === id) {
                index = i;
                break;
            }
        }
        return index;
    };

    const header = (
        <div className="flex justify-content-between">
            <h5 className="m-2 ">إدارة المستخدمين</h5>
            <span className="p-input-icon-left">
                <i className="pi pi-search" />
                <InputText
                    type="search"
                    placeholder="بحث..."
                    onInput={(e: React.ChangeEvent<HTMLInputElement>) => setGlobalFilter(e.target.value)}
                />
            </span>
        </div>
    );

    const userDialogFooter = (
        <>
            <Button label="إلغاء" icon="pi pi-times" text onClick={hideDialog} />
            <Button label="حفظ" icon="pi pi-check" text onClick={saveUser} />
        </>
    );

    const deleteUserDialogFooter = (
        <>
            <Button label="لا" icon="pi pi-times" text onClick={hideDeleteUserDialog} />
            <Button label="نعم" icon="pi pi-check" text onClick={deleteUser} />
        </>
    );

    const openNew = () => {
        setUser(emptyUser);  // Reset the user state to the empty object, ready for a new user to be created
        setSubmitted(false);  // Reset the submitted flag
        setUserDialog(true);  // Open the user dialog (form)
    };



    return (
        <div className="grid crud-demo">
            <div className="col-12">
                <div className="card">
                    <Toast ref={toast} />
                    <Toolbar className="mb-4" left={() => (
                        <>
                            <Button label="جديد" icon="pi pi-plus" className="ml-2" onClick={openNew} />
                            <Button label="حذف" icon="pi pi-trash" className="mr-2" disabled={!selectedUsers || !selectedUsers.length} onClick={() => setDeleteUsersDialog(true)} />
                        </>
                    )} />
                    <DataTable
                        ref={dt}
                        value={users}
                        paginator
                        globalFilter={globalFilter}
                        rows={10}
                        filters={filters}
                        selection={selectedUsers}
                        onSelectionChange={(e) => setSelectedUsers(e.value)}
                        rowsPerPageOptions={[5, 10, 25]}
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="عرض {first} إلى {last} من {totalRecords} مستخدمين"
                        header={header}
                        emptyMessage="لا يوجد مستخدمون."
                        responsiveLayout="scroll"
                    >
                        <Column selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column>
                        <Column field="id" header="الرمز" sortable></Column>
                        <Column field="name" header="الاسم" sortable></Column>
                        <Column field="email" header="البريد الإلكتروني" sortable></Column>
                        <Column field="created_at" header="تاريخ الإنشاء" body={(rowData) => formatDate(rowData.created_at)} sortable></Column>
                        <Column field="updated_at" header="تاريخ التحديث" body={(rowData) => formatDate(rowData.updated_at)} sortable></Column>
                        <Column field="is_admin" header="مسؤول" body={(rowData) => rowData.is_admin ? 'Admin' : 'User'} sortable />
                        <Column body={(rowData) => (
                            <>
                                <Button icon="pi pi-pencil" className="ml-2" onClick={() => editUser(rowData)} />
                                <Button icon="pi pi-trash" onClick={() => confirmDeleteUser(rowData)} />
                            </>
                        )}></Column>
                    </DataTable>

                    <Dialog visible={userDialog} style={{ width: '450px' }} header="تفاصيل المستخدم" modal className="p-fluid" footer={userDialogFooter} onHide={hideDialog}>
    <div className="field">
        <label htmlFor="name">الاسم</label>
        <InputText id="name" value={user.name} onChange={(e) => onInputChange(e, 'name')} required autoFocus className={classNames({ 'p-invalid': submitted && !user.name })} />
        {submitted && !user.name && <small className="p-error">الاسم مطلوب.</small>}
    </div>

    <div className="field">
        <label htmlFor="email">البريد الإلكتروني</label>
        <InputText id="email" value={user.email} onChange={(e) => onInputChange(e, 'email')} required className={classNames({ 'p-invalid': submitted && !user.email })} />
        {submitted && !user.email && <small className="p-error">البريد الإلكتروني مطلوب.</small>}
    </div>

    <div className="field">
        <label htmlFor="password">كلمة المرور</label>
        <InputText id="password" value={user.password} onChange={(e) => onInputChange(e, 'password')}  type="password" />
        {/* {submitted && !user.password && <small className="p-error">كلمة المرور مطلوبة.</small>} */}
    </div>

    <div className="field">
    <label htmlFor="is_admin">الدور</label>
    <Dropdown
    id="is_admin"
    value={user.is_admin}
    options={[
        { label: 'Admin', value: true },
        { label: 'User', value: false }
    ]}
    onChange={(e) => onInputChange(e, 'is_admin')}  // Correctly handles the event now
    placeholder="اختر الدور"
    required
    className={classNames({ 'p-invalid': submitted && user.is_admin === null })}
/>
</div>
</Dialog>

                    <Dialog visible={deleteUserDialog} style={{ width: '450px' }} header="تأكيد" modal footer={deleteUserDialogFooter} onHide={hideDeleteUserDialog}>
                        <div className="confirmation-content">
                            <i className="pi pi-exclamation-triangle" style={{ fontSize: '2rem' }} />
                            {user && <span>هل أنت متأكد من أنك تريد حذف <b>{user.name}</b>؟</span>}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default Crud;
