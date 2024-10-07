/* eslint-disable @next/next/no-img-element */

import React, { useContext } from 'react';
import AppMenuitem from './AppMenuitem';
import { LayoutContext } from './context/layoutcontext';
import { MenuProvider } from './context/menucontext';
import { AppMenuItem } from '@/types';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const AppMenu = () => {
    const { layoutConfig } = useContext(LayoutContext);

    const router = useRouter();
 const is_admin = localStorage.getItem('is_admin');
    // Handle logout
    const handleLogout = async () => {
        try {
            const token = localStorage.getItem('token');

            if (token) {
                // Make logout API request
                await axios.post('http://127.0.0.1:8000/api/logout', {}, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                // Clear token and user data from localStorage
                localStorage.removeItem('token');
                localStorage.removeItem('is_admin');

                // Redirect to login page
                router.push('/auth/login');
            }
        } catch (error) {
            console.error('Logout failed', error);
        }
    };
   if(is_admin){

   }
   var menu= [
    {
        label: 'الصفحات',
        items: [
            { label: 'الواجهة', icon: 'pi pi-fw pi-home', to: '/' },
            { label: 'المنتجات', icon: 'pi pi-fw pi-box', to: '/pages/products' },
            { label: 'الطلبات', icon: 'pi pi-fw pi-pencil', to: '/pages/orders' },
          //  { label: 'المستخدمين', icon: 'pi pi-user', to: '/pages/users' },
            // Add the Logout button as a menu item
            {
                label: 'تسجيل الخروج',
                icon: 'pi pi-fw pi-sign-out',
                command: () => handleLogout(),
                className: 'logout-menu-item'  // Instead of navigating, it calls handleLogout
            }
        ],
    },];
if(is_admin=='true'){
    var menu= [
        {
            label: 'الصفحات',
            items: [
                { label: 'الواجهة', icon: 'pi pi-fw pi-home', to: '/' },
                { label: 'المنتجات', icon: 'pi pi-fw pi-box', to: '/pages/products' },
                { label: 'الطلبات', icon: 'pi pi-fw pi-pencil', to: '/pages/orders' },
                { label: 'المستخدمين', icon: 'pi pi-user', to: '/pages/users' },
                // Add the Logout button as a menu item
                {
                    label: 'تسجيل الخروج',
                    icon: 'pi pi-fw pi-sign-out',
                    command: () => handleLogout(),
                    className: 'logout-menu-item'  // Instead of navigating, it calls handleLogout
                }
            ],
        },];
}
    // Add the logout item to the menu model
    const model: AppMenuItem[] =menu;

    return (
        <div>
            <MenuProvider>
                <ul className="layout-menu">
                    {model.map((item, i) => (


                        !item?.separator ? <AppMenuitem item={item} root={true} index={i} key={item.label} /> : <li className="menu-separator"></li>
                    ))}
                </ul>
            </MenuProvider>
        </div>
    );
};

export default AppMenu;
