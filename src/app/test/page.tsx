'use client';

export default function TestPage() {
    return (
        <div className="p-10">
            <h1 className="text-4xl font-bold text-red-500">Test Page</h1>
            <p className="mt-4 text-xl">If you can see this, Next.js is working correctly.</p>
            <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded" onClick={() => alert('JS is working')}>
                Test JS
            </button>
        </div>
    );
}
