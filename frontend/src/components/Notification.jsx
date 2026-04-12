import { createContext, useContext, useState, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import './Notification.css';

const NotificationContext = createContext(null);

const ICONS = {
  success: '✅',
  error: '❌',
  info: 'ℹ️',
  warning: '⚠️',
};

let nextId = 1;

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const timers = useRef({});

  const removeNotification = useCallback((id) => {
    clearTimeout(timers.current[id]);
    delete timers.current[id];
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const addNotification = useCallback(
    (message, type = 'info', duration = 4000) => {
      const id = nextId++;
      setNotifications((prev) => [...prev, { id, message, type }]);
      if (duration > 0) {
        timers.current[id] = setTimeout(() => removeNotification(id), duration);
      }
      return id;
    },
    [removeNotification]
  );

  return (
    <NotificationContext.Provider value={{ addNotification, removeNotification }}>
      {children}
      <div className="notification-container" role="status" aria-live="polite">
        {notifications.map((n) => (
          <div key={n.id} className={`notification notification--${n.type}`}>
            <span className="notification-icon">{ICONS[n.type] || ICONS.info}</span>
            <div className="notification-content">
              <strong>{n.type.charAt(0).toUpperCase() + n.type.slice(1)}</strong>
              <p>{n.message}</p>
            </div>
            <button
              className="notification-close"
              onClick={() => removeNotification(n.id)}
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

NotificationProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export function useNotification() {
  return useContext(NotificationContext);
}
