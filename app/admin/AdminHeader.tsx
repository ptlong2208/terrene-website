'use client';

import { useRouter } from 'next/navigation';

import TerreneLogo from '@/app/components/TerreneLogo';
import SlotText from '@/app/components/ui/SlotText';
import { supabaseBrowser } from '@/lib/supabase';

export default function AdminHeader() {
  const router = useRouter();

  async function signOut() {
    await supabaseBrowser().auth.signOut();
    router.replace('/admin/login');
  }

  return (
    <header className="border-line mb-6 flex items-center justify-between border-b pb-4">
      <div className="flex items-center gap-2">
        <TerreneLogo className="size-6 text-(--green-deep)" />
        <span className="text-[13px] font-semibold tracking-[0.06em] text-(--green-deep) uppercase opacity-60">
          Terrene Admin
        </span>
      </div>
      <button
        type="button"
        onClick={signOut}
        className="group cursor-pointer border-0 border-b border-(--green-deep) bg-transparent text-[12px] font-semibold text-(--green-deep)"
      >
        <SlotText text="Đăng xuất" />
      </button>
    </header>
  );
}
