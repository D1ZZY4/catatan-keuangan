import React, { useState } from "react";
import { Plus } from "lucide-react";
import { AppBar } from "@/shared/components/AppBar";
import { BottomSheet } from "@/shared/components/BottomSheet";
import { IconPicker } from "@/shared/components/IconPicker";
import { ColorPicker } from "@/shared/components/ColorPicker";
import { DynamicIcon } from "@/shared/components/DynamicIcon";
import { EmptyState } from "@/shared/components/EmptyState";
import { useAppData } from "@/app/AppDataContext";
import { useToast } from "@/shared/hooks/useToast";
import { countTransactionsByCategory } from "@/shared/db/repo";
import { cn } from "@/shared/utils/misc";
import type { Category } from "@/shared/types";

interface CategoryFormProps {
  isOpen: boolean;
  onClose: () => void;
  editCategory?: Category;
}

function CategoryForm({ isOpen, onClose, editCategory }: CategoryFormProps) {
  const { addCategory, updateCategory } = useAppData();
  const { showToast } = useToast();
  const [name, setName] = useState(editCategory?.name ?? "");
  const [icon, setIcon] = useState(editCategory?.icon ?? "Tag");
  const [color, setColor] = useState(editCategory?.color ?? "#8CC0EB");
  const [type, setType] = useState<"income" | "expense" | "both">(editCategory?.type ?? "expense");
  const [tab, setTab] = useState<"basic" | "icon" | "color">("basic");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) { showToast("Nama kategori kosong", "error"); return; }
    setLoading(true);
    try {
      if (editCategory) {
        await updateCategory({ ...editCategory, name: name.trim(), icon, color, type });
        showToast("Kategori diperbarui", "success");
      } else {
        await addCategory({ name: name.trim(), icon, color, type });
        showToast("Kategori ditambahkan", "success");
      }
      onClose();
    } catch {
      showToast("Gagal menyimpan", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={editCategory ? "Edit Kategori" : "Tambah Kategori"} fullHeight>
      <div className="flex border-b border-bg-card">
        {(["basic", "icon", "color"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={cn("flex-1 py-3 text-sm font-medium transition-colors capitalize",
              tab === t ? "text-accent-primary border-b-2 border-accent-primary" : "text-text-muted")}>
            {t === "basic" ? "Dasar" : t === "icon" ? "Ikon" : "Warna"}
          </button>
        ))}
      </div>
      <div className="p-4 space-y-4">
        {tab === "basic" && (
          <>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-text-muted">Nama Kategori</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                placeholder="cth. Makan & Minum" autoFocus
                className="w-full bg-bg-card rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted outline-none focus:ring-2 focus:ring-accent-primary/40"
                maxLength={40} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-text-muted">Jenis</label>
              <div className="flex gap-2">
                {(["expense", "income", "both"] as const).map((t) => (
                  <button key={t} onClick={() => setType(t)}
                    className={cn("flex-1 py-2 rounded-xl text-xs font-medium border transition-all",
                      type === t ? "bg-accent-primary/10 border-accent-primary text-accent-primary" : "bg-bg-card border-bg-card text-text-muted")}>
                    {t === "expense" ? "Pengeluaran" : t === "income" ? "Pemasukan" : "Keduanya"}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
        {tab === "icon" && <IconPicker value={icon} onChange={setIcon} color={color} />}
        {tab === "color" && <ColorPicker value={color} onChange={setColor} />}
      </div>
      <div className="px-4 pb-6 pt-2">
        <button onClick={() => void handleSave()} disabled={loading || !name.trim()}
          className="w-full py-4 bg-accent-primary text-white rounded-2xl font-semibold text-sm active:scale-[0.98] transition-transform disabled:opacity-50 shadow-fab">
          {loading ? "Menyimpan…" : editCategory ? "Simpan" : "Tambah"}
        </button>
      </div>
    </BottomSheet>
  );
}

export function CategoryPage() {
  const { categories, removeCategory } = useAppData();
  const { showToast } = useToast();
  const [formOpen, setFormOpen] = useState(false);
  const [editCat, setEditCat] = useState<Category | undefined>();
  const [tab, setTab] = useState<"expense" | "income">("expense");

  const filtered = categories.filter((c) => c.type === tab || c.type === "both");

  const handleLongPress = async (cat: Category) => {
    if (cat.isDefault) { showToast("Kategori bawaan tidak bisa dihapus", "warning"); return; }
    const count = await countTransactionsByCategory(cat.id);
    if (count > 0) {
      showToast(`Kategori ini dipakai di ${count} transaksi, yakin mau dihapus?`, "warning");
      return;
    }
    await removeCategory(cat.id);
    showToast("Kategori dihapus", "success");
  };

  return (
    <>
      <AppBar title="Kategori" showBack
        actions={
          <button onClick={() => { setEditCat(undefined); setFormOpen(true); }}
            className="w-9 h-9 rounded-full bg-accent-primary flex items-center justify-center shadow-fab active:scale-90 transition-transform"
            aria-label="Tambah kategori">
            <Plus size={18} className="text-white" />
          </button>
        }
      />

      <div className="flex border-b border-bg-card">
        {(["expense", "income"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={cn("flex-1 py-3 text-sm font-medium transition-colors",
              tab === t ? "text-accent-primary border-b-2 border-accent-primary" : "text-text-muted")}>
            {t === "expense" ? "Pengeluaran" : "Pemasukan"}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="Belum ada kategori"
          action={{ label: "+ Tambah Kategori", onClick: () => setFormOpen(true) }} />
      ) : (
        <div className="grid grid-cols-4 gap-3 p-4">
          {filtered.map((cat) => (
            <div key={cat.id}
              role="button" tabIndex={0}
              onClick={() => { setEditCat(cat); setFormOpen(true); }}
              onContextMenu={(e) => { e.preventDefault(); void handleLongPress(cat); }}
              className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-bg-card active:scale-95 transition-transform cursor-pointer text-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${cat.color}22` }}>
                <DynamicIcon name={cat.icon} size={20} style={{ color: cat.color }} />
              </div>
              <span className="text-[10px] text-text-muted leading-tight line-clamp-2">{cat.name}</span>
              {cat.isDefault && <span className="text-[8px] text-text-muted">bawaan</span>}
            </div>
          ))}
        </div>
      )}

      <CategoryForm isOpen={formOpen}
        onClose={() => { setFormOpen(false); setEditCat(undefined); }}
        {...(editCat !== undefined ? { editCategory: editCat } : {})} />
    </>
  );
}
