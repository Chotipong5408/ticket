import { useState } from "react";
import { PageHeader } from "../../components/ui/PageHeader";
import { usersRepo, storesRepo } from "../../repositories";
import { setUserRole } from "../../services/authService";
import { ROLE_LABELS } from "../../data/permissions";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { useLiveData } from "../../hooks/useLiveData";
import { Users, Shield, Store, Check, UserCheck } from "lucide-react";

export default function AdminAdmins() {
  useLiveData();
  const { user } = useAuth();
  const toast = useToast();
  const [role, setRole] = useState("token_admin");
  const [storeId, setStoreId] = useState("");
  const people = usersRepo.all();

  function assign(id) {
    try {
      setUserRole(user, id, role, storeId || null);
      toast.push(
        `อัปเดตบทบาทเป็น ${ROLE_LABELS[role]} เรียบร้อยแล้ว`,
        "success",
      );
    } catch (e) {
      toast.push(e.message, "error");
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="จัดการบทบาทผู้ดูแลระบบ (Role Assignment)"
        subtitle="แต่งตั้งผู้ใช้งานให้เป็น Super Admin, Event Admin หรือ Store Admin พร้อมมอบหมายร้านค้า"
        icon={Users}
      />

      {/* Target Role Selector Toolbar */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
          เลือกบทบาทที่ต้องการมอบหมาย:
        </label>
        <div className="grid gap-3 sm:grid-cols-2 max-w-xl">
          <div>
            <span className="text-[11px] text-slate-400 block mb-1">
              บทบาท (Role)
            </span>
            <select
              className="input text-xs"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              {Object.entries(ROLE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </div>

          <div>
            <span className="text-[11px] text-slate-400 block mb-1">
              ร้านค้าที่รับผิดชอบ (เฉพาะ Store Admin)
            </span>
            <select
              className="input text-xs"
              value={storeId}
              onChange={(e) => setStoreId(e.target.value)}
              disabled={role !== "store_admin"}
            >
              <option value="">- เลือกร้านค้า -</option>
              {storesRepo.all().map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.category})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* User list cards */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          รายชื่อผู้ใช้ทั้งหมดในระบบ ({people.length} ท่าน)
        </h3>

        <div className="divide-y divide-slate-100">
          {people.map((p) => (
            <div
              key={p.id}
              className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 font-bold text-xs shrink-0">
                  {p.fullName?.charAt(0) || "U"}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-slate-800 text-xs sm:text-sm">
                      {p.fullName}
                    </p>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        p.role === "super_admin"
                          ? "bg-purple-100 text-purple-800"
                          : p.role === "token_admin"
                            ? "bg-amber-100 text-amber-800"
                            : p.role === "store_admin"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {ROLE_LABELS[p.role]}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                    {p.email}
                  </p>
                </div>
              </div>

              <button
                className="btn-secondary text-xs py-1.5 px-3 self-start sm:self-auto gap-1"
                type="button"
                onClick={() => assign(p.id)}
              >
                <UserCheck className="h-3.5 w-3.5" /> มอบหมายบทบาทที่เลือก
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
