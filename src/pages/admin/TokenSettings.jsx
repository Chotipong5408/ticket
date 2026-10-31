import { useState } from "react";
import { PageHeader } from "../../components/ui/PageHeader";
import { settingsRepo } from "../../repositories";
import { saveSettings } from "../../services/catalogService";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { useLiveData } from "../../hooks/useLiveData";
import { Coins, Save, Plus, Package } from "lucide-react";

export default function TokenSettings() {
  useLiveData();
  const { user } = useAuth();
  const toast = useToast();
  const s = settingsRepo.get();
  const [price, setPrice] = useState(s.tokenPriceTHB);
  const [packages, setPackages] = useState(s.tokenPackages || []);

  function save() {
    try {
      saveSettings(user, {
        tokenPriceTHB: Number(price),
        tokenPackages: packages.map((p) => ({
          ...p,
          tokens: Number(p.tokens),
          price: Number(p.price),
        })),
      });
      toast.push(
        "บันทึกการตั้งค่าราคาและแพ็กเกจ Token เรียบร้อยแล้ว",
        "success",
      );
    } catch (e) {
      toast.push(e.message, "error");
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader
        title="ตั้งค่าราคาและแพ็กเกจ Token"
        subtitle="กำหนดอัตราแลกเปลี่ยน Token ต่อบาท และแพ็กเกจสำหรับจุดบริการเติมเงิน (Event Admin)"
        icon={Coins}
      />

      <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm space-y-6">
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1.5">
            อัตราแลกเปลี่ยนพื้นฐาน (บาท / 1 Token)
          </label>
          <div className="relative max-w-xs">
            <input
              className="input pr-12 font-bold text-slate-800"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
            <span className="absolute right-3 top-2.5 text-xs font-semibold text-slate-400">
              บาท
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            ใช้สำหรับการคำนวณราคาเริ่มต้นและรายงานสถิติ
          </p>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-3">
            แพ็กเกจเติมเงินสำเร็จรูป (Token Packages)
          </label>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3 text-[11px] font-bold text-slate-400 px-1">
              <span>จำนวน Token</span>
              <span>ราคาขาย (บาท)</span>
            </div>

            {packages.map((p, i) => (
              <div key={p.id || i} className="grid grid-cols-2 gap-3">
                <input
                  className="input text-xs font-bold"
                  placeholder="จำนวน Token"
                  value={p.tokens}
                  onChange={(e) =>
                    setPackages(
                      packages.map((x, idx) =>
                        idx === i ? { ...x, tokens: e.target.value } : x,
                      ),
                    )
                  }
                />
                <input
                  className="input text-xs font-bold"
                  placeholder="ราคา (บาท)"
                  value={p.price}
                  onChange={(e) =>
                    setPackages(
                      packages.map((x, idx) =>
                        idx === i ? { ...x, price: e.target.value } : x,
                      ),
                    )
                  }
                />
              </div>
            ))}
          </div>
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
