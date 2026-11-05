import { useState } from "react";
import { PageHeader } from "../../components/ui/PageHeader";
import { settingsRepo } from "../../repositories";
import { saveSettings } from "../../services/catalogService";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { useLiveData } from "../../hooks/useLiveData";
import { Coins, Save, Plus, Minus } from "lucide-react";

export default function TokenSettings() {
  useLiveData();
  const { user } = useAuth();
  const toast = useToast();
  const s = settingsRepo.get();
  const [price, setPrice] = useState(s.tokenPriceTHB || 10);

  function handlePriceChange(e) {
    const v = e.target.value.slice(0, 9);
    setPrice(v);
  }

  function save() {
    try {
      const numPrice = Number(price);
      if (numPrice <= 0 || isNaN(numPrice)) {
        toast.push("กรุณาระบุอัตราแลกเปลี่ยนที่มากกว่า 0 บาท", "error");
        return;
      }

      saveSettings(user, {
        tokenPriceTHB: numPrice,
        tokenPackages: [],
      });
      toast.push(
        "บันทึกการตั้งค่าราคา Token เรียบร้อยแล้ว",
        "success",
      );
    } catch (e) {
      toast.push(e.message, "error");
    }
  }

  const currentRate = Number(price) || 10;

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader
        title="ตั้งค่าราคา Token"
        subtitle="กำหนดอัตราแลกเปลี่ยน Token ต่อบาท สำหรับจุดบริการเติมเงิน (Event Admin)"
        icon={Coins}
      />

      <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm space-y-6">
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1.5">
            อัตราแลกเปลี่ยนพื้นฐาน (บาท / 1 Token)
          </label>
          <div className="flex items-center gap-2 max-w-xs">
            <button
              type="button"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 hover:border-slate-300 active:scale-95 transition disabled:opacity-40"
              onClick={() => {
                const current = Number(price) || 1;
                setPrice(String(Math.max(1, current - 1)));
              }}
              disabled={Number(price) <= 1}
              title="ลด 1 บาท"
            >
              <Minus className="h-4 w-4" />
            </button>

            <div className="relative flex-1">
              <input
                className="input pr-12 text-center font-bold text-slate-800"
                type="number"
                min="1"
                max="999999999"
                value={price}
                onChange={handlePriceChange}
                onInput={(e) => {
                  if (e.target.value.length > 9) e.target.value = e.target.value.slice(0, 9);
                }}
              />
              <span className="absolute right-3 top-2.5 text-xs font-semibold text-slate-400 pointer-events-none select-none">
                บาท
              </span>
            </div>

            <button
              type="button"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 hover:border-slate-300 active:scale-95 transition"
              onClick={() => {
                const current = Number(price) || 0;
                setPrice(String(Math.min(999999999, current + 1)));
              }}
              title="เพิ่ม 1 บาท"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <p className="text-[11px] text-slate-400 mt-1.5">
            เรทหลักของระบบ: <strong>1 Token = {currentRate} บาท</strong> (ใช้คำนวณยอดเงินเทียบเท่าและจุดบริการเติมเงิน)
          </p>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <button
            className="btn-primary w-full py-3 text-xs font-bold gap-2"
            type="button"
            onClick={save}
          >
            <Save className="h-4 w-4" /> บันทึกการตั้งค่า Token
          </button>
        </div>
      </div>
    </div>
  );
}
