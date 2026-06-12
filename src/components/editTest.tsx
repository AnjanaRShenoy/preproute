"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import CreateTest from './createTest';

export default function EditTestPage() {
    const params = useParams();
    const router = useRouter();

    // Safely extract the test dynamic UUID token from the browser route url string
    const testId = params?.id as string;

    const [testData, setTestData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
       
        if (!testId || testId === "undefined") return;

        // 👑 TRACKER: A boolean flag to ensure asynchronous data maps exactly once
        let isMounted = true;

        const fetchTestConfigurations = async () => {
            try {
                const myToken = document.cookie
                    .split('; ')
                    .find(row => row.startsWith('token='))
                    ?.split('=')[1];

                const response = await fetch(`/api/tests/${testId}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${myToken || ''}`
                    }
                });

                const resData = await response.json();

                // 👑 GUARD 2: Only write to state hooks if this exact effect instance is still valid
                if (isMounted) {
                    if (response.ok && (resData.status === 'success' || resData.data)) {
                        setTestData(resData.data);
                    } else {
                        setError(resData.message || "Failed to retrieve profile.");
                    }
                }
            } catch (err) {
                console.error(err);
                if (isMounted) setError("Connection failure.");
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        fetchTestConfigurations();

        // 👑 CLEANUP: Runs if the component unmounts or re-renders mid-stream
        return () => {
            isMounted = false;
        };
    }, [testId]); 

    // Handle page layout during asynchronous loading timelines
    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-xs font-black text-slate-400 tracking-widest uppercase animate-pulse">
                    Fetching Test Record Details...
                </div>
            </div>
        );
    }

    // Handle missing or corrupted registry targets securely
    if (error || !testData) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center space-y-4">
                <div className="text-sm font-semibold text-red-500">⚠️ Error: {error || "Record state missing"}</div>
                <button
                    onClick={() => router.push('/')}
                    className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold shadow-sm"
                >
                    Return to Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 w-screen overflow-x-hidden">
            <CreateTest
                initialDataToEdit={testData}
                testIdToEdit={testId}
                onCloseEditModal={() => router.push('/')}
            />
        </div>
    );
}