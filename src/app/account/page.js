import AccountClient from  '@/components/pages/AccountClient';
import { Suspense } from 'react';

export const metadata = {
  title: 'My Account | Aroha',
  description: 'Manage your profile, track orders, and update your addresses.',
};

export default function AccountPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="animate-pulse text-stone-400 font-serif text-xl">Loading account...</div>
      </div>
    }>
      <AccountClient />
    </Suspense>
  );
}
