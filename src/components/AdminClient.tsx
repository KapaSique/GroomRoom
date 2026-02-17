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
  fio: string;
  login: string;
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: "easeOut" as const },
  }),
};

function getNextStatus(current: string): string | null {
  if (current === "Новая") return "Обработка данных";
  if (current === "Обработка данных") return "Услуга оказана";
  return null;
}

function StatusBadge({ status }: { status: string }) {
  const cls =
    status === "Новая"
      ? "status-new"
      : status === "Обработка данных"
      ? "status-processing"
      : "status-done";
  return <span className={cls}>{status}</span>;
}

export default function AdminClient({
  requests: initialRequests,
}: {
  requests: Request[];
}) {
  const router = useRouter();
  const [requests, setRequests] = useState(initialRequests);
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  async function handleStatusChange(req: Request, formEl: HTMLFormElement) {
    setLoadingId(req.id);
    setError(null);
    const formData = new FormData(formEl);
    formData.set("id", String(req.id));

    const nextStatus = getNextStatus(req.status);
    if (!nextStatus) return;
    formData.set("status", nextStatus);

    const res = await fetch("/api/admin/requests", {
      method: "PATCH",
      body: formData,
    });
    const data = await res.json();
    setLoadingId(null);

    if (data.success) {
      router.refresh();
      window.location.reload();
    } else {
      setError(data.error || "Ошибка");
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-cream)]">
      {/* Decorative */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-rose-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -left-32 w-72 h-72 bg-[var(--color-lavender)]/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-6">
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
                Панель администратора
              </h1>
              <p className="text-sm text-[var(--color-charcoal-light)]">
                Управление заявками
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

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Requests */}
        <motion.div initial="hidden" animate="visible" className="space-y-4">
          {requests.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-card p-8 text-center"
            >
              <div className="text-4xl mb-2">📋</div>
              <p className="text-[var(--color-charcoal-light)]">
                Заявок пока нет
              </p>
            </motion.div>
          ) : (
            requests.map((req, i) => (
              <motion.div
                key={req.id}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                layout
                className="card p-5"
              >
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Photo */}
                  <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                    <img
                      src={req.photo_path}
                      alt={req.pet_name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="test-t-name font-bold text-lg text-[var(--color-charcoal)]">
                      {req.pet_name}
                    </p>
                    <p className="text-sm text-[var(--color-charcoal-light)] mb-2">
                      Владелец: {req.fio} ({req.login})
                    </p>
                    <StatusBadge status={req.status} />
                  </div>

                  {/* Status Change Form */}
                  {getNextStatus(req.status) && (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleStatusChange(req, e.currentTarget);
                      }}
                      className="flex flex-col gap-2 flex-shrink-0"
                    >
                      <select
                        name="status"
                        className="test-s-status input-field !py-2 text-sm"
                        defaultValue={getNextStatus(req.status) || ""}
                      >
                        <option value={getNextStatus(req.status) || ""}>
                          {getNextStatus(req.status)}
                        </option>
                      </select>

                      {req.status === "Обработка данных" && (
                        <input
                          type="file"
                          name="result_photo"
                          accept="image/*"
                          className="test-с-photo input-field !py-1 text-sm file:mr-2 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-rose-50 file:text-rose-500"
                        />
                      )}

                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        type="submit"
                        disabled={loadingId === req.id}
                        className="test-b-change btn-primary !py-2 text-sm disabled:opacity-50"
                      >
                        {loadingId === req.id
                          ? "Обновление..."
                          : "Сменить статус"}
                      </motion.button>
                    </form>
                  )}

                  {/* Result photo */}
                  {req.result_photo_path && (
                    <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 border-green-200">
                      <img
                        src={req.result_photo_path}
                        alt="Результат"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
      </div>
    </div>
  );
}
