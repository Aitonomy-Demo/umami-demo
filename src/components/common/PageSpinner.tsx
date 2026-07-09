import { useEffect, useState } from 'react';

export interface PageSpinnerProps {
  /** Whether the spinner should be visible. */
  loading: boolean;
  /**
   * Delay in ms before the spinner appears. Prevents flicker on fast loads.
   * Defaults to 150ms.
   */
  delay?: number;
  /** Accessible label announced to screen readers. */
  label?: string;
  /** Diameter of the spinner in pixels. */
  size?: number;
}

/**
 * A lightweight, dependency-free page-load spinner.
 *
 * Renders nothing until `loading` has been true for longer than `delay`,
 * which avoids a distracting flash on fast responses. Hide it by passing
 * `loading={false}` once data has arrived or an error has occurred.
 *
 * Usage:
 *   const { data, isLoading } = useQuery(...);
 *   return (
 *     <>
 *       <PageSpinner loading={isLoading} />
 *       {data && <Dashboard data={data} />}
 *     </>
 *   );
 */
export function PageSpinner({
  loading,
  delay = 150,
  label = 'Loading\u2026',
  size = 32,
}: PageSpinnerProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!loading) {
      setVisible(false);
      return;
    }

    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [loading, delay]);

  if (!visible) {
    return null;
  }

  const border = Math.max(2, Math.round(size / 10));

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
      }}
    >
      <span
        aria-hidden="true"
        style={{
          display: 'inline-block',
          width: size,
          height: size,
          border: `${border}px solid currentColor`,
          borderTopColor: 'transparent',
          borderRadius: '50%',
          opacity: 0.6,
          animation: 'page-spinner-rotate 0.8s linear infinite',
        }}
      />
      <span
        style={{
          position: 'absolute',
          width: 1,
          height: 1,
          padding: 0,
          margin: -1,
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          border: 0,
        }}
      >
        {label}
      </span>
      <style>{`
        @keyframes page-spinner-rotate {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default PageSpinner;
