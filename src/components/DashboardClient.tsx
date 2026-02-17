"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface Request {
  id: number;
  pet_name: string;
  photo_path: string;
  result_photo_path: string | null;
  status: string;
  created_at: string;
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: "easeOut" },
  }),
  exit: { opacity: 0, x: -100, transition: { duration: 0.3 } },
};

function StatusBadge({ status }: { status: string }) {
  const cls =
    status === "Новая"
      ? "status-new"
      : status === "Обработка данных"
      ? "status-processing"
      : "status-done";
  return <span className={`test-t-status ${cls}`}>{status}</span>;
}

export default function DashboardClient({
  userFio,
  requests: initialRequests,
}: {
  userFio: string;
  requests: Request[];
}) {
  const router = useRouter();
  const [requests, setRequests] = useState(initialRequests);
  const [showForm, setShowForm] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setFormErrors({});
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/requests", { method: "POST", body: form });
    const data = await res.json();
    setLoading(false);
    if (data.success) {
      setShowForm(false);
      router.refresh();
      window.location.reload();
    } else {
      setFormErrors(data.errors || {});
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Удалить заявку?")) return;
    const res = await fetch("/api/requests", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const data = await res.json();
    if (data.success) {
      setRequests((prev) => prev.filter((r) => r.id !== id));
    } else {
      alert(data.error || "Ошибка при удалении");
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-cream)]">
      {/* Decorative blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-rose-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -left-32 w-72 h-72 bg-[var(--color-lavender)]/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-3">
            <Image
              src="/logo/logo_groom.png"
              alt="GroomRoom"
              width={40}
              height={40}
              className="rounded-xl"
            />
            <div>
              <h1 className="text-lg font-bold text-[var(--color-charcoal)]">
                Личный кабинет
              </h1>
              <p className="text-sm text-[var(--color-charcoal-light)]">
                {userFio}
              </p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className="test-b-logout btn-secondary text-sm !py-2 !px-4"
          >
            Выход
          </motion.button>
        </motion.header>

        {/* New Request Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowForm(!showForm)}
            className="btn-primary"
          >
            {showForm ? "Отмена" : "+ Новая заявка"}
          </motion.button>
        </motion.div>

        {/* Create Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden mb-8"
            >
              <form
                onSubmit={handleCreate}
                className="glass-card p-6 space-y-4"
              >
                <h3 className="text-lg font-bold">Новая заявка</h3>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Кличка питомца
                  </label>
                  <input
                    type="text"
                    name="pet_name"
                    className={`test-i-name input-field ${formErrors.name ? "error" : ""}`}
                    placeholder="Барсик"
                  />
                  {formErrors.name && (
                    <p className="error-text">{formErrors.name}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Фото питомца (JPEG/BMP, до 2 МБ)
                  </label>
                  <input
                    type="file"
                    name="photo"
                    accept=".jpg,.jpeg,.bmp"
                    className="test-c-photo input-field file:mr-3 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-rose-50 file:text-rose-500 hover:file:bg-rose-100"
                  />
                  {formErrors.photo && (
                    <p className="error-text">{formErrors.photo}</p>
                  )}
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="test-b-new btn-primary disabled:opacity-50"
                >
                  {loading ? "Отправка..." : "Создать заявку"}
                </motion.button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Requests List */}
        <motion.div initial="hidden" animate="visible" className="space-y-3">
          <h2 className="text-xl font-bold mb-4">Мои заявки</h2>
          {requests.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-card p-8 text-center"
            >
              <div className="text-4xl mb-2">🐾</div>
              <p className="text-[var(--color-charcoal-light)]">
                У вас пока нет заявок
              </p>
            </motion.div>
          ) : (
            <AnimatePresence>
              {requests.map((req, i) => (
                <motion.div
                  key={req.id}
                  custom={i}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  layout
                  className="card p-4 flex items-center gap-4"
                >
                  <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                    <img
                      src={req.photo_path}
                      alt={req.pet_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="test-t-name font-semibold text-[var(--color-charcoal)] truncate">
                      {req.pet_name}
                    </p>
                    <StatusBadge status={req.status} />
                  </div>
                  {req.status === "Новая" && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDelete(req.id)}
                      className="test-b-remove btn-danger flex-shrink-0"
                    >
                      Удалить
                    </motion.button>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </motion.div>
      </div>
    </div>
  );
}
