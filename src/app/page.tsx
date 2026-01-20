import MainCanvas from '@/components/canvas/MainCanvas';
import ScrollIndicator from '@/components/ui/ScrollIndicator';

export default function Home() {
  return (
    <>
      <div className="fixed inset-0 z-0">
        <MainCanvas />
      </div>
      <main className="relative z-10 h-[500vh]">
        <ScrollIndicator />
      </main>
    </>
  );
}
