// page.tsx
'use client'; // Add this line to make it a Client Component

import { useState,useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Checkbox } from 'primereact/checkbox';
import { Button } from 'primereact/button';
import { Password } from 'primereact/password';
import { InputText } from 'primereact/inputtext';
import { classNames } from 'primereact/utils';

const apiUrl = 'https://api.zidoo.online/api';
const LoginPage = () => {
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [checked, setChecked] = useState(false);
    const router = useRouter();

    useEffect(() => {
        console.log(apiUrl);
        // Check if user is already authenticated
        const token = localStorage.getItem('token');
        if (token) {
            // If authenticated, redirect to the homepage or dashboard
            router.push('/');
        }
    }, [router]);

    const handleLogin = async () => {
        try {
           // await fetchCsrfToken();
            const response = await axios.post(`${apiUrl}/login`, {
                email,
                password,
            });
              // Assuming the response contains the token
        const { token, is_admin } = response.data;

        // Save token in local storage
        localStorage.setItem('token', token); // Save the token
        localStorage.setItem('is_admin', is_admin); // Optionally save user info

            // Save token or user data and redirect
            router.push('/'); // Redirect to homepage or dashboard
        } catch (error) {
            console.error("Login failed", error);
            // Optionally show an error message to the user
        }
    };
    const containerClassName = classNames('surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden');

    return (
        <div className={containerClassName} dir='rtl'>
            <div className="flex flex-column align-items-center justify-content-center">
                <div
                    style={{
                        borderRadius: '56px',
                        padding: '0.3rem',
                        background: 'linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)'
                    }}
                >
                    <div className="w-full surface-card py-8 px-5 sm:px-8" style={{ borderRadius: '53px' }}>
                        <div className="text-center mb-5">
                            <div className="text-900 text-3xl font-medium mb-3">مرحبًا!</div>
                            <span className="text-600 font-medium">قم بتسجيل الدخول لمتابعة</span>
                        </div>

                        <div>
                            <label htmlFor="email1" className="block text-900 text-xl font-medium mb-2">البريد الإلكتروني</label>
                            <InputText id="email1" type="text" placeholder="عنوان البريد الإلكتروني" className="w-full md:w-30rem mb-5"  onChange={(e) => setEmail(e.target.value)}/>

                            <label htmlFor="password1" className="block text-900 font-medium text-xl mb-2">كلمة المرور</label>
                            <Password inputId="password1" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="كلمة المرور" feedback={false} toggleMask className="w-full md:w-30rem mb-5"  />

                            <div className="flex align-items-center justify-content-between mb-5 gap-5">
                                <div className="flex align-items-center">
                                    <Checkbox inputId="rememberme1" checked={checked} onChange={(e) => setChecked(e.checked ?? false)} className="mr-2"></Checkbox>
                                    <label htmlFor="rememberme1">تذكرني</label>
                                </div>
                            </div>
                            <Button label="تسجيل الدخول" className="w-full" onClick={handleLogin}></Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
