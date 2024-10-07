/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { classNames } from 'primereact/utils';
import React, { forwardRef, useContext, useImperativeHandle, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { LayoutContext } from './context/layoutcontext';
import axios from 'axios';

const AppTopbar = forwardRef((props, ref) => {
    const { layoutConfig, layoutState, onMenuToggle, showProfileSidebar } = useContext(LayoutContext);
    const menubuttonRef = useRef(null);
    const topbarmenuRef = useRef(null);
    const topbarmenubuttonRef = useRef(null);
    const router = useRouter();

    useImperativeHandle(ref, () => ({
        menubutton: menubuttonRef.current,
        topbarmenu: topbarmenuRef.current,
        topbarmenubutton: topbarmenubuttonRef.current
    }));

    // Handle logout
    const handleLogout = async () => {
        try {
            const token = localStorage.getItem('token');
            if (token) {
                // Make logout API request
                await axios.post('https://api.zidoo.online/api/logout', {}, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                // Clear token and user data from localStorage
                localStorage.removeItem('token');
                localStorage.removeItem('user');

                // Redirect to login page
                router.push('/auth/login');
            }
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    return (
        <div className="layout-topbar" dir="rtl">
            <button ref={menubuttonRef} type="button" className="p-link layout-menu-button layout-topbar-button" onClick={onMenuToggle} dir='rtl'>
                <i className="pi pi-bars" />
            </button>
            <Link href="/" className="layout-topbar-logo">
                <span>لوحة القيادة</span>
            </Link>

            <button ref={topbarmenubuttonRef} type="button" className="p-link layout-topbar-menu-button layout-topbar-button" onClick={showProfileSidebar}>
                <i className="pi pi-ellipsis-v" />
            </button>

            {/* <div ref={topbarmenuRef} className={classNames('layout-topbar-menu', { 'layout-topbar-menu-mobile-active': layoutState.profileSidebarVisible })}>
                <button type="button" className="p-link layout-topbar-button" onClick={handleLogout}>
                    <i className="pi pi-sign-out"></i>
                    <span>تسجيل الخروج</span>
                </button>
            </div> */}
        </div>
    );
});

AppTopbar.displayName = 'AppTopbar';

export default AppTopbar;
