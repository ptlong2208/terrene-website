import PreloaderBridge from '@/app/components/PreloaderBridge';

export default function CheckoutResultLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PreloaderBridge />
      {children}
    </>
  );
}
