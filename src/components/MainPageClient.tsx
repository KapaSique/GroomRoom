"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface ShowcaseRequest {
  pet_name: string;
  photo_path: string;
  result_photo_path: string;
}

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

export default function MainPageClient({
  showcaseRequests,
}: {
  showcaseRequests: ShowcaseRequest[];
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [loginErrors, setLoginErrors] = useState<Record<string, string>>({});
  const [regErrors, setRegErrors] = useState<Record<string, string>>({});
  const [regSuccess, setRegSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setLoginErrors({});
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/login", { method: "POST", body: form });
    const data = await res.json();
    setLoading(false);
    if (data.success) {
      router.push(data.redirect);
      router.refresh();
    } else {
      setLoginErrors(data.errors || {});
    }
  }

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setRegErrors({});
    setRegSuccess(false);
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      body: form,
    });
    const data = await res.json();
    setLoading(false);
    if (data.success) {
      setRegSuccess(true);
      setActiveTab("login");
    } else {
      setRegErrors(data.errors || {});
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-cream)]">
      {/* Decorative background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-rose-200/30 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-[var(--color-lavender)]/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-[var(--color-gold-light)]/30 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="px-6 py-4 flex items-center justify-between max-w-7xl mx-auto"
        >
          <div className="flex items-center gap-3">
            <Image
              src="/logo/logo_groom.png"
              alt="GroomRoom"
              width={48}
              height={48}
              className="test-t-logo rounded-xl"
              priority
            />
            <span className="text-xl font-bold bg-gradient-to-r from-rose-500 to-rose-400 bg-clip-text text-transparent">
              GroomRoom
            </span>
          </div>
        </motion.header>

        {/* Hero section */}
        <section className="px-6 pt-6 pb-12 max-w-7xl mx-auto">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-start">
            {/* Left: Hero + Showcase */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
                className="mb-10"
              >
                <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight mb-4">
                  <span className="bg-gradient-to-r from-rose-500 via-rose-400 to-[var(--color-gold)] bg-clip-text text-transparent">
                    Красота
                  </span>{" "}
                  для вашего питомца
                </h1>
                <p className="text-[var(--color-charcoal-light)] text-lg leading-relaxed">
                  Профессиональный уход за внешним видом, кожей и шерстью, когтями и ушами вашего любимца
                </p>
              </motion.div>

              {/* Showcase */}
              {showcaseRequests.length > 0 && (
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={stagger}
                  className="mb-10"
                >
                  <motion.h2
                    variants={fadeUp}
                    custom={0}
                    className="text-xl font-bold mb-4 text-[var(--color-charcoal)]"
                  >
                    Наши работы
                  </motion.h2>
                  <div className="grid grid-cols-2 gap-3 lg:grid-cols-2">
                    {showcaseRequests.map((req, i) => (
                      <motion.div
                        key={i}
                        variants={fadeUp}
                        custom={i + 1}
                        whileHover={{ y: -4, transition: { duration: 0.2 } }}
                        className="card overflow-hidden group"
                      >
                        <div className="relative aspect-square overflow-hidden">
                          <img
                            src={req.result_photo_path || req.photo_path}
                            alt={req.pet_name}
                            className="test-t-photo w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                          <div className="absolute bottom-0 left-0 right-0 p-3">
                            <p className="test-t-name text-white font-semibold text-sm drop-shadow-lg">
                              {req.pet_name}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {showcaseRequests.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mb-10 glass-card p-8 text-center"
                >
                  <div className="text-5xl mb-3">🐾</div>
                  <p className="text-[var(--color-charcoal-light)]">
                    Скоро здесь появятся наши работы!
                  </p>
                </motion.div>
              )}
            </div>

            {/* Right: Auth Forms */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="lg:sticky lg:top-8"
            >
              <div className="glass-card p-6 lg:p-8">
                {/* Tab Switcher */}
                <div className="flex gap-2 mb-6 bg-rose-50 rounded-full p-1">
                  <button
                    onClick={() => { setActiveTab("login"); setRegErrors({}); }}
                    className={`flex-1 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                      activeTab === "login"
                        ? "bg-white text-rose-500 shadow-md"
                        : "text-[var(--color-charcoal-light)] hover:text-rose-400"
                    }`}
                  >
                    Вход
                  </button>
                  <button
                    onClick={() => { setActiveTab("register"); setLoginErrors({}); }}
                    className={`flex-1 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                      activeTab === "register"
                        ? "bg-white text-rose-500 shadow-md"
                        : "text-[var(--color-charcoal-light)] hover:text-rose-400"
                    }`}
                  >
                    Регистрация
                  </button>
                </div>

                <AnimatePresence mode="wait">
                  {regSuccess && activeTab === "login" && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm"
                    >
                      Регистрация прошла успешно! Войдите в систему.
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence mode="wait">
                  {activeTab === "login" ? (
                    <motion.form
                      key="login"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                      onSubmit={handleLogin}
                      className="space-y-4"
                    >
                      <div>
                        <label className="block text-sm font-medium mb-1.5 text-[var(--color-charcoal)]">
                          Логин
                        </label>
                        <input
                          type="text"
                          name="login"
                          className={`test-2-i-login input-field ${loginErrors.login ? "error" : ""}`}
                          placeholder="Введите логин"
                        />
                        <div className="test-2-e-login error-text">
                          {loginErrors.login || ""}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1.5 text-[var(--color-charcoal)]">
                          Пароль
                        </label>
                        <input
                          type="password"
                          name="password"
                          className={`test-2-i-pass input-field ${loginErrors.pass ? "error" : ""}`}
                          placeholder="Введите пароль"
                        />
                        <div className="test-2-e-pass error-text">
                          {loginErrors.pass || ""}
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={loading}
                        className="test-2-b-log btn-primary w-full disabled:opacity-50"
                      >
                        {loading ? "Входим..." : "Войти"}
                      </motion.button>
                    </motion.form>
                  ) : (
                    <motion.form
                      key="register"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      onSubmit={handleRegister}
                      className="space-y-3"
                    >
                      <div>
                        <label className="block text-sm font-medium mb-1 text-[var(--color-charcoal)]">
                          ФИО
                        </label>
                        <input
                          type="text"
                          name="fio"
                          className={`test-1-i-fio input-field ${regErrors.fio ? "error" : ""}`}
                          placeholder="Иванова Мария Петровна"
                        />
                        <div className="test-1-e-fio error-text">
                          {regErrors.fio || ""}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1 text-[var(--color-charcoal)]">
                          Логин
                        </label>
                        <input
                          type="text"
                          name="login"
                          className={`test-1-i-login input-field ${regErrors.login ? "error" : ""}`}
                          placeholder="maria-ivanova"
                        />
                        <div className="test-1-e-login error-text">
                          {regErrors.login || ""}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1 text-[var(--color-charcoal)]">
                          Email
                        </label>
                        <input
                          type="text"
                          name="email"
                          className={`test-1-i-email input-field ${regErrors.email ? "error" : ""}`}
                          placeholder="maria@example.com"
                        />
                        <div className="test-1-e-email error-text">
                          {regErrors.email || ""}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1 text-[var(--color-charcoal)]">
                          Пароль
                        </label>
                        <input
                          type="password"
                          name="password"
                          className={`test-1-i-pass input-field ${regErrors.pass ? "error" : ""}`}
                          placeholder="Введите пароль"
                        />
                        <div className="test-1-e-pass error-text">
                          {regErrors.pass || ""}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1 text-[var(--color-charcoal)]">
                          Повтор пароля
                        </label>
                        <input
                          type="password"
                          name="password2"
                          className={`test-1-i-pass2 input-field ${regErrors.pass2 ? "error" : ""}`}
                          placeholder="Повторите пароль"
                        />
                        <div className="test-1-e-pass2 error-text">
                          {regErrors.pass2 || ""}
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <input
                          type="checkbox"
                          name="agree"
                          value="true"
                          className="test-1-i-agree mt-1 w-4 h-4 accent-rose-500"
                        />
                        <label className="text-xs text-[var(--color-charcoal-light)] leading-snug">
                          Согласие на обработку персональных данных
                        </label>
                      </div>
                      <div className="test-1-e-agree error-text">
                        {regErrors.agree || ""}
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={loading}
                        className="test-1-b-reg btn-primary w-full disabled:opacity-50"
                      >
                        {loading ? "Регистрация..." : "Зарегистрироваться"}
                      </motion.button>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="px-6 py-8 text-center text-sm text-[var(--color-charcoal-light)]/60"
        >
          <p>&copy; 2025 GroomRoom. Забота о красоте ваших питомцев.</p>
        </motion.footer>
      </div>
    </div>
  );
}
