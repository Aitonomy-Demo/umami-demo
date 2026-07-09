import { useState, useCallback, ReactNode } from 'react';

interface SettingsTooltipProps {
  /** Content to wrap (typically the settings gear icon). */
  children: ReactNode;
  /** Tooltip label text. Defaults to "Settings". */
  label?: string;
}

/**
 * SettingsTooltip
 *
 * Wraps the settings gear icon and shows a "Settings" tooltip on hover/focus.
 * The tooltip is hidden on mouse-out and on focus loss, per SCRUM-7.
 *
 * Additive, self-contained component. Consumers can wrap the gear icon:
 *
 *   <SettingsTooltip>
 *     <GearIcon />
 *   </SettingsTooltip>
 */
export function SettingsTooltip({ children, label = 'Settings' }: SettingsTooltipProps) {
  const [visible, setVisible] = useState(false);

  const show = useCallback(() => setVisible(true), []);
  const hide = useCallback(() => setVisible(false), []);

  return (
    <span
      style={styles.wrapper}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      <span
        role="tooltip"
        aria-hidden={!visible}
        style={{
          ...styles.tooltip,
          opacity: visible ? 1 : 0,
          visibility: visible ? 'visible' : 'hidden',
        }}
      >
        {label}
      </span>
    </span>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    position: 'relative',
    display: 'inline-flex',
  },
  tooltip: {
    position: 'absolute',
    top: '100%',
    left: '50%',
    transform: 'translateX(-50%)',
    marginTop: 6,
    padding: '4px 8px',
    borderRadius: 4,
    background: 'rgba(0, 0, 0, 0.8)',
    color: '#fff',
    fontSize: 12,
    lineHeight: 1.4,
    whiteSpace: 'nowrap',
    pointerEvents: 'none',
    zIndex: 10,
    transition: 'opacity 120ms ease',
  },
};

export default SettingsTooltip;
