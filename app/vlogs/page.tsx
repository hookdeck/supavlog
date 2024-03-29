import VlogList from "@/components/VlogList";
import RecordAVlogButtonSection from "@/components/RecordAVlogButtonSection";
import Breadcrumb from "@/components/Breadcrumb";

export default async function RecordNew() {
  return (
    <div className="flex-1 flex flex-col w-full gap-10">
      <Breadcrumb />
      <RecordAVlogButtonSection />
      <div className="flex-1 flex flex-col w-full justify-center gap-10">
        <h2 className="text-2xl text-center">Vlogs</h2>
        <VlogList />
      </div>
    </div>
  );
}
