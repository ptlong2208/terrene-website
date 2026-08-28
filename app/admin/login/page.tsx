'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import TerreneLogo from '@/app/components/TerreneLogo';
import Card from '@/app/components/ui/Card';
import { FORM_ERROR_CLASS } from '@/app/components/ui/formStyles';
import PrimaryButton from '@/app/components/ui/PrimaryButton';
import SlotText from '@/app/components/ui/SlotText';
import { supabaseBrowser } from '@/lib/supabase';

type Status = 'loading' | 'signed-out' | 'not-admin';

export default function AdminLoginPage() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>('loading');
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const supabase = supabaseBrowser();

    async function loadSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setStatus('signed-out');
        setEmail(null);
        return;
      }

      setEmail(session.user.email ?? null);
      const { data: isAdmin } = await supabase.rpc('is_admin');
      if (isAdmin) {
        router.replace('/admin/reviews');
        return;
      }
      setStatus('not-admin');
    }

    void loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => void loadSession());

    return () => subscription.unsubscribe();
  }, [router]);

  async function signIn() {
    await supabaseBrowser().auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/admin/auth/callback?next=/admin/reviews` },
    });
  }

  async function signOut() {
    await supabaseBrowser().auth.signOut();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-(--green-deep)/5 p-6">
      <Card className="w-full max-w-sm text-center">
        <TerreneLogo className="mx-auto mb-3 h-9 w-9 text-(--green-deep)" />
        <h1 className="mb-6 text-[13px] font-semibold tracking-[0.06em] text-(--green-deep) uppercase opacity-60">
          Terrene Admin
        </h1>

        {status === 'loading' && (
          <p className="text-[13px] text-(--green-deep) opacity-60">Đang kiểm tra đăng nhập...</p>
        )}

        {status === 'signed-out' && (
          <PrimaryButton onClick={signIn}>Đăng nhập bằng Google</PrimaryButton>
        )}

        {status === 'not-admin' && (
          <div className="flex flex-col items-center gap-4">
            <p className={FORM_ERROR_CLASS}>{email} không có quyền admin trên trang này.</p>
            <button
              type="button"
              onClick={signOut}
              className="group cursor-pointer border-0 border-b border-(--green-deep) bg-transparent text-[13px] font-semibold text-(--green-deep)"
            >
              <SlotText text="Đăng xuất" />
            </button>
          </div>
        )}
      </Card>
    </main>
  );
}
