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

const apiUrl = 'https://wh1389740.ispot.cc/api';
const LoginPage = () => {
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
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
        setErrorMessage(null);
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
            if (axios.isAxiosError(error) && error.response) {
                console.log(email, password);
                // If there's an error response from the server (e.g., wrong credentials)
                setErrorMessage('البريد الإلكتروني أو كلمة المرور غير صالحة. يرجى المحاولة مرة أخرى.');
            } else {

                // Handle any other errors (e.g., network errors)
                setErrorMessage('فشل تسجيل الدخول. يرجى المحاولة مرة أخرى في وقت لاحق.');
            }
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
                    <div className="w-full px-5 py-8 surface-card sm:px-8" style={{ borderRadius: '53px' }}>
                        <div className="mb-5 text-center">
                            <div className="mb-3 text-3xl font-medium text-900">مرحبًا!</div>
                            <span className="font-medium text-600">قم بتسجيل الدخول لمتابعة</span>
                        </div>

                        <div>
                            <label htmlFor="email1" className="block mb-2 text-xl font-medium text-900">البريد الإلكتروني</label>
                            <InputText id="email1" type="text" placeholder="عنوان البريد الإلكتروني" className="w-full mb-5 md:w-30rem"  onChange={(e) => setEmail(e.target.value)}/>

                            <label htmlFor="password1" className="block mb-2 text-xl font-medium text-900">كلمة المرور</label>
                            <Password inputId="password1" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="كلمة المرور" feedback={false} toggleMask className="w-full mb-5 md:w-30rem"  />

                            <div className="flex gap-5 mb-5 align-items-center justify-content-between">
                                <div className="flex align-items-center">
                                    <Checkbox inputId="rememberme1" checked={checked} onChange={(e) => setChecked(e.checked ?? false)} className="mr-2"></Checkbox>
                                    <label htmlFor="rememberme1">تذكرني</label>
                                </div>

                                {errorMessage && (
                                <div className="mb-3 p-error" style={{ color: 'red', textAlign: 'center' }}>
                                    {errorMessage}
                                </div>
                                )}

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
