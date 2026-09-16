import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Info, AlertCircle, CheckCircle2, X } from 'lucide-react';

export type NotificationType = 'info' | 'warning' | 'error' | 'success';

export interface NotificationItem {
  id?: string;
  title?: string;
  message: string;
  type?: NotificationType;
}

interface NotificationBannerProps {
  notification: NotificationItem | null;
  onDismiss: () => void;
  autoDismissMs?: number;
}

export const NotificationBanner: React.FC<NotificationBannerProps> = ({
  notification,
  onDismiss,
  autoDismissMs = 6000,
}) => {
  useEffect(() => {
    if (!notification || !autoDismissMs) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, autoDismissMs);
    return () => clearTimeout(timer);
  }, [notification, autoDismissMs, onDismiss]);

  if (!notification) return null;

  const type = notification.type || 'info';

  const typeStyles = {
    info: {
      border: 'border-[#CBD5E1]',
      bg: 'bg-[#FFFFFF]',
      icon: <Info className="w-4 h-4 text-[#2563EB]" />,
      badgeBg: 'bg-[#EFF6FF]',
      badgeBorder: 'border-[#BFD5FF]',
      titleColor: 'text-[#172033]',
    },
    warning: {
      border: 'border-[#D9E2EC]',
      bg: 'bg-[#FFFFFF]',
      icon: <AlertCircle className="w-4 h-4 text-[#D97706]" />,
      badgeBg: 'bg-[#FFFBEB]',
      badgeBorder: 'border-[#FDE68A]',
      titleColor: 'text-[#172033]',
    },
    error: {
      border: 'border-[#D9E2EC]',
      bg: 'bg-[#FFFFFF]',
      icon: <Info className="w-4 h-4 text-[#526174]" />,
      badgeBg: 'bg-[#F1F5F9]',
      badgeBorder: 'border-[#CBD5E1]',
      titleColor: 'text-[#172033]',
    },
    success: {
      border: 'border-[#A7F3D0]',
      bg: 'bg-[#FFFFFF]',
      icon: <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />,
      badgeBg: 'bg-[#ECFDF5]',
      badgeBorder: 'border-[#A7F3D0]',
      titleColor: 'text-[#172033]',
    },
  }[type];

  return (
    <AnimatePresence>
      <motion.div
        id="notification-banner"
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        className="mb-4 select-none"
        role="status"
        aria-live="polite"
      >
        <div
          className={`flex items-center justify-between gap-3 px-4 py-3 bg-white border ${typeStyles.border} rounded-xl shadow-xs`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-7 h-7 rounded-lg ${typeStyles.badgeBg} border ${typeStyles.badgeBorder} flex items-center justify-center shrink-0`}
            >
              {typeStyles.icon}
            </div>
            <div className="min-w-0 flex flex-col sm:flex-row sm:items-center sm:gap-2">
              {notification.title && (
                <span className={`text-xs font-semibold ${typeStyles.titleColor} shrink-0`}>
                  {notification.title}
                </span>
              )}
              {notification.title && (
                <span className="hidden sm:inline text-[#CBD5E1]">·</span>
              )}
              <span className="text-xs text-[#526174] truncate">
                {notification.message}
              </span>
            </div>
          </div>

          <button
            id="dismiss-notification-btn"
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss notification"
            className="p-1 rounded-lg text-[#526174] hover:text-[#172033] hover:bg-[#F1F5F9] transition-colors cursor-pointer shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
