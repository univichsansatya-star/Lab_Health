import React, { useState } from 'react';
import { StorageService } from '@/src/services/storage';
import { User, UserRole } from '@/src/types';
import { Button } from '@/src/components/ui/Button';
import { Input, Select } from '@/src/components/ui/Input';
import { Modal } from '@/src/components/ui/Modal';
import {
  Users,
  Search,
  Plus,
  ShieldCheck,
  GraduationCap,
  Mail,
  Phone,
  CheckCircle2,
  XCircle,
  KeyRound,
} from 'lucide-react';

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>(() => StorageService.getUsers());
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    nim_nip: '',
    phone: '',
    department: 'S1 Keperawatan',
    role: 'student' as UserRole,
    password: '',
  });

  const allRequests = StorageService.getRequests();

  const filteredUsers = users.filter((u) => {
    if (roleFilter !== 'ALL' && u.role !== roleFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = u.name.toLowerCase().includes(q);
      const matchNim = u.nim_nip.toLowerCase().includes(q);
      const matchEmail = u.email.toLowerCase().includes(q);
      if (!matchName && !matchNim && !matchEmail) return false;
    }
    return true;
  });

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    try {
      await StorageService.createUser(
        {
          name: formData.name,
          email: formData.email,
          nim_nip: formData.nim_nip,
          phone: formData.phone,
          department: formData.department,
          role: formData.role,
          status: 'ACTIVE',
          avatar: undefined,
        },
        formData.password,
      );
      setUsers(StorageService.getUsers());
      setIsAddModalOpen(false);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Gagal menyimpan pengguna.');
    }
  };

  const handleToggleStatus = (id: string) => {
    const user = users.find((u) => u.id === id);
    if (!user) return;
    const newStatus = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    StorageService.updateUser(id, { status: newStatus });
    setUsers(StorageService.getUsers());
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-heading">
            Manajemen Pengguna Laboratorium
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar civitas akademika UIS (Mahasiswa Ners, Dosen Pengampu, dan Staff Lab)
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsAddModalOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          + Daftarkan Pengguna
        </Button>
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-8">
          <Input
            placeholder="Cari nama pengguna, NIM, NIP, atau email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>
        <div className="sm:col-span-4">
          <Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="ALL">Semua Peran (Roles)</option>
            <option value="student">Mahasiswa Praktikan</option>
            <option value="nurse_staff">Staff Laboratorium Ners</option>
            <option value="admin">Admin / Koordinator Lab</option>
          </Select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Pengguna</th>
                <th className="py-3 px-4">NIM / NIP & Prodi</th>
                <th className="py-3 px-4">Peran Sistem</th>
                <th className="py-3 px-4">Kontak WhatsApp</th>
                <th className="py-3 px-4 text-center">Pinjaman Aktif</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((u) => {
                const activeCount = allRequests.filter(
                  (r) => r.userId === u.id && (r.status === 'BORROWED' || r.status === 'READY_TO_PICKUP')
                ).length;

                return (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={u.avatar}
                          alt={u.name}
                          className="w-9 h-9 rounded-xl object-cover border border-slate-200 flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 truncate">{u.name}</p>
                          <p className="text-[11px] text-slate-400 truncate">{u.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <p className="font-mono font-bold text-slate-800">{u.nim_nip}</p>
                      <p className="text-[11px] text-slate-500">{u.department}</p>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          u.role === 'admin'
                            ? 'bg-purple-100 text-purple-800'
                            : u.role === 'nurse_staff'
                            ? 'bg-cyan-100 text-cyan-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {u.role === 'admin' ? 'Koordinator Lab' : u.role === 'nurse_staff' ? 'Staff Lab Ners' : 'Mahasiswa'}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                      {u.phone}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-full">
                        {activeCount} Tiket
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          u.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {u.status === 'ACTIVE' ? 'Aktif' : 'Ditangguhkan'}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={u.status === 'ACTIVE' ? 'text-rose-600 hover:bg-rose-50' : 'text-emerald-600 hover:bg-emerald-50'}
                        onClick={() => handleToggleStatus(u.id)}
                      >
                        {u.status === 'ACTIVE' ? 'Tangguhkan' : 'Aktifkan'}
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Daftarkan Pengguna Baru"
        size="md"
      >
        <form onSubmit={handleAddUser} className="space-y-4">
          <Input
            label="Nama Lengkap"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Contoh: Siti Nurhaliza Putri"
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="NIM / NIP"
              value={formData.nim_nip}
              onChange={(e) => setFormData({ ...formData, nim_nip: e.target.value })}
              placeholder="Contoh: 2102041019"
              required
            />
            <Input
              label="Nomor WhatsApp"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="0812-xxxx-xxxx"
              required
            />
          </div>

          <Input
            label="Email Kampus"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="email@ichsansatya.ac.id"
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Peran Akun"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
            >
              <option value="student">Mahasiswa Praktikan</option>
              <option value="nurse_staff">Staff Laboratorium</option>
              <option value="admin">Koordinator / Admin</option>
            </Select>

            <Select
              label="Program Studi"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            >
              <option value="S1 Keperawatan">S1 Keperawatan</option>
              <option value="Profesi Ners">Profesi Ners</option>
              <option value="D3 Kebidanan">D3 Kebidanan</option>
              <option value="UPT Laboratorium Kesehatan">UPT Laboratorium Kesehatan</option>
            </Select>
          </div>

          <Input
            label="Password Awal"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="Minimal 6 karakter"
            minLength={6}
            required
          />

          {formError && <p className="text-xs font-medium text-rose-600">{formError}</p>}

          <div className="pt-2 flex items-center justify-end gap-2">
            <Button variant="ghost" size="sm" type="button" onClick={() => setIsAddModalOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" size="md" type="submit">
              Simpan Pengguna
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
